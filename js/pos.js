// js/pos.js - FIXED & CLEAN VERSION

// --- 1. DATA & VARIABLES ---
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
let isDpMode = false;
const ADMIN_PIN = "692196"; 
let transactionHistory = JSON.parse(localStorage.getItem('usahadulu_sales')) || [];

const fmtIDR = (num) => "Rp " + num.toLocaleString('id-ID');

// --- 2. INIT SYSTEM ---
function startClock() {
    function update() {
        const now = new Date();
        const el = document.getElementById('clockDisplay');
        if(el) el.innerText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' });
    }
    update(); setInterval(update, 1000); 
}

document.addEventListener('DOMContentLoaded', () => {
    startClock();
    // Render awal semua produk
    renderGrid(products); 
    
    // Search Listener
    const searchInput = document.getElementById('searchProduct');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            renderGrid(products.filter(p => p.name.toLowerCase().includes(keyword)));
        });
    }

    // Toggle Menu Logic
    const menuBtn = document.getElementById('menuBtn');
    const navOverlay = document.getElementById('navOverlay');
    if(menuBtn && navOverlay) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navOverlay.classList.toggle('open');
        });
    }
});

// --- 3. PRODUCTS & CART ---
function filterProducts(cat, el) {
    currentFilter = cat;
    // Remove active from all buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    // Add active to clicked button (safe method)
    if(el) el.classList.add('active');
    
    renderGrid(cat === 'all' ? products : products.filter(p => p.category === cat));
}

function renderGrid(items) {
    const grid = document.getElementById('productGrid');
    if(!grid) return; 
    grid.innerHTML = '';
    
    if(items.length === 0) {
        grid.innerHTML = '<p style="color:#666; width:100%; text-align:center; grid-column:1/-1; padding-top:20px;">Produk tidak ditemukan.</p>'; 
        return;
    }
    
    items.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pos-card hover-target';
        card.onclick = () => addToCart(p.id);
        card.innerHTML = `
            <img src="${p.img}" class="pos-img" onerror="this.style.display='none'">
            <div class="pos-info">
                <div class="pos-title">${p.name}</div>
                <div class="pos-price">${fmtIDR(p.price)}</div>
            </div>`;
        grid.appendChild(card);
    });
}

