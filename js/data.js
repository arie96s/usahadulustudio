// js/data.js

const appConfig = {
    useLocalImages: false,
    localPath: 'img/',
    
    // --- KONFIGURASI GOOGLE FORM (ISI DI SINI) ---
    googleForm: {
        // Ganti URL ini dengan URL Google Form Anda (pastikan akhiran /formResponse)
        actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf3Xjl9rE08-l4YaZHrgUUX1VtTaWTuxzF6GoHi6uhcvvZqsQ/formResponse", 
        
        // Ganti angka entry.xxxxx sesuai dengan "Get Pre-filled Link" Google Form Anda
        inputs: {
            name: "entry.168693984",    // ID untuk Nama
            phone: "entry.1086076035",   // ID untuk No WA
            email: "entry.1587178877",   // ID untuk Email
            service: "entry.1698374412", // ID untuk Layanan (Service)
            pkg: "entry.97551763",     // ID untuk Paket
            price: "entry.1752180585",   // ID untuk Harga
            brief: "entry.622426755"    // ID untuk Brief
        }
    }
};

// --- DATA STRUCTURE ---
const siteData = {
    currentLang: localStorage.getItem('usahadulu_lang') || 'id',
    
    translations: {
        id: {
            nav_services: "LAYANAN",
            nav_portfolio: "PORTOFOLIO",
            nav_testimonials: "KLIEN & TESTIMONI",
            nav_collection: "KOLEKSI KAMI",
            nav_about: "TENTANG",
            nav_faq: "TANYA JAWAB (FAQ)",
            nav_payment: "METODE PEMBAYARAN",
            nav_terms: "SYARAT & KETENTUAN",
            hero_cta: "MULAI PROYEK",
            hero_tagline: "SOLUSI VISUAL PROFESIONAL UNTUK IDENTITAS BRAND ANDA",
            about_title: "TENTANG KAMI",
            payment_title: "CHECKOUT & PEMBAYARAN",
            pay_gateway_btn: "BAYAR SEKARANG (XENDIT/QRIS)",
            
            // FOOTER TRANSLATION
            footer_order: "CARA ORDER",
            footer_services: "LAYANAN & HARGA",
            footer_find: "IKUTI KAMI",
            footer_rights: "HAK CIPTA DILINDUNGI",

            // ABOUT PAGE STORY
            about_desc: `
                Assalamualaikum & Salam Kreatif.<br><br>
                <strong>USAHADULU</strong> bukanlah agensi raksasa, melainkan sebuah ruang karya sederhana yang telah bernafas sejak tahun <strong>2013</strong>. Perjalanan ini dimulai dari kamar kost saat saya masih duduk di bangku kuliah, bereksperimen dengan desain visual di sela-sela tumpukan tugas kampus.<br><br>
                Mungkin Anda pernah mengenal saya dengan nama brand yang berbeda-beda sebelumnya. Ya, saya memang cukup sering berganti nama usaha. Bukan karena tidak konsisten, melainkan sebuah proses panjang pencarian jati diri visual yang paling jujur. Dari sekadar hobi mahasiswa, berlanjut menjadi <em>freelancer</em> penuh waktu, hingga kini saya tetap berkarya di sela-sela kesibukan pekerjaan utama saya.<br><br>
                Semangat itu tidak pernah padam. Saya ada di sini untuk membantu menerjemahkan ide Anda menjadi visual yang berkarakter, dengan pendekatan yang personal, santai, dan bersahabat.<br><br>
                Terima kasih telah mampir dan mempercayakan visi Anda. Mari berkarya bersama.
            `,
            
            portfolio_title: "KARYA KAMI",
            order_prefix: "Halo Admin USAHADULU, saya tertarik order ",
            filter_all: "SEMUA",
            price_start: "Mulai",
            btn_order_now: "ORDER SEKARANG",
            
            // Terms
            terms_title: "SYARAT & KETENTUAN LAYANAN",
            privacy_title: "KEBIJAKAN PRIVASI",
            terms_intro: "Dengan menggunakan layanan USAHADULU, Anda menyetujui poin-poin berikut:"
        },
        en: {
            nav_services: "SERVICES",
            nav_portfolio: "PORTFOLIO",
            nav_testimonials: "CLIENTS & REVIEWS",
            nav_collection: "OUR COLLECTION",
            nav_about: "ABOUT",
            nav_faq: "FAQ / Q&A",
            nav_payment: "PAYMENT METHODS",
            nav_terms: "TERMS & CONDITIONS",
            hero_cta: "START PROJECT",
            hero_tagline: "PROFESSIONAL VISUAL SOLUTIONS FOR YOUR BRAND IDENTITY",
            about_title: "ABOUT US",
            payment_title: "CHECKOUT & PAYMENT",
            pay_gateway_btn: "PAY NOW (XENDIT/PAYPAL)",
            
            // FOOTER TRANSLATION
            footer_order: "HOW TO ORDER",
            footer_services: "SERVICES & PRICELIST",
            footer_find: "FIND US ON",
            footer_rights: "ALL RIGHTS RESERVED",

            // ABOUT PAGE STORY
            about_desc: `
                Greetings & Welcome.<br><br>
                <strong>USAHADULU</strong> isn't a massive corporate agency. It is a humble creative home that has been breathing since <strong>2013</strong>. This journey started back in my college dorm room, experimenting with visuals between piles of assignments.<br><br>
                You might have known me under different brand names in the past. It's true, I've changed identities a few times. Not out of inconsistency, but as a necessary journey to find my true visual soul. From a college side-hustle to a full-time freelance gig, and now keeping the passion alive amidst my daily professional career.<br><br>
                The spark remains untouched. I'm here to help translate your raw ideas into distinct visuals, with a personal, friendly, and grounded approach.<br><br>
                Thanks for dropping by and trusting the process. Let's make something cool together.
            `,
            
            portfolio_title: "OUR WORK",
            order_prefix: "Hello Admin USAHADULU, I'm interested in ordering ",
            filter_all: "ALL",
            price_start: "Start from",
            btn_order_now: "ORDER NOW",
            
            // Terms
            terms_title: "TERMS OF SERVICE",
            privacy_title: "PRIVACY POLICY",
            terms_intro: "By using USAHADULU services, you agree to the following points:"
        }
    },
    faq: [
        {
            q_id: "Berapa lama proses pengerjaan?",
            a_id: "Estimasi 3-7 hari kerja tergantung antrian dan tingkat kesulitan. Prioritas pengerjaan tersedia dengan biaya tambahan.",
            q_en: "How long does the process take?",
            a_en: "Estimated 3-7 working days depending on queue and complexity. Priority service available with extra charge."
        },
        {
            q_id: "Apakah ada revisi?",
            a_id: "Kami memberikan 2x sesi revisi minor (perubahan warna/font) gratis. Revisi konsep total dikenakan biaya baru.",
            q_en: "Are revisions included?",
            a_en: "We provide 2x free minor revision sessions (color/font tweaks). Total concept revision requires a new fee."
        },
        {
            q_id: "File apa yang saya dapatkan?",
            a_id: "Anda akan mendapatkan file High-Res (JPG/PNG) dan File Master (AI/PSD/EPS) sesuai paket yang diambil.",
            q_en: "What files will I get?",
            a_en: "You will receive High-Res files (JPG/PNG) and Master Files (AI/PSD/EPS) according to the selected package."
        },
        {
            q_id: "Sistem Pembayaran?",
            a_id: "Wajib DP 50% via Xendit/QRIS di awal. Pelunasan dilakukan setelah preview desain disetujui.",
            q_en: "Payment System?",
            a_en: "50% Down Payment required upfront via Xendit/PayPal. Full payment after design preview approval."
        }
    ],
    services: [
        { 
            id: 'logo', 
            name_id: "LOGO & BRANDING", 
            name_en: "LOGO & BRANDING", 
            price: "IDR 250K",
            desc_id: "Pembuatan identitas visual yang kuat. Cocok untuk brand baru yang ingin tampil beda.",
            desc_en: "Strong visual identity creation. Perfect for new brands wanting to stand out.",
            packages: [
                { item: "Basic (Logo Only)", price: "250K" },
                { item: "Standard (Logo + Mockup)", price: "450K" },
                { item: "Pro (Full Branding Kit)", price: "800K" },
                { item: "Re-drawing Vector", price: "150K" }
            ]
        },
        { 
            id: 'apparel', 
            name_id: "DESAIN KAOS/APPAREL", 
            name_en: "APPAREL/T-SHIRT DESIGN", 
            price: "IDR 150K",
            desc_id: "Desain ilustrasi untuk merchandise, kaos band, streetwear, dan clothing line.",
            desc_en: "Illustration design for merchandise, band tees, streetwear, and clothing lines.",
            packages: [
                { item: "Typography Design", price: "150K" },
                { item: "Simple Illustration", price: "300K" },
                { item: "Detailed / Metal Artwork", price: "600K" },
                { item: "Full Merch Pack (F/B/S)", price: "850K" }
            ]
        },
        { 
            id: 'flyer', 
            name_id: "DESAIN POSTER/FLYER", 
            name_en: "FLYER/POSTER DESIGN", 
            price: "IDR 100K",
            desc_id: "Media promosi digital untuk event, gig musik, atau promo produk di sosial media.",
            desc_en: "Digital promotional media for events, music gigs, or product promos on social media.",
            packages: [
                { item: "Instagram Feed/Story", price: "100K" },
                { item: "Event Poster A3", price: "200K" },
                { item: "Menu Design (1 Page)", price: "250K" },
                { item: "Banner / Billboard", price: "300K" }
            ]
        },
        { 
            id: 'web', 
            name_id: "WEB UNDANGAN DIGITAL", 
            name_en: "WEB INVITATION", 
            price: "IDR 300K",
            desc_id: "Undangan berbasis website yang elegan, modern, dan mudah disebarkan.",
            desc_en: "Elegant, modern, and easily shareable website-based invitations.",
            packages: [
                { item: "Basic Template", price: "300K" },
                { item: "Custom Theme", price: "600K" },
                { item: "Exclusive Domain (.com)", price: "+200K" },
                { item: "Prioritas Pengerjaan", price: "+100K" }
            ]
        },
        { 
            id: 'video', 
            name_id: "VIDEO & MOTION GRAPHIC", 
            name_en: "VIDEO & MOTION GRAPHIC", 
            price: "IDR 200K",
            desc_id: "Editing video kreatif untuk Reels, TikTok, atau intro YouTube yang dinamis.",
            desc_en: "Creative video editing for Reels, TikTok, or dynamic YouTube intros.",
            packages: [
                { item: "Simple Cut/Edit (1 min)", price: "200K" },
                { item: "Motion Graphic Intro", price: "350K" },
                { item: "Lyric Video", price: "500K" },
                { item: "Teaser Event", price: "400K" }
            ]
        },
    ],
    
    // PORTFOLIO & CASE STUDY
    portfolio: [
        { 
            category: 'logo', 
            title: 'NEON CYBERPUNK LOGO', 
            fileName: 'logo_cyberpunk.jpg', 
            demoUrl: 'https://images.unsplash.com/photo-1571120038865-c35012e1284a?auto=format&fit=crop&w=500&q=60',
            caseStudy: {
                client: "CyberCafe Jakarta",
                problem: "Klien membutuhkan logo yang futuristik untuk cafe gaming baru.",
                solution: "Menggunakan palet warna neon dan font glitch modern.",
                result: "Brand awareness meningkat 30% di kalangan gamer lokal."
            }
        },
        { 
            category: 'apparel', 
            title: 'MAGOS STREETWEAR V1', 
            fileName: 'magos_v1.jpg', 
            demoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=60',
            caseStudy: {
                client: "MAGOS Streetwear",
                problem: "Ingin desain yang dark tapi tetap estetik untuk pasar anak muda.",
                solution: "Ilustrasi tengkorak dengan style line-art minimalis.",
                result: "Best seller item pada peluncuran bulan Oktober."
            }
        },
        { 
            category: 'flyer', 
            title: 'METAL BAND POSTER', 
            fileName: 'poster_metal.jpg', 
            demoUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=500&q=60',
            caseStudy: {
                client: "Purgatory Band",
                problem: "Poster gig underground yang harus terlihat 'brutal' namun info terbaca.",
                solution: "Tipografi distress dikombinasikan dengan layout asimetris.",
                result: "Tiket presale sold out dalam 3 hari."
            } 
        },
        { category: 'apparel', title: 'DARK ARTS ILLUSTRATION', fileName: 'dark_art.jpg', demoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=60' },
        { category: 'logo', title: 'VINTAGE TYPOGRAPHY', fileName: 'logo_vintage.jpg', demoUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=500&q=60' },
        { category: 'web', title: 'RETRO WAVE WEBSITE', fileName: 'web_retro.jpg', demoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=60' },
        { category: 'video', title: 'URBAN VLOG INTRO', fileName: 'video_vlog.jpg', demoUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=500&q=60' },
        { category: 'flyer', title: 'EVENT FLYER DUMAI', fileName: 'flyer_dumai.jpg', demoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=60' },
        { category: 'apparel', title: 'GOTHIC MERCHANDISE', fileName: 'merch_gothic.jpg', demoUrl: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=500&q=60' },
        { category: 'video', title: 'ABSTRACT MOTION', fileName: 'video_abstract.jpg', demoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=500&q=60' },
        { category: 'web', title: 'WEDDING INVITATION', fileName: 'web_wedding.jpg', demoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=60' }
    ],
    
    filters: ['logo', 'apparel', 'web', 'video', 'flyer'],
    
    testimonials: [
        { name: "Doni Pratama", brand: "Iron Soul Band", quote: "Desain artwork untuk album band kami sakit banget! Detailnya gila, vibe dark-nya dapet banget." },
        { name: "Siska Wijaya", brand: "Cafe Senja Dumai", quote: "Pengerjaan logo dan daftar menu sangat cepat. Revisi dilayani dengan ramah sampai sesuai keinginan." },
        { name: "Rian Ardiansyah", brand: "Street Rebels", quote: "Sudah 3x order desain kaos di sini. Selalu puas sama hasilnya. Konsep metalnya orisinil." },
        { name: "Putri Anggraini", brand: "Wedding Client", quote: "Undangan digitalnya elegan dan smooth banget animasinya. Tamu-tamu pada suka!" }
    ]
};