// ---------- 1. Theme Handling on Page Load ----------
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("pref-theme"); // Retrieve saved theme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches; // Check system dark mode preference
    document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light')); // Set theme based on saved or system preference
    updateThemeIcons(); // Update theme icons visibility
});

// ---------- 2. Theme Toggle Button ----------
document.getElementById("theme-toggle").addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; // Toggle theme
    document.documentElement.setAttribute('data-theme', currentTheme); // Apply new theme
    localStorage.setItem("pref-theme", currentTheme); // Save theme preference
    updateThemeIcons(); // Update theme icons visibility
});

// ---------- 3. Update Theme Icons ----------
function updateThemeIcons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'; // Check if dark mode is active
    document.getElementById("sun").style.display = isDark ? "none" : "block"; // Show/hide sun icon
    document.getElementById("moon").style.display = isDark ? "block" : "none"; // Show/hide moon icon
}

// ---------- 4. System Theme Change Listener ----------
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) { // Check if no user theme preference is set
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light'); // Update theme based on system preference
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
            loader.classList.add("no-blur"); // Remove blur effect after 900ms
        }, 900);
        setTimeout(() => {
            loader.classList.add("hidden"); // Hide loader after 1200ms
            loader.classList.remove("active"); // Deactivate loader
        }, 1200);
    }
});

// ---------- 8. Timeline Card Animation ----------
const cards = document.querySelectorAll('.timeline-card'); // Select all timeline cards

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal'); // Add reveal class when in view
        } else {
            entry.target.classList.remove('reveal'); // Remove reveal class when out of view
        }
    });
}, {
    threshold: 0.15, // Trigger when 15% of card is visible
});

cards.forEach(card => {
    observer.observe(card); // Observe each timeline card
});