// Render filter buttons
function renderFilterButtons(categories, colors) {
  const categoryFilters = document.getElementById("category-filters");
  categoryFilters.innerHTML = `<h2 class="text-xl font-semibold">Categories</h2>`;
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.attributes.CategoryName || cat.attributes.name;
    btn.className = "px-3 py-1 rounded bg-gray-200 hover:bg-blue-300 duration-200";
    btn.onclick = () => filterProducts("category", cat.id);
    categoryFilters.appendChild(btn);
  });

  const colorFilters = document.getElementById("color-filters");
  colorFilters.innerHTML = `<h2 class="text-xl font-semibold">Colors</h2>`;
  colors.forEach(col => {
    const btn = document.createElement("button");
    btn.textContent = col.attributes.ColorName || col.attributes.name;
    btn.className = "px-3 py-1 rounded bg-gray-200 hover:bg-blue-300 duration-200";
    btn.onclick = () => filterProducts("color", col.id);
    colorFilters.appendChild(btn);
  });
}

// Render products
function renderProducts(products) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach(p => {
    // Main image
    let imgUrl = "https://via.placeholder.com/300x200?text=No+Image";
    if (p.image && p.image.url) {
      imgUrl = "http://localhost:1337" + p.image.url;
    } else if (p.image && p.image.data && p.image.data.attributes && p.image.data.attributes.url) {
      imgUrl = "http://localhost:1337" + p.image.data.attributes.url;
    }
    // Hover image
    let hoverUrl = null;
    if (p.hoverimage && p.hoverimage.url) {
      hoverUrl = "http://localhost:1337" + p.hoverimage.url;
    } else if (p.hoverimage && p.hoverimage.data && p.hoverimage.data.attributes && p.hoverimage.data.attributes.url) {
      hoverUrl = "http://localhost:1337" + p.hoverimage.data.attributes.url;
    }

    const card = document.createElement("div");
    card.className = "bg-white overflow-hidden ";
    card.style.position = "relative";

    card.innerHTML = `
      <div class="relative w-full h-110">
        <img src="${imgUrl}" alt="${p.title || "Product"}" class="w-full h-110 object-cover product-img transition-all duration-500" style="position:absolute;top:0;left:0;z-index:1;opacity:1;">
        ${hoverUrl ? `<img src="${hoverUrl}" class="w-full h-110 object-cover hover-img transition-all duration-500" style="position:absolute;top:0;left:0;z-index:2;opacity:0;">` : ""}
      </div>
      <div class="">
        <h2 class="text-2xl mt-4 font-semibold mb-2">${p.title || "No Title"}</h2>
        <p class="text-xl mb-2">$${p.price || ""}</p>
      </div>
    `;

    // Hover icons
    const iconsDiv = document.createElement("div");
    iconsDiv.className = "absolute top-47 right-20 flex gap-5 opacity-0 transition-opacity duration-300 z-10";
    iconsDiv.innerHTML = `
      <button class="text-3xl text-black px-3 cursor-pointer bg-white rounded-full p-2 shadow hover:bg-black hover:text-white duration-300">
        <i class="ri-heart-line "></i>
      </button>
      <button class="text-3xl text-black px-3 cursor-pointer bg-white rounded-full p-2 shadow hover:bg-black hover:text-white duration-300">
        <i class="ri-shopping-bag-line  add-cart-btn"></i>
      </button>
      <button class="text-3xl text-black px-3 cursor-pointer bg-white rounded-full p-2 shadow hover:bg-black hover:text-white duration-300">
        <i class="ri-eye-line "></i>
      </button>
      <button class="text-3xl text-black px-3 cursor-pointer bg-white rounded-full p-2 shadow hover:bg-black hover:text-white duration-300">
        <i class="ri-share-line "></i>
      </button>
    `;
    card.querySelector('.relative').appendChild(iconsDiv);

    // Add to cart event
    iconsDiv.querySelector('.add-cart-btn').onclick = function (e) {
      e.stopPropagation();
      addToCart(p);
    };

    // Show/hide icons and hover image
    card.addEventListener("mouseenter", () => {
      if (hoverUrl) {
        const imgEl = card.querySelector(".product-img");
        const hoverEl = card.querySelector(".hover-img");
        hoverEl.style.opacity = 1;
        imgEl.style.opacity = 0;
      }
      iconsDiv.style.opacity = 1;
    });
    card.addEventListener("mouseleave", () => {
      if (hoverUrl) {
        const imgEl = card.querySelector(".product-img");
        const hoverEl = card.querySelector(".hover-img");
        hoverEl.style.opacity = 0;
        imgEl.style.opacity = 1;
      }
      iconsDiv.style.opacity = 0;
    });

    // Quick view event
    iconsDiv.querySelector('.ri-eye-line').onclick = function (e) {
      e.stopPropagation();
      showProductQuickView(p);
    };

    container.appendChild(card);
  });
}

