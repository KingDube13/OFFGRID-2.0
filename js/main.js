// =============================================
// OFFGRID — MAIN JAVASCRIPT (HOME PAGE)
// =============================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
        if (window.lucide) lucide.createIcons();
    });
}

const trendingGrid = document.getElementById("trending-grid");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const titles = ["STREET CULTURE", "QUIET STATEMENT", "NEW UNIFORM"];
const descs = ["Everyday expression, redefined.", "Less noise. More intention.", "Classic silhouettes, new energy."];

function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, char => {
        const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
        return entities[char];
    });
}

function renderTrendCards(container, photos, searchQuery = "streetwear") {
    if (!container) return;

    if (!photos || photos.length === 0) {
        renderEmpty(container, "NO IMAGES FOUND. TRY ANOTHER STYLE.", loadTrending);
        return;
    }

    container.innerHTML = photos.map((photo, i) => {
        const title = searchQuery.toLowerCase() === "streetwear" ? titles[i % 3] : searchQuery.toUpperCase();
        const desc = searchQuery.toLowerCase() === "streetwear" ? descs[i % 3] : "Explore this aesthetic.";
        const imageURL = escapeHTML(photo.image_url);
        const imageAlt = escapeHTML(photo.alt_description || title);
        const author = escapeHTML(photo.author || "Unsplash");
        const photographerURL = escapeHTML(photo.photographer_url || "#");
        const unsplashURL = escapeHTML(photo.unsplash_url || "https://unsplash.com");

        // We use the same masonry card structure here
        return `
            <article class="trend-card">
                <a href="trends.html" class="trend-image">
                    <img src="${imageURL}" alt="${imageAlt}" loading="lazy" onerror="this.onerror=null;this.closest('.trend-image').classList.add('image-unavailable');">
                    <span class="trend-number">0${(i % 3) + 1}</span>
                </a>
                <div class="trend-info">
                    <div>
                        <h3>${escapeHTML(title)}</h3>
                        <p>${escapeHTML(desc)}</p>
                        <small style="display:block; margin-top:8px; font-size:9px; color:#73736E;">
                            PHOTO BY <a href="${photographerURL}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">${author}</a> / <a href="${unsplashURL}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">UNSPLASH</a>
                        </small>
                    </div>
                    <a href="trends.html" aria-label="Explore trend"><i data-lucide="arrow-up-right"></i></a>
                </div>
            </article>
        `;
    }).join("");

    if (window.lucide) lucide.createIcons();
}


async function loadHero() {
    const img = document.getElementById("hero-image");
    if (!img) return;

    try {
        const photos = await fetchImages("editorial streetwear fashion", 1);
        if (photos.length > 0 && photos[0].image_url) {
            img.src = photos[0].image_url;
            img.alt = photos[0].alt_description || "OFFGRID editorial fashion photography";
            img.onerror = () => { img.onerror = null; img.src = "assets/images/img1.jpg"; };
        }
    } catch (error) {
        console.error("Hero image error:", error);
        img.src = "assets/images/img1.jpg";
    }
}

async function loadTrending() {
    if (!trendingGrid) return;
    renderSkeletons(trendingGrid, 3);
    try {
        const photos = await fetchImages("baggy jeans streetwear outfit", 3);
        renderTrendCards(trendingGrid, photos, "streetwear");
    } catch (error) {
        console.error("Trending error:", error);
        renderError(trendingGrid, "CAN'T LOAD TRENDS. CHECK YOUR CONNECTION.", loadTrending);
    }
}

let searchRequest = 0;

async function performHomeSearch(query) {
    if (!trendingGrid || !query.trim()) return;
    const currentRequest = ++searchRequest;
    const oldCards = Array.from(trendingGrid.querySelectorAll(".trend-card"));
    const canAnimate = oldCards.length > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.Flip && window.gsap;
    const previousState = canAnimate ? Flip.getState(oldCards) : null;

    renderSkeletons(trendingGrid, 3);

    try {
        const photos = await fetchImages(query, 3);
        if (currentRequest !== searchRequest) return;
        renderTrendCards(trendingGrid, photos, query);

        if (previousState && window.Flip) {
            Flip.from(previousState, {
                duration: 0.5, ease: "power2.inOut", absolute: true, stagger: 0.05,
                onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 })
            });
        }
    } catch (error) {
        if (currentRequest !== searchRequest) return;
        renderError(trendingGrid, "CAN'T LOAD SEARCH RESULTS.", () => performHomeSearch(query));
    }
}

function handleSearch() {
    const query = searchInput?.value.trim();
    if (query) performHomeSearch(query);
}

searchBtn?.addEventListener("click", handleSearch);
searchInput?.addEventListener("keydown", event => { if (event.key === "Enter") handleSearch(); });

// STYLE FINDER
let currentStyleQuery = "streetwear";
let styleRequestNumber = 0;

async function loadStyleImages(query) {
    const resultsGrid = document.getElementById("style-results");
    const resultsTitle = document.getElementById("style-results-title");
    const refreshButton = document.getElementById("style-refresh");
    if (!resultsGrid) return;

    const requestNumber = ++styleRequestNumber;
    currentStyleQuery = query;
    if (resultsTitle) resultsTitle.textContent = query.toUpperCase() + " INSPIRATION";
    
    resultsGrid.innerHTML = `<div class="style-empty style-loading">DISCOVERING YOUR STYLE...</div>`;
    if (refreshButton) { refreshButton.disabled = true; refreshButton.textContent = "LOADING..."; }

    try {
        const photos = await fetchImages(query, 6);
        if (requestNumber !== styleRequestNumber) return;
        if (!photos || photos.length === 0) throw new Error("No fashion images found.");

        resultsGrid.innerHTML = "";
        photos.forEach(photo => {
            if (!photo.image_url) return;
            const card = document.createElement("article");
            card.className = "style-result-card";
            const img = document.createElement("img");
            img.src = photo.image_url;
            img.alt = photo.alt_description || query + " fashion inspiration";
            img.loading = "lazy";
            img.onerror = () => card.remove();
            card.appendChild(img);
            resultsGrid.appendChild(card);
        });

        if (!resultsGrid.children.length) resultsGrid.innerHTML = `<div class="style-empty">NO IMAGES COULD BE DISPLAYED. TRY AGAIN.</div>`;
    } catch (error) {
        if (requestNumber !== styleRequestNumber) return;
        resultsGrid.innerHTML = `<div class="style-empty">UNABLE TO LOAD THIS STYLE. PLEASE TRY AGAIN.</div>`;
    } finally {
        if (requestNumber === styleRequestNumber && refreshButton) {
            refreshButton.disabled = false;
            refreshButton.innerHTML = 'EXPLORE MORE <i data-lucide="arrow-up-right"></i>';
            if (window.lucide) lucide.createIcons();
        }
    }
}

function initStyleFinder() {
    const styleOptions = document.getElementById("style-options");
    const refreshButton = document.getElementById("style-refresh");
    if (!styleOptions) return;

    styleOptions.addEventListener("click", event => {
        const button = event.target.closest(".style-option");
        if (!button) return;
        const query = button.dataset.style;
        if (!query) return;
        styleOptions.querySelectorAll(".style-option").forEach(opt => { opt.classList.remove("active"); opt.setAttribute("aria-pressed", "false"); });
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        loadStyleImages(query);
    });

    refreshButton?.addEventListener("click", () => loadStyleImages(currentStyleQuery));
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) lucide.createIcons();
    loadHero();
    loadTrending();
    initStyleFinder();
});