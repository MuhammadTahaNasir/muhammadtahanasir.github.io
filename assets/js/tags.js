/**
 * Tags Page Script
 * Displays all tags from posts and projects with search and alphabetical navigation
 */

// Page fade-in animation
document.addEventListener('DOMContentLoaded', function() {
  const main = document.querySelector('.post-container');
  if (main) main.classList.add('page-fade-in');
});

let tagList = [];
let posts = [];
const loader = document.getElementById('loader');

/**
 * Load and aggregate tags from posts and projects
 * Creates tag map with counts and renders UI elements
 */
async function loadTags() {
    loader.classList.add('active'); // Show loader
    try {
        const [postsRes, projectsRes] = await Promise.all([
            fetch("posts/posts.json"),
            fetch("projects/projects.json")
        ]);
        if (!postsRes.ok) throw new Error('Posts file not found');
        if (!projectsRes.ok) throw new Error('Projects file not found');
        posts = await postsRes.json();
        const projects = await projectsRes.json();
        const tagMap = new Map(); // tag => count
        // Aggregate tags from posts
        posts.forEach(p => {
            if (Array.isArray(p.tags)) {
                p.tags.forEach(tag => {
                    tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
                });
            }
        });
        // Aggregate features from projects as tags
        projects.forEach(proj => {
            if (Array.isArray(proj.features)) {
                proj.features.forEach(feature => {
                    tagMap.set(feature, (tagMap.get(feature) || 0) + 1);
                });
            }
        });
        tagList = [...tagMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        renderPopularTags(tagList); // Render popular tags section
        renderAlphabetNav(tagList); // Render alphabet navigation
        renderTags(tagList); // Render sorted tags
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('tagsGrid').innerHTML = `<div class="no-results">😕 Failed to load tags. Check the console for details.</div>`;
    } finally {
        setTimeout(() => {
            loader.classList.add('hidden'); // Hide loader
            loader.classList.remove('active');
        }, 900);
    }
}

/**
 * Escape HTML entities for safe rendering
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Render tags to DOM with responsive layout
 * Mobile: Grouped by letter with headers; Desktop: Simple grid
 * @param {Array} list - Array of [tag, count] tuples
 */
function renderTags(list) {
    const tagsContainer = document.getElementById("tagsContainer");
    tagsContainer.innerHTML = ''; // Clear existing content
    if (list.length === 0) {
        tagsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No tags found</h3>
                <p>Try adjusting your search or browse all available tags</p>
            </div>
        `;
        return;
    }
    
    // Check if mobile (window width <= 768px)
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile: Group tags by first letter with section headers
        const grouped = {};
        list.forEach(([tag, count]) => {
            const firstLetter = tag[0].toUpperCase();
            if (!grouped[firstLetter]) grouped[firstLetter] = [];
            grouped[firstLetter].push([tag, count]);
        });
        
        // Render with section headers for mobile
        tagsContainer.innerHTML = Object.keys(grouped).sort().map(letter => {
            const tagsInSection = grouped[letter].map(([tag, count]) => {
                const safeName = escapeHtml(String(tag));
                return `
                    <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">
                        <span class="tag-name">${safeName}</span>
                        <span class="tag-count">${count} ${count === 1 ? 'item' : 'items'}</span>
                        <i class="fas fa-hashtag tag-icon"></i>
                    </a>
                `;
            }).join('');
            
            return `
                <div class="tag-section" id="section-${letter}">
                    <h2 class="section-header">${letter}</h2>
                    <div class="section-tags">${tagsInSection}</div>
                </div>
            `;
        }).join('');
    } else {
        // Desktop: Simple grid without sections (original design)
        tagsContainer.innerHTML = list.map(([tag, count]) => {
            const safeName = escapeHtml(String(tag));
            return `
                <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">
                    <span class="tag-name">${safeName}</span>
                    <span class="tag-count">${count} ${count === 1 ? 'item' : 'items'}</span>
                    <i class="fas fa-hashtag tag-icon"></i>
                </a>
            `;
        }).join('');
    }
}

/**
 * Render popular tags section (top 6 by count)
 * @param {Array} list - Array of [tag, count] tuples
 */
function renderPopularTags(list) {
    const popularContainer = document.getElementById('popularTagsPills');
    if (!popularContainer) return;
    
    // Sort by count descending and take top 6
    const topTags = [...list].sort((a, b) => b[1] - a[1]).slice(0, 6);
    
    popularContainer.innerHTML = topTags.map(([tag, count]) => {
        const safeName = escapeHtml(String(tag));
        return `
            <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="popular-tag-pill">
                <i class="fas fa-hashtag"></i>
                <span>${safeName}</span>
                <span class="pill-count">${count}</span>
            </a>
        `;
    }).join('');
}

/**
 * Render alphabet navigation for mobile
 * @param {Array} list - Array of [tag, count] tuples
 */
function renderAlphabetNav(list) {
    const alphabetNav = document.getElementById('alphabetNav');
    if (!alphabetNav) return;
    
    // Get all unique first letters
    const letters = [...new Set(list.map(([tag]) => tag[0].toUpperCase()))].sort();
    
    alphabetNav.innerHTML = letters.map(letter => {
        return `<button class="alphabet-btn" data-letter="${letter}">${letter}</button>`;
    }).join('');
    
    // Add click handlers with smooth scroll and visual feedback
    alphabetNav.querySelectorAll('.alphabet-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const letter = btn.dataset.letter;
            const section = document.getElementById(`section-${letter}`);
            if (section) {
                // Smooth scroll to section with offset for fixed header
                const headerOffset = 90;
                const elementPosition = section.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Visual feedback
                alphabetNav.querySelectorAll('.alphabet-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setTimeout(() => btn.classList.remove('active'), 600);
                
                // Haptic feedback on mobile (if supported)
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }
            }
        });
    });
}

// Tag search with live filtering
const searchInput = document.getElementById("tagSearch");

searchInput.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const filtered = tagList.filter(([tag]) => tag.toLowerCase().includes(q));
    
    // Hide popular tags and alphabet nav when searching (mobile only)
    const popularSection = document.getElementById('popularTagsSection');
    const alphabetNav = document.getElementById('alphabetNav');
    const isMobile = window.innerWidth <= 768;
    
    if (q.length > 0) {
        if (popularSection) popularSection.style.display = 'none';
        if (alphabetNav) alphabetNav.style.display = 'none';
        // Render simple list without sections when searching
        renderSimpleTags(filtered);
    } else {
        // Show mobile elements only on mobile
        if (isMobile) {
            if (popularSection) popularSection.style.display = 'block';
            if (alphabetNav) alphabetNav.style.display = 'flex';
        }
        renderTags(filtered);
    }
});

/**
 * Render tags without sections (for search results)
 * @param {Array} list - Filtered array of [tag, count] tuples
 */
function renderSimpleTags(list) {
    const tagsContainer = document.getElementById("tagsContainer");
    tagsContainer.innerHTML = '';
    
    if (list.length === 0) {
        tagsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No tags found</h3>
                <p>Try adjusting your search or browse all available tags</p>
            </div>
        `;
        return;
    }
    
    tagsContainer.innerHTML = list.map(([tag, count]) => {
        const safeName = escapeHtml(String(tag));
        return `
            <a href="tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">
                <span class="tag-name">${safeName}</span>
                <span class="tag-count">${count} ${count === 1 ? 'item' : 'items'}</span>
                <i class="fas fa-hashtag tag-icon"></i>
            </a>
        `;
    }).join('');
}

// Theme toggle handler
document.getElementById("theme-toggle").addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    html.style.background = newTheme === 'dark' ? '#1a1a1a' : '#f9fafc';
    html.style.color = newTheme === 'dark' ? '#d1d5db' : '#333';
    html.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('pref-theme', newTheme);
});

// Scroll to top button
window.addEventListener("scroll", () => {
    document.getElementById("scrollTop").style.display = window.scrollY > 200 ? "flex" : "none";
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Initialize tags on page load
loadTags();

/**
 * Handle responsive layout switching on window resize
 * Toggles between mobile (with sections) and desktop (grid) layouts
 */
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        const popularSection = document.getElementById('popularTagsSection');
        const alphabetNav = document.getElementById('alphabetNav');
        const searchInput = document.getElementById('tagSearch');
        
        // Only re-render if not searching
        if (searchInput && searchInput.value.length === 0) {
            // Show/hide mobile elements based on screen size
            if (popularSection) {
                popularSection.style.display = isMobile ? 'block' : 'none';
            }
            if (alphabetNav) {
                alphabetNav.style.display = isMobile ? 'flex' : 'none';
            }
            // Re-render tags with appropriate layout
            renderTags(tagList);
        }
    }, 250);
});