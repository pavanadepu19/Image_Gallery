const images = [
  { id: 1, title: "Charminar", category: "camera", url: "images/camera1.jpg" },
  { id: 2, title: "", category: "screenshots", url: "images/screenshot1.png" },
  { id: 3, title: "", category: "downloads", url: "images/downloads1.jpg" },
  {
    id: 4,
    title: "Into the Wild",
    category: "others",
    url: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=900&q=85",
  },
  { id: 5, title: "", category: "downloads", url: "images/download2.png" },
  { id: 6, title: "Taj Mahal", category: "camera", url: "images/camera2.jfif" },
  { id: 7, title: "", category: "screenshots", url: "images/screenshot2.png" },
  {
    id: 8,
    title: "Beach",
    category: "camera",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85",
  },
  { id: 9, title: "Tirupati", category: "camera", url: "images/camera3.jfif" },
  { id: 10, title: "", category: "downloads", url: "images/download3.jpg" },
  {
    id: 11,
    title: "",
    category: "others",
    url: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=900&q=85",
  },
  {
    id: 12,
    title: "Kailash Mountain",
    category: "camera",
    url: "images/camera4.jpg",
  },
  {
    id: 14,
    title: "Aerial Journey",
    category: "downloads",
    url: "images/download4.jfif",
  },
  {
    id: 15,
    title: "Forest Wildlife",
    category: "others",
    url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=85",
  },
];
// 2. GET HTML ELEMENTS
const galleryGrid = document.getElementById("galleryGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const imageCounter = document.getElementById("imageCounter");
const closeButton = document.getElementById("closeLightbox");
const nextButton = document.getElementById("nextImage");
const previousButton = document.getElementById("prevImage");
const showFavoritesButton = document.getElementById("showFavorites");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");
// 3. APPLICATION STATE
let currentCategory = "all";
let searchTerm = "";
let favoritesOnly = false;
let currentIndex = 0;
let favorites = [];
// LOAD FAVORITES
try {
  const savedFavorites = JSON.parse(
    localStorage.getItem("frameFavorites") || "[]",
  );
  if (Array.isArray(savedFavorites)) {
    favorites = savedFavorites.filter((id) =>
      images.some((image) => image.id === id),
    );
  }
} catch (error) {
  console.warn("Could not load favorites:", error);
  favorites = [];
}
// 4. CHECK HTML ELEMENTS
if (
  !galleryGrid ||
  !searchInput ||
  !lightbox ||
  !lightboxImage ||
  !closeButton ||
  !nextButton ||
  !previousButton ||
  !emptyMessage ||
  !showFavoritesButton ||
  !menuToggle ||
  !navLinks
) {
  console.error(
    "FRAME: Required HTML elements are missing. Check index.html IDs.",
  );
} else {
  // 5. GET FILTERED IMAGES
  function getVisibleImages() {
    return images.filter((image) => {
      const matchesCategory =
        currentCategory === "all" || image.category === currentCategory;
      const matchesSearch = image.category.toLowerCase().includes(searchTerm);
      const matchesFavorite = !favoritesOnly || favorites.includes(image.id);
      return matchesCategory && matchesSearch && matchesFavorite;
    });
  }
  // 6. SAVE FAVORITES
  function saveFavorites() {
    try {
      localStorage.setItem("frameFavorites", JSON.stringify(favorites));
    } catch (error) {
      console.warn("Could not save favorites:", error);
    }
  }
  // 7. RENDER GALLERY
  function renderGallery() {
    const visibleImages = getVisibleImages();
    galleryGrid.replaceChildren();
    emptyMessage.hidden = visibleImages.length > 0;
    visibleImages.forEach((image, index) => {
      const card = document.createElement("article");
      card.className = "gallery-card";
      card.style.animationDelay = `${index * 40}ms`;
      // IMAGE
      const img = document.createElement("img");
      img.src = image.url;
      img.alt = "Gallery image";
      img.loading = "lazy";
      img.addEventListener(
        "error",
        () => {
          img.alt = "Image unavailable";
          img.classList.add("image-error");
        },
        { once: true },
      );
      // FAVORITE BUTTON
      const favoriteButton = document.createElement("button");
      const isFavorite = favorites.includes(image.id);
      favoriteButton.className =
        "card-favorite" + (isFavorite ? " is-favorite" : "");
      favoriteButton.textContent = isFavorite ? "♥" : "♡";
      favoriteButton.setAttribute(
        "aria-label",
        isFavorite ? "Remove favorite" : "Add favorite",
      );
      favoriteButton.type = "button";
      favoriteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleFavorite(image.id);
      });
      // OPEN IMAGE
      card.addEventListener("click", () => {
        openLightbox(image.id);
      });
      card.append(img, favoriteButton);
      galleryGrid.appendChild(card);
    });
  }
  // 8. CATEGORY FILTERS
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.category || "all";
      favoritesOnly = false;
      showFavoritesButton.classList.remove("active");
      filterButtons.forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });
      closeLightbox();
      renderGallery();
    });
  });
  // 9. SEARCH
  searchInput.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    currentCategory = "all";
    favoritesOnly = false;
    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.category === "all");
    });
    showFavoritesButton.classList.remove("active");
    closeLightbox();
    renderGallery();
  });
  // 10. TOGGLE FAVORITES
  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter((item) => item !== id);
    } else {
      favorites.push(id);
    }
    saveFavorites();
    renderGallery();
    if (lightbox.classList.contains("open")) {
      const visibleImages = getVisibleImages();
      if (visibleImages.length === 0) {
        closeLightbox();
      } else {
        currentIndex = Math.min(currentIndex, visibleImages.length - 1);
        updateLightbox();
      }
    }
  }
  // 11. SHOW FAVORITES
  showFavoritesButton.addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    currentCategory = "all";
    showFavoritesButton.classList.toggle("active", favoritesOnly);
    filterButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.category === "all" && !favoritesOnly,
      );
    });
    closeLightbox();
    renderGallery();
    document.getElementById("gallery").scrollIntoView({ behavior: "smooth" });
  });
  // 12. OPEN LIGHTBOX
  function openLightbox(id) {
    const visibleImages = getVisibleImages();
    currentIndex = visibleImages.findIndex((image) => image.id === id);
    if (currentIndex < 0) return;
    updateLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }
  // 13. UPDATE LIGHTBOX
  function updateLightbox() {
    const visibleImages = getVisibleImages();
    if (visibleImages.length === 0) {
      closeLightbox();
      return;
    }
    if (currentIndex >= visibleImages.length) {
      currentIndex = 0;
    }
    if (currentIndex < 0) {
      currentIndex = visibleImages.length - 1;
    }
    const image = visibleImages[currentIndex];
    lightboxImage.src = image.url;
    lightboxImage.alt = "Gallery image";
    imageCounter.textContent = `${currentIndex + 1} / ${visibleImages.length}`;
  }
  // 14. NEXT IMAGE
  function nextImage() {
    const visibleImages = getVisibleImages();
    if (visibleImages.length === 0) return;
    currentIndex = (currentIndex + 1) % visibleImages.length;
    updateLightbox();
  }
  // 15. PREVIOUS IMAGE
  function prevImage() {
    const visibleImages = getVisibleImages();
    if (visibleImages.length === 0) return;
    currentIndex =
      (currentIndex - 1 + visibleImages.length) % visibleImages.length;
    updateLightbox();
  }
  // 16. CLOSE LIGHTBOX
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    document.body.style.overflow = "";
  }
  // 17. BUTTON EVENTS
  closeButton.addEventListener("click", closeLightbox);
  nextButton.addEventListener("click", nextImage);
  previousButton.addEventListener("click", prevImage);
  // 18. CLICK OUTSIDE TO CLOSE
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  // 19. KEYBOARD NAVIGATION
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") {
      closeLightbox();
    }
    if (event.key === "ArrowRight") {
      nextImage();
    }
    if (event.key === "ArrowLeft") {
      prevImage();
    }
  });
  // 20. MOBILE MENU
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("show");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
  // 21. RESET GALLERY WHEN LOGO OR NAVIGATION LINKS ARE CLICKED
  function resetGalleryToAll() {
    currentCategory = "all";
    searchTerm = "";
    favoritesOnly = false;
    searchInput.value = "";
    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.category === "all");
    });
    showFavoritesButton.classList.remove("active");
    closeLightbox();
    renderGallery();
  }
  document
    .querySelectorAll(".brand, .nav-links a, .footer-links a, .hero-button")
    .forEach((link) => {
      link.addEventListener("click", resetGalleryToAll);
    });
  // 22. INITIALIZE WEBSITE
  renderGallery();
  console.log("FRAME Photography Gallery initialized successfully.");
}
