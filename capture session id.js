// ==UserScript==
// @name         Session ID Capture
// @version      1
// @description  Capture session ID by proxying XHR requests
// @author       You
// @match        *://*.boardgamegeek.com/market/product/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log('[DEBUG] Script starting...');

    // Function to extract SessionID from cookie string
    function extractSessionId(cookieString) {
        const match = cookieString.match(/SessionID=([^;]+)/);
        if (match) {
            const sessionId = match[1];
            console.log('Found SessionID:', sessionId);
            GM_setValue('lastSessionId', sessionId);
            showNotification(`SessionID captured: ${sessionId}`);
            return sessionId;
        }
        return null;
    }

    // Notification helper
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // Create a proxy for XMLHttpRequest
    const origXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        if (arguments[1].includes('/api/market/account/sales')) {
            console.log('[DEBUG] Target XHR intercepted:', arguments[1]);
        }

        // Add listeners before calling original open
        this.addEventListener('load', function() {
            if (this.responseURL.includes('/api/market/account/sales')) {
                const headers = this.getAllResponseHeaders();
                console.log('Headers received:', headers);
            }
        });

        // Call original open method
        return origXHR.apply(this, arguments);
    };

    // Monitor using Performance Observer
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
            if (entry.name.includes('/api/market/account/sales')) {
                // Make a new request to get headers
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: entry.name,
                    onload: function(response) {
                        const setCookieHeader = response.responseHeaders
                            .split('\n')
                            .find(header => header.toLowerCase().startsWith('set-cookie:'));

                        if (setCookieHeader) {
                            extractSessionId(setCookieHeader);
                        }
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe({ entryTypes: ['resource'] });

    // Add menu commands
    GM_registerMenuCommand('Show Current SessionID', function() {
        const sessionId = GM_getValue('lastSessionId', '');
        alert(sessionId ? `Current SessionID: ${sessionId}` : 'No SessionID captured yet');
    });

    GM_registerMenuCommand('Copy SessionID to Clipboard', function() {
        const sessionId = GM_getValue('lastSessionId', '');
        if (sessionId) {
            navigator.clipboard.writeText(sessionId)
                .then(() => showNotification('SessionID copied to clipboard'))
                .catch(() => alert('Failed to copy to clipboard'));
        } else {
            alert('No SessionID captured yet');
        }
    });

    console.log('[DEBUG] Script initialization complete');
})();