// Add price filter UI
function renderPriceFilter() {
  const filtersDiv = document.querySelector('.filters');
  const priceDiv = document.createElement('div');
  priceDiv.className = 'flex flex-col gap-2 mt-4';
  priceDiv.innerHTML = `
    <h2 class="text-3xl mb-4 text-black font-serif">Price</h2>
    <label class="text-lg">Min: <input type="number" id="min-price" class="border rounded px-2 py-1 w-22" min="0"></label>
    <label class="text-lg">Max: <input type="number" id="max-price" class="border mb-16 rounded px-2 py-1 w-22" min="0"></label>
  `;
  filtersDiv.appendChild(priceDiv);

  // Filter as user types
  const minInput = document.getElementById('min-price');
  const maxInput = document.getElementById('max-price');
  function handlePriceChange() {
    const min = parseFloat(minInput.value) || 0;
    const max = parseFloat(maxInput.value) || Infinity;
    filterProducts('price', { min, max });
  }
  minInput.addEventListener('input', handlePriceChange);
  maxInput.addEventListener('input', handlePriceChange);
}

// Filter products
function filterProducts(type, value) {
  let filtered = window.allProducts;
  if (type === "category") {
    filtered = filtered.filter(p =>
      Array.isArray(p.product_categories) &&
      p.product_categories.some(c => c.id === value)
    );
  } else if (type === "color") {
    filtered = filtered.filter(p =>
      Array.isArray(p.product_colors) &&
      p.product_colors.some(c => c.id === value)
    );
  } else if (type === "price") {
    filtered = filtered.filter(p => {
      const price = parseFloat(p.price);
      return price >= value.min && price <= value.max;
    });
  }
  renderProducts(filtered);
}

// Load products, categories, colors
async function loadProducts() {
  try {
    const [productsRes, categoriesRes, colorsRes] = await Promise.all([
      fetch("http://localhost:1337/api/products?populate=*"),
      fetch("http://localhost:1337/api/product-categories"),
      fetch("http://localhost:1337/api/product-colors")
    ]);

    // If any fetch failed, redirect to error page
    if (!productsRes.ok || !categoriesRes.ok || !colorsRes.ok) {
      window.location.href = "/error.html";
      return;
    }

    const productsResult = await productsRes.json();
    const categoriesResult = await categoriesRes.json();
    const colorsResult = await colorsRes.json();

    // Strapi v4: product fields are direct, not under attributes
    const products = (productsResult.data || []).map(p => ({
      id: p.id,
      title: p.title || p.attributes?.title,
      price: p.price || p.attributes?.price,
      image: p.image || p.attributes?.image,
      hoverimage: p.hoverimage || p.attributes?.hoverimage,
      product_categories: p.product_categories || p.attributes?.product_categories || [],
      product_colors: p.product_colors || p.attributes?.product_colors || [],
      description: p.description || p.attributes?.description || ''
    }));

    // Strapi v4: categories/colors fields are direct, not under attributes
    const categories = (categoriesResult.data || []).map(cat => ({
      id: cat.id,
      name: cat.CategoryName || cat.attributes?.CategoryName || cat.attributes?.name || "Unknown"
    }));
    const colors = (colorsResult.data || []).map(col => ({
      id: col.id,
      name: col.ColorName || col.attributes?.ColorName || col.attributes?.name || "Unknown"
    }));

    // Render category filter buttons
    const categoryFilters = document.getElementById("category-filters");
    categoryFilters.innerHTML = `<h2 class="text-3xl mb-4 text-black font-serif">Categories</h2>`;
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat.name;
      btn.className = " py-1  text-xl text-gray-700 w-2 hover:text-black duration-200";
      btn.onclick = () => filterProducts("category", cat.id);
      categoryFilters.appendChild(btn);
    });

    // Render color filter buttons
    const colorFilters = document.getElementById("color-filters");
    colorFilters.innerHTML = `<h2 class="text-3xl mb-4 text-black font-serif">Colors</h2>`;
    colors.forEach(col => {
      const btn = document.createElement("button");
      btn.textContent = col.name;
      btn.className = " py-1  text-xl text-gray-700 w-2 hover:text-black duration-200";
      btn.onclick = () => filterProducts("color", col.id);
      colorFilters.appendChild(btn);
    });

    window.allProducts = products;
    renderProducts(products);
    renderPriceFilter();
  } catch (err) {
    window.location.href = "/error.html";
  }
}

