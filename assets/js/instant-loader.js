/**
 * Instant Loader Manager
 * Prevents loader from showing on hash navigation and same-page anchor links
 */

(function () {
	// Hide loader immediately if page loaded with hash fragment
	if (window.location.hash) {
		var loader = document.getElementById('loader');
		if (loader) {
			loader.style.display = 'none';
			loader.style.opacity = '0';
			loader.style.visibility = 'hidden';
			loader.classList.add('hidden');
		}
	}

	/**
	 * Check if anchor is an internal link
	 * @param {HTMLAnchorElement} anchor - The anchor element to check
	 * @returns {boolean} - True if internal link, false otherwise
	 */
	function isInternalLink(anchor) {
		try {
			var url = new URL(anchor.href, window.location.origin);
			// Skip loader for hash links (anchors/TOC)
			if (url.hash) return false;
			return url.origin === window.location.origin && !anchor.target;
		} catch (_) {
			return false;
		}
	}

	// Handle click events on links
	document.addEventListener('click', function (e) {
		var anchor = e.target.closest('a');
		if (!anchor) return;
		
		var href = anchor.getAttribute('href') || '';
		
		// Hide loader for same-page anchor links
		if (href.startsWith('#') || href.includes('#')) {
			var loader = document.getElementById('loader');
			if (loader) {
				loader.style.display = 'none';
				loader.style.opacity = '0';
				loader.style.visibility = 'hidden';
				loader.classList.add('hidden');
				loader.classList.remove('active');
			}
			return;
		}
		
		if (!isInternalLink(anchor)) return;

		// Skip loader for downloads and PDFs
		var isDownload = anchor.hasAttribute('download') || /\.pdf($|\?|#)/i.test(href);
		if (isDownload) return;
	});
	
	// Hide loader on hash change events
	window.addEventListener('hashchange', function() {
		var loader = document.getElementById('loader');
		if (loader) {
			loader.style.display = 'none';
			loader.style.opacity = '0';
			loader.style.visibility = 'hidden';
			loader.classList.add('hidden');
			loader.classList.remove('active');
		}
	}, true);
	
	// Ensure loader hidden on initial load with hash
	if (window.location.hash) {
		setTimeout(function() {
			var loader = document.getElementById('loader');
			if (loader) {
				loader.style.display = 'none';
				loader.style.opacity = '0';
				loader.style.visibility = 'hidden';
			}
		}, 0);
	}
})();


