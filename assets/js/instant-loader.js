(function () {
	function isInternalLink(anchor) {
		try {
			var url = new URL(anchor.href, window.location.origin);
			return url.origin === window.location.origin && !url.hash && !anchor.target;
		} catch (_) {
			return false;
		}
	}

	document.addEventListener('click', function (e) {
		var anchor = e.target.closest('a');
		if (!anchor) return;
		if (!isInternalLink(anchor)) return;

		// Skip loader for file downloads or PDFs so browser can handle download natively
		var href = anchor.getAttribute('href') || '';
		var isDownload = anchor.hasAttribute('download') || /\.pdf($|\?|#)/i.test(href);
		if (isDownload) return;

		// Don't prevent default - let browser handle navigation naturally
		// This fixes loader getting stuck on page transitions
	});
})();


