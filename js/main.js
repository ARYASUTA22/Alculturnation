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
                `
          )
          .join("");
        cultureListContainer.innerHTML = cardsHTML;
        updateAllFavoriteIcons();
        renderCultureListOrder();
      }
    };

    const renderCultureListOrder = () => {
      const fragment = document.createDocumentFragment();
      const allCards = Array.from(
        cultureListContainer.querySelectorAll(".card")
      );
      allCards.sort(
        (a, b) =>
          favorites.includes(b.dataset.id) - favorites.includes(a.dataset.id)
      );
      allCards.forEach((card) => fragment.appendChild(card));
      cultureListContainer.innerHTML = "";
      cultureListContainer.appendChild(fragment);
    };

    const updateAllFavoriteIcons = () => {
      cultureListContainer.querySelectorAll(".favorite-btn").forEach((icon) => {
        icon.classList.toggle("favorited", favorites.includes(icon.dataset.id));
      });
    };

    cultureListContainer.addEventListener("click", function (e) {
      if (e.target.matches(".favorite-btn")) {
        toggleFavorite(e.target.dataset.id);
        e.target.classList.toggle("favorited");
        renderCultureListOrder();
      }
    });

    searchBar.addEventListener("keyup", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      cultureListContainer.querySelectorAll(".card").forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = title.includes(searchTerm) ? "" : "none";
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
        renderFavorites(); // Re-render halaman favorit setelah menghapus item
      }
    });

    renderFavorites();
  }
});
