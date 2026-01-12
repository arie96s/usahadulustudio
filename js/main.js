// js/main.js - USAHADULU STUDIO (Final Fix + Multi-Currency)

// --- KONFIGURASI MATA UANG & KURS ---
let activeCurrency = 'IDR'; // Default Currency
let currentRate = 16900; // Fallback Rate 2026 (sesuai request)

// Fungsi Ambil Kurs Dunia (Real-time)
async function fetchExchangeRate() {
    try {
        // Fetch API Gratis
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if(data && data.rates && data.rates.IDR) {
            currentRate = data.rates.IDR;
            console.log("Updated Live Rate:", currentRate);
        }
    } catch (e) {
        console.log("Using Fallback Rate:", currentRate);
    }
}

// --- [FIX BARU] HANDLE TOMBOL BACK BROWSER (Agar Preloader Gak Nyangkut) ---
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Matikan preloader paksa jika halaman dimuat dari cache (history back)
        const preloader = document.getElementById('preloader');
        if(preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }
    }
});

// 1. FUNGSI INISIALISASI
window.addEventListener('load', () => {
    // Hide Preloader
    const preloader = document.getElementById('preloader');
    if(preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 300); 
    }
    
    // Inisialisasi Data & Kurs
    fetchExchangeRate();
    if(typeof updateLanguageUI === 'function') updateLanguageUI();
    if(typeof updateWALinks === 'function') updateWALinks();
    
    // Set tombol bahasa aktif
    const toggleBtn = document.getElementById('langToggle');
    if(toggleBtn && typeof siteData !== 'undefined') toggleBtn.setAttribute('data-lang', siteData.currentLang);

    // Highlight menu aktif
    const currentPath = window.location.pathname.split("/").pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.menu-title');
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.style.color = '#ffffff';
            link.style.fontWeight = '900';
            link.style.borderBottom = '1px solid #fff';
        }
    });

    bindHoverEvents();
    
    // Render Halaman
    if (document.getElementById('dynamicServiceList')) renderServices();
    if (document.getElementById('faqContent')) renderFAQ();
    if (document.getElementById('portfolioGrid')) {
        renderPortfolio('all');
        renderFilters();
    }
   // --- AREA PERBAIKAN ---
    if (document.getElementById('shopGrid')) {
        renderShop('all'); 
    }
    
    // PASTIKAN INI DI LUAR KURUNG KURAWAL SHOP
    if (document.getElementById('blogGrid')) {
        renderBlog();
    }
    if (document.getElementById('paymentGatewayContainer')) {
        renderOrderSummary(); 
    }
    if (document.getElementById('testimonialGrid')) {
        renderTestimonials(); 
        setupReviewStars(); 
    }
    if (document.getElementById('orderForm')) {
        initOrderPage();
    }
});

// 2. LOGIC BAHASA
window.toggleLanguage = function() {
    siteData.currentLang = siteData.currentLang === 'id' ? 'en' : 'id';
    localStorage.setItem('usahadulu_lang', siteData.currentLang);

    const toggleBtn = document.getElementById('langToggle');
    if(toggleBtn) toggleBtn.setAttribute('data-lang', siteData.currentLang);
    
    updateLanguageUI();
    if(document.getElementById('dynamicServiceList')) renderServices();
    if(document.getElementById('faqContent')) renderFAQ(); 
    if(document.getElementById('shopGrid')) renderShop('all'); // Re-render Shop
    if(document.getElementById('paymentGatewayContainer')) renderOrderSummary();
    updateWALinks();
}

function updateLanguageUI() {
    if(typeof siteData === 'undefined') return;
    const lang = siteData.currentLang;
    const t = siteData.translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });
    // Khusus konten About yang panjang
    const aboutText = document.getElementById('aboutText');
    if(aboutText) aboutText.innerHTML = t.about_desc;
}

// 3. LOGIC WHATSAPP
function updateWALinks() {
    const floatBtn = document.getElementById('waFloatBtn');
    if(!floatBtn) return;
    const lang = siteData.currentLang;
    const phone = "6282283687565"; 
    const msg = encodeURIComponent(lang === 'id' ? "Halo Admin, saya ingin bertanya jasa desain." : "Hello, I want to ask about design services.");
    floatBtn.href = `https://wa.me/${phone}?text=${msg}`;
}