function addToCart(id) {
    const item = cart.find(i => i.id === id);
    if(item) item.qty++;
    else {
        const prod = products.find(p => p.id === id);
        if(prod) cart.push({ ...prod, qty: 1 });
    }
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
        container.innerHTML = '<div class="empty-cart-state"><p>Keranjang Kosong</p></div>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-info">
                        <h4>${item.name}</h4>
                        <span class="cart-meta">${fmtIDR(item.price)} x ${item.qty}</span>
                    </div>
                    <div class="cart-controls">
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                </div>`;
        });
    }

    const tax = subtotal * 0.11;
    const total = subtotal + tax;
    
    // Update displays safely
    const setTxt = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    setTxt('subtotalDisplay', fmtIDR(subtotal));
    setTxt('taxDisplay', fmtIDR(tax));
    setTxt('totalDisplay', fmtIDR(total));
    setTxt('modalTotalDisplay', fmtIDR(total));
}

// --- 4. PEMBAYARAN & DP ---
function openPaymentModal() {
    if(cart.length === 0) { alert("Keranjang kosong!"); return; }
    
    // Default to Full Payment logic
    setPaymentType('full'); 
    document.getElementById('paymentModal').classList.add('show');
    
    // Auto fill if cash
    const totalText = document.getElementById('totalDisplay').innerText;
    const total = parseInt(totalText.replace(/[^0-9]/g, ''));
    
    if(paymentMethod === 'cash') {
        const cashInput = document.getElementById('cashInput');
        if(cashInput && !isDpMode) cashInput.value = total;
    }
    calculateChange();
}

function closeModal() { 
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show')); 
}

function setPaymentType(type) {
    isDpMode = (type === 'dp');
    
    const btnFull = document.getElementById('btnFull');
    const btnDp = document.getElementById('btnDp');
    
    if(isDpMode) {
        btnFull.className = 'type-btn';
        btnDp.className = 'type-btn active';
    } else {
        btnFull.className = 'type-btn active';
        btnDp.className = 'type-btn';
    }

    const label = document.getElementById('inputLabel');
    if(label) label.innerText = isDpMode ? "Nominal DP (Masuk)" : "Nominal Diterima";
    
    const cashInput = document.getElementById('cashInput');
    const cashGroup = document.getElementById('cashInputGroup');
    
    if(cashInput) {
        cashInput.value = '';
        cashInput.placeholder = isDpMode ? "Masukkan DP..." : "Rp 0";
    }
    
    // Kalau DP, input manual wajib. Kalau Full & Cash, input manual. Kalau Full & Transfer, hide input.
    if(cashGroup) {
        if(isDpMode || paymentMethod === 'cash') {
            cashGroup.style.display = 'block';
            if(!isDpMode && paymentMethod === 'cash') {
                 // Auto fill total for easier usage
                 const totalText = document.getElementById('totalDisplay').innerText;
                 const total = parseInt(totalText.replace(/[^0-9]/g, ''));
                 if(cashInput) cashInput.value = total;
            }
        } else {
            cashGroup.style.display = 'none';
        }
    }
    
    calculateChange();
}

function selectMethod(method, el) {
    paymentMethod = method;
    document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
    if(el) el.classList.add('active');

    const cashGroup = document.getElementById('cashInputGroup');
    const cashInput = document.getElementById('cashInput');
    const totalText = document.getElementById('totalDisplay').innerText;
    const total = parseInt(totalText.replace(/[^0-9]/g, ''));

    if(isDpMode || method === 'cash') {
        if(cashGroup) cashGroup.style.display = 'block';
        if(method === 'cash' && !isDpMode && cashInput) cashInput.value = total;
    } else {
        if(cashGroup) cashGroup.style.display = 'none';
        // For logic purposes, treat non-cash full payment as exact amount
        if(cashInput) cashInput.value = total;
    }
    calculateChange();
}

function calculateChange() {
    const totalText = document.getElementById('totalDisplay').innerText;
    const total = parseInt(totalText.replace(/[^0-9]/g, '')) || 0;
    
    const cashInput = document.getElementById('cashInput');
    let cash = cashInput ? (parseInt(cashInput.value) || 0) : 0;
    
    // If hidden and not DP, assume exact payment
    if(document.getElementById('cashInputGroup').style.display === 'none') {
        cash = total;
    }

    const changeDisplay = document.getElementById('changeDisplay');
    const changeLabel = document.getElementById('changeLabel');

    if(!changeDisplay) return;

    if(isDpMode) {
        const sisa = total - cash;
        changeLabel.innerText = "SISA TAGIHAN (HUTANG):";
        changeLabel.style.color = "#ff4757";
        if(sisa > 0) {
            changeDisplay.innerText = fmtIDR(sisa);
            changeDisplay.style.color = '#ff4757';
        } else {
            changeDisplay.innerText = "LUNAS (DP 100%)";
            changeDisplay.style.color = '#2ed573';
        }
    } else {
        changeLabel.innerText = "Kembalian:";
        changeLabel.style.color = "#ccc";
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
    const total = parseInt(totalText.replace(/[^0-9]/g, '')) || 0;
    
    let cash = 0;
    const cashInput = document.getElementById('cashInput');
    if(document.getElementById('cashInputGroup').style.display === 'none') {
        cash = total;
    } else {
        cash = cashInput ? (parseInt(cashInput.value) || 0) : 0;
    }

    const clientInput = document.getElementById('clientNameInput');
    const clientName = (clientInput && clientInput.value.trim() !== "") ? clientInput.value : "Guest";

    if(isDpMode) {
        if(cash <= 0) { alert("Nominal DP minimal 1 rupiah."); return; }
        // Safe check
        if(cash >= total) {
            if(!confirm("Nominal DP melunasi tagihan. Ubah jadi Transaksi LUNAS?")) return;
        }
    } else {
        if(cash < total) { alert("Uang kurang! Gunakan fitur DP jika ingin hutang."); return; }
    }

    saveTransactionToHistory(total, cash, clientName);
    closeModal();
    showReceiptModal(total, cash, clientName);
}

// --- 5. DATA & EXCEL ---
function saveTransactionToHistory(total, paid, client) {
    let status = (paid < total) ? 'DP / PARTIAL' : 'LUNAS';
    let debt = (paid < total) ? (total - paid) : 0;
    
    // Fix floating point issues roughly
    if(debt < 0) debt = 0;

    const newTrx = {
        id: "TRX-" + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
        items: [...cart], 
        total: total, 
        paid: paid, 
        debt: debt,
        status: status, 
        client: client, 
        method: paymentMethod
    };
    
    transactionHistory.push(newTrx);
    localStorage.setItem('usahadulu_sales', JSON.stringify(transactionHistory));
}

function openAdminPanel() {
    const pin = prompt("MASUKKAN PIN ADMIN:");
    if(pin === ADMIN_PIN) {
        updateAdminUI();
        document.getElementById('adminModal').classList.add('show');
    } else { 
        if(pin !== null) alert("PIN SALAH!"); 
    }
}

function updateAdminUI() {
    const list = document.getElementById('transactionList');
    if(!list) return;
    list.innerHTML = '';
    
    let rev = 0, cashIn = 0, digi = 0;
    
    // Copy array to reverse without mutating original
    [...transactionHistory].reverse().forEach(trx => {
        // Revenue is what is PAID, not Total Bill
        rev += trx.paid;
        
        if(trx.method === 'cash') cashIn += trx.paid; 
        else digi += trx.paid;
        
        const d = new Date(trx.date);
        list.innerHTML += `
            <div class="history-item" onclick='alertDetail(${JSON.stringify(trx)})'>
                <div>
                    <span class="h-id">#${trx.id} (${trx.status})</span>
                    <span class="h-date">${d.toLocaleDateString('id-ID')} | ${trx.client}</span>
                </div>
                <div>
                    <span class="h-total">${fmtIDR(trx.paid)}</span>
                    <span class="h-method" style="display:block; text-align:right; margin-top:2px;">${trx.method}</span>
                </div>
            </div>`;
    });
    
    const elRev = document.getElementById('admTotalRevenue');
    const elCash = document.getElementById('admTotalCash');
    const elDigi = document.getElementById('admTotalDigital');
    
    if(elRev) elRev.innerText = fmtIDR(rev);
    if(elCash) elCash.innerText = fmtIDR(cashIn);
    if(elDigi) elDigi.innerText = fmtIDR(digi);
}

function alertDetail(trx) {
    let items = trx.items.map(i => `- ${i.name} (x${i.qty})`).join('\n');
    alert(`DETAIL #${trx.id}\n----------------\nStatus: ${trx.status}\nKlien: ${trx.client}\nTanggal: ${new Date(trx.date).toLocaleString()}\n\nITEM:\n${items}\n\nTagihan: ${fmtIDR(trx.total)}\nBayar: ${fmtIDR(trx.paid)}\nHutang: ${fmtIDR(trx.debt)}`);
}

