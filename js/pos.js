// js/pos.js

// 1. DATA PRODUK (Simulasi Database)
// Mengambil gaya penamaan dari Usahadulu (Asset, Service, Merch)
const products = [
    { id: 1, name: "LOGO BASIC PACKAGE", price: 250000, category: "service", img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=300&q=60" },
    { id: 2, name: "METAL FONT BUNDLE", price: 150000, category: "asset", img: "https://images.unsplash.com/photo-1571120038865-c35012e1284a?auto=format&fit=crop&w=300&q=60" },
    { id: 3, name: "MAGOS TEE V1 - BLACK", price: 185000, category: "merch", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=60" },
    { id: 4, name: "SKULL VECTOR PACK", price: 100000, category: "asset", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=60" },
    { id: 5, name: "WEB UNDANGAN", price: 300000, category: "service", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=60" },
    { id: 6, name: "VIDEO EDITING (1 MIN)", price: 200000, category: "service", img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=300&q=60" },
    { id: 7, name: "STREETWEAR MOCKUP", price: 99000, category: "asset", img: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=300&q=60" },
    { id: 8, name: "CUSTOM ILLUSTRATION", price: 600000, category: "service", img: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=300&q=60" }
];

// State Aplikasi
let cart = [];
let currentFilter = 'all';
let paymentMethod = 'cash';

// Format Rupiah
const fmtIDR = (num) => {
    return "Rp " + num.toLocaleString('id-ID');
}

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    renderProducts('all');
    updateClock();
    setInterval(updateClock, 1000);
    
    // Search Listener
    document.getElementById('searchProduct').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
        renderGrid(filtered);
    });
});

// Jam Digital
function startClock() {
    function update() {
        const now = new Date();
        // Format jam:menit (24 jam)
        const timeString = now.toLocaleTimeString('id-ID', {
            hour: '2-digit', 
            minute:'2-digit'
        });
        const clockEl = document.getElementById('clockDisplay');
        if(clockEl) clockEl.innerText = timeString;
    }
    update(); // Jalankan langsung
    setInterval(update, 1000); // Update tiap detik
}

// 3. RENDER PRODUCTS
function filterProducts(cat) {
    currentFilter = cat;
    
    // Update Button Active State
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if(cat === 'all') {
        renderGrid(products);
    } else {
        const filtered = products.filter(p => p.category === cat);
        renderGrid(filtered);
    }
}

function renderGrid(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    if(items.length === 0) {
        grid.innerHTML = '<p style="color:#666; col-span:3;">Produk tidak ditemukan.</p>';
        return;
    }

    items.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pos-card hover-target';
        card.onclick = () => addToCart(p.id);
        
        card.innerHTML = `
            <img src="${p.img}" class="pos-img" alt="${p.name}">
            <div class="pos-info">
                <div>
                    <div class="pos-title">${p.name}</div>
                    <div class="pos-price">${fmtIDR(p.price)}</div>
                </div>
                <div class="pos-stock">STOCK: ∞</div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Re-bind cursor effect (karena element baru dibuat)
    if(typeof bindHoverEvents === 'function') bindHoverEvents(); // Dari main.js
}

// 4. CART LOGIC
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if(existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
}

function updateCartQty(id, change) {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.qty += change;
        if(item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cartContainer');
    container.innerHTML = '';

    let subtotal = 0;

    if(cart.length === 0) {
        container.innerHTML = '<div class="empty-cart-state"><p style="text-align:center; margin-top:50px; color:#444;">Keranjang Kosong.<br>Pilih produk di sebelah kiri.</p></div>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-info">
                    <h4>${item.name}</h4>
                    <span class="cart-meta">${fmtIDR(item.price)} x ${item.qty}</span>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn hover-target" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span style="color:#fff; font-size:12px; font-weight:bold;">${item.qty}</span>
                    <button class="qty-btn hover-target" onclick="updateCartQty(${item.id}, 1)">+</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Calculations
    const tax = subtotal * 0.11; // PPN 11%
    const total = subtotal + tax;

    document.getElementById('subtotalDisplay').innerText = fmtIDR(subtotal);
    document.getElementById('taxDisplay').innerText = fmtIDR(tax);
    document.getElementById('totalDisplay').innerText = fmtIDR(total);
    
    // Update Modal Total juga
    document.getElementById('modalTotalDisplay').innerText = fmtIDR(total);

    if(typeof bindHoverEvents === 'function') bindHoverEvents();
}

// 5. PAYMENT LOGIC
function openPaymentModal() {
    if(cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }
    const modal = document.getElementById('paymentModal');
    modal.classList.add('show');
    document.getElementById('cashInput').value = '';
    document.getElementById('changeDisplay').innerText = 'Rp 0';
    selectMethod('cash'); // Default
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

function selectMethod(method) {
    paymentMethod = method;
    document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
    // Cari tombol yang diklik (agak manual traversing karena onclick di html)
    event.target.classList.add('active');

    const cashGroup = document.getElementById('cashInputGroup');
    if(method === 'cash') {
        cashGroup.style.display = 'block';
    } else {
        cashGroup.style.display = 'none';
        document.getElementById('changeDisplay').innerText = '-';
    }
}

function calculateChange() {
    const totalText = document.getElementById('totalDisplay').innerText;
    const total = parseInt(totalText.replace(/[^0-9]/g, '')); // Hapus Rp dan titik
    
    const cashInput = document.getElementById('cashInput').value;
    const cash = parseInt(cashInput) || 0;

    if(cash >= total) {
        document.getElementById('changeDisplay').innerText = fmtIDR(cash - total);
        document.getElementById('changeDisplay').style.color = '#2ed573';
    } else {
        document.getElementById('changeDisplay').innerText = "Uang Kurang!";
        document.getElementById('changeDisplay').style.color = '#ff4757';
    }
}

function processTransaction() {
    const totalText = document.getElementById('totalDisplay').innerText;
    const total = parseInt(totalText.replace(/[^0-9]/g, ''));
    
    if(paymentMethod === 'cash') {
        const cashInput = document.getElementById('cashInput').value;
        const cash = parseInt(cashInput) || 0;
        if(cash < total) {
            alert("Pembayaran Gagal: Uang Cash Kurang!");
            return;
        }
    }

    // Sukses
    closeModal();
    showReceiptModal();
}

// 6. RECEIPT & PRINTING
function showReceiptModal() {
    const modal = document.getElementById('receiptModal');
    const preview = document.getElementById('receiptPreview');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();
    const totalText = document.getElementById('totalDisplay').innerText;
    
    // Generate Struk HTML Sederhana
    let itemsHtml = cart.map(item => `
        <div style="display:flex; justify-content:space-between;">
            <span>${item.name} x${item.qty}</span>
            <span>${fmtIDR(item.price * item.qty)}</span>
        </div>
    `).join('');

    preview.innerHTML = `
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:10px; margin-bottom:10px;">
            <strong>USAHADULU STUDIO</strong><br>
            Citimall Dumai, Riau<br>
            ${dateStr}
        </div>
        ${itemsHtml}
        <div style="border-top:1px dashed #000; margin-top:10px; padding-top:10px; display:flex; justify-content:space-between; font-weight:bold;">
            <span>TOTAL</span>
            <span>${totalText}</span>
        </div>
        <div style="text-align:center; margin-top:20px;">
            TERIMA KASIH!<br>
            #SupportLocalCreative
        </div>
    `;

    modal.classList.add('show');
}

function newTransaction() {
    closeModal();
    clearCart();
}

// js/pos.js - Bagian Paling Bawah

window.printReceipt = function() {
    // Pastikan library jsPDF terbaca
    const { jsPDF } = window.jspdf;
    
    // 1. Setup Ukuran Kertas Thermal (80mm x Auto/150mm)
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150] 
    });

    // Setup Font Monospace (Penting agar lurus seperti mesin kasir)
    doc.setFont("courier", "normal");
    
    let y = 10; // Posisi vertikal awal (Y coordinate)

    // --- 2. HEADER ---
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("USAHADULU STUDIO", 40, y, { align: "center" }); // 40 adalah tengah dari lebar 80
    y += 4;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text("Citimall Dumai, Riau", 40, y, { align: "center" });
    y += 4;

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID') + " " + now.toLocaleTimeString('id-ID');
    doc.text(dateStr, 40, y, { align: "center" });
    y += 6;

    // Garis Pemisah (Dashed line simulasi dengan text)
    doc.text("--------------------------------", 40, y, { align: "center" });
    y += 5;

    // --- 3. DAFTAR ITEM (LOOPING CART) ---
    doc.setFontSize(9);
    
    cart.forEach(item => {
        // Nama Produk (Kiri)
        // Potong nama jika terlalu panjang agar tidak menabrak harga
        let name = item.name.length > 18 ? item.name.substring(0, 18) + ".." : item.name;
        
        doc.text(name, 5, y);
        
        // Harga Total per Item (Kanan)
        const priceStr = fmtIDR(item.price * item.qty);
        doc.text(priceStr, 75, y, { align: "right" }); // 75 = Kanan (batas kertas 80 - margin 5)
        
        y += 4;
        
        // Detail Qty di bawah nama (kecil)
        doc.setFontSize(7);
        doc.text(`(${item.qty} x ${fmtIDR(item.price)})`, 5, y);
        doc.setFontSize(9); // Kembalikan ukuran font
        
        y += 5; // Jarak antar item
    });

    // --- 4. TOTAL & PEMBAYARAN ---
    doc.text("--------------------------------", 40, y, { align: "center" });
    y += 5;

    const totalText = document.getElementById('totalDisplay').innerText;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    
    // Tulis TOTAL (Kiri) dan Angka (Kanan)
    doc.text("TOTAL", 5, y);
    doc.text(totalText, 75, y, { align: "right" });
    y += 6;

    // Info Pembayaran
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Metode: ${paymentMethod.toUpperCase()}`, 5, y);
    y += 4;
    
    if(paymentMethod === 'cash') {
        const cashInput = document.getElementById('cashInput').value;
        const changeText = document.getElementById('changeDisplay').innerText;
        
        doc.text(`Tunai : Rp ${parseInt(cashInput).toLocaleString('id-ID')}`, 5, y);
        y += 4;
        doc.text(`Kembali: ${changeText}`, 5, y);
    }

    // --- 5. FOOTER ---
    y += 10;
    doc.setFontSize(8);
    doc.text("TERIMA KASIH!", 40, y, { align: "center" });
    y += 4;
    doc.text("#SupportLocalCreative", 40, y, { align: "center" });
    y += 4;
    doc.text("Simpan struk ini sbg bukti.", 40, y, { align: "center" });

    // --- 6. SIMPAN FILE ---
    doc.save(`Struk_Usahadulu_${Date.now()}.pdf`);
}
