// OFFGRID — Unsplash API Module

const UNSPLASH_ACCESS_KEY = "LFKp5fAGP90Nsx0Hf0MDhw0D2cmRw6FQPBPPAPoXdbc";

async function fetchImages(query, count = 8) {
    console.log("OFFGRID: Requesting Unsplash images...");

    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Unsplash API response:", errorData);
            throw new Error(`Unsplash returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("No images found.");
        }

        return data.results.map(photo => ({
            image_url: photo.urls.regular,
            author: photo.user.name,
            photographer_url: photo.user.links.html + "?utm_source=offgrid&utm_medium=referral",
            unsplash_url: "https://unsplash.com/?utm_source=offgrid&utm_medium=referral",
            alt_description: photo.alt_description || "Fashion photography",
            id: photo.id
        }));

    } catch (error) {
        console.error("OFFGRID IMAGE ERROR:", error);
        throw error;
    }
}

function renderSkeletons(container, count = 8) {
  container.innerHTML = Array.from({ length: count }).map(() => '<div class="skeleton" aria-hidden="true"></div>').join('');
}

function renderError(container, message, onRetry) {
  container.innerHTML = `
    <div class="state-panel">
      <p>${message}</p>
      <button class="btn" id="retry-btn">Retry</button>
    </div>`;
  container.querySelector('#retry-btn').addEventListener('click', onRetry);
}

function renderEmpty(container, message, onReset) {
  container.innerHTML = `
    <div class="state-panel">
      <p>${message}</p>
      <button class="btn" id="reset-btn">Reset</button>
    </div>`;
  container.querySelector('#reset-btn').addEventListener('click', onReset);
}