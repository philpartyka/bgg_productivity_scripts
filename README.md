# BoardGameGeek Productivity Suite of UserScripts
A collection of userscripts that I created to help me with the useability of the BoardGameGeek website.  Userscripts can be loaded into Tampermonkey or Violentmonkey.  

There are four different scripts in this collection:
- Geekmail Message Presets
- Version Page automatically switches to English filter
- The GeekMarket pages automatically switches to USD currency filter
- The GeekMarket's Price History page automatically switches to USD currency filter

Although some of these seem redundant, each of them required a different solution to achieve a similar result.  

The Geekmail Message Presets is the most robust of the scripts.  It adds buttons above the text input area when writing a geekmail.  These buttons, when pressed, paste a message into the text box.  This saves time by pasting common messages with the press of a button.  Some example messages:
- A box that pops up where you input the shipping estimate for the item and the item's price so that a message with both will be pasted along with payment information.  The item price info is automatically filled in based on the item being inquired about.
- A box that pops up where you input the tracking number and based on the number format a message is pasted on the service used and a link is pasted to the url of the tracking number's current status.
- An "I'm away" message with a date selection option so the exact return date is provided.
- "Yes, its available.  What is your zip code?" ...in response to the default is this item available question
- "Sorry, this item is pending, I will get back to you if its available"

## Future plans
- I will combine all these scripts into one big userscript.  This one userscript will allow the users to enable or disable certain features.
- I want to let the user add and create their own messages and buttons on the geekmail script
- allow the user to choose their default currency and language to view on their respective pages

## Examples of the Message presets
Comparison of the Message page without the script and with the script enabled
![comparison](screenshots/message%20preset%20comparison.png)
Shipping popup (with price prefilled from the listing mentioned in the message body)
![shipping](screenshots/shipping%20popup.png)
Tracking Popup 
![tracking](screenshots/tracking%20popup.png)
Away Popup (for when I will be away for X days)
![away](screenshots/away%20popup.png)
