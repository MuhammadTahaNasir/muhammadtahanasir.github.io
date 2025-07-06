document.addEventListener("DOMContentLoaded", () => {
    // Apply saved or system theme on load
    const savedTheme = localStorage.getItem("pref-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.body.classList.toggle("dark", initialTheme === 'dark');
    updateThemeIcons();
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    // Toggle the dark class on body
    document.body.classList.toggle("dark");
    const newTheme = document.body.classList.contains("dark") ? 'dark' : 'light';
    localStorage.setItem("pref-theme", newTheme);
    updateThemeIcons();
});

function updateThemeIcons() {
    // Update sun/moon icon visibility based on body class
    const isDark = document.body.classList.contains("dark");
    const sunIcon = document.getElementById("sun");
    const moonIcon = document.getElementById("moon");
    if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? "none" : "block";
        moonIcon.style.display = isDark ? "block" : "none";
    } else {
        console.error("Theme toggle icons (sun/moon) not found");
    }
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) {
        document.body.classList.toggle("dark", e.matches);
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

    if (state.path && (state.path.includes('index.html') || state.path === '/')) {
        const savedTheme = localStorage.getItem('pref-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle("dark", savedTheme ? savedTheme === 'dark' : prefersDark);
        updateThemeIcons();
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
});