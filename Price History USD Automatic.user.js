// ==UserScript==
// @name         Automatic USD Currency Filter to BGG item price history
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  When you visit the price history page of an item on boardgamegeek.com this script displays only the past USD sales.  It does this by simulating a click on the Currency dropdown menu and then clicking the US Dollars option.
// @author       You
// @match        https://boardgamegeek.com/market/pricehistory/thing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to click on dropdown and select "U.S. Dollars"
    function selectUSD() {
        // Wait for the dropdown to appear
        var dropdownInterval = setInterval(function() {
            var dropdownMenu = document.querySelector('.btn-group.open ul.dropdown-menu');
            if (dropdownMenu) {
                clearInterval(dropdownInterval); // Stop checking once found
                // Find the list item for "U.S. Dollars" and click it
                var usDollarsOption = dropdownMenu.querySelector('li.ng-scope:nth-child(1) a.ng-binding');
                if (usDollarsOption) {
                    usDollarsOption.click();
                }
            }
        }, 100); // Check every 100ms for dropdown menu
    }

    // Function to initiate the script when both elements are ready
    function initiateScript() {
        // Select the second .btn-group dropdown
        var dropdown = document.querySelectorAll('.btn-group')[2];

        if (dropdown) {
            // Click on the dropdown toggle button
            var toggleButton = dropdown.querySelector('.btn.dropdown-toggle');
            if (toggleButton) {
                toggleButton.click();
                // Call function to select "U.S. Dollars" after dropdown is clicked
                selectUSD();
            }
        }
    }

    // Wait for the page to fully load before initiating the script
    window.addEventListener('load', function() {
        initiateScript();
    });

})();
