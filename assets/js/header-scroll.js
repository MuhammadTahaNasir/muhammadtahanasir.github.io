/**
 * Header Scroll Effect
 * Adds 'scrolled' class to header when user scrolls down for glassmorphism effect
 */

(function() {
	function updateHeader() {
		var header = document.querySelector('.header');
		if (!header) return;
		
		if (window.scrollY > 10) {
			header.classList.add('scrolled');
		} else {
			header.classList.remove('scrolled');
		}
	}

	// Initialize on page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', updateHeader);
	} else {
		updateHeader();
	}

	// Update on scroll
	window.addEventListener('scroll', updateHeader, { passive: true });
})();


