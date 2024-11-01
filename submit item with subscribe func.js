// ==UserScript==
// @name         Auto Submit Item to BGG GeekList
// @version      3.0
// @description  Automatically submit a prefilled item to a BGG GeekList using captured session ID
// @match        *://*.boardgamegeek.com/market/product/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const signature = 'Saturday only, any time\n[size=9][url=https://www.yulgame.com/Vfm/Items/341512?Seller=philfromqueens]Click here to view the rest of my items[/url][/size]';

    // Function to extract SessionID from cookie string
    function extractSessionId(cookieString) {
        const match = cookieString.match(/SessionID=([^;]+)/);
        return match ? match[1] : null;
    }

    // Create a proxy for XMLHttpRequest to capture session ID
    const origXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        if (arguments[1].includes('/api/market/account/sales')) {
            this.addEventListener('load', function() {
                const headers = this.getAllResponseHeaders();
                const setCookieHeader = headers.split('\n')
                    .find(header => header.toLowerCase().startsWith('set-cookie:'));
                if (setCookieHeader) {
                    const sessionId = extractSessionId(setCookieHeader);
                    if (sessionId) {
                        GM_setValue('lastSessionId', sessionId);
                    }
                }
            });
        }
        return origXHR.apply(this, arguments);
    };

    // Monitor using Performance Observer
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
            if (entry.name.includes('/api/market/account/sales')) {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: entry.name,
                    onload: function(response) {
                        const setCookieHeader = response.responseHeaders
                            .split('\n')
                            .find(header => header.toLowerCase().startsWith('set-cookie:'));

                        if (setCookieHeader) {
                            const sessionId = extractSessionId(setCookieHeader);
                            if (sessionId) {
                                GM_setValue('lastSessionId', sessionId);
                            }
                        }
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe({ entryTypes: ['resource'] });

    // Function to subscribe to an item
    async function subscribeToItem(itemId, sessionId) {
        try {
            const response = await fetch(`https://api.geekdo.com/api/listitems/${itemId}/subscriptions`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `GeekAuth ${sessionId}`
                }
            });

            if (response.status === 204) {
                return true;
            }
            throw new Error(`Subscription failed with status: ${response.status}`);
        } catch (error) {
            throw error;
        }
    }

    // Function to extract image IDs from the gallery
    function getImageIds() {
        const imageIds = [];
        const galleryDiv = document.querySelector('div.imagegallery');

        if (galleryDiv) {
            // Find all image URLs in the gallery
            const imageUrls = galleryDiv.innerHTML.match(/pic\d+\.jpg/g);

            if (imageUrls) {
                // Extract unique IDs from the URLs
                const uniqueIds = [...new Set(imageUrls.map(url => {
                    const match = url.match(/pic(\d+)\.jpg/);
                    return match ? match[1] : null;
                }).filter(id => id !== null))];

                return uniqueIds;
            }
        }

        return [];
    }

    // Modified submit function to handle the chain of requests
    async function submitItem() {
        const sessionId = GM_getValue('lastSessionId', null);
        if (!sessionId) {
            alert('Session ID not yet captured. Please try again in a moment.');
            return;
        }

        try {
            // Extract the object ID from the link element
            const linkElement = document.querySelector('a[ng-href*="objectid="]');
            const objectID = linkElement ? linkElement.href.match(/objectid=(\d+)/)?.[1] : null;

            // Get the price from the specified <td> element
            const priceElement = document.evaluate(
                "//tr[td[text()='Price']]/td[2]",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            let price = priceElement ? priceElement.textContent.trim() : "Price not found";

            // Remove ".00" if the price ends with it, leaving a whole number
            if (price.endsWith(".00")) {
                price = price.slice(0, -3);
            }

            // Get the condition (e.g., "New") from the specified <div> element
            const conditionElement = document.querySelector('div.condition-label');
            const condition = conditionElement ? conditionElement.textContent.trim() : "Condition not found";

            // Get the notes (e.g., "in shrink") from the <span> element
            const notesElement = document.evaluate(
                '/html/body/div[2]/div/div/div/div[4]/div/div[6]/div/div/div[2]/span',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            let notes = notesElement ? notesElement.innerHTML.replace(/<br\s*\/?>/gi, '\n').trim() : "";

            // Exclude the notes if they contain the specific unwanted text
            if (notes === "The seller has not provided notes for this product.") {
                notes = "";
            }

            // Get image IDs
            const imageIds = getImageIds();

            // Construct the image ID text for the body
            const imageIdText = imageIds.map(id => `[imageid=${id}]`).join('\n');

            // Construct the body for the payload - now including image IDs after notes
            const bodyContent = `${price}\n${condition}\n${notes}\n${imageIdText ? '\n' + imageIdText : ''}\n\n` + signature;

            // Construct the data payload with the dynamic values
            const data = {
                "item": {
                    "type": "things",
                    "id": objectID  // Using the extracted object ID
                },
                "imageid": null,
                "imageOverridden": false,
                "body": bodyContent,
                "rollsEnabled": false
            };

            // 1. Submit the item
            const submitResponse = await fetch("https://api.geekdo.com/api/geeklists/341512/listitems", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `GeekAuth ${sessionId}`
                },
                body: JSON.stringify(data)
            });

            if (!submitResponse.ok) {
                throw new Error(`Failed to submit item: ${submitResponse.statusText}`);
            }

            // Parse the response to get the item ID
            const responseData = await submitResponse.json();
            const newItemId = responseData.listitem.id;

            if (!newItemId) {
                throw new Error("Could not get item ID from response");
            }

            // Subscribe to the item using the ID from the response
            await subscribeToItem(newItemId, sessionId);

            alert("Item submitted and subscribed successfully!");

        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    // Function to create and add the button to the page
    function addButton() {
        // Target the specific section
        const targetSection = document.evaluate(
            '/html/body/div[2]/div/div/div/div[4]/div/div[2]/div',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (targetSection) {
            // Create the button element
            const button = document.createElement("button");
            button.textContent = "Add to Geeklist";
            button.style.marginLeft = "auto";
            button.style.backgroundColor = "#4CAF50";
            button.style.color = "white";
            button.style.border = "none";
            button.style.borderRadius = "5px";
            button.style.padding = "10px";
            button.style.cursor = "pointer";

            // Add the button to the target section and right-align it
            targetSection.style.display = "flex";             // Make container flexible
            targetSection.style.justifyContent = "flex-end";  // Align button to the right
            targetSection.appendChild(button);

            // Attach the click event listener to the button
            button.addEventListener("click", submitItem);
        } else {
            console.error("Target section not found.");
        }
    }

    // Run the addButton function to add the button to the page
    addButton();

})();