// ---------- 1. Tag Management and Loading ----------
let tagList = []; // Stores the list of tags with their counts
let posts = []; // Stores the fetched posts data
const loader = document.getElementById('loader'); // Reference to the loader element for displaying loading state

// Asynchronously fetches and processes tags from a JSON file
async function loadTags() {
    loader.classList.add('active'); // Show loader with active state
    try {
        const res = await fetch("../posts/posts.json"); // Fetch posts data from JSON file
        if (!res.ok) throw new Error('File not found'); // Handle fetch errors
        posts = await res.json(); // Parse JSON response into posts array
        const tagMap = new Map(); // Create a Map to count tag occurrences
        posts.forEach(p => {
            p.tags.forEach(tag => {
                tagMap.set(tag, (tagMap.get(tag) || 0) + 1); // Increment tag count
            });
        });
        tagList = [...tagMap.entries()].sort((a, b) => a[0].localeCompare(b[0])); // Convert Map to sorted array of [tag, count]
        renderTags(tagList); // Render the sorted tags
    } catch (error) {
        console.error('Fetch error:', error); // Log any fetch-related errors
        document.getElementById('tagsGrid').innerHTML = `<p class="no-results">😕 Failed to load tags. Check the console for details.</p>`; // Display error message
    } finally {
        setTimeout(() => {
            loader.classList.add('no-blur'); // Add no-blur class to loader after 600ms
        }, 600);
        setTimeout(() => {
            loader.classList.add('hidden'); // Hide loader
            loader.classList.remove('active'); // Remove active state
        }, 800);
    }
}

// Renders the provided list of tags to the DOM
function renderTags(list) {
    const tagsGrid = document.getElementById("tagsGrid"); // Reference to the tags grid element
    tagsGrid.innerHTML = ''; // Clear existing content (e.g., skeleton UI)
    if (list.length === 0) {
        tagsGrid.innerHTML = '<p class="no-results">😕 No tags found.</p>'; // Display message if no tags are available
        return;
    }
    tagsGrid.innerHTML = list.map(([tag, count]) => `
        <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">
            ${tag}<span class="tag-count">${count}</span>
        </a>
    `).join(''); // Generate HTML for each tag with its count and join into a single string
}

// ---------- 2. Tag Search Functionality ----------
document.getElementById("tagSearch").addEventListener("input", e => {
    const q = e.target.value.toLowerCase(); // Get search query in lowercase
    const filtered = tagList.filter(([tag]) => tag.toLowerCase().includes(q)); // Filter tags based on query
    renderTags(filtered); // Re-render tags with filtered list
});

// ---------- 3. Theme Toggle ----------
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark"); // Toggle dark mode class on root element
    localStorage.setItem("pref-theme", document.documentElement.classList.contains("dark") ? "dark" : "light"); // Save theme preference to localStorage
});

// Loads saved theme or applies system preference
const savedTheme = localStorage.getItem("pref-theme"); // Retrieve saved theme from localStorage
if (savedTheme) {
    document.documentElement.classList.toggle("dark", savedTheme === "dark"); // Apply saved theme
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add("dark"); // Apply dark theme if system prefers dark mode
}

// ---------- 4. Scroll-to-Top Functionality ----------
window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display = window.scrollY > 200 ? "flex" : "none"; // Show/hide scroll-to-top button based on scroll position
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Smoothly scroll to the top of the page
});

// ---------- 5. Initialize Tag Loading ----------
loadTags(); // Call loadTags to fetch and display tags on page load