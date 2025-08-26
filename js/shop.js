/*
  Dynamische Shop‑Logik für die Tech‑Support‑Website.

  Dieses Skript lädt Produktinformationen aus `data/products.json`,
  erstellt Kategorienfilter und Produktkarten und verwaltet einen
  einfachen Warenkorb im localStorage. Nutzer können Produkte nach
  Kategorie filtern, zur Anzeige hinzufügen und in den Warenkorb legen.
*/

document.addEventListener('DOMContentLoaded', () => {
  const categoryFilter = document.getElementById('category-filter');
  const productList = document.getElementById('product-list');
  const cartCountEl = document.getElementById('cart-count');
  let products = [];
  let categories = [];

  // Aktualisiert die Warenkorbanzeige basierend auf localStorage
  function updateCartCount() {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (err) {
      cart = [];
    }
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = count;
  }

  // Produkte und Kategorien aus JSON laden
  fetch('data/products.json')
    .then(res => res.json())
    .then(data => {
      products = data.products || [];
      categories = data.categories || [];
      populateCategoryFilter();
      renderProducts();
    })
    .catch(err => {
      // Wenn das Laden des JSON aufgrund von CORS oder File‑Protocol nicht funktioniert,
      // definieren wir hier Fallback‑Produkte und Kategorien. So funktioniert der Shop
      // auch lokal ohne Server.
      console.error('Fehler beim Laden der Produkte:', err);
      products = [
        {
          id: 'kabel-01',
          name: 'USB‑C Kabel 1 m',
          category: 'Zubehör',
          description:
            'Hochwertiges USB‑C Kabel mit 1 m Länge für schnelle Datenübertragung und zuverlässiges Laden.',
          price: 9.99,
          image: 'images/tools.svg'
        },
        {
          id: 'maus-01',
          name: 'Kabellose Maus',
          category: 'Zubehör',
          description:
            'Ergonomische kabellose Maus mit hoher Präzision und langer Batterielaufzeit.',
          price: 24.99,
          image: 'images/laptop-code.svg'
        },
        {
          id: 'ssd-01',
          name: '256 GB SSD',
          category: 'Ersatzteile',
          description:
            'Schnelle Solid‑State‑Disk für einen deutlichen Leistungsschub Ihres Computers.',
          price: 49.99,
          image: 'images/database.svg'
        },
        {
          id: 'ram-01',
          name: '8 GB DDR4 RAM',
          category: 'Ersatzteile',
          description:
            'Arbeitsspeicher für flüssige Performance bei alltäglichen Aufgaben und Multitasking.',
          price: 34.99,
          image: 'images/tools.svg'
        },
        {
          id: 'office-01',
          name: 'Office Suite Lizenz',
          category: 'Software & Lizenzen',
          description:
            'Umfangreiche Office‑Suite für effizientes Arbeiten in Beruf und Freizeit.',
          price: 119.99,
          image: 'images/laptop-code.svg'
        },
        {
          id: 'security-01',
          name: 'Sicherheitssoftware Jahreslizenz',
          category: 'Software & Lizenzen',
          description:
            'Schützen Sie Ihre Geräte vor Viren, Malware und Phishing mit einer bewährten Sicherheitslösung.',
          price: 59.99,
          image: 'images/database.svg'
        },
        {
          id: 'gutschein-01',
          name: 'Service‑Gutschein 1 h',
          category: 'Service‑Gutscheine',
          description:
            'Verschenken Sie professionelle IT‑Hilfe: Gutschein für eine Stunde Support Ihrer Wahl.',
          price: 39.9,
          image: 'images/tools.svg'
        },
        {
          id: 'gutschein-02',
          name: 'Service‑Gutschein 3 h',
          category: 'Service‑Gutscheine',
          description:
            'Drei Stunden geballtes IT‑Know‑how – ideal für größere Projekte oder umfassende Beratung.',
          price: 99.9,
          image: 'images/laptop-code.svg'
        }
      ];
      // Erzeugt eindeutige Kategorien aus den Fallback‑Produkten
      categories = [...new Set(products.map(p => p.category))];
      populateCategoryFilter();
      renderProducts();
    });

  // Füllt das Dropdown mit Kategorien
  function populateCategoryFilter() {
    if (!categoryFilter) return;
    categoryFilter.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Alle Kategorien';
    categoryFilter.appendChild(allOption);
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
  }

  // Erzeugt Produktkarten entsprechend der aktuellen Filterung
  function renderProducts() {
    if (!productList) return;
    productList.innerHTML = '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const filtered = selectedCategory
      ? products.filter(p => p.category === selectedCategory)
      : products;
    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="price">${product.price.toFixed(2)} €</p>
        <button data-id="${product.id}">In den Warenkorb</button>
      `;
      // Event-Handler für Button
      const button = card.querySelector('button');
      button.addEventListener('click', () => addToCart(product.id));
      productList.appendChild(card);
    });
  }

  // Fügt ein Produkt dem Warenkorb hinzu und aktualisiert die Anzeige
  function addToCart(productId) {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (err) {
      cart = [];
    }
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Artikel wurde dem Warenkorb hinzugefügt.');
  }

  // Filterwechsel
  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderProducts);
  }
  // Warenkorb initialisieren
  updateCartCount();
});