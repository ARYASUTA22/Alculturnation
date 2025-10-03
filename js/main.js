document.addEventListener("DOMContentLoaded", function () {
  // === Elemen & State Umum ===
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const backToTopButton = document.getElementById("back-to-top-btn");
  const header = document.querySelector(".header");
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // === Logika Umum (berjalan di semua halaman) ===

  // Sticky Navbar Logic
  if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
  }
  
  // Toggle menu mobile
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () =>
      mobileMenu.classList.toggle("active")
    );
  }

  // Tombol Back to Top
  if (backToTopButton) {
    window.addEventListener("scroll", function () {
      if (
        document.body.scrollTop > 200 ||
        document.documentElement.scrollTop > 200
      ) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    });
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
            <a href="detail.html?id=${culture.id}" class="card-link fade-up">
              <div class="card" data-id="${culture.id}">
                  <img src="${culture.imgSrc}" alt="${culture.imgAlt}" class="image-reveal">
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

    const updateAllFavoriteIcons = () => {
      cultureListContainer.querySelectorAll(".favorite-btn").forEach((icon) => {
        icon.classList.toggle("favorited", favorites.includes(icon.dataset.id));
      });
    };

    cultureListContainer.addEventListener("click", function (e) {
      if (e.target.matches(".favorite-btn")) {
        e.preventDefault(); 
        toggleFavorite(e.target.dataset.id);
        e.target.classList.toggle("favorited");
      }
    });

    searchBar.addEventListener("keyup", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      cultureListContainer.querySelectorAll(".card-link").forEach((cardLink) => {
          const card = cardLink.querySelector('.card');
          const title = card.querySelector("h3").textContent.toLowerCase();
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
                <a href="detail.html?id=${culture.id}" class="card-link fade-up">
                  <div class="card" data-id="${culture.id}">
                      <img src="${culture.imgSrc}" alt="${culture.imgAlt}" class="image-reveal">
                      <div class="card-content">
                          <div class="card-title">
                              <h3 class="font-serif">${culture.title}</h3>
                              <span class="favorite-btn favorited" data-id="${culture.id}">&#9733;</span>
                          </div>
                          <p>${culture.description}</p>
                      </div>
                  </div>
                </a>
            `
        )
        .join("");
      favoriteListContainer.innerHTML = cardsHTML;
    };

    favoriteListContainer.addEventListener("click", function (e) {
      if (e.target.matches(".favorite-btn")) {
        e.preventDefault();
        toggleFavorite(e.target.dataset.id);
        renderFavorites();
      }
    });

    renderFavorites();
  }

  // === Logika Halaman Detail ===
  if (document.getElementById("detail-content-container")) {
    const detailContainer = document.getElementById("detail-content-container");

    const renderDetail = () => {
        const params = new URLSearchParams(window.location.search);
        const cultureId = params.get('id');
        if (!cultureId) {
            detailContainer.innerHTML = "<p>Budaya tidak ditemukan.</p>";
            return;
        }
        
        const culture = cultureData.find(item => item.id === cultureId);
        if (!culture) {
            detailContainer.innerHTML = "<p>Detail untuk budaya ini tidak ditemukan.</p>";
            return;
        }

        document.title = `${culture.title} - Alculturnation`;
        const detailHTML = `
            <div class="detail-page">
                <img src="${culture.imgSrc}" alt="${culture.imgAlt}" class="detail-image image-reveal">
                <div class="fade-up">
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
            </div>
        `;
        detailContainer.innerHTML = detailHTML;
    };

    renderDetail();
  }

// === Logika Halaman Kontak ===
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const successMessage = document.getElementById('success-message');
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Mengambil data dari form
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      // Membuat konten untuk file teks
      const textContent = `Nama: ${name}\nEmail: ${email}\nPesan:\n${message}`;

      // Membuat Blob (objek file)
      const blob = new Blob([textContent], { type: 'text/plain' });

      // Membuat link untuk mengunduh file
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'form-response.txt'; // Nama file yang akan diunduh

      // Menambahkan link ke body, mengkliknya, lalu menghapusnya
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Tampilkan pesan sukses
      successMessage.style.display = 'block';

      // Kosongkan form
      contactForm.reset();

      // Sembunyikan pesan setelah beberapa detik
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 5000);
    });
  }

});