function resetHistoryData() {
    if(confirm("HAPUS SEMUA DATA PENJUALAN?")) {
        if(prompt("Ketik 'DELETE' untuk konfirmasi:") === 'DELETE') {
            transactionHistory = []; 
            localStorage.removeItem('usahadulu_sales');
            updateAdminUI(); 
            alert("Database Reset Berhasil.");
        }
    }
}

function switchAdminTab(tabName, el) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabName+'Tab').style.display = 'block';
    if(el) el.classList.add('active');
}

function downloadExcel() {
    if(transactionHistory.length === 0) return alert("Data kosong.");
    let csv = "ID,TANGGAL,KLIEN,STATUS,TOTAL TAGIHAN,SUDAH BAYAR,SISA HUTANG,METODE\n";
    
    transactionHistory.forEach(trx => {
        const d = new Date(trx.date).toLocaleDateString('id-ID');
        csv += `${trx.id},${d},"${trx.client}",${trx.status},${trx.total},${trx.paid},${trx.debt},${trx.method}\n`;
    });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], {type: "text/csv"}));
    link.download = `Laporan_Usahadulu_${Date.now()}.csv`;
    link.click();
}

// --- 6. STRUK & PRINTING ---
function showReceiptModal(total, paid, client) {
    const modal = document.getElementById('receiptModal');
    const preview = document.getElementById('receiptPreview');
    if(!modal || !preview) return;

    const debt = total - paid;
    const statusLabel = debt > 0 ? "BELUM LUNAS (DP)" : "LUNAS";
    const sisaLabel = debt > 0 ? "SISA HUTANG" : "KEMBALIAN";
    const sisaValue = debt > 0 ? debt : Math.abs(debt);
    const sisaColor = debt > 0 ? '#ff4757' : '#2ed573';

    let itemsHtml = cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${item.name} <span style="font-size:10px;">(x${item.qty})</span></span>
            <span>${fmtIDR(item.price * item.qty)}</span>
        </div>`).join('');

    preview.innerHTML = `
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:10px; margin-bottom:10px;">
            <strong>USAHADULU STUDIO</strong><br>
            Citimall Dumai, Riau<br>
            <span style="font-size:10px;">${new Date().toLocaleString('id-ID')}</span><br>
            <span style="font-size:10px;">Klien: ${client.toUpperCase()}</span>
        </div>
        ${itemsHtml}
        <div style="border-top:1px dashed #000; margin-top:10px; padding-top:10px;">
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
                <span>TOTAL</span><span>${fmtIDR(total)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:5px;">
                <span>BAYAR (${paymentMethod.toUpperCase()})</span><span>${fmtIDR(paid)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:5px; color:${sisaColor}; font-weight:bold;">
                <span>${sisaLabel}</span><span>${fmtIDR(sisaValue)}</span>
            </div>
            <div style="text-align:center; margin-top:10px; border:1px solid #000; padding:2px; font-weight:bold; font-size:10px;">
                STATUS: ${statusLabel}
            </div>
        </div>
        <div style="text-align:center; margin-top:20px; font-size:10px;">TERIMA KASIH!<br>IG: @arie96s | @magos.co</div>
    `;

    modal.classList.add('show');
}

function newTransaction() { 
    closeModal(); 
    clearCart(); 
}

// Print PDF Handler
window.printReceipt = function() {
    if (!window.jspdf) { 
        alert("Gagal memuat library PDF. Pastikan internet aktif (CDN)."); 
        return; 
    }
    
    const { jsPDF } = window.jspdf;
    // 80mm width, dynamic height roughly
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 250] });
    
    doc.setFont("courier", "normal");
    
    let y = 10; 
    const centerX = 40; 
    const lineSpacing = 4;

    // Header
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text("USAHADULU STUDIO", centerX, y, { align: "center" }); y += lineSpacing;
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.text("Design & Creative Services", centerX, y, { align: "center" }); y += 4;
    doc.text("Dumai, Riau", centerX, y, { align: "center" }); y += lineSpacing + 2;
    doc.text("------------------------------------------", centerX, y, { align: "center" }); y += lineSpacing;

    // Meta
    const now = new Date();
    const clientInput = document.getElementById('clientNameInput');
    const client = clientInput ? (clientInput.value || "Guest") : "Guest";
    const trxId = "TRX-" + now.getTime().toString().slice(-6);

    doc.text(`Tgl   : ${now.toLocaleDateString('id-ID')}`, 5, y); y += 4;
    doc.text(`Jam   : ${now.toLocaleTimeString('id-ID')}`, 5, y); y += 4;
    doc.text(`ID    : ${trxId}`, 5, y); y += 4;
    doc.text(`Klien : ${client.substring(0,25)}`, 5, y); y += 4;

    doc.text("------------------------------------------", centerX, y, { align: "center" }); y += lineSpacing;

    // Items
    doc.setFontSize(9);
    cart.forEach(item => {
        let name = item.name.length > 20 ? item.name.substring(0, 20) + ".." : item.name;
        doc.text(name, 5, y);
        doc.text(fmtIDR(item.price*item.qty), 75, y, { align: "right" }); y += 4;
        doc.setFontSize(7); 
        doc.text(`(x${item.qty} @ ${fmtIDR(item.price)})`, 5, y);
        doc.setFontSize(9); y += 5; 
    });
    doc.text("------------------------------------------", centerX, y, { align: "center" }); y += lineSpacing;

    // Calc
    const totalText = document.getElementById('totalDisplay').innerText;
    const totalVal = parseInt(totalText.replace(/[^0-9]/g, ''));
    
    // Recalculate paid logic for printing
    let cashVal = 0;
    if(document.getElementById('cashInputGroup').style.display === 'none') {
        cashVal = totalVal; // Full non-cash payment
    } else {
        cashVal = document.getElementById('cashInput') ? (parseInt(document.getElementById('cashInput').value)||0) : 0;
    }
    
    const debt = totalVal - cashVal;
    
    doc.setFont(undefined, 'bold');
    doc.text("TOTAL TAGIHAN", 5, y); doc.text(totalText, 75, y, { align: "right" }); y += lineSpacing + 2;
    doc.setFont(undefined, 'normal');
    doc.text(`Bayar (${paymentMethod.toUpperCase()})`, 5, y); doc.text(fmtIDR(cashVal), 75, y, { align: "right" }); y += lineSpacing;

    if(debt > 0) {
        doc.setFont(undefined, 'bold'); 
        doc.text("SISA HUTANG", 5, y); doc.text(fmtIDR(debt), 75, y, { align: "right" });
    } else {
        doc.text("KEMBALIAN", 5, y); doc.text(fmtIDR(Math.abs(debt)), 75, y, { align: "right" });
    }
    y += lineSpacing + 4;
    
    // Status
    doc.setFontSize(10); doc.setFont(undefined, 'bold');
    doc.text(`STATUS: ${debt > 0 ? "BELUM LUNAS" : "LUNAS"}`, centerX, y, { align: "center" }); y += lineSpacing * 2;

    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.text("Simpan struk ini sebagai bukti.", centerX, y, { align: "center" });
    
    // Auto download
    doc.save(`Struk_Usahadulu_${now.getTime()}.pdf`);
};
