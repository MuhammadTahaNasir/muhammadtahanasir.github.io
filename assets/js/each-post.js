// Theme handling
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("pref-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
    updateThemeIcons();
    loadRelatedPosts();
    loadTags();
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem("pref-theme", currentTheme);
    updateThemeIcons();
});

function updateThemeIcons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.getElementById("sun").style.display = isDark ? "none" : "block";
    document.getElementById("moon").style.display = isDark ? "block" : "none";
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        updateThemeIcons();
    }
});

// Scroll to top
window.addEventListener("scroll", () => {
    const scrollTopButton = document.getElementById("scrollTop");
    if (scrollTopButton) {
        scrollTopButton.style.display = window.scrollY > 200 ? "flex" : "none";
    }
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Loader handling
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("active");
        setTimeout(() => {
            loader.classList.add("no-blur");
        }, 600);
        setTimeout(() => {
            loader.classList.add("hidden");
            loader.classList.remove("active");
        }, 800);
    }
});

// Navigation handling
document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        console.log('Navigating to:', href);

        if (href && href !== '#' && !href.startsWith('#')) {
            history.pushState({ path: href }, '', href); // Ensure path is set
            window.location.assign(href);
        } else {
            console.error('Invalid href:', href);
        }
    });
});

window.addEventListener('popstate', (event) => {
    const state = event.state || {};
    console.log('Popstate event at', new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }), ': Raw State:', JSON.stringify(state), 'URL:', window.location.href);

    // Refined condition with try-catch and detailed logging
    if (state && typeof state === 'object' && state.hasOwnProperty('path') && typeof state.path === 'string') {
        console.log('State type confirmed as object, path exists and is string, value:', state.path);
        try {
            if (state.path.includes('index.html')) {
                console.log('Matched index.html, applying theme and scroll');
                const savedTheme = localStorage.getItem('pref-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
                updateThemeIcons();
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
                console.log('No index.html match, skipping theme/scroll update');
            }
        } catch (error) {
            console.error('Error inside popstate logic:', error);
        }
    } else {
        console.log('Invalid state or path, State details:', JSON.stringify(state), 'Typeof state:', typeof state);
    }
});

// Load related posts
async function loadRelatedPosts() {
    try {
        const res = await fetch("../../posts/posts.json");
        if (!res.ok) throw new Error("Failed to fetch posts.json");
        const allPosts = await res.json();

        // Get the full current URL path and match it exactly with the post's url field
        const currentUrl = window.location.pathname.replace(/^\/|\/$/g, '');
        const currentPost = allPosts.find(p => p.url === currentUrl);

        // Create a sorted list of all posts (excluding posts.html) based on date
        const sortedPosts = allPosts
            .filter(p => p.url && !p.url.endsWith("posts.html"))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Dynamically set total posts, excluding posts.html
        const totalPosts = sortedPosts.length;
        const currentIndex = currentPost ? sortedPosts.indexOf(currentPost) : -1;

        // Prepare the custom order
        let topRelated = [];

        // Always add the first post (post 1)
        if (sortedPosts[0]) {
            topRelated.push(sortedPosts[0]);
        }

        // Handle logic based on current post
        if (currentIndex === 0) {
            // First post: Show post 1 (active), post 2, show other, second-to-last, last
            if (sortedPosts[1]) topRelated.push(sortedPosts[1]);
        } else if (currentIndex === 1) {
            // Second post: Show post 1, post 2 (active), show other, second-to-last, last
            if (currentPost && !topRelated.includes(currentPost)) {
                topRelated.push(currentPost); // Add post 2 (active)
            }
        } else if (currentIndex === totalPosts - 1) {
            // Last post: Show post 1, second-to-last, active post, show other, last
            if (sortedPosts[totalPosts - 2] && !topRelated.includes(sortedPosts[totalPosts - 2])) {
                topRelated.push(sortedPosts[totalPosts - 2]);
            }
            if (currentPost && !topRelated.includes(currentPost)) {
                topRelated.push(currentPost);
            }
        } else if (currentIndex > 1) {
            // Other posts: Show post 1, previous post, active post, show other, second-to-last, last
            if (sortedPosts[currentIndex - 1] && !topRelated.includes(sortedPosts[currentIndex - 1])) {
                topRelated.push(sortedPosts[currentIndex - 1]);
            }
            if (currentPost && !topRelated.includes(currentPost)) {
                topRelated.push(currentPost);
            }
        } else {
            // Fallback: If no current post, show post 2
            if (sortedPosts[1] && !topRelated.includes(sortedPosts[1])) {
                topRelated.push(sortedPosts[1]);
            }
        }

        // Add "Show Other" link
        topRelated.push({ isShowOther: true, total: totalPosts });

        // Add second-to-last and last posts (avoid duplicates)
        const secondLastIndex = totalPosts - 2;
        const lastIndex = totalPosts - 1;
        if (secondLastIndex >= 0 && !topRelated.includes(sortedPosts[secondLastIndex])) {
            topRelated.push(sortedPosts[secondLastIndex]);
        }
        if (lastIndex >= 0 && !topRelated.includes(sortedPosts[lastIndex])) {
            topRelated.push(sortedPosts[lastIndex]);
        }

        const container = document.getElementById("related-posts-container");

        container.innerHTML = topRelated.map((post, idx) => {
            if (post.isShowOther) {
                return `
                    <div class="post-item show-other center-link">
                        <a href="../../posts.html" class="show-all-link">Show all ${post.total} posts</a>
                    </div>
                `;
            }
            const originalIndex = sortedPosts.indexOf(post) + 1;
            return `
                <div class="post-item${post.url === currentUrl ? ' current-post' : ''}">
                    <div class="post-number">${originalIndex}</div>
                    <div>
                        <a href="${post.url.startsWith('/') ? '.' : '../../'}${post.url}">
                            ${post.title}
                        </a>
                        <p>${post.summary.slice(0, 120)}${post.summary.length > 120 ? "..." : ""}</p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Error loading related posts:", err);
        document.getElementById("related-series").style.display = "none";
    }
}

// Load tags
async function loadTags() {
    try {
        const res = await fetch("../../posts/posts.json");
        if (!res.ok) throw new Error("Failed to fetch posts.json");
        const allPosts = await res.json();

        const currentUrl = window.location.pathname.replace(/^\/|\/$/g, '');
        const currentPost = allPosts.find(p => p.url === currentUrl);

        const tagsContainer = document.getElementById("dynamic-tags");
        if (currentPost && currentPost.tags) {
            tagsContainer.innerHTML = currentPost.tags.map(tag => `
                <a href="/tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">${tag}</a>
            `).join('');
        }
    } catch (err) {
        console.error("Error loading tags:", err);
        document.getElementById("dynamic-tags").style.display = "none";
    }
}