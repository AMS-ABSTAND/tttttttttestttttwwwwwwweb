/*
  Simple booking calendar implementation.

  The calendar displays the current month and highlights the days that are
  available for booking based on a JSON file located at `data/availability.json`.
  When an available date is clicked, a booking form is revealed allowing users
  to choose a service and enter their contact information.

  Administrators can update `data/availability.json` to control which days
  appear as available. Only dates explicitly listed in the JSON will be
  selectable by customers.
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

  // If the calendar is not present on this page, abort early.
  if (!calendarEl) return;

  let availability = [];
  let currentDate = new Date();
  let selectedDate = null;

  // Fetch available dates from the JSON file
  fetch('data/availability.json')
    .then(response => response.json())
    .then(data => {
      availability = data.availableDates || [];
      renderCalendar(currentDate);
    })
    .catch(err => {
      console.error('Failed to load availability data:', err);
      renderCalendar(currentDate);
    });

  // Render the calendar for a given month and year
  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Update month-year label
    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    if (monthYearLabel) {
      monthYearLabel.textContent = `${monthNames[month]} ${year}`;
    }

    // Determine first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) – 6 (Sat)
    const totalDays = lastDay.getDate();

    // Clear existing rows
    calendarEl.innerHTML = '';

    // Create header row for weekdays
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

    // Create body
    const tbody = document.createElement('tbody');
    let row = document.createElement('tr');
    // Fill initial empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
      const cell = document.createElement('td');
      cell.classList.add('unavailable');
      row.appendChild(cell);
    }
    // Fill days of month
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = cellDate.toISOString().split('T')[0];
      const cell = document.createElement('td');
      cell.textContent = day;
      // Determine if date is available
      if (availability.includes(dateStr)) {
        cell.classList.add('available');
        cell.addEventListener('click', () => selectDate(dateStr, cell));
      } else {
        cell.classList.add('unavailable');
      }
      row.appendChild(cell);
      // If end of week, create new row
      if ((startDayOfWeek + day) % 7 === 0) {
        tbody.appendChild(row);
        row = document.createElement('tr');
      }
    }
    // Fill trailing empty cells to complete the grid
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

  // Handle date selection
  function selectDate(dateStr, cell) {
    // Deselect previous selection
    const previouslySelected = calendarEl.querySelector('.selected');
    if (previouslySelected) {
      previouslySelected.classList.remove('selected');
    }
    cell.classList.add('selected');
    selectedDate = dateStr;
    if (bookingDateDisplay) {
      bookingDateDisplay.textContent = selectedDate;
    }
    if (bookingDateInput) {
      bookingDateInput.value = selectedDate;
    }
    // Show booking form
    if (bookingForm) {
      bookingForm.classList.add('visible');
    }
  }

  // Navigation handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
      // Hide booking form when navigating months
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

  // Submit handler (basic feedback)
  if (submitButton) {
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      // Basic validation
      const name = document.getElementById('booking-name').value.trim();
      const email = document.getElementById('booking-email').value.trim();
      const service = document.getElementById('service-select').value;
      if (!selectedDate || !name || !email || !service) {
        alert('Bitte füllen Sie alle Felder aus und wählen Sie einen Termin.');
        return;
      }
      // Show confirmation message
      alert(`Vielen Dank, ${name}! Ihre Buchungsanfrage für den ${selectedDate} (` +
            `${service}) wurde gesendet. Wir werden uns in Kürze bei Ihnen melden.`);
      // Reset form
      document.getElementById('booking-name').value = '';
      document.getElementById('booking-email').value = '';
      document.getElementById('service-select').selectedIndex = 0;
      bookingForm.classList.remove('visible');
      const selectedCell = calendarEl.querySelector('.selected');
      if (selectedCell) selectedCell.classList.remove('selected');
    });
  }
});