// 4. CUSTOM CURSOR
const cursor = document.getElementById('cursor');
function bindHoverEvents() {
    if(!cursor) return;
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, .menu-title, .social-icon-btn, input, select, textarea');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        target.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}
document.addEventListener('mousemove', (e) => {
    if(cursor) {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    }
});

// 5. MENU NAVIGASI
const menuBtn = document.getElementById('menuBtn');
const navOverlay = document.getElementById('navOverlay');
const mainHeader = document.getElementById('mainHeader');

if(menuBtn) {
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navOverlay.classList.toggle('open');
        mainHeader.classList.toggle('menu-active');
        document.body.classList.toggle('no-scroll');
        
        const logoImg = document.getElementById('headerLogoImg');
        if (logoImg) {
            logoImg.style.opacity = navOverlay.classList.contains('open') ? '0.5' : '1';
        }
    });
}

// 6. RENDER SERVICES
function renderServices() {
    const container = document.getElementById('dynamicServiceList');
    if(!container) return;
    container.innerHTML = '';
    const lang = siteData.currentLang;
    
    siteData.services.forEach(svc => {
        const name = lang === 'id' ? svc.name_id : svc.name_en;
        const desc = lang === 'id' ? svc.desc_id : svc.desc_en;
        
        let tableRows = '';
        svc.packages.forEach(pkg => { 
            const orderLink = `order.html?service=${encodeURIComponent(name)}&package=${encodeURIComponent(pkg.item)}&price=${encodeURIComponent(pkg.price)}`;
            tableRows += `
                <tr>
                    <td>${pkg.item}</td>
                    <td>${pkg.price}</td>
                    <td style="text-align:right;">
                        <a href="${orderLink}" class="mini-order-btn hover-target">ORDER</a>
                    </td>
                </tr>`; 
        });

        // --- BANNER PROMO KHUSUS VIDEO ---
        let promoBannerHTML = '';
        
        if (svc.id === 'video') {
            const promoTitle = lang === 'id' ? 'BUDGET TERBATAS?' : 'LIMITED BUDGET?';
            const promoDesc = lang === 'id' 
                ? 'Jangan paksakan budget. Gunakan <strong>Template Siap Pakai</strong> kami. High Quality, harga mulai 50 Ribuan.' 
                : 'Don\'t force the budget. Use our <strong>Ready-to-Use Templates</strong>. High Quality, starting from 50K IDR.';
            const promoBtn = lang === 'id' ? 'LIHAT KATALOG ASET &rarr;' : 'VIEW ASSET CATALOG &rarr;';

            promoBannerHTML = `
                <div class="promo-banner" style="margin: 30px 0 10px 0; padding: 25px; border: 1px dashed #555; border-radius: 12px; text-align: center; background: #050505;">
                    <h3 style="color: #fff; font-size: 16px; margin-bottom: 10px; font-weight: bold;">${promoTitle}</h3>
                    <p style="color: #999; font-size: 13px; margin-bottom: 20px; line-height: 1.6;">${promoDesc}</p>
                    <a href="shop.html" class="hover-target" style="color: #fff; text-decoration: none; font-weight: bold; font-size: 12px; border-bottom: 1px solid #fff; padding-bottom: 2px;">
                        ${promoBtn}
                    </a>
                </div>
            `;
        }
        
        const li = document.createElement('li');
        li.className = 'service-wrapper';
        
        li.innerHTML = `
            <div class="service-header hover-target" onclick="toggleService(this)">
                <span class="service-name-main">${name}</span>
                <span class="service-icon-state">▼</span>
            </div>
            <div class="service-body">
                <p class="service-desc">${desc}</p>
                <table class="price-table">${tableRows}</table>
                ${promoBannerHTML}
            </div>`;
        container.appendChild(li);
    });
    bindHoverEvents();
}

// 6b. FUNGSI ACCORDION & ANIMASI BANNER
window.toggleService = function(header) {
    header.classList.toggle('active');
    const body = header.nextElementSibling;
    const banner = body.querySelector('.promo-banner');

    if (header.classList.contains('active')) {
        body.style.maxHeight = body.scrollHeight + "px";
        if(banner) {
            setTimeout(() => {
                banner.classList.add('show'); 
                body.style.maxHeight = (body.scrollHeight + banner.scrollHeight + 50) + "px";
            }, 600);
        }
    } else {
        body.style.maxHeight = null;
        if(banner) {
            banner.classList.remove('show');
        }
    }
}

