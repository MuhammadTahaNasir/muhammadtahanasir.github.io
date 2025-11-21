/**
 * Navigation Active State Manager
 * Automatically highlights the current page link in navigation menus
 */

(function() {
	/**
	 * Extract filename from pathname
	 * @param {string} pathname - URL pathname
	 * @returns {string} - Normalized filename
	 */
	function getFileName(pathname) {
		if (!pathname || pathname === '/' || pathname === '/index.html') return 'index.html';
		const parts = pathname.split('/').filter(Boolean);
		const last = parts[parts.length - 1] || 'index.html';
		return last.includes('.') ? last : 'index.html';
	}

	/**
	 * Normalize href to filename
	 * @param {string} href - Link href attribute
	 * @returns {string} - Normalized filename
	 */
	function normalizeHref(href) {
		try {
			if (!href) return '';
			const cleanHref = href.replace(/^\//, '');
			const url = new URL(cleanHref, window.location.origin);
			return getFileName(url.pathname);
		} catch (e) {
			return href.replace(/^\//, '') || 'index.html';
		}
	}

	/**
	 * Update active state for navigation links
	 * @param {string} selector - CSS selector for navigation container
	 */
	function updateActive(selector) {
		const container = document.querySelector(selector);
		if (!container) return;
		
		const links = Array.from(container.querySelectorAll('a'));
		const current = getFileName(window.location.pathname);
		
		links.forEach(a => {
			const href = a.getAttribute('href');
			if (!href) return;
			
			const target = normalizeHref(href);
			
			if (target === current) {
				a.classList.add('active');
			} else {
				a.classList.remove('active');
			}
		});
	}

	function run() {
		updateActive('.pill-nav');
		updateActive('.bottom-nav');
	}

	// Initialize on page load
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run);
	} else {
		run();
	}
	
	// Update on back/forward navigation
	window.addEventListener('pageshow', run);
})();


