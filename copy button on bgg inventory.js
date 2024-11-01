// ==UserScript==
// @name         BGG Market Copy Button
// @version      1.7
// @description  Adds a copy button to BGG market inventory items with enhanced functionality
// @author       You
// @match        https://boardgamegeek.com/market/account/inventory*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('BGG Market Copy Button script starting...');

    // Store the market data
    let marketData = null;

    // Intercept XMLHttpRequest
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this.addEventListener('load', function() {
            try {
                const data = JSON.parse(this.responseText);
                if (data && data.products && Array.isArray(data.products)) {
                    console.log('Found market data in XHR response:', data);
                    marketData = data;
                    // After getting market data, process the inventory items
                    processInventoryItems();
                }
            } catch (e) {
                // Ignore non-JSON responses
            }
        });
        originalXHR.call(this, method, url, ...rest);
    };

    // Add CSS for the copy button
    function addStyles() {
        GM_addStyle(`
            .btn-copy {
                background-color: #6c757d;
                color: white;
                margin-left: 4px;
            }
            .btn-copy:hover {
                background-color: #5a6268;
                color: white;
            }
        `);
    }

    // Function to format price
    function formatPrice(price) {
        price = price.replace('$', '').trim();
        return price.endsWith('.00') ? price.slice(0, -3) : price;
    }

    // Function to find product data
    function findProductData(itemName) {
        if (!marketData?.products) {
            console.log('No market data available for:', itemName);
            return null;
        }

        const normalizedSearchName = itemName.toLowerCase().trim();
        console.log('Searching for:', normalizedSearchName);
        console.log('Available products:', marketData.products.length);

        const product = marketData.products.find(product => {
            const versionName = product.version?.name?.toLowerCase().trim();
            const objectLinkName = product.objectlink?.name?.toLowerCase().trim();
            return versionName === normalizedSearchName || objectLinkName === normalizedSearchName;
        });

        console.log('Found product:', product);
        return product;
    }

    // Function to create copy button
    function createCopyButton(itemName, price) {
        const copyBtn = document.createElement('a');
        copyBtn.className = 'btn btn-xs btn-copy';
        copyBtn.textContent = 'Copy';
        copyBtn.style.cursor = 'pointer';

        copyBtn.addEventListener('click', function() {
            console.log('Copy button clicked for:', itemName);
            const formattedPrice = formatPrice(price);
            const productData = findProductData(itemName);
            const objectId = productData ? productData.objectid : '';
            const textToCopy = `[thing=${objectId}]${itemName}[/thing] - $${formattedPrice}`;

            console.log('Copying text:', textToCopy);

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 1000);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });

        return copyBtn;
    }

    // Function to process inventory items
    function processInventoryItems() {
        // Wait until the DOM is ready and marketData is available
        if (!document.body || !marketData) {
            setTimeout(processInventoryItems, 50);
            return;
        }

        const inventoryItems = document.querySelectorAll('.inventory-item');
        console.log('Found inventory items:', inventoryItems.length);

        inventoryItems.forEach(item => {
            if (item.querySelector('.btn-copy')) return;

            const nameElement = item.querySelector('.inventory-item-name a');
            if (!nameElement) return;
            const itemName = nameElement.textContent.trim();

            const priceElement = item.querySelector('.inventory-item-price');
            if (!priceElement) return;
            const price = priceElement.textContent.trim();

            const actionGroup = item.querySelector('.inventory-item-action-group');
            if (!actionGroup) return;

            const copyButton = createCopyButton(itemName, price);
            actionGroup.appendChild(copyButton);
        });
    }

    // Add styles after DOM is ready
    function addStylesWhenReady() {
        if (document.body) {
            addStyles();
        } else {
            setTimeout(addStylesWhenReady, 50);
        }
    }

    addStylesWhenReady();

    // Initial processing
    function initialProcessing() {
        if (document.body && marketData) {
            console.log('Performing initial processing...');
            processInventoryItems();
        } else {
            setTimeout(initialProcessing, 50);
        }
    }

    initialProcessing();

    // Set up a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const hasInventoryItems = Array.from(mutation.addedNodes).some(node =>
                    node.nodeType === 1 &&
                    (node.classList?.contains('inventory-item') ||
                     node.querySelector?.('.inventory-item'))
                );
                if (hasInventoryItems) {
                    shouldProcess = true;
                }
            }
        });

        if (shouldProcess) {
            console.log('New inventory items detected, processing...');
            processInventoryItems();
        }
    });

    function startObserving() {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log('Started observing document.body');
        } else {
            // If document.body is not yet available, wait and try again
            setTimeout(startObserving, 50);
        }
    }

    startObserving();

})();
