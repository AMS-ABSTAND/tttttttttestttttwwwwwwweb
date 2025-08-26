/*
  Erweiterte Buchungskalender‑Logik für die Tech‑Support‑Website.

  Diese Datei basiert auf dem einfachen Kalender aus der Original‑Vorlage und
  wurde erweitert, um Buchungen im Browser persistent zu speichern. Das
  Kalenderwidget liest verfügbare Termine aus `data/availability.json`,
  visualisiert sie und zeigt ein Buchungsformular an, sobald ein freier Tag
  ausgewählt wurde. Bei einer erfolgreichen Anfrage wird der Termin zusammen
  mit den eingegebenen Kundendaten im localStorage gespeichert, sodass eine
  spätere Auswertung möglich ist.
*/

document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.querySelector('.calendar');
  const monthYearLabel = document.getElementById('month-year');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  const bookingForm = document.getElementById('booking-form');
  const bookingDateDisplay = document.getElementById('booking-date-display');
  const bookingDateInput = document.getElementById('selected-date');
  const submitButton = document.getElementById('submit-booking');

  // Falls der Kalender nicht vorhanden ist (z.B. auf anderen Seiten), keine Aktion.
  if (!calendarEl) return;

  let availability = [];
  let currentDate = new Date();
  let selectedDate = null;

  // Lese verfügbare Daten aus dem JSON
  fetch('data/availability.json')
    .then(response => response.json())
    .then(data => {
      availability = data.availableDates || [];
      renderCalendar(currentDate);
    })
    .catch(err => {
      console.warn('Konnte availability.json nicht laden, verwende Fallback-Daten.', err);
      // Fallback‑Liste für freie Termine (identisch mit availability.json)
      availability = [
        '2025-09-01',
        '2025-09-02',
        '2025-09-03',
        '2025-09-05',
        '2025-09-07',
        '2025-09-10',
        '2025-09-15',
        '2025-09-20'
      ];
      renderCalendar(currentDate);
    });

  /**
   * Rendert den Kalender für ein bestimmtes Datum (Monat/Jahr).
   * @param {Date} date
   */
  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Beschriftung aktualisieren
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    if (monthYearLabel) {
      monthYearLabel.textContent = `${monthNames[month]} ${year}`;
    }
    // Erster und letzter Tag bestimmen
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    // Kalender leeren
    calendarEl.innerHTML = '';
    // Kopfzeile
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const weekdayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    weekdayNames.forEach(day => {
      const th = document.createElement('th');
      th.textContent = day;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    calendarEl.appendChild(thead);
    // Tabellenkörper
    const tbody = document.createElement('tbody');
    let row = document.createElement('tr');
    // Leere Zellen am Monatsanfang
    for (let i = 0; i < startDayOfWeek; i++) {
      const cell = document.createElement('td');
      cell.classList.add('unavailable');
      row.appendChild(cell);
    }
    // Tage ausfüllen
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      // Die ISO‑Darstellung von Date verwendet UTC und führt je nach Zeitzone zu
      // Verschiebungen (z.B. wird ein lokaler 1.9. als 31.8. im ISO‑String
      // ausgegeben). Deshalb wird hier der Zeitzonenversatz berücksichtigt,
      // sodass das Datum korrekt als YYYY‑MM‑DD im lokalen Kontext vorliegt.
      const localIso = new Date(cellDate.getTime() - cellDate.getTimezoneOffset() * 60000)
        .toISOString();
      const dateStr = localIso.split('T')[0];
      const cell = document.createElement('td');
      cell.textContent = day;
      if (availability.includes(dateStr)) {
        cell.classList.add('available');
        cell.addEventListener('click', () => selectDate(dateStr, cell));
      } else {
        cell.classList.add('unavailable');
      }
      row.appendChild(cell);
      // Neue Zeile am Ende der Woche
      if ((startDayOfWeek + day) % 7 === 0) {
        tbody.appendChild(row);
        row = document.createElement('tr');
      }
    }
    // Restliche Zellen auffüllen
    const remainingCells = 7 - row.children.length;
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        const cell = document.createElement('td');
        cell.classList.add('unavailable');
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    calendarEl.appendChild(tbody);
  }

  /**
   * Wählt ein Datum aus und zeigt das Formular an.
   * @param {string} dateStr ISO‑Datum (YYYY‑MM‑DD)
   * @param {HTMLTableCellElement} cell
   */
  function selectDate(dateStr, cell) {
    // Bisherige Auswahl entfernen
    const previouslySelected = calendarEl.querySelector('.selected');
    if (previouslySelected) {
      previouslySelected.classList.remove('selected');
    }
    cell.classList.add('selected');
    selectedDate = dateStr;
    if (bookingDateDisplay) bookingDateDisplay.textContent = selectedDate;
    if (bookingDateInput) bookingDateInput.value = selectedDate;
    if (bookingForm) bookingForm.classList.add('visible');
  }

  // Navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
      if (bookingForm) bookingForm.classList.remove('visible');
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
      if (bookingForm) bookingForm.classList.remove('visible');
    });
  }

  // Formularübermittlung mit Persistenz
  if (submitButton) {
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      const name = document.getElementById('booking-name').value.trim();
      const email = document.getElementById('booking-email').value.trim();
      const service = document.getElementById('service-select').value;
      if (!selectedDate || !name || !email || !service) {
        alert('Bitte füllen Sie alle Felder aus und wählen Sie einen Termin.');
        return;
      }
      // Bestehende Buchungen laden
      let bookings = [];
      try {
        bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      } catch (err) {
        bookings = [];
      }
      // Neue Buchung hinzufügen
      bookings.push({
        date: selectedDate,
        service: service,
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('bookings', JSON.stringify(bookings));
      // Bestätigung anzeigen
      alert(`Vielen Dank, ${name}! Ihre Buchungsanfrage für den ${selectedDate} (${service}) wurde gesendet. Wir werden uns in Kürze bei Ihnen melden.`);
      // Formular zurücksetzen
      document.getElementById('booking-name').value = '';
      document.getElementById('booking-email').value = '';
      document.getElementById('service-select').selectedIndex = 0;
      if (bookingForm) bookingForm.classList.remove('visible');
      const selectedCell = calendarEl.querySelector('.selected');
      if (selectedCell) selectedCell.classList.remove('selected');
      selectedDate = null;
    });
  }
});