// 7. RENDER FAQ
function renderFAQ() {
    const container = document.getElementById('faqContent');
    if(!container) return;
    container.innerHTML = '';
    const lang = siteData.currentLang;
    
    siteData.faq.forEach(item => {
        const q = lang === 'id' ? item.q_id : item.q_en;
        const a = lang === 'id' ? item.a_id : item.a_en;
        
        const div = document.createElement('div');
        div.className = 'faq-item';
        div.innerHTML = `
            <span class="faq-q">${q}</span>
            <p class="faq-a">${a}</p>
        `;
        container.appendChild(div);
    });
}

// 8. PORTFOLIO & CASE STUDY
window.renderPortfolio = function(cat) {
    const grid = document.getElementById('portfolioGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    const items = cat === 'all' ? siteData.portfolio : siteData.portfolio.filter(i => i.category === cat);
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'portfolio-item hover-target';
        
        let imgSrc = appConfig.useLocalImages ? ('img/' + item.fileName) : item.demoUrl;
        
        div.onclick = () => openCaseStudy(item, imgSrc);
        div.innerHTML = `<img src="${imgSrc}" loading="lazy"><div class="portfolio-tag">${item.category.toUpperCase()}</div>`;
        grid.appendChild(div);
    });
    bindHoverEvents();
}

function renderFilters() {
    const container = document.getElementById('filterContainer');
    if(!container) return;
    container.innerHTML = '<button class="filter-btn hover-target active" onclick="renderPortfolio(\'all\')">ALL</button>';
    siteData.filters.forEach(c => {
        container.innerHTML += `<button class="filter-btn hover-target" onclick="renderPortfolio('${c}')">${c.toUpperCase()}</button>`;
    });
}

function openCaseStudy(item, imgSrc) {
    const modal = document.getElementById('lightboxModal');
    if(!modal) return;
    
    const cs = item.caseStudy || { client: "-", problem: "Information not available.", solution: "-", result: "-" };
    
    const contentHtml = `
        <div class="modal-content case-study-content">
            <div class="close-modal hover-target" onclick="closeLightboxOnly()">×</div>
            <h2 class="modal-title">${item.title}</h2>
            
            <div class="case-study-grid">
                <div class="case-study-img">
                    <img src="${imgSrc}" alt="${item.title}">
                </div>
                <div class="case-study-details">
                    <h3>CLIENT</h3>
                    <p>${cs.client}</p>
                    <h3>PROBLEM</h3>
                    <p>${cs.problem}</p>
                    <h3>SOLUTION</h3>
                    <p>${cs.solution}</p>
                    <h3>RESULT</h3>
                    <p>${cs.result}</p>
                    <a href="services.html" class="service-action-btn hover-target" style="margin-top:20px;">START SIMILAR PROJECT</a>
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = contentHtml;
    modal.classList.add('show');
    bindHoverEvents();
}

window.closeLightboxOnly = function() {
    const modal = document.getElementById('lightboxModal');
    if(modal) modal.classList.remove('show');
}

// --- VARIABEL GLOBAL PAGINATION ---
let currentShopPage = 1;
const itemsPerPage = 6; 

// --- FUNGSI RENDER SHOP TERBARU (MULTI-CURRENCY + PAGINATION) ---
window.renderShop = function(filter, page = 1) {
    const grid = document.getElementById('shopGrid');
    if(!grid) return;
    
    // Smooth Scroll logic
    if(page !== currentShopPage && page !== 1) {
        const yOffset = -120; 
        const y = grid.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
    
    currentShopPage = page;
    grid.innerHTML = ''; 
    const lang = siteData.currentLang; 
    const t = siteData.translations[lang]; 

    // Update State Tombol Currency
    document.querySelectorAll('.currency-btn').forEach(btn => {
        if(btn.dataset.curr === activeCurrency) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Reset tombol filter
    document.querySelectorAll('#shopFilter .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnOnClick = btn.getAttribute('onclick');
        if(btnOnClick.includes(`'${filter}'`) || (filter === 'all' && btnOnClick.includes(`'all'`))) {
            btn.classList.add('active');
        }
    });

    const allItems = filter === 'all' ? siteData.shop : siteData.shop.filter(p => p.category === filter);

    if(allItems.length === 0) {
        const emptyMsg = lang === 'id' ? 'Produk belum tersedia.' : 'Products not available.';
        grid.innerHTML = `<p style="color:#666; width:100%; text-align:center; padding: 40px;">${emptyMsg}</p>`;
        renderPagination(0, filter);
        return;
    }

    // Pagination Logic
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (page > totalPages) page = 1;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = allItems.slice(start, end);

    // Render Items dengan Logika Kurs
    paginatedItems.forEach((p, index) => {
        let badgeStyle = '';
        let badgeText = p.badge || ''; 

        if(p.badge === 'NEW') badgeStyle = 'background: #fff; color: #000;';
        else if (p.badge === 'BEST SELLER') badgeStyle = 'background: #ffd700; color: #000; border:none;';

        // --- KALKULASI HARGA & MARKUP ---
        let displayPrice, buyLink, btnText;

        if (activeCurrency === 'IDR') {
            // IDR (Harga Mentah dari Data)
            displayPrice = "IDR " + (p.priceRaw / 1000).toFixed(0) + "K";
            buyLink = p.link_idr;
            btnText = lang === 'id' ? "BELI (MAYAR)" : "BUY (IDR)";
        } else {
            // USD (Rumus: (IDR / Rate) * 1.7)
            let rawUsd = (p.priceRaw / currentRate) * 1.7;
            
            // Psychological Rounding (.99)
            let finalUsd = Math.ceil(rawUsd) - 0.01; 
            if (finalUsd < 0.99) finalUsd = 0.99; // Minimum price safety

            displayPrice = "$ " + finalUsd.toFixed(2);
            buyLink = p.link_usd;
            btnText = "BUY (GUMROAD)";
        }

        const card = document.createElement('div');
        card.className = 'product-card hover-target';
        card.style.animationDelay = `${index * 0.1}s`; 
        
        card.innerHTML = `
            ${badgeText ? `<div class="instant-badge" style="${badgeStyle}">${badgeText}</div>` : ''}
            <img src="${p.img}" alt="${p.title}" class="product-img">
            <div class="product-info">
                <span class="product-cat">${p.type}</span>
                <h3 class="product-title">${p.title}</h3>
                <div class="product-footer">
                    <span class="product-price" style="${activeCurrency === 'USD' ? 'color:#ffd700;' : ''}">${displayPrice}</span>
                    <a href="${buyLink}" target="_blank" class="buy-btn hover-target">${btnText}</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    renderPagination(totalPages, filter);
    bindHoverEvents();
}

