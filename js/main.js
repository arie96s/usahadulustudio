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

// Perubahan fungsi renderShop di main.js
// Perbaikan fungsi renderShop di main.js agar harga tampil sesuai USD
window.renderShop = function(filter, page = 1) {
    const grid = document.getElementById('shopGrid');
    if(!grid) return;
    
    if(page !== currentShopPage && page !== 1) {
        const yOffset = -120; 
        const y = grid.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }

    function renderPagination(totalPages, filter) {
    const container = document.getElementById('shopPagination');
    if(!container) return;
    container.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn hover-target ${i === currentShopPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => renderShop(filter, i);
        container.appendChild(btn);
    }
}
    
    currentShopPage = page;
    grid.innerHTML = ''; 
    const lang = siteData.currentLang; 

    const allItems = filter === 'all' ? siteData.shop : siteData.shop.filter(p => p.category === filter);

    if(allItems.length === 0) {
        const emptyMsg = lang === 'id' ? 'Produk belum tersedia.' : 'Products not available.';
        grid.innerHTML = `<p style="color:#666; width:100%; text-align:center; padding: 40px;">${emptyMsg}</p>`;
        renderPagination(0, filter);
        return;
    }

    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = allItems.slice(start, end);

    paginatedItems.forEach((p, index) => {
        let badgeStyle = p.badge === 'NEW' ? 'background: #fff; color: #000;' : (p.badge === 'BEST SELLER' ? 'background: #ffd700; color: #000; border:none;' : '');

        // PERBAIKAN: Langsung menggunakan p.priceRaw karena data sudah dalam format USD (Dolar)
        let displayPrice = "$ " + p.priceRaw.toFixed(2); 
        
        let buyLink = p.link_redbubble || "#"; 
        let btnText = siteData.currentLang === 'id' ? "BELI DI REDBUBBLE" : "BUY ON REDBUBBLE";

        const card = document.createElement('div');
        card.className = 'product-card hover-target';
        card.style.animationDelay = `${index * 0.1}s`; 
        
        card.innerHTML = `
            ${p.badge ? `<div class="instant-badge" style="${badgeStyle}">${p.badge}</div>` : ''}
            <img src="${p.img}" alt="${p.title}" class="product-img">
            <div class="product-info">
                <span class="product-cat">${p.type}</span>
                <h3 class="product-title">${p.title}</h3>
                <div class="product-footer">
                    <span class="product-price" style="color:#ffd700;">${displayPrice}</span>
                    <a href="${buyLink}" target="_blank" class="buy-btn hover-target">${btnText}</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    renderPagination(totalPages, filter);
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

// 3. Fungsi Utama: Apply Voucher (Updated for Payment Term Sync)
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

    // --- [BARU] TRIGGER UPDATE TAGIHAN REAL-TIME ---
    // Pastikan angka "TAGIHAN SAAT INI" ikut berubah setelah diskon diterapkan
    if(typeof updatePayableDisplay === 'function') {
        updatePayableDisplay();
    }
}

// 11. ORDER & PAYMENT LOGIC (Updated PDF with Brief + Payment Term)
function initOrderPage() {
    const serviceSelect = document.getElementById('orderService');
    const pkgSelect = document.getElementById('orderPackage');
    const priceInput = document.getElementById('orderPrice');
    
    // 1. Cek apakah elemen ada (untuk menghindari error di halaman lain)
    if (!serviceSelect || !pkgSelect || !priceInput) return;

    // --- [BARU] LOGIKA HITUNG TAGIHAN REAL-TIME (DP/FULL) ---
    window.updatePayableDisplay = function() {
        const termSelect = document.getElementById('paymentTerm');
        const term = termSelect ? parseFloat(termSelect.value) : 1.0;
        
        // Gunakan currentFinalPrice (harga setelah voucher jika ada)
        const payable = currentFinalPrice * term;
        
        const displayElement = document.getElementById('payableAmountDisplay');
        const finalPriceEl = document.getElementById('finalPriceDisplay');
        
        if(displayElement) displayElement.innerText = formatNumberToPrice(payable);
        if(finalPriceEl) finalPriceEl.innerText = formatNumberToPrice(currentFinalPrice);
    };

    // 2. Ambil Bahasa Aktif
    const lang = siteData.currentLang || 'id';
    
    // 3. Kosongkan Dropdown Dulu
    serviceSelect.innerHTML = '<option value="">-- Pilih Layanan / Select Service --</option>';
    pkgSelect.innerHTML = '<option value="">-- Pilih Paket / Select Package --</option>';

    // 4. Populate (Isi) Dropdown Service dari data.js
    siteData.services.forEach((svc, index) => {
        const option = document.createElement('option');
        option.value = index; // Kita simpan index array-nya sebagai value
        option.text = lang === 'id' ? svc.name_id : svc.name_en; // Nama sesuai bahasa
        serviceSelect.appendChild(option);
    });

    // 5. Fungsi Update Paket saat Service dipilih
    function updatePackages(selectedIndex) {
        pkgSelect.innerHTML = ''; // Reset paket
        
        if (selectedIndex === "") {
            pkgSelect.innerHTML = '<option value="">-- Pilih Paket Dahulu --</option>';
            priceInput.value = "IDR 0";
            return;
        }

        const selectedService = siteData.services[selectedIndex];
        
        // Loop paket di dalam service tersebut
        selectedService.packages.forEach((pkg) => {
            const opt = document.createElement('option');
            opt.value = pkg.item; // Nama paket
            opt.setAttribute('data-price', pkg.price); // Simpan harga di atribut data
            opt.text = `${pkg.item}`;
            pkgSelect.appendChild(opt);
        });

        // Otomatis pilih paket pertama dan update harga
        if (pkgSelect.options.length > 0) {
            pkgSelect.selectedIndex = 0;
            updatePrice();
        }
    }

    // 6. Fungsi Update Harga
    function updatePrice() {
        const selectedOption = pkgSelect.options[pkgSelect.selectedIndex];
        if (selectedOption) {
            const price = selectedOption.getAttribute('data-price');
            priceInput.value = "IDR " + price; // Format harga
            
            // Reset logika diskon/voucher jika harga berubah
            if(typeof currentBasePrice !== 'undefined') {
                currentBasePrice = parsePriceToNumber("IDR " + price);
                // Reset tampilan diskon jika user ganti paket
                document.getElementById('discountDisplay').style.display = 'none';
                document.getElementById('voucherMsg').style.display = 'none';
                document.getElementById('voucherInput').value = '';
                currentFinalPrice = currentBasePrice;
                appliedDiscountCode = null;

                // [BARU] Panggil updatePayableDisplay agar tagihan di bawah ikut sinkron
                updatePayableDisplay();
            }
        }
    }

    // 7. Event Listeners (Saat user klik ganti)
    serviceSelect.addEventListener('change', function() {
        updatePackages(this.value);
    });

    pkgSelect.addEventListener('change', function() {
        updatePrice();
    });

    // 8. LOGIKA URL PARAMETER (Agar link dari Artikel tetap jalan)
    const urlParams = new URLSearchParams(window.location.search);
    const paramService = urlParams.get('service'); 
    
    if (paramService) {
        const foundIndex = siteData.services.findIndex(s => 
            s.name_id.includes(paramService) || s.name_en.includes(paramService)
        );

        if (foundIndex !== -1) {
            serviceSelect.value = foundIndex; 
            updatePackages(foundIndex); 
            
            const paramPkg = urlParams.get('package');
            if(paramPkg) {
                for(let i=0; i<pkgSelect.options.length; i++) {
                    if(pkgSelect.options[i].value.includes(paramPkg)) {
                        pkgSelect.selectedIndex = i;
                        updatePrice();
                        break;
                    }
                }
            }
        }
    }
}

window.submitOrder = function() {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    const brief = document.getElementById('clientBrief').value;
    const serviceSelect = document.getElementById('orderService');
    const pkgSelect = document.getElementById('orderPackage');
    const termSelect = document.getElementById('paymentTerm');

    let service = "-";
    if (serviceSelect && serviceSelect.selectedIndex !== -1) {
        service = serviceSelect.options[serviceSelect.selectedIndex].text;
    }
    const pkg = pkgSelect ? pkgSelect.value : "-";
    
    const termValue = termSelect ? parseFloat(termSelect.value) : 1.0;
    const paymentStatus = termValue === 0.5 ? "DP 50%" : "LUNAS";
    const amountToPayNow = currentFinalPrice * termValue;

    if(!name || !phone || !brief || service === "" || pkg === "" || service.includes("--")) { 
        alert("Harap lengkapi data order dan deskripsi konsep!"); 
        return; 
    }

    const orderData = { 
        name, phone, email, service, pkg, brief, 
        totalPrice: formatNumberToPrice(currentFinalPrice),
        payableNow: formatNumberToPrice(amountToPayNow),
        paymentStatus: paymentStatus,
        voucher: appliedDiscountCode 
    };

    generateInvoicePDF(orderData); 
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    
    const btn = document.querySelector('.submit-order-btn');
    if(btn) btn.innerText = "Processing...";
    
    setTimeout(() => { window.location.href = "payment.html"; }, 2000);
};

// 11. ORDER & PAYMENT LOGIC (Updated PDF with Brief, DP/Full Info & Vouchers)
function generateInvoicePDF(data) {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // HEADER & BRANDING
    doc.setFontSize(22); 
    doc.setFont("helvetica", "bold"); 
    doc.text("INVOICE", 105, 20, null, null, "center");
    
    doc.setFontSize(12); 
    doc.setFont("helvetica", "normal"); 
    doc.text("USAHADULU STUDIO", 105, 28, null, null, "center");
    doc.line(20, 40, 190, 40);

    // INFO CLIENT & PAYMENT STATUS
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Client: ${data.name}`, 20, 56);
    doc.text(`Phone: ${data.phone}`, 20, 62);
    doc.text(`Email: ${data.email || '-'}`, 20, 68);

    // Menampilkan Status Pembayaran (DP/Lunas) di sisi kanan
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT STATUS:", 140, 50);
    doc.setFontSize(12);
    doc.setTextColor(data.paymentStatus.includes("DP") ? 255 : 46, data.paymentStatus.includes("DP") ? 71 : 213, data.paymentStatus.includes("DP") ? 87 : 115);
    doc.text(data.paymentStatus, 140, 58); 
    doc.setTextColor(0, 0, 0); // Reset ke hitam

    // INFO LAYANAN
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold"); 
    doc.text("ITEM DESCRIPTION:", 20, 80);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Service: ${data.service}`, 20, 88);
    doc.text(`Package: ${data.pkg}`, 20, 94);

    // BRIEF SECTION
    doc.setFont("helvetica", "bold");
    doc.text("BRIEF / NOTES:", 20, 105);

    doc.setFont("helvetica", "normal");
    const splitBrief = doc.splitTextToSize(data.brief || "-", 170);
    doc.text(splitBrief, 20, 112);
    
    // Garis Pembatas Bawah Dinamis
    let yPos = 112 + (splitBrief.length * 5) + 15;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // --- LOGIKA HARGA & DISKON ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Project Value:`, 140, yPos, null, null, "right");
    doc.text(`${data.totalPrice}`, 190, yPos, null, null, "right");
    yPos += 8;

    if(data.voucher) {
        doc.setTextColor(255, 0, 0); 
        doc.text(`Voucher Applied (${data.voucher}):`, 140, yPos, null, null, "right");
        doc.text(`DISCOUNTED`, 190, yPos, null, null, "right");
        yPos += 8;
        doc.setTextColor(0, 0, 0); 
    }

    // TOTAL YANG HARUS DIBAYAR SEKARANG
    doc.setFontSize(14); 
    doc.setFont("helvetica", "bold");
    doc.text(`PAYABLE NOW: ${data.payableNow}`, 190, yPos, null, null, "right");

    // FOOTER NOTA
    yPos += 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for choosing USAHADULU Studio. Let's make something great.", 105, yPos, null, null, "center");

    // DOWNLOAD
    doc.save(`Invoice_USAHADULU_${data.name}.pdf`);
}

