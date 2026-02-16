/* ==========================================================================
   MAGOS FINAL SYSTEM - FULL INTEGRATED VERSION (NO COMPRESSION)
   ========================================================================== */

// --- 1. GLOBAL VARIABLES ---
let products = [];
let cart = [];
let wishlist = [];
let currentProduct = null;
let currentProductSlide = 0;
let productSlideCount = 0;
let selectedSize = null;

// Currency & Exchange Rate
let currentCurrency = 'IDR';
const exchangeRate = 16000; 

// Pagination & Filtering
let currentPage = 1;
const itemsPerPage = 6;
let currentFilter = 'all';

// Checkout & Promo System
const shippingRates = { 'jne': 30000, 'jnt': 35000, 'dhl': 550000, 'fedex': 600000 };
const activeVouchers = { 
    'MAGOSLAUNCH': { type: 'percent', value: 0.10 }, 
    'USAHADULU': { type: 'fixed', value: 20000 } 
};
let currentShippingCost = 0;
let grandTotal = 0;
let currentDiscountAmount = 0;
let appliedVoucherCode = '';

// --- 2. INITIALIZATION (WINDOW LOAD) ---
window.addEventListener('load', () => {
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        closeModal(e.target.id);
    }
});    
    // A. Preloader Logic
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => { preloader.style.visibility = 'hidden'; }, 500);
        }, 800); 
    }

    // B. Language & Currency Sync
    const savedLang = localStorage.getItem('magos_lang') || 'id';
    setLanguage(savedLang);
    currentCurrency = (savedLang === 'en') ? 'USD' : 'IDR';

    // C. Data Generation
    generateProducts();

    // D. UI Rendering
    if(document.getElementById('productGrid')) {
        displayProducts('all', 1);
    }

    // E. Storage Retrieval
    loadCartFromStorage();
    loadWishlistFromStorage();

    // F. Infinite Loop Animations
    initInfiniteLoop('hero-track');      
    initInfiniteLoop('marquee-content'); 
});

// --- 3. DATA GENERATION & FORMATTING ---
function generateProducts() {
    // CEK APAKAH SUDAH ADA DATA DI STORAGE
    const savedData = localStorage.getItem('magos_products_data');
    
    if (savedData) {
        // Jika ada, gunakan data dari storage (Gudang)
        products = JSON.parse(savedData);
    } else {
        // Jika belum ada (pertama kali buka), buat data awal dan simpan
        products = Array.from({length: 12}).map((_, i) => {
            const id = i + 1;
            let cat, price;
            // Stok awal standar
            const stock = { 'S': 5, 'M': 10, 'L': 5, 'XL': 3, 'XXL': 0 }; 
            
            if (i < 3) { cat='T-SHIRT'; price=185000; }
            else if (i < 6) { cat='OUTERWEAR'; price=350000; }
            else if (i < 9) { cat='BOTTOMS'; price=285000; }
            else { cat='ACCESSORIES'; price=95000; }
            
            return { id, name: `MAGOS ARCHIVE 00${id}`, category: cat, images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'], price, stock, desc: `Industrial grade material [TYPE_MGS_${id}].` };
        });
        localStorage.setItem('magos_products_data', JSON.stringify(products));
    }
}

function formatMoney(amount) {
    if (currentCurrency === 'USD') {
        return "$" + (amount / exchangeRate).toFixed(2);
    }
    return "Rp " + amount.toLocaleString('id-ID');
}

// --- 4. DISPLAY & FILTERING SYSTEM ---
function displayProducts(filterCat = 'all', page = 1) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;

    // 1. AKTIFKAN STATE LOADING & SKELETON
    // Menambahkan class 'is-loading' untuk kontrol CSS dan merender kotak skeleton
    grid.classList.add('is-loading');
    grid.innerHTML = Array.from({length: itemsPerPage}).map(() => `
        <div class="prod">
            <div class="skeleton"></div>
        </div>
    `).join('');

    currentFilter = filterCat;
    currentPage = page;

    // 2. SIMULASI LOADING (800ms) 
    // Memberikan waktu bagi skeleton untuk terlihat sebelum data asli muncul
    setTimeout(() => {
        const filtered = filterCat === 'all' || filterCat === 'ALL' 
            ? products 
            : products.filter(p => p.category.toLowerCase() === filterCat.toLowerCase());

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filtered.slice(start, end);

        // Matikan state loading
        grid.classList.remove('is-loading');
        grid.innerHTML = '';

        if(paginatedItems.length === 0) {
            grid.innerHTML = '<div style="width:100%; text-align:center; padding:50px; color:#666; font-size:10px;">NO_DATA_FOUND</div>';
        } else {
            paginatedItems.forEach(p => {
                const el = document.createElement('div');
                el.className = 'prod hover-target';
                
                // Logika Status Badge (Sinkron dengan Admin)
                let statusBadgeHTML = '';
                const status = p.status ? p.status.toUpperCase() : 'NORMAL';
                
                // Hanya tampilkan badge jika status bukan NORMAL (PRESALE atau SOLDOUT)
                if (status !== 'NORMAL') {
                    statusBadgeHTML = `<div class="status-indicator-capsule ${status.toLowerCase()}">${status}</div>`;
                }

                el.onclick = () => openProductModal(p);
                
                // Menggunakan images_list dari CMS yang sudah diproses menjadi array images
                const imgFront = p.images && p.images[0] ? p.images[0] : 'magos/assets/img/default.jpg';
                const imgBack = p.images && p.images[1] ? p.images[1] : imgFront;

                el.innerHTML = `
                    <div class="prod-img-wrapper">
                        <img src="${imgFront}" class="img-front" loading="lazy">
                        <img src="${imgBack}" class="img-back" loading="lazy">
                        ${statusBadgeHTML} 
                    </div>
                    <div class="label">${p.category}</div> 
                    <div class="meta">
                        <h4>${p.name}</h4>
                        <p>${formatMoney(p.price)}</p>
                    </div>
                `;
                grid.appendChild(el);
            });
        }
        
        renderPagination(totalPages, page);

        // Terapkan efek visual tambahan untuk produk SOLDOUT (Grayscale/Opacity)
        if (typeof applyStatusEffects === "function") {
            applyStatusEffects(paginatedItems);
        }
    }, 800); // Durasi loading skeleton
}

