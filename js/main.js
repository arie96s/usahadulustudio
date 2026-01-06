// js/main.js

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
    
    // Inisialisasi Data
    updateLanguageUI();
    updateWALinks();
    
    // Set tombol bahasa aktif
    const toggleBtn = document.getElementById('langToggle');
    if(toggleBtn) toggleBtn.setAttribute('data-lang', siteData.currentLang);

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
    if(document.getElementById('paymentGatewayContainer')) renderOrderSummary();
    updateWALinks();
}

function updateLanguageUI() {
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
// Optimasi performance cursor menggunakan transform
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
            // Ganti logo jadi putih/hitam jika perlu, atau tetap sama
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
        
        const li = document.createElement('li');
        li.className = 'service-wrapper';
        li.innerHTML = `
            <div class="service-header hover-target" onclick="this.classList.toggle('active'); this.nextElementSibling.style.maxHeight = this.classList.contains('active') ? this.nextElementSibling.scrollHeight + 'px' : null;">
                <span class="service-name-main">${name}</span>
                <span class="service-icon-state">▼</span>
            </div>
            <div class="service-body">
                <p class="service-desc">${desc}</p>
                <table class="price-table">${tableRows}</table>
            </div>`;
        container.appendChild(li);
    });
    bindHoverEvents();
}

function renderFAQ() {
    const container = document.getElementById('faqContent');
    if(!container) return;
    container.innerHTML = '';
    const lang = siteData.currentLang;
    siteData.faq.forEach(item => {
        const q = lang === 'id' ? item.q_id : item.q_en;
        const a = lang === 'id' ? item.a_id : item.a_en;
        container.innerHTML += `<div class="faq-item"><span class="faq-q">${q}</span><span class="faq-a">${a}</span></div>`;
    });
}

// 7. PORTFOLIO & CASE STUDY
window.renderPortfolio = function(cat) {
    const grid = document.getElementById('portfolioGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    // (Logic simple untuk highlight button, bisa dikembangkan lagi)
    
    const items = cat === 'all' ? siteData.portfolio : siteData.portfolio.filter(i => i.category === cat);
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'portfolio-item hover-target';
        
        // Logika Gambar: Gunakan demoUrl jika useLocalImages false
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
    
    // Default data jika case study tidak ada
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

// 8. REVIEW SYSTEM
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

// 9. ORDER & PAYMENT LOGIC (UPDATED WITH GOOGLE FORM)
function initOrderPage() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('orderService').value = urlParams.get('service') || '-';
    document.getElementById('orderPackage').value = urlParams.get('package') || '-';
    document.getElementById('orderPrice').value = urlParams.get('price') || 'TBD';
}

window.submitOrder = function() {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    const brief = document.getElementById('clientBrief').value;
    const service = document.getElementById('orderService').value;
    const pkg = document.getElementById('orderPackage').value;
    const price = document.getElementById('orderPrice').value;

    if(!name || !phone) { alert("Harap lengkapi Nama dan No WA!"); return; }

    const submitBtn = document.querySelector('.submit-order-btn');
    submitBtn.innerText = "Processing...";
    submitBtn.style.opacity = "0.7";
    submitBtn.disabled = true;

    // --- GOOGLE FORM SUBMISSION LOGIC ---
    if(appConfig.googleForm && appConfig.googleForm.actionUrl.includes("docs.google.com")) {
        const gForm = appConfig.googleForm;
        const formData = new FormData();
        
        // Mapping Data ke Entry ID Google Form
        if(gForm.inputs.name) formData.append(gForm.inputs.name, name);
        if(gForm.inputs.phone) formData.append(gForm.inputs.phone, phone);
        if(gForm.inputs.email) formData.append(gForm.inputs.email, email);
        if(gForm.inputs.service) formData.append(gForm.inputs.service, service);
        if(gForm.inputs.pkg) formData.append(gForm.inputs.pkg, pkg);
        if(gForm.inputs.price) formData.append(gForm.inputs.price, price);
        if(gForm.inputs.brief) formData.append(gForm.inputs.brief, brief);

        // Kirim menggunakan Fetch dengan mode no-cors
        fetch(gForm.actionUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        }).then(() => {
            console.log("Data sent to Google Form successfully.");
        }).catch(err => {
            console.error("Failed sending to Google Form:", err);
            // Lanjut saja meski gagal (mungkin masalah koneksi), user tidak perlu tahu
        });
    }

    // --- PROCEED TO LOCAL PROCESS ---
    const orderData = { name, phone, service, pkg, price };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // Delay sedikit agar request fetch sempat terkirim sebelum redirect
    setTimeout(() => {
        alert("Invoice Created! Redirecting to Payment...");
        window.location.href = "payment.html";
    }, 1000);
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

window.openXenditDemo = function(price) {
    const modal = document.getElementById('lightboxModal');
    const html = `
        <div class="modal-content xendit-modal-body">
            <div class="x-header">
                <span class="x-logo">xendit</span>
                <span class="x-amount">${price}</span>
            </div>
            <div class="x-content">
                <span class="x-label">VIRTUAL ACCOUNT (Demo)</span>
                
                <span class="x-label">QR CODE</span>
                <div class="x-option hover-target" onclick="alert('Redirecting to QRIS...')">
                    <div class="x-icon">QRIS</div>
                    <div class="x-name">QRIS (GoPay, OVO, Dana)</div>
                </div>
                
                <span class="x-label">E-WALLET / GLOBAL</span>
                <div class="x-option hover-target" onclick="alert('Redirecting to PayPal...')">
                    <div class="x-icon">PP</div>
                    <div class="x-name">PayPal International</div>
                </div>
            </div>
            <div class="x-footer">
                Powered by Xendit Payment Gateway (Demo Mode)
            </div>
            <button onclick="closeLightboxOnly()" style="width:100%; padding:15px; background:#f0f0f0; border:none; color:#333; cursor:pointer; font-weight:bold;">CANCEL TRANSACTION</button>
        </div>
    `;
    modal.innerHTML = html;
    modal.classList.add('show');
}