// Fungsi Switch Currency (Dipanggil dari HTML)
window.switchCurrency = function(curr) {
    activeCurrency = curr;
    
    // Cari filter yang sedang aktif agar tidak reset ke 'all'
    const activeFilterBtn = document.querySelector('#shopFilter .filter-btn.active');
    let currentFilter = 'all';
    
    if (activeFilterBtn) {
        // Ekstrak nama filter dari atribut onclick, misal: renderShop('vector')
        const match = activeFilterBtn.getAttribute('onclick').match(/'([^']+)'/);
        if (match) currentFilter = match[1];
    }
    
    renderShop(currentFilter, currentShopPage);
}

// --- FUNGSI GENERATOR TOMBOL ANGKA ---
function renderPagination(totalPages, currentFilter) {
    let pagContainer = document.getElementById('shopPagination');
    if (!pagContainer) {
        pagContainer = document.createElement('div');
        pagContainer.id = 'shopPagination';
        pagContainer.className = 'pagination-container';
        const grid = document.getElementById('shopGrid');
        grid.parentNode.insertBefore(pagContainer, grid.nextSibling);
    }

    pagContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn hover-target ${i === currentShopPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => window.renderShop(currentFilter, i);
        pagContainer.appendChild(btn);
    }
    bindHoverEvents(); 
}

// 10. REVIEW SYSTEM
function setupReviewStars() {
    const stars = document.querySelectorAll('.star-icon');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const val = parseInt(this.getAttribute('data-val'));
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-val'));
                if (sVal <= val) s.classList.add('active');
                else s.classList.remove('active');
            });
            document.getElementById('reviewFormContainer').style.display = 'block';
        });
    });
}

function renderTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if(!grid) return;
    grid.innerHTML = '';
    siteData.testimonials.forEach(t => {
        grid.innerHTML += `<div class="testi-card"><div class="testi-quote">${t.quote}</div><span class="testi-author">${t.name}</span><span class="testi-brand">${t.brand}</span></div>`;
    });
}