function renderPagination(totalPages, page) {
    const pagContainer = document.getElementById('paginationContainer');
    if (!pagContainer) return;
    pagContainer.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('div');
    prevBtn.className = `page-btn hover-target ${page === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '&#10094;'; 
    prevBtn.onclick = () => { if(page > 1) displayProducts(currentFilter, page - 1); };
    pagContainer.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('div');
        btn.className = `page-btn hover-target ${i === page ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => displayProducts(currentFilter, i);
        pagContainer.appendChild(btn);
    }

    const nextBtn = document.createElement('div');
    nextBtn.className = `page-btn hover-target ${page === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '&#10095;'; 
    nextBtn.onclick = () => { if(page < totalPages) displayProducts(currentFilter, page + 1); };
    pagContainer.appendChild(nextBtn);
}

function filterProducts(cat) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    // Visual trigger via event target in HTML usually
    displayProducts(cat, 1);
}

function openProductModal(p) {
    currentProduct = p;
    selectedSize = null; 
    const track = document.getElementById('pTrack');
    if (!track) return; 
    
    track.innerHTML = ''; 
    track.style.transform = 'translateX(0)';
    currentProductSlide = 0;
    
    // 1. Render Slider Gambar
    p.images.forEach(imgSrc => {
        const div = document.createElement('div');
        div.className = 'product-slide';
        div.innerHTML = `<img src="${imgSrc}">`;
        track.appendChild(div);
    });
    productSlideCount = p.images.length;

    // 2. Set Informasi Dasar
    document.getElementById('mTitle').innerText = p.name;
    document.getElementById('mPrice').innerText = formatMoney(p.price);
    document.getElementById('mDesc').innerText = p.desc;

    // 3. Sinkronisasi Stok & UI
    const stockGrid = document.getElementById('stockContainer');
    const allSizeBadge = document.getElementById('allSizeBadge');
    
    if (p.category === 'ACCESSORIES') {
        if(stockGrid) stockGrid.style.display = 'none';
        if(allSizeBadge) allSizeBadge.style.display = 'block';
        selectedSize = "ALL SIZE";
    } else {
        if(stockGrid) stockGrid.style.display = 'flex';
        if(allSizeBadge) allSizeBadge.style.display = 'none';
        
        const stockItems = document.querySelectorAll('.stock-item');
        stockItems.forEach(item => {
            const labelText = item.querySelector('.stock-circle').innerText;
            // AMBIL ANGKA STOK DARI DATA ADMIN
            const currentStock = p.stock[labelText] !== undefined ? p.stock[labelText] : 0;
            
            // UPDATE ANGKA DI LAYAR
            const numDisplay = item.querySelector('.stock-num');
            if(numDisplay) numDisplay.innerText = currentStock;

            // Atur State Visual
            item.classList.remove('selected', 'empty');
            item.style.opacity = "1";
            item.style.pointerEvents = "auto";

            if (currentStock === 0) {
                item.classList.add('empty');
                item.style.opacity = "0.2"; // Efek redup untuk stok habis
                item.style.pointerEvents = "none"; // Tidak bisa diklik
            }

            item.onclick = function() {
                if (currentStock === 0) return;
                document.querySelectorAll('.stock-item').forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
                selectedSize = labelText;
            };
        });
    }

    // 4. Render Tombol Aksi (Wishlist, Acquire, Cart)
    const btnPlace = document.getElementById('btnAddToCart');
    if(btnPlace) {
        const btnContainer = btnPlace.parentElement;
        btnPlace.style.display = 'none'; 

        const oldRow = btnContainer.querySelector('.action-row-dynamic');
        if(oldRow) oldRow.remove();

        const isWished = wishlist.some(item => item.id === p.id);
        const heartFill = isWished ? '#e02e42' : 'none';

        const actionRow = document.createElement('div');
        actionRow.className = 'action-row-dynamic';
        actionRow.innerHTML = `
            <div id="quickWishlist" class="action-icon-btn hover-target">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="${heartFill}">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </div>
            <button id="btnAcquireNow" class="btn primary hover-target">ACQUIRE NOW</button>
            <div id="quickAddCart" class="action-icon-btn hover-target">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
            </div>
        `;
        btnContainer.appendChild(actionRow);

        // Bind Events
        document.getElementById('btnAcquireNow').onclick = () => {
            if(!selectedSize) { alert("SELECT SIZE FIRST"); return; }
            addToCart(p, selectedSize); 
            window.location.href = 'checkout.html';
        };
        document.getElementById('quickAddCart').onclick = (e) => {
            if(!selectedSize) { alert("SELECT SIZE FIRST"); return; }
            addToCart(p, selectedSize);
            playJumpAnimation(e, '#cartCount');
        };
        document.getElementById('quickWishlist').onclick = (e) => {
            toggleWishlistItem(p.id);
            const isNowWished = wishlist.some(item => item.id === p.id);
            e.currentTarget.querySelector('svg').setAttribute('fill', isNowWished ? '#e02e42' : 'none');
        };
    }

    // 5. Render Sugesti Produk (YOU MIGHT ALSO LIKE)
    if (typeof renderRelatedProducts === "function") {
        renderRelatedProducts(p.category, p.id);
    }

    document.getElementById('productModal').classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Reset variabel global produk saat modal ditutup
        if (modalId === 'productModal') {
            currentProduct = null;
            selectedSize = null;
        }
    }
}

function moveProductSlide(direction) {
    if(productSlideCount <= 1) return;
    currentProductSlide = (currentProductSlide + direction + productSlideCount) % productSlideCount;
    document.getElementById('pTrack').style.transform = `translateX(-${currentProductSlide * 100}%)`;
}

function toggleSizeChart() {
    const modal = document.getElementById('sizeChartModal');
    const chartImg = modal.querySelector('.static-chart-container img');
    const calcResult = document.getElementById('calcResult');
    
    if (!modal || !currentProduct) return;

    // 1. Sinkronisasi Gambar Size Chart
    // Jika produk memiliki sizeChart khusus, gunakan itu. Jika tidak, pakai default.
    const defaultChart = 'assets/img/size-guide.jpg';
    chartImg.src = currentProduct.sizeChart || defaultChart;

    // 2. Reset UI Kalkulator
    // Membersihkan hasil pencarian ukuran sebelumnya agar tidak berantakan
    if (calcResult) {
        calcResult.style.display = 'none';
        calcResult.innerText = '';
    }
    
    // 3. Reset Input
    if (document.getElementById('calcHeight')) document.getElementById('calcHeight').value = '';
    if (document.getElementById('calcWeight')) document.getElementById('calcWeight').value = '';

    // 4. Tampilkan Modal
    modal.classList.add('active');
}
// --- Sambungan dari fungsi toggleSizeChart ---

function calculateSize() {
    // 1. Ambil input dari elemen HTML
    const heightInput = document.getElementById('calcHeight');
    const weightInput = document.getElementById('calcWeight');
    const resultDisplay = document.getElementById('calcResult');

    // 2. Validasi Input
    if (!heightInput || !weightInput || !resultDisplay) return;

    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);

    if (!h || !w) {
        alert("PLEASE ENTER BOTH HEIGHT AND WEIGHT");
        return;
    }

    // 3. Logika Penentuan Ukuran (Bisa disesuaikan dengan standar brand Anda)
    let recommendedSize = "M"; 
    if (h > 180 || w > 85) {
        recommendedSize = "XXL";
    } else if (h > 175 || w > 75) {
        recommendedSize = "XL";
    } else if (h > 168 || w > 65) {
        recommendedSize = "L";
    } else if (h < 160 || w < 50) {
        recommendedSize = "S";
    }

    // 4. Render Hasil ke UI dengan gaya kapsul industrial
    resultDisplay.style.display = 'block';
    resultDisplay.innerHTML = `
        <div style="margin-top: 15px; padding: 15px; border-top: 1px dashed #222;">
            <span style="font-size: 9px; color: #666; letter-spacing: 1px; font-weight: 900; text-transform: uppercase;">
                RECOMMENDED SIZE:
            </span>
            <span style="display: inline-block; margin-left: 10px; background: #fff; color: #000; padding: 5px 15px; border-radius: 50px; font-weight: 900; font-size: 12px; letter-spacing: 1px;">
                ${recommendedSize}
            </span>
        </div>
    `;
}

// Tambahkan/Update di magos.js
function addToCart(p, size) {
    // 1. Cari produk di database lokal untuk validasi stok terkini
    const productInDb = products.find(item => item.id === p.id);
    
    if (productInDb && productInDb.stock[size] > 0) {
        // 2. Kurangi stok lokal di "gudang" (LocalStorage)
        productInDb.stock[size] -= 1;
        localStorage.setItem('magos_products_data', JSON.stringify(products));

        // 3. Masukkan ke array keranjang
        // Gunakan pencarian berdasarkan ID dan Ukuran
        const existingIndex = cart.findIndex(item => item.id === p.id && item.size === size);
        
        if (existingIndex > -1) {
            cart[existingIndex].qty += 1; // Jika barang sama & size sama, tambah jumlah
        } else {
            // Gunakan performance.now() agar cartId benar-benar unik jika klik sangat cepat
            cart.push({ 
                ...p, 
                size: size, 
                qty: 1, 
                cartId: Date.now() + Math.random() 
            });
        }
        
        // 4. Simpan dan Update UI
        saveCart();
        updateCartUI(); // Update angka (counter) di ikon header
        
        // 5. Tutup Modal Produk
        closeModal('productModal');
        
        // --- PERBAIKAN ALUR ---
        // Hapus toggleCart() agar drawer samping tidak otomatis terbuka
        
        // 6. Refresh tampilan grid produk
        // Ini memastikan jika stok habis, label SOLDOUT akan langsung muncul di halaman utama
        if (typeof displayProducts === "function") {
            displayProducts(currentFilter, currentPage);
        }
        
    } else {
        // Notifikasi jika stok habis saat diklik
        const currentLang = localStorage.getItem('magos_lang') || 'id';
        alert(currentLang === 'id' ? "MAAF, STOK HABIS!" : "OUT OF STOCK!");
    }
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('magos_cart');
    if (saved) { cart = JSON.parse(saved); updateCartUI(); }
}
function saveCart() { localStorage.setItem('magos_cart', JSON.stringify(cart)); }

function toggleCart() { 
    document.getElementById('cartBackdrop')?.classList.toggle('active');
    document.getElementById('cartDrawer')?.classList.toggle('active');
    document.getElementById('wishlistDrawer')?.classList.remove('active');
}

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    if(countEl) countEl.innerText = cart.length;
    const container = document.getElementById('cartItemsContainer');
    if(!container) return;
    
    container.innerHTML = ''; 
    let total = 0;

    if(cart.length === 0) {
        const currentLang = localStorage.getItem('magos_lang') || 'id';
        const emptyText = translations[currentLang]['empty_cart'] || 'EMPTY CART';
        const continueText = translations[currentLang]['btn_continue'] || 'CONTINUE SHOPPING';

        // Menambahkan SVG dan Tombol secara eksplisit
        container.innerHTML = `
            <div class="empty-state" style="text-align:center; padding: 60px 20px;">
                <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#333" stroke-width="1.5" style="margin-bottom:20px; display: inline-block;">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p style="font-size: 11px; letter-spacing: 2px; color: #666; margin-bottom: 25px; font-weight: 900; text-transform: uppercase;">${emptyText}</p>
                <button class="btn ghost hover-target" onclick="toggleCart(); document.getElementById('shop').scrollIntoView({behavior:'smooth'});" style="font-size: 10px; padding: 12px 25px; width: auto; display: inline-block; border-radius: 50px;">
                    ${continueText}
                </button>
            </div>`;
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.images[0]}">
                    <div class="ci-info">
                        <h4>${item.name} <span style="border:1px solid #333; padding:1px 4px; font-size:9px; border-radius:3px; margin-left:5px;">${item.size}</span></h4>
                        <p>${formatMoney(item.price)}</p>
                        <div class="ci-remove-capsule hover-target" onclick="removeFromCart(${index})">REMOVE</div>
                    </div>
                </div>`;
        });
    }

    if(document.getElementById('cartTotalDisplay')) {
        document.getElementById('cartTotalDisplay').innerText = formatMoney(total);
    }
}

