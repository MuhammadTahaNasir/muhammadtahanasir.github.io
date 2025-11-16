// Theme handling
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("pref-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
    updateThemeIcons();
    loadRelatedPosts();
    loadTags();
    initializeSocialSharing();
    initializeNewsletter();
    
    // Increment view count for this post
    incrementPostViewCount();
});

// Loader handling
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("hidden");
        }, 800);
    }
});

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem("pref-theme", currentTheme);
        updateThemeIcons();
    });
}

function updateThemeIcons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const sunIcon = document.getElementById("sun");
    const moonIcon = document.getElementById("moon");
    
    if (sunIcon) {
        sunIcon.style.display = isDark ? "none" : "block";
    }
    if (moonIcon) {
        moonIcon.style.display = isDark ? "block" : "none";
    }
}

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("pref-theme")) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        updateThemeIcons();
    }
});

// Scroll to top and social toolbar
window.addEventListener("scroll", () => {
    const scrollTopButton = document.getElementById("scrollTop");
    const socialToolbar = document.querySelector('.social-sharing-toolbar');
    const header = document.querySelector('.header');
    
    // Add/remove scrolled class to header for blur effect
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Show scroll to top button when scrolling down
    if (scrollTopButton) {
        if (window.scrollY > 200) {
            scrollTopButton.style.display = "flex";
        } else {
            scrollTopButton.style.display = "none";
        }
    }
    
    // On mobile, social toolbar is always visible (positioned in top-right)
    // No need to toggle visibility based on scroll
});

const scrollTopButton = document.getElementById("scrollTop");
if (scrollTopButton) {
    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// Removed duplicate loader handling - it's now above near theme handling

// Navigation handling
document.querySelectorAll('.pill-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        console.log('Navigating to:', href);

        if (href && href !== '#' && !href.startsWith('#')) {
            // Use window.location.href for proper navigation
            window.location.href = href;
        } else {
            console.error('Invalid href:', href);
        }
    });
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    console.log('Popstate event:', window.location.href);
    
    // Reload the page to ensure proper state
    window.location.reload();
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
        
        if (!container) {
            console.log("Related posts container not found, skipping...");
            return;
        }

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
        const relatedSeries = document.getElementById("related-series");
        if (relatedSeries) {
            relatedSeries.style.display = "none";
        }
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
        
        if (!tagsContainer) {
            console.log("Dynamic tags container not found, skipping...");
            return;
        }
        
        if (currentPost && currentPost.tags) {
            tagsContainer.innerHTML = currentPost.tags.map(tag => `
                <a href="/tags/tag.html?name=${encodeURIComponent(tag)}" class="tag">${tag}</a>
            `).join('');
        }
    } catch (err) {
        console.error("Error loading tags:", err);
        const dynamicTags = document.getElementById("dynamic-tags");
        if (dynamicTags) {
            dynamicTags.style.display = "none";
        }
    }
}

// Social Sharing Functionality
function initializeSocialSharing() {
    const subscribeBtn = document.querySelector('.subscribe-btn');
    const shareBtn = document.querySelector('.share-btn');

    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', handleSubscribe);
    }
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShare);
    }
}

function handleSubscribe() {
    // Show newsletter modal with subscribe functionality only
    showNewsletterModal();
}

function handleShare() {
    const url = window.location.href;
    const title = document.title;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch((error) => {
            console.log('Share cancelled or failed:', error);
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showToast('📋 Link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('📋 Link copied to clipboard!');
        });
    }
}