window.submitReview = function() {
    alert("Terima kasih! Ulasan Anda telah diposting (Simulasi).");
    document.getElementById('reviewFormContainer').style.display = 'none';
}

// --- LOGIKA VOUCHER & KALKULASI HARGA ---

let currentBasePrice = 0;   // Harga asli (angka)
let currentFinalPrice = 0;  // Harga setelah diskon (angka)
let appliedDiscountCode = null;

// 1. Helper: Mengubah string "250K" atau "IDR 250K" menjadi angka 250000
function parsePriceToNumber(priceStr) {
    if(!priceStr) return 0;
if(priceStr === 'TBD') return 0;

    let cleanStr = priceStr.toString().toUpperCase().replace(/IDR/g, '').replace(/RP/g, '').trim();
    
    let multiplier = 1;
    if(cleanStr.includes('K')) {
        multiplier = 1000;
        cleanStr = cleanStr.replace('K', '');
    } else if (cleanStr.includes('M')) { // Jaga-jaga kalau harganya jutaan (1M)
        multiplier = 1000000;
        cleanStr = cleanStr.replace('M', '');
    }
    
    return parseFloat(cleanStr) * multiplier;
}

// 2. Helper: Mengubah angka 187500 menjadi format "IDR 187.5K"
function formatNumberToPrice(num) {
    if(num >= 1000) {
        return "IDR " + (num / 1000).toLocaleString('id-ID') + "K";
    }
    return "IDR " + num.toLocaleString('id-ID');
}

// 3. Fungsi Utama: Apply Voucher
window.applyVoucher = function() {
    const input = document.getElementById('voucherInput');
    const msg = document.getElementById('voucherMsg');
    const priceField = document.getElementById('orderPrice');
    const discDisplay = document.getElementById('discountDisplay');
    
    const code = input.value.trim().toUpperCase();
    const rawPriceStr = priceField.value; // Ambil harga asli dari field readonly
    
    // Simpan harga asli ke variabel global jika belum ada
    if(currentBasePrice === 0) {
        currentBasePrice = parsePriceToNumber(rawPriceStr);
    }
    
    // Reset dulu
    currentFinalPrice = currentBasePrice;
    appliedDiscountCode = null;
    msg.style.display = 'block';
    discDisplay.style.display = 'none';

    // Cek Database di data.js
    if(siteData.activeVouchers && siteData.activeVouchers[code]) {
        const voucher = siteData.activeVouchers[code];
        
        // Hitung Diskon
        let discountAmount = 0;
        if(voucher.type === 'percent') {
            discountAmount = currentBasePrice * voucher.value;
        } else if (voucher.type === 'fixed') {
            discountAmount = voucher.value;
        }
        
        currentFinalPrice = currentBasePrice - discountAmount;
        if(currentFinalPrice < 0) currentFinalPrice = 0; // Anti minus

        // Update UI
        msg.style.color = '#2ed573';
        msg.innerHTML = `Voucher <strong>${code}</strong> berhasil! Hemat ${formatNumberToPrice(discountAmount)}`;
        
        document.getElementById('discAmount').innerText = "-" + formatNumberToPrice(discountAmount);
        document.getElementById('finalPriceDisplay').innerText = formatNumberToPrice(currentFinalPrice);
        discDisplay.style.display = 'block';
        
        appliedDiscountCode = code; // Simpan status
        
        // Animasi feedback
        input.style.borderColor = '#2ed573';
    } else {
        // Gagal
        msg.style.color = '#ff4757';
        msg.innerText = "Kode voucher tidak valid atau sudah kadaluwarsa.";
        input.style.borderColor = '#ff4757';
    }
}

// 11. ORDER & PAYMENT LOGIC (Updated PDF with Brief)
function initOrderPage() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('orderService').value = urlParams.get('service') || '-';
    document.getElementById('orderPackage').value = urlParams.get('package') || '-';
    document.getElementById('orderPrice').value = urlParams.get('price') || 'TBD';
}

// GANTI FUNGSI generateInvoicePDF DI js/main.js DENGAN INI:

