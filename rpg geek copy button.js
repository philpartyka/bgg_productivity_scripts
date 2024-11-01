// ==UserScript==
// @name         RPGGeek Copy Button
// @version      1.4
// @description  Adds a copy button to RPGGeek item pages before the settings button
// @author
// @match        *://*.rpggeek.com/rpgitem/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('RPGGeek Copy Button script started');

    // Function to wait for an element to exist
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => waitForElement(selector, callback), 100);
        }
    }

    // Wait for the action container element
    waitForElement('.game-header-secondary-actions.hidden-game-header-collapsed', function(actionContainer) {
        console.log('Action container found');

        // Get the settings button
        const settingsButton = actionContainer.querySelector('button[edit-geek-item-settings]');
        if (!settingsButton) {
            console.error('Settings button not found');
            return;
        }
        console.log('Settings button found');

        // Get the item name
        const nameElement = document.querySelector('span[itemprop="name"]');
        if (!nameElement) {
            console.error('Item name element not found');
            return;
        }
        const itemName = nameElement.textContent.trim();
        console.log('Item Name:', itemName);

        // Get the item id from the URL
        const href = window.location.pathname; // e.g., '/rpgitem/276951/imp-of-the-perverse'
        const itemIdMatch = href.match(/\/rpgitem\/(\d+)/);
        if (!itemIdMatch) {
            console.error('Item ID not found in URL:', href);
            return;
        }
        const itemId = itemIdMatch[1];
        console.log('Item ID:', itemId);

        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'C';
        copyButton.className = 'btn btn-xs btn-white';
        copyButton.style.marginRight = '5px';

        // Add click event listener
        copyButton.addEventListener('click', function() {
            const textToCopy = `[thing=${itemId}]${itemName}[/thing] - `;
            navigator.clipboard.writeText(textToCopy).then(() => {
                console.log('Copied to clipboard:', textToCopy);
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'C';
                }, 1000);
            }).catch(err => {
                console.error('Failed to copy text:', err);
            });
        });

        // Insert the copy button before the settings button
        actionContainer.insertBefore(copyButton, settingsButton);

        console.log('Copy button added before the settings button');
    });

})();
