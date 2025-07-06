// ---------- 1. Theme Handling on Page Load ----------
document.addEventListener("DOMContentLoaded", () => {
    // Apply saved or system theme on load
    const savedTheme = localStorage.getItem("pref-theme"); // Retrieve saved theme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches; // Check system dark mode preference
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light'); // Set initial theme
    document.documentElement.setAttribute('data-theme', initialTheme); // Apply theme to document
    updateThemeIcons(); // Update theme icons visibility
});

// ---------- 2. Theme Toggle Button ----------
document.getElementById("theme-toggle").addEventListener("click", () => {
    // Toggle between light and dark themes
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'; // Get current theme
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'; // Determine new theme
    document.documentElement.setAttribute('data-theme', newTheme); // Apply new theme
    localStorage.setItem("pref-theme", newTheme); // Save theme preference
    updateThemeIcons(); // Update theme icons visibility
});

// ---------- 3. Update Theme Icons ----------
function updateThemeIcons() {
    // Update sun/moon icon visibility based on current theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'; // Check if dark mode is active
    const sunIcon = document.getElementById("sun"); // Get sun icon
    const moonIcon = document.getElementById("moon"); // Get moon icon
    if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? "none" : "block"; // Show/hide sun icon
        moonIcon.style.display = isDark ? "block" : "none"; // Show/hide moon icon
    } else {
        console.error("Theme toggle icons (sun/moon) not found in DOM"); // Log error if icons are missing
    }
}

// ---------- 4. System Theme Change Listener ----------
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) { // Check if no user theme preference is set
        const newTheme = e.matches ? 'dark' : 'light'; // Set theme based on system preference
        document.documentElement.setAttribute('data-theme', newTheme); // Apply new theme
        updateThemeIcons(); // Update theme icons visibility
    }
});

// ---------- 5. Scroll to Top Button Visibility ----------
window.addEventListener("scroll", () => {
    const scrollTopButton = document.getElementById("scrollTop"); // Get scroll-to-top button
    if (scrollTopButton) {
        scrollTopButton.style.display = window.scrollY > 200 ? "flex" : "none"; // Show button after 200px scroll
    }
});

// ---------- 6. Scroll to Top Button Click ----------
document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
});

// ---------- 7. Loader Animation on Page Load ----------
window.addEventListener("load", () => {
    const loader = document.getElementById("loader"); // Get loader element
    if (loader) {
        loader.classList.add("active"); // Activate loader
        setTimeout(() => {
            loader.classList.add("no-blur"); // Remove blur effect after 600ms
        }, 600);
        setTimeout(() => {
            loader.classList.add("hidden"); // Hide loader after 800ms
            loader.classList.remove("active"); // Deactivate loader
        }, 800);
    }
});

// ---------- 8. Navigation Handling ----------
document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        const href = link.getAttribute('href'); // Get link href
        console.log('Navigating to:', href); // Log navigation target

        if (href && href !== '#' && !href.startsWith('#')) { // Check for valid href
            history.pushState({ path: href }, '', href); // Update browser history
            window.location.assign(href); // Navigate to href
        } else {
            console.error('Invalid href:', href); // Log error for invalid href
        }
    });
});

// ---------- 9. Popstate Event Handling ----------
window.addEventListener('popstate', (event) => {
    const state = event.state || {}; // Get event state
    console.log('Popstate event:', state, 'URL:', window.location.href); // Log popstate details

    if (state.path && (state.path.includes('index.html') || state.path === '/')) { // Check for index or root path
        const savedTheme = localStorage.getItem('pref-theme'); // Retrieve saved theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Check system dark mode
        document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light')); // Apply theme
        updateThemeIcons(); // Update theme icons visibility
        window.scrollTo({ top: 0, behavior: 'instant' }); // Scroll to top instantly
    }
});