function generateInvoicePDF(data) {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // HEADER
    doc.setFontSize(22); 
    doc.setFont("helvetica", "bold"); 
    doc.text("INVOICE", 105, 20, null, null, "center");
    
    doc.setFontSize(12); 
    doc.setFont("helvetica", "normal"); 
    doc.text("USAHADULU STUDIO", 105, 28, null, null, "center");
    doc.line(20, 40, 190, 40);

    // INFO CLIENT (BAGIAN YANG DIPERBAIKI)
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Client: ${data.name}`, 20, 56);
    doc.text(`Phone: ${data.phone}`, 20, 62);
    doc.text(`Email: ${data.email || '-'}`, 20, 68); // <--- Baris Email dikembalikan

    // INFO LAYANAN
    doc.setFont("helvetica", "bold"); 
    doc.text("ITEM DESCRIPTION:", 20, 80); // Posisi Y=80 aman (di bawah Email Y=68)
    
    doc.setFont("helvetica", "normal");
    doc.text(`Service: ${data.service}`, 20, 88);
    doc.text(`Package: ${data.pkg}`, 20, 94);

    // BRIEF SECTION
    doc.setFont("helvetica", "bold");
    doc.text("BRIEF / NOTES:", 20, 105);

    doc.setFont("helvetica", "normal");
    const splitBrief = doc.splitTextToSize(data.brief || "-", 170);
    doc.text(splitBrief, 20, 112);
    
    // Garis Pembatas Bawah (Dinamis mengikuti panjang brief)
    let yPos = 112 + (splitBrief.length * 5) + 15;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // --- LOGIKA HARGA & DISKON ---
    if(data.voucher) {
        // Tampilkan harga asli dicoret (simulasi teks)
        doc.setFont("helvetica", "normal");
        doc.text(`Original Price:`, 140, yPos, null, null, "right");
        doc.text(`${data.originalPrice}`, 190, yPos, null, null, "right");
        yPos += 6;
        
        // Tampilkan Voucher Merah
        doc.setTextColor(255, 0, 0); 
        doc.text(`Voucher (${data.voucher}):`, 140, yPos, null, null, "right");
        doc.text(`DISCOUNT APPLIED`, 190, yPos, null, null, "right");
        yPos += 8;
        doc.setTextColor(0, 0, 0); // Reset ke Hitam
    }

    // TOTAL HARGA
    doc.setFontSize(14); 
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${data.price}`, 190, yPos, null, null, "right");

    // DOWNLOAD
    doc.save(`Invoice_${data.name}.pdf`);
}

window.submitOrder = function() {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    const brief = document.getElementById('clientBrief').value;
    const service = document.getElementById('orderService').value;
    const pkg = document.getElementById('orderPackage').value;
    
    // PERUBAHAN DISINI: Ambil harga final (diskon) atau harga normal
    let finalPriceStr = document.getElementById('orderPrice').value;
    
    // Jika ada diskon aktif, gunakan harga diskon untuk data order
    if(appliedDiscountCode && currentFinalPrice > 0) {
        finalPriceStr = formatNumberToPrice(currentFinalPrice);
    }

    if(!name || !phone || !brief) { alert("Harap lengkapi DATA & DESKRIPSI!"); return; }

    const submitBtn = document.querySelector('.submit-order-btn');
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    // Masukkan data voucher ke object orderData agar tercatat di invoice
    const orderData = { 
        name, phone, email, service, pkg, brief, 
        price: finalPriceStr, 
        originalPrice: formatNumberToPrice(currentBasePrice || parsePriceToNumber(document.getElementById('orderPrice').value)),
        voucher: appliedDiscountCode 
    };

    generateInvoicePDF(orderData); // Panggil fungsi PDF yang sudah diupdate (di bawah)

    // Simpan ke LocalStorage untuk halaman Payment
    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    setTimeout(() => {
        // Redirect ke Payment
        window.location.href = "payment.html";
    }, 2000);
};

function renderOrderSummary() {
    const container = document.getElementById('paymentGatewayContainer');
    const data = JSON.parse(localStorage.getItem('currentOrder'));
    
    if(!data) {
        container.innerHTML = '<p style="text-align:center; color:#888;">Belum ada pesanan aktif. Silakan pilih layanan terlebih dahulu.</p><div style="text-align:center; margin-top:20px;"><a href="services.html" class="service-action-btn">LIHAT LAYANAN</a></div>';
        return;
    }

    container.innerHTML = `
        <div class="summary-card">
            <h3 class="summary-title">RINGKASAN PESANAN</h3>
            <div class="summary-row"><span>Nama:</span> <strong>${data.name}</strong></div>
            <div class="summary-row"><span>Paket:</span> <strong>${data.service} (${data.pkg})</strong></div>
            <div class="summary-row total"><span>TOTAL:</span> <strong>${data.price}</strong></div>
        </div>
        
        <button class="payment-gateway-trigger hover-target" onclick="openXenditDemo('${data.price}')">
            ${siteData.currentLang === 'id' ? 'BAYAR VIA XENDIT (QRIS/PAYPAL)' : 'PAY VIA XENDIT (QRIS/PAYPAL)'}
        </button>
    `;
    bindHoverEvents();
}

