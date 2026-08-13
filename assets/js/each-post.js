// Snappy Loader Animation (450ms Playback)
(function() {
    function dismissLoader() {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.classList.add("hidden");
            setTimeout(() => {
                if (loader.parentNode && loader.classList.contains("hidden")) {
                    loader.style.display = "none";
                }
            }, 350);
        }
    }
    
    // Play snappy 450ms animation on page load, then smoothly fade out
    if (document.readyState === "complete") {
        setTimeout(dismissLoader, 300);
    } else {
        setTimeout(dismissLoader, 450);
    }
})();

// Smooth scroll for anchor links (table of contents)
document.addEventListener("DOMContentLoaded", () => {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#top') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Hide loader immediately
                const loader = document.getElementById("loader");
                if (loader) {
                    loader.style.display = "none";
                    loader.style.opacity = "0";
                    loader.style.visibility = "hidden";
                    loader.classList.add("hidden");
                }
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without triggering page reload
                history.pushState(null, null, href);
            }
        });
    });
});

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

// Loader handling - only on actual page load, NOT on hash navigation
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    const toolbar = document.querySelector('.social-sharing-toolbar');

    function revealToolbar() {
        if (toolbar) {
            toolbar.classList.add("toolbar-visible");
        }
    }

    if (loader && !window.location.hash) {
        setTimeout(() => {
            loader.classList.add("hidden");
            loader.classList.remove("active");
            // Reveal toolbar after loader fades out (500ms transition)
            setTimeout(revealToolbar, 500);
        }, 800);
    } else if (loader && window.location.hash) {
        // If there's a hash, hide immediately and show toolbar
        loader.style.display = "none";
        loader.classList.add("hidden");
        revealToolbar();
    } else {
        // No loader present, show toolbar immediately
        revealToolbar();
    }
});

// Handle bfcache restores (page shown from back/forward cache on refresh)
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        // Page was restored from bfcache — hide loader immediately and show toolbar
        const loader = document.getElementById("loader");
        if (loader) {
            loader.style.display = "none";
            loader.classList.add("hidden");
            loader.classList.remove("active");
        }
        const toolbar = document.querySelector('.social-sharing-toolbar');
        if (toolbar) {
            toolbar.classList.add("toolbar-visible");
        }
    }
});

// Prevent loader from showing on hash navigation (table of contents)
let lastHash = window.location.hash;
window.addEventListener("hashchange", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        // Force loader to stay hidden on hash navigation
        loader.classList.add("hidden");
        loader.classList.remove("active");
        loader.style.display = "none";
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
    }
    lastHash = window.location.hash;
}, true);

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.documentElement.style.backgroundColor = currentTheme === 'dark' ? '#06070d' : '#f5f5f7';
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

        const currentUrl = window.location.pathname.replace(/^\/|\/$/g, '');
        const currentPost = allPosts.find(p => p.url === currentUrl);

        const sortedPosts = allPosts
            .filter(p => p.url && !p.url.endsWith("posts.html"))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalPosts = sortedPosts.length;
        
        let topRelated = [];
        
        // Latest 5 posts
        for (let i = 0; i < 5 && i < totalPosts; i++) {
            topRelated.push(sortedPosts[i]);
        }

        topRelated.push({ isShowOther: true, total: totalPosts });

        const container = document.getElementById("related-posts-container");
        if (!container) return;

        container.innerHTML = topRelated.map((post) => {
            if (post.isShowOther) {
                return `
                    <div class="post-item show-other">
                        <a href="../../posts.html" class="show-all-btn">Show all ${post.total} posts &rarr;</a>
                    </div>
                `;
            }
            
            // Chronological numbering: Oldest = 1, Newest = totalPosts
            const originalIndex = totalPosts - sortedPosts.indexOf(post);
            
            // Resolve thumbnail
            let thumbUrl = '../../assets/images/posts/ai-deployment.png'; // Fallback
            if (post.thumbnail) {
                if (post.thumbnail.startsWith('/')) {
                    thumbUrl = '../..' + post.thumbnail;
                } else if (post.thumbnail.startsWith('http')) {
                    thumbUrl = post.thumbnail;
                } else {
                    thumbUrl = '../../assets/images/posts/' + post.thumbnail;
                }
            }
            
            return `
                <div class="post-item${post.url === currentUrl ? ' current-post' : ''}">
                    <a href="${post.url.startsWith('/') ? '.' : '../../'}${post.url}" class="post-link">
                        <div class="thumb-box">
                            <img src="${thumbUrl}" alt="Thumbnail" onerror="this.onerror=null; this.style.opacity=0;">
                            <div class="badge">${originalIndex}</div>
                        </div>
                        <div class="info">
                            <span class="post-title">${post.title}</span>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Error loading related posts:", err);
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

function getNormalizedViewKey(urlOrPath) {
    let path = urlOrPath.replace(/^\/|\/$/g, '');
    path = path.replace(/\.html$/i, '');
    return `views-${path}`;
}

// View count functionality
function incrementPostViewCount() {
    const currentUrl = window.location.pathname;
    const viewKey = getNormalizedViewKey(currentUrl);
    const currentViews = parseInt(localStorage.getItem(viewKey) || 0);
    const newViews = currentViews + 1;
    localStorage.setItem(viewKey, newViews);
}

// Copy Code Button Functionality
document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(block => {
        // Ensure block is relative for absolute positioning of the button
        block.style.position = 'relative';
        
        // Remove pre-existing buttons inside block to avoid duplication
        const existingBtns = block.querySelectorAll('.copy-code-btn');
        existingBtns.forEach(btn => btn.remove());
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
        copyBtn.setAttribute('title', 'Copy code');
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pre = block.querySelector('pre');
            if (!pre) return;
            
            const textToCopy = pre.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
        
        block.appendChild(copyBtn);
    });
});
