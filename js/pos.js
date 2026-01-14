// js/pos.js - Final Version (With Email Receipt Feature)

// --- 1. DATA PRODUK ---
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

let cart = [];
let currentFilter = 'all';
let paymentMethod = 'cash';

// Helper Format Rupiah
const fmtIDR = (num) => {
    return "Rp " + num.toLocaleString('id-ID');
}

// --- 2. FUNGSI JAM ---
function startClock() {
    function update() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', {
            hour: '2-digit', 
            minute:'2-digit'
        });
        const clockEl = document.getElementById('clockDisplay');
        if(clockEl) clockEl.innerText = timeString;
    }
    update(); 
    setInterval(update, 1000); 
}

// --- 3. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    startClock();
    filterProducts('all'); 
    
    const searchInput = document.getElementById('searchProduct');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
            renderGrid(filtered);
        });
    }
});

// --- 4. LOGIKA PRODUK & CART ---
function filterProducts(cat) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');

    if(cat === 'all') renderGrid(products);
    else renderGrid(products.filter(p => p.category === cat));
}

function renderGrid(items) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.innerHTML = '';

    if(items.length === 0) {
        grid.innerHTML = '<p style="color:#666; width:100%; text-align:center; margin-top:20px;">Produk tidak ditemukan.</p>';
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
    if(typeof bindHoverEvents === 'function') bindHoverEvents(); 
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);
    if(existingItem) existingItem.qty++;
    else cart.push({ ...product, qty: 1 });
    updateCartUI();
}

function updateCartQty(id, change) {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.qty += change;
        if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cartContainer');
    if(!container) return;
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

    const tax = subtotal * 0.11; 
    const total = subtotal + tax;

    if(document.getElementById('subtotalDisplay')) document.getElementById('subtotalDisplay').innerText = fmtIDR(subtotal);
    if(document.getElementById('taxDisplay')) document.getElementById('taxDisplay').innerText = fmtIDR(tax);
    if(document.getElementById('totalDisplay')) document.getElementById('totalDisplay').innerText = fmtIDR(total);
    if(document.getElementById('modalTotalDisplay')) document.getElementById('modalTotalDisplay').innerText = fmtIDR(total);

    if(typeof bindHoverEvents === 'function') bindHoverEvents();
}