function removeFromCart(cartId) {
    // Cari item berdasarkan cartId unik
    const itemIndex = cart.findIndex(item => item.cartId === cartId);
    
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        // Kembalikan stok ke gudang
        const productInDb = products.find(p => p.id === item.id);
        if (productInDb) {
            productInDb.stock[item.size] += (item.qty || 1);
            localStorage.setItem('magos_products_data', JSON.stringify(products));
        }
        
        // Hapus dari array
        cart.splice(itemIndex, 1);
        saveCart();
        updateCartUI();
        
        // Refresh jika di halaman cart.html
        if(window.location.pathname.includes('cart.html')) {
            renderCartPage(); 
        }
    }
}

// Wishlist Logic
function loadWishlistFromStorage() {
    const saved = localStorage.getItem('magos_wishlist');
    if (saved) { wishlist = JSON.parse(saved); updateWishlistUI(); }
}
function saveWishlist() { 
    localStorage.setItem('magos_wishlist', JSON.stringify(wishlist)); 
    updateWishlistUI(); 
}
function toggleWishlist() {
    document.getElementById('wishlistDrawer')?.classList.toggle('active');
    document.getElementById('cartBackdrop')?.classList.toggle('active');
    document.getElementById('cartDrawer')?.classList.remove('active');
}
// Di dalam magos.js
function toggleWishlistItem(id) {
    const idx = wishlist.findIndex(item => item.id === id);
    if (idx > -1) { 
        wishlist.splice(idx, 1); 
    } else { 
        const p = products.find(x => x.id === id); 
        if(p) wishlist.push(p); 
    }
    saveWishlist();

    // PERBAIKAN: Gunakan Optional Chaining agar tidak error jika ID tidak ada
    const btnHeart = document.getElementById('realWishlistBtn');
    if(btnHeart) {
        btnHeart.classList.toggle('active');
    }
}
function updateWishlistUI() {
    const countEl = document.getElementById('wishlistCount');
    if(countEl) countEl.innerText = wishlist.length;
    const container = document.getElementById('wishlistItemsContainer');
    if(!container) return;
    
    container.innerHTML = '';

    if(wishlist.length === 0) {
        const currentLang = localStorage.getItem('magos_lang') || 'id';
        const emptyText = translations[currentLang]['empty_wishlist'] || 'EMPTY WISHLIST';
        const continueText = translations[currentLang]['btn_continue'] || 'CONTINUE SHOPPING';

        container.innerHTML = `
            <div class="empty-state" style="text-align:center; padding: 60px 20px;">
                <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#333" stroke-width="1.5" style="margin-bottom:20px; display: inline-block;">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 00 0-7.78z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p style="font-size: 11px; letter-spacing: 2px; color: #666; margin-bottom: 25px; font-weight: 900; text-transform: uppercase;">${emptyText}</p>
                <button class="btn ghost hover-target" onclick="toggleWishlist(); document.getElementById('shop').scrollIntoView({behavior:'smooth'});" style="font-size: 10px; padding: 12px 25px; width: auto; display: inline-block; border-radius: 50px;">
                    ${continueText}
                </button>
            </div>`;
        return;
    }

    wishlist.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.images[0]}">
                <div class="ci-info">
                    <h4>${item.name}</h4>
                    <p>${formatMoney(item.price)}</p>
                    <div class="ci-remove-capsule hover-target" onclick="toggleWishlistItem(${item.id})">REMOVE</div>
                </div>
            </div>`;
    });
}

// Ganti fungsi lama dengan ini
function openCheckoutModal() { 
    if(cart.length === 0) {
        const currentLang = localStorage.getItem('magos_lang') || 'id';
        alert(currentLang === 'id' ? "KERANJANG KOSONG" : "CART IS EMPTY");
        return;
    }
    // Pastikan data keranjang terbaru tersimpan di LocalStorage
    saveCart(); 
    
    // Arahkan langsung ke file checkout.html
    // Pastikan path sesuai. Jika checkout.html di folder root, gunakan ini:
    window.location.href = "checkout.html"; 
}

function showStep(step) {
    ['step-1-info', 'step-2-shipping', 'step-3-summary'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
    const target = (step === 1) ? 'step-1-info' : (step === 2) ? 'step-2-shipping' : 'step-3-summary';
    const targetEl = document.getElementById(target);
    if(targetEl) targetEl.style.display = 'block';
}

function goToStep2() {
    if(!document.getElementById('coName').value || !document.getElementById('coAddress').value) {
        alert("PLEASE COMPLETE SHIPPING DETAILS");
        return;
    }
    showStep(2);
    calculateGrandTotal();
}

function goToStep3() {
    const name = document.getElementById('coName').value;
    const addr = document.getElementById('coAddress').value;
    const courier = document.getElementById('coCourier').value;
    const payment = document.getElementById('coPayment').value;

    document.getElementById('sumName').innerText = name;
    document.getElementById('sumAddress').innerText = addr;
    document.getElementById('sumCourier').innerText = courier.toUpperCase();
    document.getElementById('sumPayment').innerText = payment.toUpperCase();
    
    showStep(3);
    calculateGrandTotal();
}

function calculateGrandTotal() {
    const courier = document.getElementById('coCourier').value;
    currentShippingCost = shippingRates[courier] || 0;
    
    // Ambil data dari storage jika variabel cart kosong (akibat pindah halaman)
    if(cart.length === 0) {
        cart = JSON.parse(localStorage.getItem('magos_cart') || "[]");
    }

    let subtotal = 0;
    cart.forEach(item => subtotal += item.price);
    
    // Gunakan fungsi keamanan untuk total akhir
    grandTotal = secureCalculateTotal(subtotal, currentShippingCost, currentDiscountAmount);
    
    // Update UI di checkout.html
    const totalDisplay = document.getElementById('resTotal');
    if(totalDisplay) {
        totalDisplay.innerText = formatMoney(grandTotal);
    }
}

// Voucher Logic
// --- Update Fungsi applyVoucher ---
function applyVoucher() {
    const code = document.getElementById('voucherCode').value.toUpperCase();
    const msg = document.getElementById('voucherMsg');
    const rowDisc = document.getElementById('rowDiscount');

    if (activeVouchers[code]) {
        appliedVoucherCode = code;
        let subtotal = 0; 
        cart.forEach(i => subtotal += i.price);
        
        const v = activeVouchers[code];
        if(v.type === 'percent') currentDiscountAmount = subtotal * v.value;
        else currentDiscountAmount = v.value;

        // SIMPAN DISKON KE STORAGE AGAR TERBACA DI CHECKOUT.HTML
        localStorage.setItem('magos_applied_discount', currentDiscountAmount);
        localStorage.setItem('magos_voucher_code', code);

        msg.style.display = 'block';
        msg.style.color = '#25D366';
        msg.innerText = `CODE_ACCEPTED: -${formatMoney(currentDiscountAmount)}`;
        
        if(rowDisc) rowDisc.style.display = 'flex';
        const sumDiscEl = document.getElementById('sumDiscount');
        if(sumDiscEl) sumDiscEl.innerText = `- ${formatMoney(currentDiscountAmount)}`;
        
        calculateGrandTotal();
    } else {
        msg.style.display = 'block';
        msg.style.color = '#ff4444';
        msg.innerText = "INVALID_CODE";
        
        // Reset jika kode salah
        currentDiscountAmount = 0;
        localStorage.removeItem('magos_applied_discount');
        if(rowDisc) rowDisc.style.display = 'none';
        calculateGrandTotal();
    }
}

// Tambahkan logika untuk membersihkan diskon setelah checkout selesai di fungsi finishPay()
function finishPay() {
    // ... kode yang sudah ada ...
    localStorage.removeItem('magos_cart');
    localStorage.removeItem('magos_applied_discount'); // Hapus diskon setelah sukses
    localStorage.removeItem('magos_voucher_code');
}

function generateInvoicePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // --- 1. HEADER & LOGO ---
    // Kode Base64 SVG MAGOS yang kamu berikan
    const logoSvg = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCA3MjAgNzIwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPjxnIGlkPSJNQUdPUy1MT0dPIiBzZXJpZjppZD0iTUFHT1MgTE9HTyI+PHBhdGggZD0iTTQxMy4wNzMsMjA4Ljk1OWMxLjU1OCwxMi45NzkgMS44MjgsLTIuMTc4IDEuODIzLC0yLjQyYy0wLjg5MiwtNDQuMTU3IDM0LjIzMiwtNzIuNDA2IDM1LjQ1OCwtNzEuOTgxYzEuOTY5LDAuNjgzIDAuNjc3LDEuNDMxIC0xLjA1Niw2Ljg3MmMtMjAuMTc4LDYzLjM1NCAyNS4yMTEsMTExLjc3NyAzMi44MzMsMTY5Ljk2NmMxMi43NTUsOTcuMzc4IC01My45NzQsMTIwLjAxNyAtODEuMjM2LDE1Ni44MjljLTE0LjI4NywxOS4yOTIgLTEyLjQzNCwzOS42MDYgLTEzLjY5NSwyNi4yMjVjLTIuODA2LC0yOS43OTggMTMuNzI3LC01MS4zODggMjIuOTc5LC03MC4zMTRjMzIuMTQ0LC02NS43NTQgMTMuNjk0LC0xMDUuNTQgLTEuNDQ4LC0xNDQuMzczYy0wLjkwNywtMi4zMjcgLTIuNzMzLC0yLjMxIC0yLjc4MywwLjE4OGMtMC45NzMsNDguNzI4IC0yNC4xMzksNjMuNTY1IC00NC43NzEsOTkuMzI0Yy00LjMxNSwxNi4xNDQgLTUuNTUxLDMxLjQwNyAtOS41MTMsMjguMjk1Yy0zMS4xMTUsLTI0LjQzNSAtNTEuMDUsLTc4LjA2OSAtNTMuODcxLC04NS42NTdjLTcuNDQ1LC0yMC4wMyAtNi4yMjEsLTMyLjA3MiAtOC44NjIsLTIzLjA2MmMtMTcuNzE5LDYwLjQyNSAtMTAuNDg3LDgzLjk0OSAtOS40NDEsODkuMzgxYzEwLjAzMiw1Mi4xMjMgNDYuMjkzLDY0LjE2OSAyNy42NjMsNTYuNzgyYy0zNy45MDYsLTE1LjAzMSAtNTEuNjc5LC0yOC4xODUgLTU1LjM3LC0zMS43MWMtNjEuNjMzLC01OC44NjYgLTExLjA4MywtMTMxLjYxMSAtMy40ODEsLTE2OS41M2M4LjcwOSwtNDMuNDM2IC05LjU2OSwtNjMuMDI4IC0xMC43OTcsLTY1LjE4MmMtNC43NiwtOC4zNDggNjMuMzE5LDE4LjE2MSA5My4yMTksOTMuMTE5YzEwLjc3OSwyNy4wMjMgMTAuMjIsNDIuNTk0IDEzLjU0NywzOC40NTVjMjQuODQ3LC0zMC45MjQgMUF7MTAuMDk0LC02OS44MDggNy45NCwtNzUuNDg1Yy0xMi45MTIsLTM0LjAzIC04Mi43OCwtMTE1LjM2MyAtNS4yMDcsLTE5My4xMTljMTQuMjE3LC0xNC4yNSA0Mi43NDgsLTM0Ljg2MyAzNi41MDcsLTI2LjIwN2MtOS43MTMsMTMuNDY5IC0xMS4wODcsMTIuNjg4IC0xNi43NDUsMjguMzE1Yy0yMC4zOTgsNTYuMzQzIDkuMjUyLDk0LjE3MSAxOS4wNjQsMTA4LjU0YzI0LjU5LDM2LjAxMSAyNi41NDYsNTUuNDU1IDI3LjI0Miw1Ni43NDdaIiBzdHlsZT0iZmlsbDojZmZiMjAwOyIvPjxwYXRoIGQ9Ik0zNDkuNTM1LDU5Ni4yNDhjMC43MjksMC42OTggNS42MzUsNy41ODggMzUuNzk1LDIzLjQ2NmMyLjQ3MSwxLjMwMSAzMy42MjEsMTcuNzAxIDE5LjI3NSwyOS4wOTRjLTE0LjQ3MSwxMS40OTMgLTUyLjk4MiwtOS41OTQgLTU4Ljk5OSwtMTIuNTkxYy0yNS41NjMsLTEyLjczIC00Ni41NzQsLTQ0LjkwMiAtNTQuOTU3LC01MC44MThjLTkuNTM3LC02LjczMSAxOS4wMywzNy42ODYgMjAuMDMsMzkuMjc2YzI0LjY2NiwzOS4xNzQgNjIuNzM3LDQ5LjMwMSA2MS4wNyw2OS44NzJjLTEuNDMxLDE3LjY2OSAtMjYuOTczLDMuMDc0IC0zNS4yNTIsLTEuNjIzYy01NS41NzEsLTMxLjUzMSAtNzUuMTY5LC04OC42MDYgLTc5LjU0MiwtODguOTg2Yy0yLjg4OCwtMC4yNTEgMC4zMjMsNy4wNiAyLjY0MiwxNC44OTFjMTMuNTY1LDQ1LjgwOSA0Mi44MzgsNjMuMjg1IDQzLjg0Miw2OS45ODVjMi42MjksMTcuNTM2IC00My45ODksLTkuNjYzIC01Ny41NjMsLTI5LjQ4MmMtNy41MTUsLTEwLjk3MiAtMzEuNjAzLC04MS45MDQgLTM5LjYwNywtNzguNDE5Yy0xLjIyNywwLjUzNCA5LjMyOCwzNC45NjMgMi4yMTgsMjMuNjg1Yy0yNS40NTgsLTQwLjM4NCAtNjkuMzY1LC00My4 hisIDMxLjE3MWMyMi43MzgsLTE1Ljg1NiAtMjguNDUzLC01MC44MTkgLTI2LjU1NSwtOTcuNDIzYzEuNzksLTQzLjkyOCAzNC42MTksLTU0LjM5OSAyNC40MzIsLTEwNy4xNDdjLTAuMzEsLTEuNjA3IDEuNTI1LC0yLjg5OCAzLjE4MywtMC43NjFjNDEuOTA2LDUzLjk5MSAtMC43NDUsODcuNDY2IDQ1LjY1OCwxMjcuNzM4YzQ3LjU1OCw0MS4xODUgODQuMDc2LDQzLjY3MyAxMTguNjQxLDU4LjYwMmMyMi40MzMsOS42ODkgMTQuOTUsMjYuOTA0IDQ5LjE5OSw0Ni4wMTZjNy40ODcsNC4xNzggLTYuOCwxMy4zMDUgLTcuMzczLDEzLjYxYy0yNi4zOTcsMTQuMDY5IC00MC45OTksLTE4LjM0NyAtNDkuNzQyLC0yMS43MTZjLTMyLjEyMiwtMTIuMzggNC41MTIsNTYuNDUgMjYuMDc5LDc3LjYyN1oiIHN0eWxlPSJmaWxsOiNmZmIyMDA7Ii8+PHBhdGggZD0iTTU0Mi41MTEsNTYyLjA0N2MtMC40OTUsLTAuMTg4IC0wLjgwOSwtMC42NzkgLTAuNzcxLC0xLjIwOGMxLjkxNywtMjcuMDAzIDIuODA5LC0yOC44IDAuNTQ0LC0yOC4zNDhjLTAuNTE3LDAuMTAzIC02LjUwNywxMC4zODggLTkuMDA2LDE3Ljc4NmMtMTQuMTU0LDQxLjg5OSAyLjg3Miw2NS42OTUgLTMxLjc1LDk3LjY3M2MtMS43OTIsMS42NTUgLTI1LjQ0MSwyMy40OTggLTI1LjcyMSwxNi4zNjhjLTAuMTEyLC0yLjg0MyA2LjQ4MSwtMi44MTIgMTkuMzI1LC0zNy4wNTZjMS41MTcsLTQuMDQ2IDEwLjMwOSwtMjcuNDg3IDEyLjI0NywtNTIuNjA1YzAuODMsLTEwLjc2NyAtMi44ODQsMS41NTYgLTcuMzc1LDExLjQ0N2MtMTguNzc0LDQxLjM0NyAtMjMuMjk3LDcxLjI0NiAtNzMuMjA4LDEwNC42NTRjLTI0LjUzLDE2LjQxOSAtMjYuMzE1LDYuMDA2IC0yNi42OCwzLjg4Yy00LjQ2MywtMjYuMDMgMzguOTIzLC0zOS41ODMgNTIuMDk1LC04NC4wMTljMTcuODExLC02MC4wODYgNy45NzYsLTEwNC44NjQgLTE1LjM0NSwtNzEuNzAxYy05LjEyNywxMi45NzggLTIyLjMyNiwzOC40NTggLTQ5LjQwOSwyOS45MTdjLTMuNDY5LC0xLjA5NCAtMTIuODAxLC03LjIyNiAtOC4wODIsLTExLjU4NmMyMi40MDMsLTIwLjY5NSAyMy44MDcsLTIwLjU1NCAzOS43MjIsLTY0LjA2MWMxNy45MTgsLTQ4Ljk4MSA1OS4wMjMsLTU0LjE5NiA5MS45OTIsLTk3Ljc2MmMyMy41MDUsLTMxLjA2IC00LjI0NSwtNjguMTg0IDE2LjYyLC0xMDEuMTU0YzEwLjQwNCwtMTYuNDQgMTMuMDgsLTE1Ljc4OCAxMy4zMDEsLTE0LjI0NGMwLjA1NiwwLjM4OSAtOC4zOTYsMjAuNjUzIDQuMjI4LDQ2LjI3NWMxNy4zNTgsMzUuMjMgNDAuNTE4LDU4LjYwMikS0xMy4yNTcsMTEyYy0xLjkwNiwzLjcxOCAtMjEuMDA1LDMzLjU0IC0zLjE1OSw0MS41NzJjMTIuMzI4LDUuNTQ4IDE5LjY4MSwtMTcuMzU5IDIwLjM3MSwtMTkuNTA3YzQuMDc2LC0xMi42OTkgMi42MDUsLTI5LjA2OCA2LjI5NSwtMTYuMTc2YzE5LjM0LDY3LjU1OCAtMTUuOTY4LDg2LjkyIC0zNS45MiwxMTQuMzM3Yy0xLjczMywyLjM4MiAtMS41OTQsNC4yNzUgLTMuNTY5LDMuNTIxWiIgc3R5bGU9ImZpbGw6I2ZmYjIwMDsiLz48L2c+PC9zdmc+";

    // Merender logo SVG ke PDF (Posisi: x=20, y=10, Lebar=20, Tinggi=20)
    // Format SVG langsung didukung oleh jsPDF versi terbaru
    try {
        doc.addImage(logoSvg, 'SVG', 20, 10, 20, 20);
    } catch (e) {
        // Fallback jika SVG gagal render, tampilkan teks MAGOS
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("MAGOS", 20, 25);
    }
    
    // Teks deskripsi di bawah logo
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("ARCHIVE & INDUSTRIAL WEAR", 20, 33);
    doc.text("USAHADULU STUDIO Ecosystem", 20, 37);

    // --- 2. INFORMASI INVOICE (POJOK KANAN) ---
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 140, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const orderID = document.getElementById('resID').innerText;
    doc.text(`No. Order : ${orderID}`, 140, 30);
    doc.text(`Tanggal   : ${new Date().toLocaleDateString('id-ID')}`, 140, 35);

    // Garis Pemisah (Koordinat Y disesuaikan menjadi 42 agar tidak terlalu rapat dengan teks brand)
    doc.setDrawColor(200);
    doc.line(20, 42, 190, 42);

    // --- 3. DETAIL PENGIRIMAN ---
    const customerName = document.getElementById('coName').value;
    const customerPhone = document.getElementById('coPhone').value;
    const customerProv = document.getElementById('coProv').value;
    const customerCity = document.getElementById('coCity').value;
    const customerAddr = document.getElementById('coAddress').value;

    doc.setFont("helvetica", "bold");
    doc.text("DITUJUKAN KEPADA:", 20, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Nama      : ${customerName}`, 20, 59);
    doc.text(`WhatsApp  : ${customerPhone}`, 20, 65);
    
    const fullAddress = `${customerAddr}, ${customerCity}, ${customerProv}`;
    doc.text(`Alamat    :`, 20, 71);
    doc.text(fullAddress, 38, 71, { maxWidth: 100 });

    // --- 4. TABEL ITEM ---
    // Mengambil variabel 'cart' yang sudah didefinisikan secara global di magos.js
    const head = [['Deskripsi Produk', 'Ukuran', 'Harga Satuan', 'Qty', 'Total']];
    const body = cart.map(item => [
        item.name,
        item.size,
        `Rp ${item.price.toLocaleString('id-ID')}`,
        item.qty,
        `Rp ${(item.price * item.qty).toLocaleString('id-ID')}`
    ]);

    doc.autoTable({
        startY: 85,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], font: "helvetica" },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
        columnStyles: { 4: { halign: 'right' } }
    });

    // --- 5. RINGKASAN PEMBAYARAN & DISKON ---
    let finalY = doc.lastAutoTable.finalY + 15;
    const subtotal = document.getElementById('sumSubtotal').innerText;
    const shipping = document.getElementById('sumShippingCost').innerText;
    const discountEl = document.getElementById('sumDiscount');
    const grandTotal = document.getElementById('sumGrandTotal').innerText;

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 130, finalY);
    doc.text(subtotal, 190, finalY, { align: 'right' });

    finalY += 7;
    doc.text("Ongkos Kirim", 130, finalY);
    doc.text(shipping, 190, finalY, { align: 'right' });

    if (discountEl && discountEl.style.display !== 'none' && discountEl.innerText !== "Rp 0") {
        finalY += 7;
        doc.setTextColor(180, 0, 0); 
        doc.setFont("helvetica", "bold");
        doc.text("Potongan Diskon", 130, finalY);
        doc.text(discountEl.innerText, 190, finalY, { align: 'right' });
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
    }

    finalY += 10;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(130, finalY - 5, 190, finalY - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL", 130, finalY);
    doc.text(grandTotal, 190, finalY, { align: 'right' });

    // --- 7. FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Barang yang sudah dibeli tidak dapat ditukar kecuali ada cacat produksi.", 105, 280, { align: 'center' });
    doc.setFont("helvetica", "bold");
    doc.text("THANK YOU FOR SUPPORTING INDEPENDENT ARCHIVE.", 105, 285, { align: 'center' });

    // Simpan PDF dengan format nama file yang rapi
    const fileName = `Invoice_MAGOS_${customerName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}
// --- 8. TRANSLATION & LANGUAGE ---
const translations = {
    'en': {
        // Navigation & General
        'nav_back': '← BACK TO STUDIO',
        'nav_back_shop': '← BACK TO SHOP',
        'nav_drop': 'LATEST DROP',
        'nav_gallery': 'GALLERY',
        'nav_store': 'STORE (SOON)',
        'hero_sub': 'DARK AESTHETICS & INDUSTRIAL WEAR.',
        'hero_btn': 'SHOP COLLECTION',
        'footer_copy': '©2026 | USAHADULU STUDIO',

        // Product & Store
        'btn_add_cart': 'ADD TO CART',
        'lbl_select_size': 'SELECT SIZE:',
        'btn_size_chart': 'VIEW SIZE CHART',
        'empty_cart': 'EMPTY CART',
        'empty_wishlist': 'EMPTY WISHLIST',
        'btn_continue': 'CONTINUE SHOPPING',

        // Terms & Conditions Page
        'terms_title': 'TERMS & CONDITIONS',
        'terms_subtitle': 'PLEASE READ CAREFULLY BEFORE PURCHASING.',
        't_sec1_title': '1. GENERAL POLICY',
        't_sec1_desc': 'By purchasing from MAGOS ARCHIVE, you agree to the following terms. We operate as an independent studio based in Indonesia. Product colors may vary slightly due to photographic lighting or your monitor settings.',
        't_sec2_title': '2. SIZING & TOLERANCE',
        't_sec2_desc': 'All our garments are manually cut and sewn. Please allow a tolerance of 1-2 cm from the Size Chart. We strongly recommend checking the size guide carefully before checking out.',
        't_sec3_title': '3. SHIPPING',
        't_sec3_desc': 'Orders will be processed within 1-2 business days after payment confirmation. Tracking numbers will be sent via WhatsApp or Email. We are not responsible for delays caused by the courier service (JNE/J&T/DHL).',
        't_sec4_title': '4. RETURN & EXCHANGE',
        't_sec4_desc': 'All sales are final. We do not accept refunds. Size exchanges are allowed within 3 days of receipt, provided stock is available and shipping costs are borne by the buyer. Claims for defective products must include an uninterrupted Unboxing Video.',
        't_sec5_title': '5. DATA PRIVACY',
        't_sec5_desc': 'Your personal data (Name, Address, Phone No.) is used solely for order processing and shipping purposes. We will never sell or share your data with any third parties.',

        // Privacy Protocol Page
        'priv_title': 'PRIVACY PROTOCOL',
        'priv_sub': 'DATA PROTECTION & USER ANONYMITY',
        'priv_doc_id': 'DOC_ID: PP-2026-X',
        'priv_status': 'STATUS: ENCRYPTED',
        'priv_updated': 'UPDATED: 24.01.2026',
        'priv_s1_title': '01 / DATA COLLECTION',
        'priv_s1_desc': 'We collect only the essential data required to process your transaction and improve the system interface. This includes name, shipping coordinates (address), and contact signals (email/phone). We do not store payment credentials directly on our servers.',
        'priv_s2_title': '02 / COOKIES & TRACKING',
        'priv_s2_desc': 'System uses "cookies" to maintain your session integrity (Cart & Wishlist data). By accessing the MAGOS Archive, you agree to the temporary storage of these data packets on your local device.',
        'priv_s3_title': '03 / THIRD PARTY DISCLOSURE',
        'priv_s3_desc': 'Your data is classified. We do not sell, trade, or transfer your personally identifiable information to outside parties, except for trusted third parties who assist us in operating our website (shipping logistics).',
        'priv_s4_title': '04 / USER RIGHTS',
        'priv_s4_desc': 'You have the right to request a complete purge of your data from our archives. Contact our system administrator via the Contact page to initiate a data deletion request.',
        'priv_back': '← RETURN TO BASE',

        // Contact Page
        'cont_coord': 'COORDINATES',
        'cont_loc_lbl': 'LOCATION_HQ',
        'cont_loc_val': 'PAYAKUMBUH, WEST SUMATRA, INDONESIA [ID]',
        'cont_sig_lbl': 'DIGITAL_SIGNAL',
        'cont_line_lbl': 'DIRECT_LINE',
        'cont_hours_lbl': 'OPERATING_HOURS',
        'cont_hours_val': 'MON - FRI : 09 AM - 05 PM | SYSTEM ALWAYS ONLINE',
        'cont_form_title': 'INITIATE TRANSMISSION',
        'cont_lbl_name': 'IDENTITY (NAME)',
        'cont_lbl_email': 'SIGNAL BACK (EMAIL)',
        'cont_lbl_msg': 'ENCRYPTED MESSAGE',
        'cont_btn_send': 'TRANSMIT DATA ↗'
    },
    'id': {
        // Navigasi & Umum
        'nav_back': '← KEMBALI KE STUDIO',
        'nav_back_shop': '← KEMBALI KE TOKO',
        'nav_drop': 'RILISAN TERBARU',
        'nav_gallery': 'GALERI',
        'nav_store': 'TOKO (SEGERA)',
        'hero_sub': 'ESTETIKA GELAP & PAKAIAN INDUSTRIAL.',
        'hero_btn': 'LIHAT KOLEKSI',
        'footer_copy': '©2026 | USAHADULU STUDIO',

        // Produk & Toko
        'btn_add_cart': 'TAMBAH KE KERANJANG',
        'lbl_select_size': 'PILIH UKURAN:',
        'btn_size_chart': 'LIHAT SIZE CHART',
        'empty_cart': 'KERANJANG KOSONG',
        'empty_wishlist': 'WISHLIST KOSONG',
        'btn_continue': 'LANJUT BELANJA',

        // Halaman Syarat & Ketentuan
        'terms_title': 'SYARAT & KETENTUAN',
        'terms_subtitle': 'HARAP BACA DENGAN TELITI SEBELUM MEMBELI.',
        't_sec1_title': '1. KEBIJAKAN UMUM',
        't_sec1_desc': 'Dengan membeli dari MAGOS ARCHIVE, Anda menyetujui persyaratan berikut. Kami beroperasi sebagai studio independen yang berbasis di Indonesia. Warna produk mungkin sedikit berbeda karena pencahayaan fotografi atau pengaturan monitor Anda.',
        't_sec2_title': '2. UKURAN & TOLERANSI',
        't_sec2_desc': 'Semua pakaian kami dipotong dan dijahit secara manual. Harap maklumi toleransi 1-2 cm dari Size Chart. Kami sangat menyarankan untuk memeriksa panduan ukuran dengan teliti sebelum melakukan checkout.',
        't_sec3_title': '3. PENGIRIMAN',
        't_sec3_desc': 'Pesanan akan diproses dalam 1-2 hari kerja setelah konfirmasi pembayaran. Nomor resi akan dikirimkan melalui WhatsApp atau Email. Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh jasa kurir (JNE/J&T/DHL).',
        't_sec4_title': '4. PENGEMBALIAN & PERTUKARAN',
        't_sec4_desc': 'Semua penjualan bersifat final. Kami tidak menerima pengembalian dana. Penukaran ukuran diperbolehkan dalam waktu 3 hari setelah diterima, selama stok tersedia dan biaya pengiriman ditanggung oleh pembeli. Klaim produk cacat harus menyertakan Video Unboxing tanpa jeda.',
        't_sec5_title': '5. PRIVASI DATA',
        't_sec5_desc': 'Data pribadi Anda (Nama, Alamat, No. Telp) digunakan semata-mata untuk keperluan pemrosesan pesanan dan pengiriman. Kami tidak akan pernah menjual atau membagikan data Anda kepada pihak ketiga mana pun.',

        // Halaman Protokol Privasi
        'priv_title': 'PROTOKOL PRIVASI',
        'priv_sub': 'PERLINDUNGAN DATA & ANONIMITAS PENGGUNA',
        'priv_doc_id': 'ID_DOK: PP-2026-X',
        'priv_status': 'STATUS: TERENKRIPSI',
        'priv_updated': 'DIPERBARUI: 24.01.2026',
        'priv_s1_title': '01 / PENGUMPULAN DATA',
        'priv_s1_desc': 'Kami hanya mengumpulkan data esensial yang diperlukan untuk memproses transaksi Anda dan meningkatkan antarmuka sistem. Ini mencakup nama, koordinat pengiriman (alamat), dan sinyal kontak (email/telepon). Kami tidak menyimpan kredensial pembayaran langsung di server kami.',
        'priv_s2_title': '02 / COOKIES & PELACAKAN',
        'priv_s2_desc': 'Sistem menggunakan "cookies" untuk menjaga integritas sesi Anda (data Keranjang & Wishlist). Dengan mengakses MAGOS Archive, Anda menyetujui penyimpanan sementara paket data ini di perangkat lokal Anda.',
        'priv_s3_title': '03 / PENGUNGKAPAN PIHAK KETIGA',
        'priv_s3_desc': 'Data Anda bersifat rahasia. Kami tidak menjual, memperdagangkan, atau mentransfer informasi identitas pribadi Anda kepada pihak luar, kecuali untuk pihak ketiga tepercaya yang membantu kami dalam mengoperasikan situs web kami (logistik pengiriman).',
        'priv_s4_title': '04 / HAK PENGGUNA',
        'priv_s4_desc': 'Anda memiliki hak untuk meminta penghapusan total data Anda dari arsip kami. Hubungi administrator sistem kami melalui halaman Kontak untuk memulai permintaan penghapusan data.',
        'priv_back': '← KEMBALI KE BASIS',

        // Halaman Kontak
        'cont_coord': 'KOORDINAT',
        'cont_loc_lbl': 'LOKASI_HQ',
        'cont_loc_val': 'PAYAKUMBUH, SUMATERA BARAT, INDONESIA [ID]',
        'cont_sig_lbl': 'SINYAL_DIGITAL',
        'cont_line_lbl': 'JALUR_LANGSUNG',
        'cont_hours_lbl': 'JAM_OPERASIONAL',
        'cont_hours_val': 'SENIN - JUMAT : 09:00 - 17:00 | SISTEM SELALU ONLINE',
        'cont_form_title': 'INISIASI TRANSMISI',
        'cont_lbl_name': 'IDENTITAS (NAMA)',
        'cont_lbl_email': 'SINYAL BALIK (EMAIL)',
        'cont_lbl_msg': 'PESAN TERENKRIPSI',
        'cont_btn_send': 'KIRIM DATA ↗'
    }
};
// Tambahkan fungsi ini karena dipanggil oleh HTML onclick
function toggleLanguage() {
    const currentLang = localStorage.getItem('magos_lang') || 'id';
    const newLang = currentLang === 'id' ? 'en' : 'id';
    setLanguage(newLang);
    
    // Refresh tampilan produk agar harga berubah (IDR/USD)
    if(document.getElementById('productGrid')) {
        displayProducts(currentFilter, currentPage);
    }
}

function setLanguage(lang) {
    localStorage.setItem('magos_lang', lang);
    
    // Update UI Switcher
    const toggle = document.getElementById('langToggle');
    if(toggle) toggle.setAttribute('data-lang', lang);

    // Update Mata Uang otomatis
    currentCurrency = (lang === 'en') ? 'USD' : 'IDR';

    // Update semua elemen dengan data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Jika elemen adalah input/textarea, ubah placeholder
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });
}

// --- 9. UTILS & EFFECTS ---
function initInfiniteLoop(className) {
    const container = document.querySelector('.' + className);
    if (!container) return;
    const items = Array.from(container.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        container.appendChild(clone);
    });
}

// Custom Cursor (Hanya aktif di Desktop)
document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.getElementById("cursor");
    if(cursor) {
        document.addEventListener("mousemove", (e) => {
            cursor.style.left = e.clientX + "px"; cursor.style.top = e.clientY + "px";
        });
        document.body.addEventListener("mouseover", (e) => {
            if (e.target.closest('a, button, .prod, .hover-target, .page-btn')) {
                cursor.classList.add("hovered");
            } else {
                cursor.classList.remove("hovered");
            }
        });
    }
});

/* ==========================================================================
   MAGOS SECURITY & AUTO-VALIDATION SYSTEM (LAUNCH READY)
   ========================================================================== */

// 1. AUTO-CAPITALIZATION & SANITIZATION
// Mengubah input alamat dan nama menjadi Huruf Kapital otomatis agar Invoice terlihat rapi.
document.addEventListener('input', (e) => {
    if (e.target.id === 'coName' || e.target.id === 'coStreet' || e.target.id === 'coAddress') {
        e.target.value = e.target.value.toUpperCase();
    }
    
    // Mencegah input karakter berbahaya (XSS Protection)
    if (e.target.classList.contains('contact-input')) {
        e.target.value = e.target.value.replace(/[<>]/g, "");
    }
});

// 2. WHATSAPP NUMBER FORMATTER
// Memastikan nomor telepon diawali dengan angka tanpa karakter spesial.
const phoneInput = document.getElementById('coPhone');
if (phoneInput) {
    phoneInput.addEventListener('blur', (e) => {
        let val = e.target.value.replace(/\D/g, ''); // Hapus semua non-angka
        if (val.startsWith('0')) {
            val = '62' + val.substring(1);
        }
        e.target.value = val;
    });
}

// 3. PERSISTENT CHECKOUT DATA (Safety Feature)
// Menyimpan data input secara lokal agar tidak hilang jika halaman ter-refresh.
const saveCheckoutData = () => {
    const data = {
        name: document.getElementById('coName')?.value,
        phone: document.getElementById('coPhone')?.value,
        email: document.getElementById('coEmail')?.value,
        prov: document.getElementById('coProv')?.value,
        city: document.getElementById('coCity')?.value,
        addr: document.getElementById('coAddress')?.value
    };
    localStorage.setItem('magos_pending_checkout', JSON.stringify(data));
};

// Panggil fungsi simpan setiap kali ada perubahan input
document.querySelectorAll('.contact-input').forEach(input => {
    input.addEventListener('change', saveCheckoutData);
});

// Load kembali data jika ada saat halaman dibuka
window.addEventListener('load', () => {
    const saved = localStorage.getItem('magos_pending_checkout');
    if (saved) {
        const data = JSON.parse(saved);
        if (document.getElementById('coName')) document.getElementById('coName').value = data.name || '';
        if (document.getElementById('coPhone')) document.getElementById('coPhone').value = data.phone || '';
        if (document.getElementById('coEmail')) document.getElementById('coEmail').value = data.email || '';
        if (document.getElementById('coProv')) document.getElementById('coProv').value = data.prov || '';
        if (document.getElementById('coCity')) document.getElementById('coCity').value = data.city || '';
        if (document.getElementById('coAddress')) document.getElementById('coAddress').value = data.addr || '';
    }
});

// 4. PRICE INTEGRITY GUARD
// Mencegah nilai Grand Total menjadi negatif atau error saat kalkulasi diskon.
const secureCalculateTotal = (subtotal, shipping, discount) => {
    let total = (subtotal + shipping) - discount;
    return total < 0 ? 0 : Math.round(total);
};

// 5. EMPTY CART GUARD (Redirect Safety)
// Mencegah akses ke checkout.html jika keranjang kosong.
if (window.location.pathname.includes('checkout.html')) {
    const currentCart = JSON.parse(localStorage.getItem('magos_cart') || "[]");
    if (currentCart.length === 0) {
        alert("ACCESS_DENIED: YOUR CART IS EMPTY");
        window.location.href = "magos.html";
    }
}

function openProductModalById(id) {
    const product = products.find(p => String(p.id) === String(id));
    if (product) {
        // Beri jeda sedikit agar modal lama benar-benar bersih
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
        setTimeout(() => {
            openProductModal(product);
        }, 300);
    }
}

function renderRelatedProducts(currentCategory, currentProductId) {
    const relatedContainer = document.getElementById('relatedGrid');
    if (!relatedContainer || !products.length) return;

    // Gunakan toLowerCase() agar kategori selalu cocok
    const related = products.filter(p => 
        p.category.toLowerCase() === currentCategory.toLowerCase() && 
        String(p.id) !== String(currentProductId)
    ).slice(0, 3);

    let html = '';
    related.forEach(item => {
        // Gunakan properti 'images' yang sudah diproses di loadMagosProducts
        const displayImg = (item.images && item.images.length > 0) ? item.images[0] : 'magos/assets/img/default.jpg';
        
        html += `
            <div class="related-item hover-target" onclick="closeModal('productModal'); setTimeout(() => openProductModalById('${item.id}'), 300)">
                <img src="${displayImg}" alt="${item.name}">
                <p>${item.name.toUpperCase()}</p>
            </div>
        `;
    });
    
    relatedContainer.innerHTML = html || '<p style="font-size:8px; color:#333; text-align:center; width:100%;">NO_SIMILAR_ITEMS</p>';
}

function setViewMode(mode) {
    const grid = document.getElementById('productGrid');
    const btnLook = document.getElementById('btnLookbook');
    const btnEcom = document.getElementById('btnEcommerce');

    // Validasi agar tidak terjadi error jika elemen tidak ditemukan
    if (!grid || !btnLook || !btnEcom) return;

    if (mode === 'ecommerce') {
        grid.classList.remove('lookbook-layout');
        grid.classList.add('ecommerce-grid');
        btnEcom.classList.add('active');
        btnLook.classList.remove('active');
    } else {
        grid.classList.remove('ecommerce-grid');
        grid.classList.add('lookbook-layout');
        btnLook.classList.add('active');
        btnEcom.classList.remove('active');
    }

    // Memicu ulang render produk agar animasi Skeleton Loading muncul
    displayProducts(currentFilter, currentPage);
}