// 12. XENDIT DEMO MODAL
window.openXenditDemo = function(price) {
    const modal = document.getElementById('lightboxModal');
    
    const html = `
        <div class="modal-content xendit-modal-body">
            <div class="x-header">
                <span class="x-logo">xendit</span>
                <span class="x-amount">${price}</span>
            </div>
            
            <div class="x-content">
                <span class="x-label">Virtual Account (Demo)</span>
                <div class="x-option hover-target" onclick="alert('Demo: Payment Successful!')">
                    <div class="x-icon" style="background:#005ce6; color:#fff;">BCA</div>
                    <div class="x-name">BCA Virtual Account</div>
                </div>
                 <div class="x-option hover-target" onclick="alert('Demo: Payment Successful!')">
                    <div class="x-icon" style="background:#f39c12; color:#fff;">BRI</div>
                    <div class="x-name">BRI Virtual Account</div>
                </div>

                <span class="x-label">QR Code / E-Wallet</span>
                <div class="x-option hover-target" onclick="alert('Redirecting to QRIS...')">
                    <div class="x-icon" style="background:#fff; border:1px solid #ddd;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/QRIS_logo.svg/1200px-QRIS_logo.svg.png" style="width:25px; height:auto;">
                    </div>
                    <div class="x-name">QRIS (GoPay, OVO, Dana, ShopeePay)</div>
                </div>
                
                <span class="x-label">International</span>
                <div class="x-option hover-target" onclick="alert('Redirecting to PayPal...')">
                    <div class="x-icon" style="background:#003087; color:#fff;">PP</div>
                    <div class="x-name">PayPal / Credit Card</div>
                </div>
            </div>

            <div class="x-footer">
                Secured by Xendit Payment Gateway (Demo Mode)
            </div>
            
            <button class="x-cancel-btn hover-target" onclick="closeLightboxOnly()">
                CANCEL TRANSACTION
            </button>
        </div>
    `;
    
    modal.innerHTML = html;
    modal.classList.add('show');
    bindHoverEvents();
    
    };
   // --- RENDER BLOG (ARTIKEL) ---
window.renderBlog = function() {
    const grid = document.getElementById('blogGrid');
    if(!grid) return;
    
    // Cek apakah data blog ada di data.js
    if(!siteData.blog || siteData.blog.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%;">Belum ada artikel tersedia.</p>';
        return;
    }
    
    grid.innerHTML = ''; // Hapus tulisan "Memuat artikel..."

    siteData.blog.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blog-card hover-target';
        // Saat diklik pindah ke halaman artikel
        card.onclick = (e) => {
    e.preventDefault(); // Mencegah pindah langsung
    smoothNavigate(post.link); // Panggil animasi dulu
};
        
        card.innerHTML = `
            <div class="blog-thumb">
                <img src="${post.img}" alt="${post.title}" loading="lazy">
                <div class="blog-cat">${post.category}</div>
            </div>
            <div class="blog-info">
                <div class="blog-meta">${post.date}</div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <span class="read-more-btn">BACA SELENGKAPNYA &rarr;</span>
            </div>
        `;
        grid.appendChild(card);
    });
    
    // Aktifkan efek cursor custom
    if(typeof bindHoverEvents === 'function') bindHoverEvents(); 
    }
    // --- FUNGSI TRANSISI HALUS (SMOOTH PAGE TRANSITION) ---
window.smoothNavigate = function(url) {
    const preloader = document.getElementById('preloader');
    
    if(preloader) {
        // 1. Munculkan Layar Hitam (Fade Out)
        preloader.style.visibility = 'visible';
        preloader.style.opacity = '1';
        
        // 2. Tunggu animasi CSS selesai (0.8 detik), baru pindah url
        setTimeout(() => {
            window.location.href = url;
        }, 800); // 800ms sesuai durasi transisi di style.css
    } else {
        // Fallback jika preloader tidak ada
        window.location.href = url;
    }
}