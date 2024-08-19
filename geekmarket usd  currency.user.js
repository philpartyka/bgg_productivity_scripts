// ==UserScript==
// @name         Automatic USD Currency filter on BGG market page
// @match        https://boardgamegeek.com/market/browse?objecttype=thing*
// @description  Automatically adds '&currency=USD' to the URL when you visit the boargamegeek market for a particular item
// ==/UserScript==

// @grant none

(function() {
    'use strict';

    // Check if the current URL already contains '&currency=USD'
    if (!window.location.href.includes('&currency=USD')) {
        // Append '&currency=USD' to the URL
        window.location.href += '&currency=USD';
    }
})();