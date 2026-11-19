// OFFGRID — TRENDS JAVASCRIPT
const trendsGrid = document.getElementById('trends-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const searchMap = {
    'streetwear': 'baggy jeans streetwear outfit',
    'sneakers': 'chunky sneakers fashion',
    'denim': 'denim on denim outfit',
    'outerwear': 'leather jacket streetwear'
};

function renderTrendCards(container, data, displayTitle) {
    container.innerHTML = data.map((item, i) => `
    <article class="trend-card">
        <div class="trend-image">
            <img src="${item.image_url}" alt="Trend Look" loading="lazy">
            <button class="save-btn" aria-label="Save this trend">♡</button>
        </div>
        <div class="trend-info">
            <div>
                <h3>${displayTitle}</h3>
                <p style="display:flex; align-items:center; gap:4px;">
                    <span style="color: var(--lime); font-weight:bold; font-size:16px;">↑</span> 
                    +${item.growth}% this month
                </p>
                <small style="display:block; margin-top:8px; font-size:9px; color:#73736E;">
                    PHOTO BY <a href="${item.photographer_url}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">${item.author}</a> / <a href="${item.unsplash_url}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">UNSPLASH</a>
                </small>
            </div>
            <i data-lucide="arrow-up-right"></i>
        </div>
    </article>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
    
    container.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('is-saved');
            btn.textContent = btn.classList.contains('is-saved') ? '♥' : '♡';
        });
    });
}

async function fetchTrendData(searchQuery) {
    const photos = await fetchImages(searchQuery, 8);
    return photos.map((photo, index) => ({
        ...photo,
        growth: [40, 32, 28, 24, 18, 15, 12, 8][index] || 10
    }));
}

async function performSearch(query, displayTitle) {
    try {
        const newData = await fetchTrendData(query);
        const oldCards = trendsGrid.querySelectorAll('.trend-card');
        
        if (oldCards.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            renderTrendCards(trendsGrid, newData, displayTitle || query);
            return;
        }

        const state = Flip.getState(oldCards);
        renderTrendCards(trendsGrid, newData, displayTitle || query);

        Flip.from(state, {
            duration: 0.5, ease: "power2.inOut", absolute: true, stagger: 0.05,
            onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 }),
            onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.3 })
        });
    } catch (err) {
        renderError(trendsGrid, "Can't load trends.", () => performSearch(query, displayTitle));
    }
}

async function initialLoad() {
    if (!trendsGrid) return;
    renderSkeletons(trendsGrid, 8);
    performSearch('baggy jeans streetwear outfit', 'STREETWEAR');
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const filterName = e.target.dataset.filter;
        if (searchInput) searchInput.value = ''; 
        filterBtns.forEach(b => b.classList.remove('is-active'));
        e.target.classList.add('is-active');
        const specificQuery = searchMap[filterName] || filterName;
        performSearch(specificQuery, filterName.toUpperCase());
    });
});

searchBtn?.addEventListener('click', () => {
    const rawQuery = searchInput.value.trim();
    if (rawQuery) performSearch(rawQuery, rawQuery.toUpperCase());
});
searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const rawQuery = searchInput.value.trim();
        if (rawQuery) performSearch(rawQuery, rawQuery.toUpperCase());
    }
});

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
        if (window.lucide) lucide.createIcons();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    initialLoad();
});