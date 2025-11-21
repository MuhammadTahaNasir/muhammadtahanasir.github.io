/**
 * Contact Page Script
 * Handles theme toggle, form submission, and user feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    
    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        html.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('pref-theme', newTheme);
    });
    
    // Form submission handler
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                console.log('Sending form data to API...');
                const response = await fetch('https://contact-form-plum-five.vercel.app/api/submit-contact', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                console.log('Response status:', response.status);
                const result = await response.json();
                console.log('Response data:', result);
                
                if (response.ok) {
                    showToast('🎉 Message sent successfully!');
                    launchConfetti();
                    setTimeout(() => {
                        window.location.href = '/thank-you.html';
                    }, 1000);
                } else {
                    showToast(`❌ Error: ${result.message}`);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                showToast(`❌ Network error: ${error.message}`);
            }
        });
    }
});

/**
 * Display toast notification
 * @param {string} message - The message to display
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#3b82f6',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        fontSize: '0.95em',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.4s ease, transform 0.3s ease',
    });
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(0px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

/**
 * Launch confetti animation on successful form submission
 */
function launchConfetti() {
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        Object.assign(confetti.style, {
            position: 'fixed',
            top: `${Math.random() * 20 + 20}%`,
            left: `${Math.random() * 100}%`,
            width: '8px',
            height: '8px',
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            borderRadius: '50%',
            zIndex: '9999',
            opacity: 1,
            pointerEvents: 'none',
            transition: 'transform 2s ease-out, opacity 2s ease-out',
        });
        document.body.appendChild(confetti);
        
        requestAnimationFrame(() => {
            confetti.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = 0;
        });
        
        setTimeout(() => confetti.remove(), 2000);
    }
}

// Scroll to top button visibility
window.addEventListener('scroll', () => {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
    }
});

// Scroll to top button handler
document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});