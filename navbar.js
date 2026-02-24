// navbar.js
// This script standardizes the navigation bar across all pages.
// It detects whether it's running in the root or a subdirectory based on how it was included.

(function() {
    // Capture the script element that loaded this file to check for relative paths (e.g., "../navbar.js")
    const currentScript = document.currentScript;
    const isSubfolder = currentScript && currentScript.getAttribute('src').includes('../');

    document.addEventListener('DOMContentLoaded', function() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Clear existing content to avoid duplication if any
        nav.innerHTML = '';

        // Define base links
        const links = [
            { text: 'Card Index', href: 'index.html' },
            { text: 'Tournaments/Meta', href: 'tournaments.html' },
            { text: 'Deck Builder', href: 'deckbuilder.html' }
        ];

        // Determine current page filename for active state
        const path = window.location.pathname;
        const currentPage = path.split('/').pop() || 'index.html';

        links.forEach(link => {
            const a = document.createElement('a');
            a.textContent = link.text;

            // Adjust href if in a subfolder
            if (isSubfolder) {
                a.href = '../' + link.href;
            } else {
                a.href = link.href;
            }

            // Check if this link corresponds to the current page
            // Logic: if the href (without ../) matches the current page filename
            if (link.href === currentPage) {
                a.classList.add('active');
            }

            nav.appendChild(a);
        });
    });
})();
