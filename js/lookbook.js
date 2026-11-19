// OFFGRID — LOOKBOOK JAVASCRIPT (With Load More)

const lookbookGrid = document.getElementById('lookbook-grid');
let currentPage = 1;
let isLoading = false;

// Create the "Load More" button
const loadMoreBtn = document.createElement('button');
loadMoreBtn.className = 'btn';
loadMoreBtn.textContent = 'LOAD MORE INSPIRATION';
loadMoreBtn.style.margin = '40px auto';
loadMoreBtn.style.display = 'block';
loadMoreBtn.style.gridColumn = '1 / -1'; // Ensure it spans full width if inside a grid

async function loadLookbook(page = 1) {
    if (!lookbookGrid || isLoading) return;
    
    isLoading = true;
    if (page === 1) renderSkeletons(lookbookGrid, 9);
    
    try {
        // Fetch images using the Unsplash API page parameter
        const url = `https://api.unsplash.com/search/photos?query=streetwear%20fashion%20editorial&per_page=15&page=${page}&orientation=portrait`;
        const response = await fetch(url, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            if (page === 1) lookbookGrid.innerHTML = ''; // Clear skeletons
            
            const photos = data.results.map(photo => ({
                image_url: photo.urls.regular,
                id: photo.id
            }));

            // Render the new images
            photos.forEach(photo => {
                const card = document.createElement('article');
                card.className = 'trend-card';
                card.style.cursor = 'zoom-in';
                card.innerHTML = `
                    <div class="trend-image">
                        <img src="${photo.image_url}" alt="Curated fashion look" loading="lazy" onclick="openPinterestLightbox('${photo.image_url}', 'streetwear fashion editorial')">
                    </div>
                `;
                lookbookGrid.appendChild(card);
            });

            // Add the Load More button if it's not already in the DOM
            if (!document.getElementById('load-more-container')) {
                const btnContainer = document.createElement('div');
                btnContainer.id = 'load-more-container';
                btnContainer.style.columnSpan = 'all'; // For CSS columns
                btnContainer.style.textAlign = 'center';
                btnContainer.style.marginTop = '30px';
                btnContainer.appendChild(loadMoreBtn);
                lookbookGrid.appendChild(btnContainer);
            }
            
            currentPage++;
        } else {
            loadMoreBtn.textContent = 'NO MORE IMAGES';
            loadMoreBtn.disabled = true;
        }

    } catch (err) {
        console.error("Lookbook error:", err);
        if (page === 1) renderError(lookbookGrid, "Can't load lookbook.", () => loadLookbook(1));
    } finally {
        isLoading = false;
    }
}

// Load More Click Event
loadMoreBtn.addEventListener('click', () => {
    loadLookbook(currentPage);
});

// Mobile Nav Toggle
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
    loadLookbook(1);
});