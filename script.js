document.addEventListener('DOMContentLoaded', function() {
    // === Elemen Global ===
    const allNavLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const searchBar = document.getElementById('search-bar');
    const cultureListContainer = document.querySelector('#culture-list .card-grid');
    const favoriteListContainer = document.getElementById('favorite-list');
    const backToTopButton = document.getElementById("back-to-top-btn");

    // === State Aplikasi ===
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // === Fungsi-fungsi Utama ===

    /**
     * Menampilkan halaman yang dipilih dan menyembunyikan yang lain.
     * @param {string} pageId - ID dari elemen section halaman yang akan ditampilkan.
     */
    const showPage = (pageId) => {
        pages.forEach(page => page.classList.remove('active'));
        const activePage = document.getElementById(pageId);
        if (activePage) activePage.classList.add('active');

        updateActiveNavLinks(pageId);
        window.scrollTo(0, 0);
        mobileMenu.classList.remove('active');

        if (pageId === 'favorites') {
            renderFavorites();
        }
    };

    /**
     * Memperbarui link navigasi yang aktif.
     * @param {string} pageId - ID halaman yang sedang aktif.
     */
    const updateActiveNavLinks = (pageId) => {
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            }
        });
        if (pageId === 'home') {
            document.querySelector('.nav-menu > .nav-link[data-page="home"]').classList.add('active');
        }
    };

    /**
     * Mengisi container kartu budaya dengan data dari file data.js.
     */
    const populateCultureCards = () => {
        if (typeof cultureData !== 'undefined' && cultureListContainer) {
            const cardsHTML = cultureData.map(culture => {
                const isFavorited = favorites.includes(culture.id);
                return `
                    <div class="card" data-id="${culture.id}">
                        <img src="${culture.imgSrc}" alt="${culture.imgAlt}">
                        <div class="card-content">
                            <div class="card-title">
                                <h3 class="font-serif">${culture.title}</h3>
                                <span class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${culture.id}">&#9733;</span>
                            </div>
                            <p>${culture.description}</p>
                            <a href="#" class="nav-link" data-page="${culture.id}">Baca Selengkapnya &rarr;</a>
                        </div>
                    </div>
                `;
            }).join('');
            cultureListContainer.innerHTML = cardsHTML;
            renderCultureListOrder();
        }
    };

    /**
     * Mengurutkan ulang daftar kartu budaya berdasarkan favorit.
     */
    const renderCultureListOrder = () => {
        const fragment = document.createDocumentFragment();
        const allCards = Array.from(cultureListContainer.querySelectorAll('.card'));

        allCards.sort((a, b) => {
            const aIsFavorited = favorites.includes(a.dataset.id);
            const bIsFavorited = favorites.includes(b.dataset.id);
            return bIsFavorited - aIsFavorited;
        });
        
        allCards.forEach(card => fragment.appendChild(card));
        cultureListContainer.innerHTML = '';
        cultureListContainer.appendChild(fragment);
    };

    /**
     * Meng-handle penambahan/penghapusan dari daftar favorit.
     * @param {string} cardId - ID dari kartu yang akan di-toggle.
     */
    const toggleFavorite = (cardId) => {
        const index = favorites.indexOf(cardId);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(cardId);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Update UI di halaman utama dan favorit
        updateAllFavoriteIcons(cardId);
        renderCultureListOrder();
        if (document.getElementById('favorites').classList.contains('active')) {
            renderFavorites();
        }
    };

    /**
     * Memperbarui semua ikon favorit untuk kartu tertentu.
     * @param {string} cardId - ID kartu yang ikonnya akan diperbarui.
     */
    const updateAllFavoriteIcons = (cardId) => {
        const allIcons = document.querySelectorAll(`.favorite-btn[data-id="${cardId}"]`);
        allIcons.forEach(icon => {
            icon.classList.toggle('favorited', favorites.includes(cardId));
        });
    };

    /**
     * Merender daftar kartu di halaman favorit.
     */
    const renderFavorites = () => {
        favoriteListContainer.innerHTML = '';
        const favoriteCultureData = cultureData.filter(culture => favorites.includes(culture.id));

        if (favoriteCultureData.length === 0) {
            favoriteListContainer.innerHTML = '<p class="no-favorites-message">Anda belum menambahkan budaya favorit.</p>';
            return;
        }

        const cardsHTML = favoriteCultureData.map(culture => `
            <div class="card" data-id="${culture.id}">
                <img src="${culture.imgSrc}" alt="${culture.imgAlt}">
                <div class="card-content">
                    <div class="card-title">
                        <h3 class="font-serif">${culture.title}</h3>
                        <span class="favorite-btn favorited" data-id="${culture.id}">&#9733;</span>
                    </div>
                    <p>${culture.description}</p>
                    <a href="#" class="nav-link" data-page="${culture.id}">Baca Selengkapnya &rarr;</a>
                </div>
            </div>
        `).join('');
        favoriteListContainer.innerHTML = cardsHTML;
    };


    // === Event Listeners ===

    // Navigasi utama dan mobile
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.dataset.page);
        });
    });
    
    // Tombol menu mobile
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('active'));

    // Event Delegation untuk konten dinamis (kartu budaya)
    [cultureListContainer, favoriteListContainer].forEach(container => {
        if(container) {
            container.addEventListener('click', function(e) {
                // Handle klik tombol favorit
                if (e.target.matches('.favorite-btn')) {
                    e.stopPropagation();
                    const cardId = e.target.dataset.id;
                    toggleFavorite(cardId);
                }
                // Handle klik link "Baca Selengkapnya"
                if (e.target.matches('.nav-link')) {
                    e.preventDefault();
                    const pageId = e.target.dataset.page;
                    showPage(pageId);
                }
            });
        }
    });

    // Pencarian
    searchBar.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allCards = cultureListContainer.querySelectorAll('.card');
        allCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.p.textContent.toLowerCase();
            card.style.display = (title.includes(searchTerm) || description.includes(searchTerm)) ? 'block' : 'none';
        });
    });

    // Tombol Back to Top
    window.onscroll = function() {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    };
    backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Bug fix: tutup menu mobile saat resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            mobileMenu.classList.remove('active');
        }
    });

    // === Inisialisasi Aplikasi ===
    populateCultureCards();
});