// --- 5. LOGIKA PEMBAYARAN ---
function openPaymentModal() {
    if(cart.length === 0) { alert("Keranjang kosong!"); return; }
    const modal = document.getElementById('paymentModal');
    if(modal) {
        modal.classList.add('show');
        const cashInput = document.getElementById('cashInput');
        if(cashInput) cashInput.value = '';
        const changeDisplay = document.getElementById('changeDisplay');
        if(changeDisplay) changeDisplay.innerText = 'Rp 0';
        selectMethod('cash');
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

function selectMethod(method) {
    paymentMethod = method;
    document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');

    const cashGroup = document.getElementById('cashInputGroup');
    const changeDisplay = document.getElementById('changeDisplay');
    
    if(cashGroup) {
        if(method === 'cash') {
            cashGroup.style.display = 'block';
        } else {
            cashGroup.style.display = 'none';
            if(changeDisplay) changeDisplay.innerText = '-';
        }
    }
}

function calculateChange() {
    const totalText = document.getElementById('totalDisplay').innerText;
    const total = parseInt(totalText.replace(/[^0-9]/g, ''));
    const cashInput = document.getElementById('cashInput');
    const cash = cashInput ? (parseInt(cashInput.value) || 0) : 0;
    const changeDisplay = document.getElementById('changeDisplay');

    if(changeDisplay) {
        if(cash >= total) {
            changeDisplay.innerText = fmtIDR(cash - total);
            changeDisplay.style.color = '#2ed573';
        } else {
            changeDisplay.innerText = "Uang Kurang!";
            changeDisplay.style.color = '#ff4757';
        }
    }
}

function processTransaction() {
    const totalText = document.getElementById('totalDisplay').innerText;
    const total = parseInt(totalText.replace(/[^0-9]/g, ''));
    if(paymentMethod === 'cash') {
        const cashInput = document.getElementById('cashInput');
        const cash = cashInput ? (parseInt(cashInput.value) || 0) : 0;
        if(cash < total) { alert("Uang Cash Kurang!"); return; }
    }
    
    // --- TAMBAHKAN BARIS INI (WAJIB) ---
    saveTransactionToHistory(); 
    // -----------------------------------

    closeModal();
    showReceiptModal();
}

// --- 6. RECEIPT & EMAIL LOGIC (UPDATED) ---

function showReceiptModal() {
    const modal = document.getElementById('receiptModal');
    const preview = document.getElementById('receiptPreview');
    if(!modal || !preview) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();
    
    let itemsHtml = cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${item.name} <span style="font-size:10px; color:#666;">(x${item.qty})</span></span>
            <span>${fmtIDR(item.price * item.qty)}</span>
        </div>
    `).join('');

    // Update isi modal struk dengan tombol EMAIL
    preview.innerHTML = `
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:10px; margin-bottom:10px;">
            <strong>USAHADULU STUDIO</strong><br>
            Citimall Dumai, Riau<br>
            <span style="font-size:10px;">${dateStr}</span>
        </div>
        ${itemsHtml}
        <div style="border-top:1px dashed #000; margin-top:10px; padding-top:10px; display:flex; justify-content:space-between; font-weight:bold;">
            <span>TOTAL</span>
            <span>${document.getElementById('totalDisplay').innerText}</span>
        </div>
        <div style="text-align:center; margin-top:20px; font-size:10px;">
            TERIMA KASIH!<br>KEEP THE RECEIPTS.
        </div>
    `;
    
    // INJECT TOMBOL TAMBAHAN DI BAGIAN ACTION
    // Cari elemen receipt-actions di pos.html, jika tidak ada, kita inject di modal content
    const actionsDiv = modal.querySelector('.receipt-actions');
    if(actionsDiv) {
        actionsDiv.innerHTML = `
            <button class="filter-btn hover-target" onclick="printReceipt()">PRINT / PDF</button>
            <button class="filter-btn hover-target" onclick="openEmailModal()" style="border-color:#2ed573; color:#2ed573;">RECEIPT TO EMAIL</button>
            <button class="filter-btn hover-target" onclick="newTransaction()">NEW ORDER</button>
        `;
    }

    modal.classList.add('show');
}

// Fungsi Buka Modal Email
function openEmailModal() {
    // Tutup modal receipt dulu (opsional, biar gak numpuk)
    // document.getElementById('receiptModal').classList.remove('show');
    
    const emailModal = document.getElementById('emailModal');
    if(emailModal) {
        emailModal.classList.add('show');
        document.getElementById('clientEmailInput').focus();
    }
}

// Fungsi Kirim Email (Simulasi)
function processEmailSend() {
    const emailInput = document.getElementById('clientEmailInput');
    const email = emailInput.value;
    const btn = document.querySelector('#emailModal .pay-btn'); // Tombol kirim

    if(!email || !email.includes('@')) {
        alert("Harap masukkan alamat email yang valid!");
        return;
    }

    // Efek Loading
    const originalText = btn.innerText;
    btn.innerText = "SENDING...";
    btn.disabled = true;

    // Simulasi Delay Pengiriman
    setTimeout(() => {
        alert(`SUKSES!\nStruk digital telah dikirim ke: ${email}\nPengirim: usahadulustudio@gmail.com`);
        
        btn.innerText = originalText;
        btn.disabled = false;
        emailInput.value = ''; // Reset input
        closeModal(); // Tutup semua modal
        clearCart(); // Bersihkan keranjang karena transaksi selesai
    }, 1500);
}

function newTransaction() {
    closeModal();
    clearCart();
}

// Fungsi Print PDF
window.printReceipt = function() {
    if (!window.jspdf) { alert("Library PDF belum termuat."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 150] });
    doc.setFont("courier", "normal");
    
    let y = 10;
    doc.setFontSize(10); doc.setFont(undefined, 'bold');
    doc.text("USAHADULU STUDIO", 40, y, { align: "center" }); y += 4;
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.text("ONLINE / IRL", 40, y, { align: "center" }); y += 4;
    const now = new Date();
    doc.text(now.toLocaleDateString('id-ID') + " " + now.toLocaleTimeString('id-ID'), 40, y, { align: "center" }); y += 6;
    doc.text("--------------------------------", 40, y, { align: "center" }); y += 5;

    doc.setFontSize(9);
    cart.forEach(item => {
        let name = item.name.length > 18 ? item.name.substring(0, 18) + ".." : item.name;
        doc.text(name, 5, y);
        doc.text(fmtIDR(item.price * item.qty), 75, y, { align: "right" }); 
        y += 4;
        doc.setFontSize(7);
        doc.text(`(${item.qty} x ${fmtIDR(item.price)})`, 5, y);
        doc.setFontSize(9); 
        y += 5; 
    });

    doc.text("--------------------------------", 40, y, { align: "center" }); y += 5;
    doc.setFontSize(10); doc.setFont(undefined, 'bold');
    doc.text("TOTAL", 5, y);
    doc.text(document.getElementById('totalDisplay').innerText, 75, y, { align: "right" }); y += 6;
    
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.text(`Metode: ${paymentMethod.toUpperCase()}`, 5, y); y += 4;
    
    if(paymentMethod === 'cash') {
        const cashVal = document.getElementById('cashInput') ? parseInt(document.getElementById('cashInput').value) : 0;
        doc.text(`Tunai : Rp ${cashVal.toLocaleString('id-ID')}`, 5, y); y += 4;
        doc.text(`Kembali: ${document.getElementById('changeDisplay').innerText}`, 5, y);
    }
    
    y += 10;
    doc.text("TERIMA KASIH!", 40, y, { align: "center" }); y += 4;
    doc.text("KEEP THE RECEIPTS.", 40, y, { align: "center" });
    
    doc.save(`Struk_Usahadulu_${Date.now()}.pdf`);
}

// --- 7. HISTORY & SECURITY LOGIC (NEW) ---

const ADMIN_PIN = "692196"; // GANTI PIN INI UNTUK KEAMANAN
let transactionHistory = JSON.parse(localStorage.getItem('usahadulu_sales')) || [];

// Modifikasi fungsi 'processTransaction' yang lama
// Tambahkan baris ini SEBELUM 'showReceiptModal()' di dalam fungsi processTransaction:
/*
    saveTransactionToHistory(); // <--- Tambahkan ini
    showReceiptModal();
*/

function saveTransactionToHistory() {
    const totalText = document.getElementById('totalDisplay').innerText;
    const totalVal = parseInt(totalText.replace(/[^0-9]/g, ''));
    
    const newTrx = {
        id: "TRX-" + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
        items: [...cart], // Copy cart
        total: totalVal,
        method: paymentMethod
    };

    transactionHistory.push(newTrx);
    // Simpan ke LocalStorage Browser
    localStorage.setItem('usahadulu_sales', JSON.stringify(transactionHistory));
}

// Fungsi Buka Admin Panel dengan PIN
function openAdminPanel() {
    const inputPin = prompt("MASUKKAN PIN ADMIN UNTUK AKSES DATA KEUANGAN:");
    
    if (inputPin === ADMIN_PIN) {
        updateAdminUI();
        document.getElementById('adminModal').classList.add('show');
    } else if (inputPin !== null) {
        alert("PIN SALAH! AKSES DITOLAK.");
    }
}

function updateAdminUI() {
    const listContainer = document.getElementById('transactionList');
    listContainer.innerHTML = '';
    
    let totalRevenue = 0;
    let cashIn = 0;
    let digitalIn = 0;

    // Urutkan dari yang terbaru
    const reversedHistory = [...transactionHistory].reverse();

    if(reversedHistory.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; color:#444; padding:20px;">Belum ada data transaksi.</div>';
    }

    reversedHistory.forEach(trx => {
        // Hitung Recap
        totalRevenue += trx.total;
        if(trx.method === 'cash') cashIn += trx.total;
        else digitalIn += trx.total;

        // Render List HTML
        const dateObj = new Date(trx.date);
        const dateStr = dateObj.toLocaleDateString('id-ID') + ' ' + dateObj.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});

        const div = document.createElement('div');
        div.className = 'history-item';
        div.onclick = () => alertDetail(trx); // Klik untuk lihat detail
        div.innerHTML = `
            <div>
                <span class="h-id">#${trx.id}</span>
                <span class="h-date">${dateStr}</span>
            </div>
            <div style="display:flex; align-items:center;">
                <span class="h-total">${fmtIDR(trx.total)}</span>
                <span class="h-method">${trx.method.toUpperCase()}</span>
            </div>
        `;
        listContainer.appendChild(div);
    });

    // Update Angka di Box Summary
    document.getElementById('admTotalRevenue').innerText = fmtIDR(totalRevenue);
    document.getElementById('admTotalCash').innerText = fmtIDR(cashIn);
    document.getElementById('admTotalDigital').innerText = fmtIDR(digitalIn);
}

// Fitur Klik item history untuk lihat detail (Simple Alert dulu)
function alertDetail(trx) {
    let itemDetails = trx.items.map(i => `- ${i.name} (x${i.qty})`).join('\n');
    alert(`DETAIL TRANSAKSI #${trx.id}\n\nItem:\n${itemDetails}\n\nTotal: ${fmtIDR(trx.total)}\nMetode: ${trx.method.toUpperCase()}`);
}

function resetHistoryData() {
    const confirmReset = confirm("PERINGATAN KERAS!\n\nApakah anda yakin ingin MENGHAPUS SEMUA DATA penjualan selamanya?\nData tidak bisa dikembalikan.");
    if(confirmReset) {
        const doubleCheck = prompt("Ketik 'DELETE' untuk konfirmasi penghapusan:");
        if(doubleCheck === 'DELETE') {
            transactionHistory = [];
            localStorage.removeItem('usahadulu_sales');
            updateAdminUI();
            alert("Data Keuangan telah di-reset menjadi 0.");
        }
    }
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if(tabName === 'history') {
        document.getElementById('historyTab').style.display = 'block';
        event.target.classList.add('active');
    } else {
        document.getElementById('settingsTab').style.display = 'block';
        event.target.classList.add('active');
    }
}
// --- 8. EXPORT TO EXCEL FEATURE (NEW) ---

function downloadExcel() {
    if (transactionHistory.length === 0) {
        alert("Belum ada data transaksi untuk di-download.");
        return;
    }

    // 1. Buat Header Kolom Excel
    let csvContent = "ID TRANSAKSI,TANGGAL,JAM,ITEM DIBELI,TOTAL RUPIAH,METODE BAYAR\n";

    // 2. Loop semua data history
    transactionHistory.forEach(trx => {
        const dateObj = new Date(trx.date);
        const dateStr = dateObj.toLocaleDateString('id-ID'); // Format: 14/01/2026
        const timeStr = dateObj.toLocaleTimeString('id-ID'); // Format: 20:30

        // Gabungkan nama item jadi satu string (misal: "Logo (x1) | Kaos (x2)")
        // Kita ganti koma dengan garis tegak (|) agar tidak merusak kolom CSV
        let itemString = trx.items.map(i => `${i.name} (x${i.qty})`).join(" | ");
        
        // Bersihkan tanda koma di nama item jika ada, ganti spasi
        itemString = itemString.replace(/,/g, " ");

        // 3. Susun Baris CSV
        // Format: ID, TANGGAL, JAM, "ITEMS", TOTAL, METODE
        let row = `${trx.id},${dateStr},${timeStr},"${itemString}",${trx.total},${trx.method.toUpperCase()}`;
        csvContent += row + "\n";
    });

    // 4. Proses Download File
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Nama file otomatis ada tanggal hari ini
    const today = new Date().toISOString().slice(0,10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Usahadulu_${today}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
