/* --- MAGOS LOGIC & DATA --- */

// 1. DATA CONFIG (Bisa diupdate nanti via Firebase jika perlu)
const adminPhone = "628123456789"; // GANTI DENGAN NOMOR WA FAJRI (Format 628...)

const products = Array.from({length:20}).map((_,i)=>({
  id: i+1,
  name: `Magos Tee ${i+1 < 10 ? '0'+(i+1) : i+1}`,
  rawPrice: 200000 + (i % 5)*25000,
  price: `Rp ${(200000 + (i % 5)*25000).toLocaleString('id-ID')}`,
  img: `https://picsum.photos/800/1000?random=${101+i}`,
  desc: `Edisi terbatas Magos Vol.${i+1}. Bahan Cotton Combed 24s Heavyweight. Boxy fit.`
}));

const collectionData = [
    { id: 'c1', title: "Dark Cargo", desc: "Setelan cargo tactical.", img: "https://picsum.photos/600/800?random=501" },
    { id: 'c2', title: "Oversized Hoodie", desc: "Hoodie heavyweight 400gsm.", img: "https://picsum.photos/600/800?random=502" },
    { id: 'c3', title: "Utility Vest", desc: "Rompi utilitas pelindung.", img: "https://picsum.photos/600/800?random=503" }
];

const lookbooks = [
    { id: 1, title: "URBAN DECAY", cover: "https://picsum.photos/800/1000?random=31", desc: "Sesi foto konstruksi.", gallery: ["https://picsum.photos/800/600?random=201", "https://picsum.photos/800/600?random=202"] },
    { id: 2, title: "NEON NIGHTS", cover: "https://picsum.photos/800/1000?random=32", desc: "Cahaya malam Bandung.", gallery: ["https://picsum.photos/800/600?random=205", "https://picsum.photos/800/600?random=206"] }
];

const journalEntries = [
    { id: 1, title: "Behind the Fabric", desc: "Wawancara proses pembuatan.", img: "https://picsum.photos/900/400?random=88" },
    { id: 2, title: "Community Drop", desc: "Pop-up show di Bandung.", img: "https://picsum.photos/900/400?random=89" }
];

// 2. SCROLL & UI LOGIC
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