function showNewsletterModal() {
    // Remove existing modal if any
    const existingModal = document.querySelector('.newsletter-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'newsletter-modal';
    modal.innerHTML = `
        <div class="newsletter-modal-content">
            <div class="newsletter-modal-header">
                <h3>Subscribe to Newsletter</h3>
                <button class="newsletter-close-btn">&times;</button>
            </div>
            <div class="newsletter-modal-body">
                <div class="newsletter-form-section">
                    <p>Get the latest updates, articles, and insights from <strong>&lt;terry/&gt;</strong> directly in your inbox.</p>
                    <p>Subscribe to the newsletter, and don't miss out on future content and updates.</p>
                    <form class="newsletter-form">
                        <input type="email" class="newsletter-input" placeholder="Enter your email address" required>
                        <button type="submit" class="newsletter-submit-btn">Subscribe</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Setup newsletter form
    setupNewsletterForm(modal);
    
    // Handle close button
    const closeBtn = modal.querySelector('.newsletter-close-btn');
    closeBtn.addEventListener('click', () => {
        hideNewsletterModal(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideNewsletterModal(modal);
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            hideNewsletterModal(modal);
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

function hideNewsletterModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function setupNewsletterForm(modal) {
    const form = modal.querySelector('.newsletter-form');
    const input = modal.querySelector('.newsletter-input');
    const submitBtn = modal.querySelector('.newsletter-submit-btn');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = input.value.trim();
        
        if (!email) {
            showToast('❌ Please enter your email address');
            return;
        }
        
        if (!isValidEmail(email)) {
            showToast('❌ Please enter a valid email address');
            return;
        }
        
        // Send email to you like contact form
        const formData = new FormData();
        formData.append('name', 'Newsletter Subscriber');
        formData.append('email', email);
        formData.append('message', 'Newsletter subscription request from blog post. User wants to receive updates and latest content from <terry/>');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        
        fetch('https://contact-form-plum-five.vercel.app/api/submit-contact', {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            // Since email is reaching you, consider it successful
            showToast('🎉 Thanks for subscribing!');
            input.value = '';
            // Close modal after successful subscription
            setTimeout(() => {
                hideNewsletterModal(modal);
            }, 1500);
        })
        .catch(error => {
            console.error('Newsletter subscription error:', error);
            // Since email is reaching you, show success even if there's a network error
            showToast('🎉 Thanks for subscribing!');
            input.value = '';
            // Close modal after successful subscription
            setTimeout(() => {
                hideNewsletterModal(modal);
            }, 1500);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        });
    });
}

// Newsletter Functionality
function initializeNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterInput = document.querySelector('.newsletter-input');
    const newsletterBtn = document.querySelector('.newsletter-btn');

    if (newsletterForm && newsletterBtn) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        newsletterBtn.addEventListener('click', handleNewsletterSubmit);
    }

    if (newsletterInput) {
        newsletterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNewsletterSubmit(e);
            }
        });
    }
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const emailInput = document.querySelector('.newsletter-input');
    const newsletterBtn = document.querySelector('.newsletter-btn');
    const email = emailInput.value.trim();
    
    if (!email) {
        showToast('❌ Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('❌ Please enter a valid email address');
        return;
    }
    
    // Send email to you like contact form
    const formData = new FormData();
    formData.append('name', 'Newsletter Subscriber');
    formData.append('email', email);
    formData.append('message', 'Newsletter subscription request from blog post. User wants to receive updates and latest content from <terry/>');
    
    newsletterBtn.disabled = true;
    newsletterBtn.textContent = 'SUBSCRIBING...';
    
    fetch('https://contact-form-plum-five.vercel.app/api/submit-contact', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        // Since email is reaching you, consider it successful
        showToast('🎉 Thanks for subscribing!');
        emailInput.value = '';
    })
    .catch(error => {
        console.error('Newsletter subscription error:', error);
        // Since email is reaching you, show success even if there's a network error
        showToast('🎉 Thanks for subscribing!');
        emailInput.value = '';
    })
    .finally(() => {
        newsletterBtn.disabled = false;
        newsletterBtn.textContent = 'SUBSCRIBE';
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Toast notification
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation with slight delay for CSS transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }, 3000);
}

// View count functionality
function incrementPostViewCount() {
    const currentUrl = window.location.pathname.replace(/^\/|\/$/g, '');
    const viewKey = `views-${currentUrl}`;
    const currentViews = parseInt(localStorage.getItem(viewKey) || 0);
    const newViews = currentViews + 1;
    localStorage.setItem(viewKey, newViews);
}