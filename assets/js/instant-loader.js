(function () {
	// Immediately check if page loaded with hash
	if (window.location.hash) {
		var loader = document.getElementById('loader');
		if (loader) {
			loader.style.display = 'none';
			loader.style.opacity = '0';
			loader.style.visibility = 'hidden';
			loader.classList.add('hidden');
		}
	}

	function isInternalLink(anchor) {
		try {
			var url = new URL(anchor.href, window.location.origin);
			// Allow same-page hash links (table of contents, anchors)
			if (url.hash) {
				return false; // Skip loader for ANY hash links
			}
			return url.origin === window.location.origin && !anchor.target;
		} catch (_) {
			return false;
		}
	}

	document.addEventListener('click', function (e) {
		var anchor = e.target.closest('a');
		if (!anchor) return;
		
		// Check if it's a same-page anchor link (table of contents)
		var href = anchor.getAttribute('href') || '';
		if (href.startsWith('#') || href.includes('#')) {
			// Let browser handle smooth scroll to anchor, no loader
			// Ensure loader stays hidden
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

		// Skip loader for file downloads or PDFs so browser can handle download natively
		var isDownload = anchor.hasAttribute('download') || /\.pdf($|\?|#)/i.test(href);
		if (isDownload) return;

		// Don't prevent default - let browser handle navigation naturally
		// This fixes loader getting stuck on page transitions
	});
	
	// Also prevent loader on hashchange event globally - with capture phase
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
	
	// Run immediately on script load
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