// Cart state with localStorage
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('cart');
    window.cart = saved ? JSON.parse(saved) : [];
  } catch {
    window.cart = [];
  }
}
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(window.cart));
}

window.cart = [];

function addToCart(product) {
  const existing = window.cart.find(item => item.id === product.id);
  if (existing) {
    existing.count++;
  } else {
    window.cart.push({ ...product, count: 1 });
  }
  saveCartToStorage();
  renderCart();
  showCartNotification(product);
}

function showCartNotification(product) {
  let notif = document.getElementById('cart-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'cart-notification';
    notif.className = 'fixed top-5 right-80 bg-green-500 text-white px-8 py-5 rounded-lg shadow-lg z-50 text-lg font-semibold opacity-0 transition-opacity duration-500';
    document.body.appendChild(notif);
  }
  notif.textContent = `"${product.title}" added to cart!`;
  notif.style.opacity = 1;
  setTimeout(() => {
    notif.style.opacity = 0;
  }, 1800);
}

function renderCart() {
  let cartDiv = document.getElementById('cart-modal');
  if (!cartDiv) {
    cartDiv = document.createElement('div');
    cartDiv.id = 'cart-modal';
    cartDiv.className = 'fixed top-0 right-0 w-110 h-full bg-white shadow-2xl z-50 p-6 overflow-y-auto border-l-2 border-gray-200';
    cartDiv.style.display = 'none';
    cartDiv.style.transition = 'all 0.3s';
    document.body.appendChild(cartDiv);
  }
  // Always keep cartDiv in DOM
  cartDiv.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Cart</h2>
      <button id="close-cart-btn" class="text-2xl bg-gray-200 rounded-full px-2 py-1 hover:bg-gray-400"><i class="ri-close-line"></i></button>
    </div>
    ${window.cart.length === 0 ? `<p class="text-gray-500">Your cart is empty.</p>` : `
    <div class="flex flex-col gap-4">
      ${window.cart.map(item => `
        <div class="flex items-center gap-4 p-3 rounded-lg shadow border border-gray-100 bg-gray-50">
          <img src="${item.image && item.image.url ? 'http://localhost:1337' + item.image.url : 'https://via.placeholder.com/60x60?text=No+Image'}" class="w-16 h-16 object-cover rounded" />
          <div class="flex-1">
            <div class="font-semibold text-lg">${item.title}</div>
            <div class="text-gray-600">$${item.price}</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 cursor-pointer bg-gray-200 text-lg font-bold rounded decrease-btn" data-id="${item.id}"><i class="ri-subtract-line"></i></button>
            <span class="font-bold text-lg">${item.count}</span>
            <button class="px-3 py-1 cursor-pointer bg-gray-200 text-lg font-bold rounded increase-btn" data-id="${item.id}"><i class="ri-add-line"></i></button>
          </div>
          <button class="ml-2 px-3 py-1 cursor-pointer bg-red-500 text-lg text-white rounded remove-cart-btn" data-id="${item.id}"><i class="ri-delete-bin-7-line"></i></button>
        </div>
      `).join('')}
    </div>
    <div class="mt-6 text-xl font-bold flex justify-between items-center">
      <span>Total:</span>
      <span>$${window.cart.reduce((sum, item) => sum + item.price * item.count, 0)}</span>
    </div>
    <button class="mt-6 w-full py-3 cursor-pointer bg-green-600 text-white rounded-lg text-lg font-bold hover:bg-green-700 duration-300 transition">Checkout</button>
    `}
  `;
  // Remove item
  cartDiv.querySelectorAll('.remove-cart-btn').forEach(btn => {
    btn.onclick = function () {
      window.cart = window.cart.filter(item => item.id != btn.dataset.id);
      saveCartToStorage();
      renderCart();
    };
  });
  // Increase count
  cartDiv.querySelectorAll('.increase-btn').forEach(btn => {
    btn.onclick = function () {
      const item = window.cart.find(i => i.id == btn.dataset.id);
      if (item) item.count++;
      saveCartToStorage();
      renderCart();
    };
  });
  // Decrease count
  cartDiv.querySelectorAll('.decrease-btn').forEach(btn => {
    btn.onclick = function () {
      const item = window.cart.find(i => i.id == btn.dataset.id);
      if (item && item.count > 1) item.count--;
      saveCartToStorage();
      renderCart();
    };
  });
  // Close cart
  const closeBtn = cartDiv.querySelector('#close-cart-btn');
  if (closeBtn) {
    closeBtn.onclick = function () {
      cartDiv.style.display = 'none';
    };
  }
}

function setupCartHeaderButton() {
  const cartIcon = document.querySelector('.ri-shopping-bag-2-line');
  if (!cartIcon) return;
  cartIcon.style.cursor = 'pointer';
  cartIcon.onclick = function () {
    let cartDiv = document.getElementById('cart-modal');
    if (!cartDiv) {
      renderCart();
      cartDiv = document.getElementById('cart-modal');
    }
    cartDiv.style.display = 'block';
    cartDiv.scrollTop = 0;
  };
}

// Quick view modal
function showProductQuickView(product) {
  let modal = document.getElementById('quickview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickview-modal';
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-transparent';
    modal.innerHTML = `
      <div class="bg-white shadow-2xl  w-300 relative flex border border-gray-200" style="box-shadow: 0 8px 32px rgba(0,0,0,0.18);">
        <button id="close-quickview-btn" class="absolute top-5 right-5 text-xl cursor-pointer bg-white border border-gray-300 rounded-full px-3 py-2 shadow hover:bg-gray-100 hover:text-red-500 duration-300"><i class="ri-close-line"></i></button>
        <div class="w-1/2 flex items-center justify-center">
          <img id="quickview-img" src="" class="w-full h-full object-cover  border border-gray-100 shadow" style="" />
        </div>
        <div class="w-1/2 px-12 flex flex-col justify-center">
          <h2 id="quickview-title" class="text-4xl font-semibold font-serif mb-1 text-black"></h2>
          <p  class="text-gray-500  mb-2 font-serif">By Adena</p>
          <span id="quickview-price" class="inline-block  text-black text-3xl"></span>
          <br />
          <p id="quickview-desc" class="text-gray-700 border-t border-gray-200 text-lg mb-4 pt-5 leading-relaxed"></p>
          <div class="flex items-center justify-between  ">
          <button id="quickview-addcart-btn" class="mt-4 px-20 py-2 bg-black text-white text-lg cursor-pointer hover:shadow-2xl hover:bg-gray-200 hover:text-black duration-300 flex items-center gap-2 self-start">
            ADD TO CART
          </button>
          <i class="ri-checkbox-circle-line text-xl text-green-500 ml-37 mt-4"></i>
          <p class="text-green-500 mt-4">available</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Fill modal with product info
  document.getElementById('quickview-img').src = product.image && product.image.url ? 'http://localhost:1337' + product.image.url : 'https://via.placeholder.com/300x200?text=No+Image';
  document.getElementById('quickview-title').textContent = product.title || 'No Title';
  document.getElementById('quickview-price').textContent = product.price ? `$${product.price}` : '';
  // Try to get description from all possible places
  let desc = '';
  if (product.description) desc = product.description;
  else if (product.desc) desc = product.desc;
  else if (product.attributes) {
    if (product.attributes.description) desc = product.attributes.description;
    else if (product.attributes.desc) desc = product.attributes.desc;
  }
  document.getElementById('quickview-desc').textContent = desc;
  modal.style.display = 'flex';
  // Add to Cart button event
  document.getElementById('quickview-addcart-btn').onclick = function () {
    addToCart(product);
  };
  // Close button
  document.getElementById('close-quickview-btn').onclick = function () {
    modal.style.display = 'none';
  };
}

// On page load, restore cart from localStorage
window.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  renderCart();
  setupCartHeaderButton();
  renderSearchBar();
});

// Init
loadProducts();

// Add search bar UI and logic
function renderSearchBar() {
  const main = document.querySelector('main');
  if (!main) return;
  let searchDiv = document.getElementById('product-search-bar');
  if (!searchDiv) {
    searchDiv = document.createElement('div');
    searchDiv.id = 'product-search-bar';
    searchDiv.className = 'flex justify-center items-center mt-10 mb-6';
    searchDiv.innerHTML = `
      <input type="text" id="search-input" placeholder="Search products by name..." class="w-96 px-5 py-3 border border-gray-300 rounded-full text-xl focus:outline-none focus:border-gray-500 shadow hover:scale-103 duration-300" />
    `;
    main.insertBefore(searchDiv, main.children[2]);
  }
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  function doSearch() {
    const query = input.value.trim().toLowerCase();
    if (!window.allProducts) return;
    if (!query) {
      renderProducts(window.allProducts);
      return;
    }
    const filtered = window.allProducts.filter(p => (p.title || '').toLowerCase().includes(query));
    renderProducts(filtered);
  }
  input.addEventListener('input', doSearch);
  btn.addEventListener('click', doSearch);
}
