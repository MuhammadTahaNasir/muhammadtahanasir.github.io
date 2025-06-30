// Loader and resource loading
const loader = document.getElementById('loader');
const resourcesGrid = document.getElementById('resourcesGrid');

async function loadResources() {
    loader.classList.add('active');
    try {
        const res = await fetch("data/resources.json");
        if (!res.ok) throw new Error("Failed to load resources");
        const resources = await res.json();
        resourcesGrid.innerHTML = ""; // Clear loading message
        resources.forEach((r) => {
            const card = document.createElement("div");
            card.className = "resource-card";
            card.innerHTML = `
            <i class="${r.thumbnail} card-thumb"></i>
            <h3 class="card-title">${r.title}</h3>
            <p class="card-desc">${r.description || r.desc || 'No description available'}</p>
            <a href="${r.link}" class="card-btn" ${r.type === "Link" ? 'target="_blank"' : ''}>View</a>
          `;
            resourcesGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading resources:", error);
        resourcesGrid.innerHTML = "<p>Error loading resources. Please try again later.</p>";
    } finally {
        setTimeout(() => {
            loader.classList.add('no-blur');
        }, 900);
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.classList.remove('active');
        }, 1200);
    }
}

// Theme toggle functionality
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("pref-theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Load saved theme preference or detect system preference
const savedTheme = localStorage.getItem("pref-theme");
if (savedTheme) {
    document.body.classList.toggle("dark", savedTheme === "dark");
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add("dark");
}

// Scroll to top functionality
window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display = window.scrollY > 200 ? "flex" : "none";
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Load resources on page load
window.addEventListener("DOMContentLoaded", loadResources);