// 3. CART SYSTEM
let cart = [];
const shipCosts = { 'JNE': 20000, 'JNT': 22000 };

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    drawer.classList.toggle('active');
    backdrop.classList.toggle('active');
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const countBadge = document.getElementById('cartCount');
    const totalDisplay = document.getElementById('cartTotalDisplay');
    
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    countBadge.textContent = totalItems;
    if(totalItems > 0) countBadge.classList.add('active');
    else countBadge.classList.remove('active');

    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    totalDisplay.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;

    container.innerHTML = '';
    if(cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Keranjang kosong.</p>';
        return;
    }

    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.img}" class="cart-item-img" alt="img">
            <div class="cart-item-details">
                <div><div class="cart-item-title">${item.name}</div><div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div></div>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">&#60;</button>
                    <input type="number" class="qty-input" value="${item.qty}" readonly>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">&#62;</button>
                </div>
            </div>`;
        container.appendChild(el);
    });
}

function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if(!item) return;
    let newQty = item.qty + change;
    if (newQty < 1) cart = cart.filter(i => i.id !== id);
    else item.qty = newQty;
    updateCartUI();
}

function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if(existing) existing.qty++;
    else cart.push({ id: product.id, name: product.name, price: product.rawPrice, img: product.img, qty: 1 });
    
    // Flying Animation
    const btn = document.getElementById('btnAddToCart'); 
    const cartIcon = document.getElementById('cartTrigger');
    const btnRect = btn.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    const flyer = document.createElement('img');
    flyer.src = product.img; flyer.className = 'flying-img';
    flyer.style.width = '50px'; flyer.style.height = '50px';
    flyer.style.top = (btnRect.top + btnRect.height/2 - 25) + 'px';
    flyer.style.left = (btnRect.left + btnRect.width/2 - 25) + 'px';
    document.body.appendChild(flyer);
    setTimeout(() => {
        flyer.style.top = (cartRect.top + cartRect.height/2 - 25) + 'px';
        flyer.style.left = (cartRect.left + cartRect.width/2 - 25) + 'px';
        flyer.style.opacity = '0';
        flyer.style.width = '10px'; flyer.style.height = '10px';
    }, 50);
    setTimeout(() => { flyer.remove(); updateCartUI(); }, 800);
}

// 4. CHECKOUT LOGIC (WHATSAPP INTEGRATION)
function openCheckoutModal() {
    if(cart.length === 0) { alert("Keranjang kosong!"); return; }
    toggleCart(); 
    document.getElementById('checkoutFormView').style.display = 'grid';
    document.getElementById('checkoutSummaryView').classList.remove('active');
    document.getElementById('checkoutSummaryView').style.display = 'none';
    document.getElementById('checkoutModal').classList.add('active');
}

function validateAndProceed() {
    const ids = ['coName', 'coPhone', 'coAddress', 'coShipping'];
    let valid = true; let data = {};
    ids.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('input-error');
        if(!el.value) { el.classList.add('input-error'); valid = false; }
        else data[id] = el.value;
    });

    if(!valid) return; 

    document.getElementById('checkoutFormView').style.display = 'none';
    const sumView = document.getElementById('checkoutSummaryView');
    sumView.style.display = 'block';
    setTimeout(() => sumView.classList.add('active'), 50);

    document.getElementById('sumName').textContent = data.coName;
    document.getElementById('sumAddress').textContent = data.coAddress;
    document.getElementById('sumShipMethod').textContent = data.coShipping;

    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const shipCost = shipCosts[data.coShipping] || 0;
    const total = subtotal + shipCost;
    document.getElementById('sumTotal').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function backToForm() {
    document.getElementById('checkoutSummaryView').classList.remove('active');
    setTimeout(() => {
        document.getElementById('checkoutSummaryView').style.display = 'none';
        document.getElementById('checkoutFormView').style.display = 'grid';
    }, 300);
}

function finalizeOrderWA() {
    const name = document.getElementById('coName').value;
    const phone = document.getElementById('coPhone').value;
    const address = document.getElementById('coAddress').value;
    const ship = document.getElementById('coShipping').value;
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const shipCost = shipCosts[ship] || 0;
    const total = subtotal + shipCost;

    let itemList = "";
    cart.forEach(c => { itemList += `- ${c.name} (x${c.qty})%0A`; });

    const text = `Halo Admin MAGOS,%0A%0ASaya mau order:%0A${itemList}%0A` +
                 `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}%0A` +
                 `Ongkir (${ship}): Rp ${shipCost.toLocaleString('id-ID')}%0A` +
                 `*TOTAL: Rp ${total.toLocaleString('id-ID')}*%0A%0A` +
                 `Data Pengiriman:%0A` +
                 `Nama: ${name}%0A` +
                 `No HP: ${phone}%0A` +
                 `Alamat: ${address}`;

    window.open(`https://wa.me/${adminPhone}?text=${text}`, '_blank');
}

// 5. MODAL SYSTEM & INITIALIZATION
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-backdrop').forEach(m => m.addEventListener('click', e => { if(e.target===m) m.classList.remove('active'); }));

// Render Products
const grid = document.getElementById('productGrid');
function displayProducts() {
    // Menampilkan 6 produk pertama saja sebagai contoh
    products.slice(0,6).forEach(p => {
        const el = document.createElement('div'); el.className='prod';
        el.onclick = () => openProductModal(p);
        el.innerHTML = `<div class="label">NEW</div><img src="${p.img}"><div class="overlay"></div><div class="meta"><h4>${p.name}</h4><p>${p.price}</p></div>`;
        grid.appendChild(el);
    });
}

function openProductModal(product) {
    document.getElementById('mTitle').textContent = product.name;
    document.getElementById('mPrice').textContent = product.price;
    document.getElementById('mDesc').textContent = product.desc;
    document.getElementById('mImage').src = product.img;
    const btn = document.getElementById('btnAddToCart');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.id = 'btnAddToCart';
    newBtn.onclick = () => addToCart(product);
    document.getElementById('productModal').classList.add('active');
}

// Initialize Everything
displayProducts();
// (Opsional: Panggil fungsi lain seperti renderCollection, renderLookbook sesuai kebutuhan data)
