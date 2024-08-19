// ==UserScript==
// @name         BGG geekmail Reply Presets
// @version      1
// @description  Adds buttons when responding to a geekmail so that common replies can pasted with the push of a button.  Before any button is pressed, two empty lines are added above the existing text in the text box, because I always found it annoying to squeeze my cursor into the perfect spot without breaking the quoted text.
// @author       philfromqueens
// @match        https://boardgamegeek.com/geekmail
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require      https://gist.githubusercontent.com/BrockA/2625891/raw/waitForKeyElements.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to fetch price from API
    function fetchPrice(productId, callback) {
        var apiUrl = `https://api.geekdo.com/api/market/products/${productId}`;
        $.get(apiUrl, function(response) {
            if (response && response.price) {
                callback(null, response.price);
            } else {
                callback('Error fetching price');
            }
        }).fail(function() {
            callback('Error fetching price');
        });
    }

    // Function to create and show the popup window for the shipping estimate button.
    function showPopup(productPrice, callback) {
        var popup = $('<div></div>').css({
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'padding': '20px',
            'background-color': '#fff',
            'box-shadow': '0 0 10px rgba(0,0,0,0.5)',
            'z-index': '10000'
        });

        var shippingLabel = $('<label>Shipping: </label>').css({'display': 'block', 'margin-bottom': '10px'});
        var shippingInput = $('<input type="text" id="shippingInput">').css({'width': '100%', 'margin-bottom': '10px'});

        var itemLabel = $('<label>Item: </label>').css({'display': 'block', 'margin-bottom': '10px'});
        var itemInput = $('<input type="text" id="itemInput">').css({'width': '100%', 'margin-bottom': '20px'});
        if (productPrice) {
            itemInput.val(productPrice);
        }

        var submitButton = $('<button>Submit</button>').css({
            'padding': '10px 20px',
            'background-color': '#007bff',
            'color': 'white',
            'border': 'none',
            'border-radius': '3px',
            'cursor': 'pointer'
        });

        submitButton.on('click', function() {
            var shippingValue = parseFloat(shippingInput.val());
            var itemValue = parseFloat(itemInput.val());

            if (isNaN(shippingValue) || isNaN(itemValue)) {
                callback(false, 'Shipping will be $XXX for $YYY total.  If interested send payment via paypal to crappytheclown@gmail.com.\n');
            } else {
                var totalValue = shippingValue + itemValue;
                var shippingText = '$' + shippingValue.toFixed(2).replace(/\.00$/, '');
                var totalText = '$' + totalValue.toFixed(2).replace(/\.00$/, '');
                var message = 'Shipping will be ' + shippingText + ' for ' + totalText + ' total.  If interested send payment via paypal to crappytheclown@gmail.com.\n';
                callback(true, message);
            }

            popup.remove();
        });

        popup.append(shippingLabel, shippingInput, itemLabel, itemInput, submitButton);
        $('body').append(popup);

        shippingInput.focus();
    }


    function showPromoPopup(callback) {
        var popup = $('<div></div>').css({
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'padding': '20px',
            'background-color': '#fff',
            'box-shadow': '0 0 10px rgba(0,0,0,0.5)',
            'z-index': '10000'
        });

        var shippingLabel = $('<label>Shipping: </label>').css({'display': 'block', 'margin-bottom': '10px'});
        var shippingInput = $('<input type="text" id="shippingInput">').css({'width': '100%', 'margin-bottom': '10px'});

        var noZipCodeContainer = $('<div></div>').css({'display': 'flex', 'align-items': 'center', 'margin-bottom': '10px'});
        var noZipCodeCheckbox = $('<input type="checkbox" id="noZipCodeCheckbox">').css({'margin-right': '10px'});
        var noZipCodeLabel = $('<label for="noZipCodeCheckbox">No zip code</label>');

        var itemLabel = $('<label>Item: </label>').css({'display': 'block', 'margin-bottom': '10px'});
        var itemInput = $('<input type="text" id="itemInput">').css({'width': '100%', 'margin-bottom': '20px'});

        var submitButton = $('<button>Submit</button>').css({
            'padding': '10px 20px',
            'background-color': '#007bff',
            'color': 'white',
            'border': 'none',
            'border-radius': '3px',
            'cursor': 'pointer'
        });

        submitButton.on('click', function() {
            var shippingValue = parseFloat(shippingInput.val());
            var itemValue = parseFloat(itemInput.val());
            var noZipCodeChecked = noZipCodeCheckbox.is(':checked');

            if (isNaN(itemValue)) {
                callback(false, 'Shipping will be $XXX for $YYY total.  If interested send payment via paypal to crappytheclown@gmail.com.\n');
            } else if (noZipCodeChecked) {
                var totalValue = itemValue + 0.70;
                var totalText = '$' + totalValue.toFixed(2).replace(/\.00$/, '');
                var message = 'Since its just a card, I can ship it in an envelope between two thin pieces of cardboard for the cost of a stamp ($0.70), so ' + totalText + ' total. There would be no tracking with this option. If interested in this option, send payment via paypal to crappytheclown@gmail.com\n\n' +
                              'Otherwise, I can ship it between two thicker pieces of cardboard in a padded envelope for around $4-5 in addition to the cost of the item. This option will have tracking. If you\'re interested in this shipping method then please send your zip code.';
                callback(true, message);
            } else if (!isNaN(shippingValue)) {
                var totalValue = shippingValue + itemValue;
                var shippingText = '$' + shippingValue.toFixed(2).replace(/\.00$/, '');
                var totalText = '$' + totalValue.toFixed(2).replace(/\.00$/, '');
                var message = 'Since its just a card, I can ship it in an envelope between two thin pieces of cardboard for the cost of a stamp ($0.70), so ' + (itemValue + 0.70).toFixed(2).replace(/\.00$/, '') + ' total. There would be no tracking with this option.\n\n' +
                              'Otherwise, I can ship it between two thicker pieces of cardboard in a padded envelope but the cost will be ' + shippingText + ' for ' + totalText + ' total. This option will have tracking.\n\n' +
                              'If interested, send payment for the preferred shipping method via paypal to crappytheclown@gmail.com';
                callback(true, message);
            } else {
                callback(false, 'Shipping will be $XXX for $YYY total.  If interested send payment via paypal to crappytheclown@gmail.com.\n');
            }

            popup.remove();
        });

        noZipCodeContainer.append(noZipCodeCheckbox, noZipCodeLabel);
        popup.append(shippingLabel, shippingInput, noZipCodeContainer, itemLabel, itemInput, submitButton);
        $('body').append(popup);

        shippingInput.focus();
    }


    // Function to create and show the popup window for the "Away" button
    function showAwayPopup(callback) {
        var popup = $('<div></div>').css({
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'padding': '20px',
            'background-color': '#fff',
            'box-shadow': '0 0 10px rgba(0,0,0,0.5)',
            'z-index': '10000'
        });

        var daysRow = $('<div></div>').css({
            'display': 'flex',
            'justify-content': 'space-between',
            'margin-bottom': '10px'
        });

        var days = [
            { short: 'Su', full: 'Sunday' },
            { short: 'M', full: 'Monday' },
            { short: 'Tu', full: 'Tuesday' },
            { short: 'W', full: 'Wednesday' },
            { short: 'Th', full: 'Thursday' },
            { short: 'F', full: 'Friday' },
            { short: 'Sa', full: 'Saturday' }
        ];

        days.forEach(function(day) {
            var dayButton = $('<button></button>').text(day.short).css({
                'padding': '5px 10px',
                'background-color': '#f8f9fa',
                'border': '1px solid #ddd',
                'border-radius': '3px',
                'cursor': 'pointer',
                'flex': '1',
                'margin': '0 2px'
            });

            dayButton.on('click', function() {
                var message = `Sorry I'm away until ${day.full}. I will get back to you then.\n`;
                callback(true, message);
                popup.remove();
            });

            daysRow.append(dayButton);
        });

        var orText = $('<div>or</div>').css({
            'text-align': 'center',
            'margin': '10px 0'
        });

        var monthLabel = $('<label>Month: </label>').css({'display': 'block', 'margin-bottom': '10px'});
        var monthSelect = $('<select id="monthSelect"></select>').css({'width': '100%', 'margin-bottom': '10px'});
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var currentMonth = new Date().getMonth();
        months.forEach(function(month, index) {
            monthSelect.append($('<option></option>').val(month).text(month));
        });
        monthSelect.val(months[currentMonth]);

        var dateLabel = $('<label>Date: </label>').css({'display': 'block', 'margin-bottom': '10px'});
        var dateSelect = $('<select id="dateSelect"></select>').css({'width': '100%', 'margin-bottom': '20px'});
        for (var i = 1; i <= 31; i++) {
            dateSelect.append($('<option></option>').val(i).text(i));
        }

        var submitButton = $('<button>Submit</button>').css({
            'padding': '10px 20px',
            'background-color': '#007bff',
            'color': 'white',
            'border': 'none',
            'border-radius': '3px',
            'cursor': 'pointer'
        });

        submitButton.on('click', function() {
            var selectedMonth = monthSelect.val();
            var selectedDate = parseInt(dateSelect.val());
            var currentDate = new Date();
            var selectedFullDate = new Date(currentDate.getFullYear(), months.indexOf(selectedMonth), selectedDate);
            var timeDiff = selectedFullDate - currentDate;
            var dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var message = `Sorry I'm away until ${selectedMonth} ${selectedDate} (${dayDiff} days). I will get back to you then.\n`;

            callback(true, message);
            popup.remove();
        });

        popup.append(daysRow, orText, monthLabel, monthSelect, dateLabel, dateSelect, submitButton);
        $('body').append(popup);

        monthSelect.focus();
    }


    // Function to create and show the popup window for the "Tracking" button
    function showTrackingPopup(callback) {
        var popup = $('<div></div>').css({
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'padding': '20px',
            'background-color': '#fff',
            'box-shadow': '0 0 10px rgba(0,0,0,0.5)',
            'z-index': '10000'
        });

        var trackingLabel = $('<label>Tracking Number: </label>').css({'display': 'block', 'margin-bottom': '10px'});
        var trackingInput = $('<input type="text" id="trackingInput" maxlength="30">').css({'width': '100%', 'margin-bottom': '20px'});

        var submitButton = $('<button>Submit</button>').css({
            'padding': '10px 20px',
            'background-color': '#007bff',
            'color': 'white',
            'border': 'none',
            'border-radius': '3px',
            'cursor': 'pointer'
        });

        submitButton.on('click', function() {
            var trackingNumber = trackingInput.val().trim();
            var shippingService = '';
            var trackingLink = '';

            if (trackingNumber.startsWith('1Z')) {
                shippingService = 'UPS';
                trackingLink = `https://www.ups.com/track?AgreeToTermsAndConditions=yes&loc=en_US&tracknum=${trackingNumber}&requester=ST/trackdetails`;
            } else if (trackingNumber.startsWith('94')) {
                shippingService = 'USPS';
                trackingLink = `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${trackingNumber}`;
            } else if (trackingNumber.startsWith('AHOY')) {
                shippingService = 'Asendia USA';
                trackingLink = `https://a1.asendiausa.com/tracking/?trackingnumber=${trackingNumber}`;
            } else {
                shippingService = 'Fedex';
                trackingLink = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
            }

            var message = `${trackingNumber}\n\nShipped via [url=${trackingLink}]${shippingService}[/url]\n\nEnjoy!\n`;


            callback(true, message);
            popup.remove();
        });

        popup.append(trackingLabel, trackingInput, submitButton);
        $('body').append(popup);

        trackingInput.focus();
    }

    // Function to add the buttons above the target element
    function addButtons() {
        // Button configurations.  The first part is what is displayed on the button.  The second part is what is printed in the text box when the button is clicked.
        var buttonsConfig = [
            { text: 'shipping est', message: 'Shipping will be $XXX for $YYY total.  If interested send payment via paypal to crappytheclown@gmail.com.\n', popup: true },
            { text: 'tracking', popup: true, tracking: true },
            { text: 'promo', popup: true, promo: true },
            { text: 'zip?', message: 'Yes its available, what is your Zip Code?\n' },
            { text: 'pending', message: 'Sorry, the item is currently pending.  I will let you know if it becomes available.\n' },
            { text: 'away', popup: true, away: true }
        ];

        // Container for buttons
        var buttonContainer = $('<div></div>');

        // Create and style buttons
        buttonsConfig.forEach(function(config) {
            var button = $('<button></button>').text(config.text);
            button.css({
                'margin': '0 5px 10px 0',
                'padding': '5px 10px',
                'background-color': '#007bff',
                'color': 'white',
                'border': 'none',
                'border-radius': '3px',
                'cursor': 'pointer'
            });

            // Add click event listener to the button
            button.on('click', function() {
                if (config.popup && config.away) {
                    showAwayPopup(function(success, message) {
                        // Get the textarea element
                        var textarea = $('textarea#body.post-editor__textarea');
                        // Get the current text in the textarea
                        var currentText = textarea.val();
                        // Set the new text, adding the message before the existing text
                        textarea.val(message + currentText);
                    });
                } else if (config.popup && config.tracking) {
                    showTrackingPopup(function(success, message) {
                        // Get the textarea element
                        var textarea = $('textarea#body.post-editor__textarea');
                        // Get the current text in the textarea
                        var currentText = textarea.val();
                        // Set the new text, adding the message before the existing text
                        textarea.val(message + currentText);
                    });
                } else if (config.popup && config.promo) {
                    showPromoPopup(function(success, message) {
                        // Get the textarea element
                        var textarea = $('textarea#body.post-editor__textarea');
                        // Get the current text in the textarea
                        var currentText = textarea.val();
                        // Set the new text, adding the message before the existing text
                        textarea.val(message + currentText);
                    });
                } else if (config.popup) {
                        var textarea = $('textarea#body.post-editor__textarea');
                        var currentText = textarea.val();
                        var match = currentText.match(/The above message was sent regarding your GeekMarket Listing \[geekurl=\/market\/product\/(\d+)\]/);
                        if (match) {
                            var productId = match[1];
                            fetchPrice(productId, function(error, price) {
                                var productPrice = error ? '' : price;
                                showPopup(productPrice, function(success, message) {
                                    // Get the current text in the textarea
                                    var currentText = textarea.val();
                                    // Set the new text, adding the message before the existing text
                                    textarea.val(message + currentText);
                                });
                            });
                        } else {
                            showPopup('', function(success, message) {
                                // Get the current text in the textarea
                                var currentText = textarea.val();
                                // Set the new text, adding the message before the existing text
                                textarea.val(message + currentText);
                            });
                        }
                } else {
                    // Get the textarea element
                    var textarea = $('textarea#body.post-editor__textarea');
                    // Get the current text in the textarea
                    var currentText = textarea.val();
                    // Set the new text, adding the message before the existing text
                    textarea.val(config.message + currentText);
                }
            });

            // Append button to container
            buttonContainer.append(button);
        });

        // Insert the button container above the target element
        $('textarea#body.post-editor__textarea').before(buttonContainer);
    }

    // Function to add two new lines to the textarea automatically
    function addNewLines() {
        // Get the textarea element
        var textarea = $('textarea#body.post-editor__textarea');
        // Get the current text in the textarea
        var currentText = textarea.val();
        // Set the new text with two new lines before the existing text
        textarea.val('\n\n' + currentText);
    }

    // Use waitForKeyElements to monitor the appearance of the textarea
    waitForKeyElements("textarea#body.post-editor__textarea", function() {
        addNewLines();
        addButtons();
    });
})();
