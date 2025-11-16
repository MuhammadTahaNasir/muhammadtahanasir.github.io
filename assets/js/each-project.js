document.addEventListener("DOMContentLoaded", () => {
    // Show loader animation
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('active')) {
        loader.classList.add('active');
        setTimeout(() => {
            loader.classList.add('no-blur');
        }, 900);
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.classList.remove('active');
        }, 1200);
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('pref-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons();

    // Dynamically generate tool tags from meta features
    const featuresMeta = document.querySelector('meta[name="features"]');
    const toolsTagsDiv = document.getElementById('project-tools-tags');
    if (featuresMeta && toolsTagsDiv) {
        const features = featuresMeta.content.split(',').map(feature => feature.trim());
        toolsTagsDiv.innerHTML = features.map(feature => `
            <a href="/tags/tag.html?name=${encodeURIComponent(feature)}" class="tag">${feature}</a>
        `).join(' ');
    }

    // Initialize carousel
    initCarousel();
});

// Theme toggle functionality
function updateThemeIcons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.getElementById("sun").style.display = isDark ? "none" : "block";
    document.getElementById("moon").style.display = isDark ? "block" : "none";
}

document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem("pref-theme", next);
    updateThemeIcons();
});

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        updateThemeIcons();
    }
});

window.addEventListener("scroll", () => {
    const scrollTopButton = document.getElementById("scrollTop");
    const header = document.querySelector('.header');
    
    // Add/remove scrolled class to header for blur effect
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    if (scrollTopButton) {
        scrollTopButton.classList.toggle("visible", window.scrollY > 200);
    }
});

document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Navigation handling
document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('#')) {
            // Use window.location.href for proper navigation
            window.location.href = href;
        }
    });
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    console.log('Popstate event:', window.location.href);
    
    // Reload the page to ensure proper state
    window.location.reload();
});

// Image Carousel Functionality
function initCarousel() {
    const carousel = document.querySelector('.image-carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.dot');
    const prevBtn = carousel.querySelector('.prev-btn');
    const nextBtn = carousel.querySelector('.next-btn');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Preload all images to prevent flash
    slides.forEach(slide => {
        const img = slide.querySelector('img');
        if (img) {
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[index].classList.add('active');
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalSlides - 1;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index < totalSlides) {
                currentSlide = index;
                showSlide(currentSlide);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'ArrowRight') nextSlide();
        }
    });

    let autoPlayInterval;
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 7500); // 7.5 seconds - perfect balance
    }
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    startAutoPlay();
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    showSlide(0);

    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');

    carousel.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-btn') || e.target.closest('.dot')) {
            return;
        }
        const activeSlide = carousel.querySelector('.carousel-slide.active img');
        modalImage.src = activeSlide.src;
        modalImage.alt = activeSlide.alt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        stopAutoPlay(); // Pause autoplay when modal opens
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        startAutoPlay(); // Resume autoplay when modal closes
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

        // Optimized keyboard event listener for modal
    let lastKeyTime = 0;
    const keyThrottle = 100; // 100ms throttle

    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active')) {
            const now = Date.now();
            
            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
            } else if (e.key === 'ArrowLeft' && (now - lastKeyTime) > keyThrottle) {
                e.preventDefault();
                lastKeyTime = now;
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(currentSlide);
                showModalSlide(currentSlide);
            } else if (e.key === 'ArrowRight' && (now - lastKeyTime) > keyThrottle) {
        e.preventDefault();
                lastKeyTime = now;
                currentSlide = (currentSlide + 1) % totalSlides;
                showSlide(currentSlide);
                showModalSlide(currentSlide);
            }
        }
    });

    function showModalSlide(index) {
        const activeSlide = slides[index].querySelector('img');
        modalImage.src = activeSlide.src;
        modalImage.alt = activeSlide.alt;
        // Remove disabled state checks for smoother navigation
    }

    modalPrev.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
        showModalSlide(currentSlide);
    });

    modalNext.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
        showModalSlide(currentSlide);
    });

    // Enhanced touch/swipe functionality
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    function handleSwipe() {
        const swipeThreshold = 30; // Reduced threshold for better responsiveness
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        
        // Only handle horizontal swipes (ignore vertical scrolling)
        if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
            if (diffX > 0) {
                // Swipe left - next
                if (modal.classList.contains('active')) {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    showSlide(currentSlide);
                    showModalSlide(currentSlide);
                } else {
                    nextSlide();
                }
            } else {
                // Swipe right - previous
                if (modal.classList.contains('active')) {
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    showSlide(currentSlide);
                    showModalSlide(currentSlide);
                } else {
                    prevSlide();
                }
            }
        }
    }

    // Carousel touch events
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isSwiping = true;
        stopAutoPlay(); // Pause autoplay during touch
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
        if (isSwiping) {
            e.preventDefault(); // Prevent scrolling during swipe
        }
    }, { passive: false });

    carousel.addEventListener('touchend', (e) => {
        if (isSwiping) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
            isSwiping = false;
            startAutoPlay(); // Resume autoplay after touch
        }
    }, { passive: true });

    // Modal touch events
    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isSwiping = true;
    }, { passive: true });

    modal.addEventListener('touchmove', (e) => {
        if (isSwiping) {
            e.preventDefault(); // Prevent scrolling during swipe
        }
    }, { passive: false });

    modal.addEventListener('touchend', (e) => {
        if (isSwiping) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
            isSwiping = false;
        }
    }, { passive: true });
}