// 12. XENDIT DEMO MODAL (Updated to Sync with DP/Full Amount)
window.openXenditDemo = function(payableAmount) {
    const modal = document.getElementById('lightboxModal');
    const data = JSON.parse(localStorage.getItem('currentOrder'));
    
    // Gunakan nominal payableNow dari storage jika parameter tidak dikirim
    const displayPrice = payableAmount || (data ? data.payableNow : "IDR 0");
    
    const html = `
        <div class="modal-content xendit-modal-body">
            <div class="x-header">
                <span class="x-logo">xendit</span>
                <span class="x-amount">${displayPrice}</span>
            </div>
            
            <div class="x-content">
                <div style="background: #fff3cd; color: #856404; padding: 10px; font-size: 11px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #ffeeba;">
                    <strong>MODE DEMO:</strong> Pembayaran ini hanya simulasi untuk keperluan verifikasi portofolio.
                </div>

                <span class="x-label">Virtual Account (Simulasi)</span>
                <div class="x-option hover-target" onclick="alert('Simulasi: Virtual Account BCA dibuat. Silakan transfer ke nomor yang tertera (Demo).')">
                    <div class="x-icon" style="background:#005ce6; color:#fff;">BCA</div>
                    <div class="x-name">BCA Virtual Account</div>
                </div>

                <span class="x-label">QR Code / E-Wallet</span>
                <div class="x-option hover-target" onclick="alert('Simulasi: Menampilkan QRIS...')">
                    <div class="x-icon" style="background:#fff; border:1px solid #ddd;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/QRIS_logo.svg/1200px-QRIS_logo.svg.png" style="width:25px; height:auto;">
                    </div>
                    <div class="x-name">QRIS (GoPay, OVO, Dana, ShopeePay)</div>
                </div>
                
                <span class="x-label">International Payment</span>
                <div class="x-option hover-target" onclick="alert('Simulasi: Mengarahkan ke PayPal Login...')">
                    <div class="x-icon" style="background:#003087; color:#fff;">PP</div>
                    <div class="x-name">PayPal / Credit Card</div>
                </div>
            </div>

            <div class="x-footer">
                Secured by Xendit Payment Gateway (Development Mode)
            </div>
            
            <button class="x-cancel-btn hover-target" onclick="closeLightboxOnly()">
                BATALKAN TRANSAKSI
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

/* -------------------------------------- */
/* SCROLL REVEAL ANIMATION                */
/* -------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal-item");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1, // Muncul ketika 10% elemen terlihat
        rootMargin: "0px 0px -50px 0px" // Trigger sedikit sebelum bawah layar
    });

    revealElements.forEach((el) => observer.observe(el));
});

//* -------------------------------------- */
/* WA FLOATING BUTTON LOGIC (FIXED & SMOOTH) */
/* -------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Konfigurasi Konten
    const waContent = [
        {
            // PHASE 1: CHAT
            img: "img/wa_sticker.png",
            text: "Bingung Konsep?<br>Ngobrol Gratis Sini, Sob.",
            link: "https://wa.me/6282283687565?text=Halo%20Admin,%20mau%20konsultasi%20desain."
        },
        {
            // PHASE 2: CALL
            img: "img/wa_sticker_2.png", 
            text: "Jangan Takut...<br>Adminnya Manusia Kok.",
            link: "https://wa.me/6282283687565?text=Halo%20Admin,%20saya%20butuh%20respon%20cepat%20(Deadline)."
        }
    ];

    // --- FITUR TAMBAHAN: PRE-LOAD GAMBAR ---
    // Agar saat ganti gambar tidak kedip/loading (langsung ada)
    waContent.forEach(item => {
        const i = new Image();
        i.src = item.img;
    });

    let currentIndex = 0; 
    const floatBtn = document.getElementById('waFloatBtn');
    const waImg = document.getElementById('waImg');
    const waBubble = document.getElementById('waBubble');

    if(floatBtn && waImg && waBubble) {
        
        function runWACycle() {
            // STEP A: TUNGGU 5 DETIK (Posisi Hilang/Sembunyi)
            setTimeout(() => {
                
                // STEP B: GANTI KONTEN DIAM-DIAM (Saat tombol masih di bawah/sembunyi)
                const content = waContent[currentIndex];
                
                // Ganti source gambar & teks
                waImg.src = content.img;
                waBubble.innerHTML = content.text;
                floatBtn.href = content.link; 

                // Reset opacity gambar ke 1 (penuh) agar siap tampil
                waImg.style.opacity = '1';

                // STEP C: BERI JEDA KECIL (100ms)
                // Memberi waktu browser merender gambar baru sebelum tombol naik
                setTimeout(() => {
                    
                    // STEP D: MUNCULKAN TOMBOL (Sekarang gambar sudah pasti baru)
                    floatBtn.classList.add('show');

                    // STEP E: TAHAN SELAMA 30 DETIK
                    setTimeout(() => {
                        
                        // STEP F: HILANGKAN TOMBOL
                        floatBtn.classList.remove('show');

                        // STEP G: PERSIAPAN LOOP BERIKUTNYA
                        currentIndex = (currentIndex + 1) % waContent.length;
                        
                        // Ulangi siklus
                        runWACycle();

                    }, 30000); // Durasi Muncul (30 Detik)

                }, 100); // Jeda render

            }, 5000); // Durasi Sembunyi (5 Detik)
        }

        // Jalankan siklus pertama kali
        runWACycle();
    }
});

function renderOrderSummary() {
    const container = document.getElementById('paymentGatewayContainer');
    const data = JSON.parse(localStorage.getItem('currentOrder'));
    
    if(!container || !data) return;

    container.innerHTML = `
        <div class="form-group" style="background: #111; padding: 20px; border: 1px dashed #444; border-radius: 8px; margin-bottom: 20px;">
            <label style="color: #888; font-size: 11px; margin-bottom: 12px; display: block; letter-spacing: 1px;">
                RINGKASAN TAGIHAN (${data.paymentStatus})
            </label>
            
            <div style="border-top: 1px solid #222; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #888; margin-bottom: 8px;">
                    <span>Total Project:</span>
                    <span style="color: #fff; font-weight: bold;">${data.totalPrice}</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #333; margin-top: 10px;">
                    <span style="color: #eee; font-size: 14px; font-weight: bold;">HARUS DIBAYAR:</span>
                    <span style="color: #2ed573; font-size: 20px; font-weight: 900;">${data.payableNow}</span>
                </div>
            </div>
        </div>
        
        <div class="payment-option hover-target" onclick="showBankBCA()" style="border: 1px solid #2ed573; padding: 20px; border-radius: 8px; cursor: pointer; background: rgba(46, 213, 115, 0.05); margin-bottom: 12px; transition: all 0.3s ease;">
            <div style="font-weight: bold; color: #fff; font-size: 15px; letter-spacing: 0.5px;">TRANSFER BANK BCA (MANUAL)</div>
            <div style="font-size: 11px; color: #888; margin-top: 4px;">Konfirmasi bukti bayar via WhatsApp Admin.</div>
        </div>

        <button class="payment-gateway-trigger hover-target" onclick="openXenditDemo('${data.payableNow}')" style="width: 100%; padding: 18px; background: #080808; border: 1px solid #333; color: #444; cursor: pointer; border-radius: 8px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
            XENDIT / QRIS / PAYPAL (BELUM AKTIF)
        </button>
    `;
    
    if(typeof bindHoverEvents === 'function') bindHoverEvents();
}

window.showBankBCA = function() {
    const modal = document.getElementById('lightboxModal');
    if(!modal) return;
    
    const data = JSON.parse(localStorage.getItem('currentOrder'));
    const payable = data ? data.payableNow : "IDR 0";

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 420px; padding: 35px; border-radius: 12px; background: #0a0a0a; border: 1px solid #333; text-align: center; position: relative;">
            <div style="font-size: 40px; margin-bottom: 20px;">🏦</div>
            <h2 style="color: #fff; font-size: 18px; font-weight: 900; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;">Instruksi Pembayaran</h2>
            
            <div style="background: #111; padding: 20px; border-radius: 8px; border: 1px solid #222; margin-bottom: 20px; text-align: left;">
                <div style="color: #888; font-size: 10px; margin-bottom: 8px; text-transform: uppercase;">1. Transfer ke Rekening BCA:</div>
                <div style="color: #2ed573; font-size: 24px; font-weight: 900; letter-spacing: 2px; margin-bottom: 4px;">6145150268</div>
                <div style="color: #fff; font-size: 13px; font-weight: bold;">A/N FAJRI SALAM</div>
                
                <div style="margin-top: 15px; border-top: 1px solid #222; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #888; font-size: 11px;">NOMINAL:</span> 
                    <span style="color: #fff; font-weight: bold; font-size: 16px;">${payable}</span>
                </div>
            </div>

            <div style="text-align: left; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #1a1a1a;">
                <div style="color: #fff; font-size: 11px; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;">
                    <span style="background: #2ed573; color: #000; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 8px; font-size: 10px; font-weight: 900;">2</span> 
                    UPLOAD BUKTI BAYAR
                </div>
                <p style="color: #888; font-size: 11px; line-height: 1.5; margin: 0;">
                    Setelah transfer, silakan kirimkan <strong>Screenshot/Foto Bukti Bayar</strong> melalui WhatsApp agar admin dapat segera memverifikasi dan memulai pengerjaan.
                </p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <a href="https://wa.me/6282283687565?text=Halo%20Admin,%20saya%20sudah%20transfer%20sebesar%20${encodeURIComponent(payable)}.%20Berikut%20saya%20lampirkan%20bukti%20bayarnya." 
                   target="_blank" class="cta-btn hover-target" style="background: #2ed573; color: #000; padding: 15px; text-decoration: none; border-radius: 4px; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                   <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                   KIRIM BUKTI KE WHATSAPP
                </a>
                <button onclick="closeLightboxOnly()" style="background: transparent; border: none; color: #555; cursor: pointer; font-size: 11px; text-decoration: underline;">
                    Tutup Instruksi
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    if(typeof bindHoverEvents === 'function') bindHoverEvents();
};
