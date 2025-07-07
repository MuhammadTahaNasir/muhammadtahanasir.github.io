// Theme handling
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("pref-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
    updateThemeIcons();
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
            history.pushState({ path: href }, '', href);
            window.location.assign(href);
        } else {
            console.error('Invalid href:', href);
        }
    });
});

window.addEventListener('popstate', (event) => {
    const state = event.state || {};
    console.log('Popstate event:', state, 'URL:', window.location.href);

    if (state.path && state.path.includes('index.html')) {
        // For index.html, no dynamic content to load, so just ensure theme is applied
        const savedTheme = localStorage.getItem('pref-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
        updateThemeIcons();
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
});
