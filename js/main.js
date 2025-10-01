document.addEventListener("DOMContentLoaded", function () {
  // === Elemen & State Umum ===
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const backToTopButton = document.getElementById("back-to-top-btn");
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // === Logika Umum (berjalan di semua halaman) ===

  // Toggle menu mobile
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () =>
      mobileMenu.classList.toggle("active")
    );
  }

  // Tombol Back to Top
  if (backToTopButton) {
    window.onscroll = function () {
      if (
        document.body.scrollTop > 200 ||
        document.documentElement.scrollTop > 200
      ) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    };
    backToTopButton.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  // Bug fix: tutup menu mobile saat resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      mobileMenu.classList.remove("active");
    }
  });

  /**
   * Menangani penambahan/penghapusan favorit.
   * @param {string} cardId - ID dari kartu yang di-toggle.
   */
  const toggleFavorite = (cardId) => {
    const index = favorites.indexOf(cardId);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(cardId);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  // === Logika Halaman Home ===
  if (document.getElementById("home")) {
    const searchBar = document.getElementById("search-bar");
    const cultureListContainer = document.querySelector(
      "#culture-list .card-grid"
    );

  const populateCultureCards = () => {
    if (typeof cultureData !== "undefined") {
      const cardsHTML = cultureData 
        .map(
          (culture) => `
            <a href="detail.html?id=${culture.id}" class="card-link">
              <div class="card" data-id="${culture.id}">
                  <img src="${culture.imgSrc}" alt="${culture.imgAlt}">
                  <div class="card-content">
                      <div class="card-title">
                          <h3 class="font-serif">${culture.title}</h3>
                          <span class="favorite-btn" data-id="${culture.id}">&#9733;</span>
                      </div>
                      <p>${culture.description}</p>
                  </div>
              </div>
            </a>
          `
        )
        .join("");
      cultureListContainer.innerHTML = cardsHTML;
      updateAllFavoriteIcons();
    }
  };

    // Fungsi renderCultureListOrder telah dihapus seluruhnya

    const updateAllFavoriteIcons = () => {
      cultureListContainer.querySelectorAll(".favorite-btn").forEach((icon) => {
        icon.classList.toggle("favorited", favorites.includes(icon.dataset.id));
      });
    };

    cultureListContainer.addEventListener("click", function (e) {
      if (e.target.matches(".favorite-btn")) {
        toggleFavorite(e.target.dataset.id);
        e.target.classList.toggle("favorited");
        // Fungsi pengurutan (renderCultureListOrder) telah dihapus dari sini
      }
    });

    searchBar.addEventListener("keyup", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Perulangan sekarang pada semua kartu, bukan hanya yang ditampilkan
    cultureListContainer.querySelectorAll(".card-link").forEach((cardLink) => {
        const card = cardLink.querySelector('.card');
        const title = card.querySelector("h3").textContent.toLowerCase();
        // Tampilkan/sembunyikan elemen <a> pembungkusnya
        cardLink.style.display = title.includes(searchTerm) ? "" : "none";
    });
  });

    populateCultureCards();
  }

  // === Logika Halaman Favorites ===
  if (document.getElementById("favorites")) {
    const favoriteListContainer = document.getElementById("favorite-list");

    const renderFavorites = () => {
      favoriteListContainer.innerHTML = "";
      const favoriteCultureData = cultureData.filter((culture) =>
        favorites.includes(culture.id)
      );

      if (favoriteCultureData.length === 0) {
        favoriteListContainer.innerHTML =
          '<p class="no-favorites-message">Anda belum menambahkan budaya favorit.</p>';
        return;
      }

      const cardsHTML = favoriteCultureData
        .map(
          (culture) => `
                <div class="card" data-id="${culture.id}">
                    <img src="${culture.imgSrc}" alt="${culture.imgAlt}">
                    <div class="card-content">
                        <div class="card-title">
                            <h3 class="font-serif">${culture.title}</h3>
                            <span class="favorite-btn favorited" data-id="${culture.id}">&#9733;</span>
                        </div>
                        <p>${culture.description}</p>
                    </div>
                </div>
            `
        )
        .join("");
      favoriteListContainer.innerHTML = cardsHTML;
    };

    favoriteListContainer.addEventListener("click", function (e) {
      if (e.target.matches(".favorite-btn")) {
        toggleFavorite(e.target.dataset.id);
        renderFavorites();
      }
    });

    renderFavorites();
  }

  if (document.getElementById("detail-content-container")) {
    const detailContainer = document.getElementById("detail-content-container");

    const renderDetail = () => {
        // Ambil ID dari URL (contoh: detail.html?id=kudus)
        const params = new URLSearchParams(window.location.search);
        const cultureId = params.get('id');

        if (!cultureId) {
            detailContainer.innerHTML = "<p>Budaya tidak ditemukan.</p>";
            return;
        }
        
        // Cari data budaya yang sesuai di cultureData
        const culture = cultureData.find(item => item.id === cultureId);

        if (!culture) {
            detailContainer.innerHTML = "<p>Detail untuk budaya ini tidak ditemukan.</p>";
            return;
        }

        // Buat HTML untuk halaman detail
        document.title = `${culture.title} - Alculturnation`; // Update judul tab browser
        const detailHTML = `
            <div class="detail-page">
                <img src="${culture.imgSrc}" alt="${culture.imgAlt}" class="detail-image">
                <h2 class="font-serif">${culture.title}</h2>
                <div class="detail-content">
                    <div>
                        <h3>Sejarah</h3>
                        <p>${culture.details.sejarah}</p>
                    </div>
                    <div>
                        <h3>Budaya yang Bergabung</h3>
                        <p>${culture.details.budayaBergabung}</p>
                    </div>
                    <div>
                        <h3>Jejak Budaya dalam Hasil Campurannya</h3>
                        <p>${culture.details.jejakBudaya}</p>
                    </div>
                    <div>
                        <h3>Budaya yang Dihasilkan</h3>
                        <p>${culture.details.hasil}</p>
                    </div>
                    <div>
                        <h3>Lokasi</h3>
                        <p>${culture.details.lokasi}</p>
                    </div>
                </div>
            </div>
        `;
        detailContainer.innerHTML = detailHTML;
    };

    renderDetail();
  }
});