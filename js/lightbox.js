// OFFGRID — PINTEREST-STYLE LIGHTBOX

// Create the HTML for the lightbox and append it to the body
document.addEventListener('DOMContentLoaded', () => {
    const lightboxHTML = `
        <div class="lightbox-overlay" id="pinterest-lightbox">
            <div class="lightbox-top-bar">
                <button class="lightbox-close-btn" onclick="closePinterestLightbox()">&times;</button>
            </div>
            
            <div class="lightbox-main">
                <div class="lightbox-arrow arrow-left" onclick="navigateLightbox(-1)">&#8592;</div>
                <img id="lightbox-main-img" src="" alt="Enlarged view">
                <div class="lightbox-arrow arrow-right" onclick="navigateLightbox(1)">&#8594;</div>
            </div>

            <div class="lightbox-related">
                <h3>MORE LIKE THIS</h3>
                <div class="related-grid" id="lightbox-related-grid">
                    <!-- Related images will be injected here -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
});

let currentImages = []; // Store the images currently in the lightbox
let currentIndex = 0;

// Main function to open the lightbox (called from lookbook.js)
async function openPinterestLightbox(imageUrl, query) {
    const lightbox = document.getElementById('pinterest-lightbox');
    const mainImg = document.getElementById('lightbox-main-img');
    const relatedGrid = document.getElementById('lightbox-related-grid');

    // Set the main image
    mainImg.src = imageUrl;
    
    // Show the overlay
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Fetch related images from Unsplash
    relatedGrid.innerHTML = `<p style="color:white; text-align:center; width:100%; grid-column: 1/-1;">Loading related inspiration...</p>`;
    
    try {
        // Fetch 8 related images based on the query
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8`;
        const response = await fetch(url, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Map the images and store them in the global array for navigation
            currentImages = data.results.map(photo => photo.urls.regular);
            
            // Find the index of the clicked image (or default to 0)
            const clickedIndex = currentImages.findIndex(url => url === imageUrl);
            currentIndex = clickedIndex !== -1 ? clickedIndex : 0;

            // Render the related grid
            relatedGrid.innerHTML = data.results.map((photo, index) => `
                <img src="${photo.urls.small}" alt="Related look" onclick="setLightboxImage(${index})">
            `).join('');

        } else {
            relatedGrid.innerHTML = `<p style="color:white; text-align:center; width:100%; grid-column: 1/-1;">No related images found.</p>`;
        }
    } catch (err) {
        console.error("Error loading related images:", err);
        relatedGrid.innerHTML = `<p style="color:white; text-align:center; width:100%; grid-column: 1/-1;">Could not load related images.</p>`;
    }
}

// Change image when clicking a related thumbnail
function setLightboxImage(index) {
    if (!currentImages[index]) return;
    currentIndex = index;
    document.getElementById('lightbox-main-img').src = currentImages[index];
}

// Navigate left/right with arrows
function navigateLightbox(direction) {
    if (currentImages.length === 0) return;
    
    currentIndex += direction;
    
    // Loop around if at the end
    if (currentIndex >= currentImages.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    
    document.getElementById('lightbox-main-img').src = currentImages[currentIndex];
}

// Close the lightbox
function closePinterestLightbox() {
    const lightbox = document.getElementById('pinterest-lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Allow closing with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePinterestLightbox();
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
});