# Dostyk Restaurant

Created by Yerbol Aiserik from SE-2536.

This is the Midterm version of the Dostyk Restaurant website. The project continues the same restaurant theme, the same repository, and the same three pages, but the pages are now finished as one connected site and prepared for later JavaScript work.

## Pages

- `index.html` - home page with restaurant introduction, real photos, contact information, and links to the menu and order pages.
- `menu.html` - menu page with real categories, dishes, prices, category links, quantity fields, and an order button.
- `order.html` - order and booking page with a complete form, required fields, exact time, service choices, table booking options, extra options, and a visible confirmation area.

## User Journeys

1. Menu journey: the visitor starts on `index.html`, reads about the restaurant, clicks `Ас мәзірін көру`, opens `menu.html`, compares food categories and prices, chooses dish quantities in the basket form, then submits the basket to `order.html`.

2. Delivery order journey: the visitor opens `order.html`, enters name, email, phone, date, exact delivery time, portion count, food choice, service type, extra foods and drinks, then submits the form and reaches the confirmation area.

3. Table booking journey: the visitor opens `order.html`, chooses `Дәмханада жеймін`, selects the date, time, guest count and a 2, 3 or 4 person table, then submits the form and reaches the confirmation area.

## JavaScript Preparation

- The order form has `id="order-request-form"`.
- The menu basket form has `id="menu-cart-form"`.
- The submit and reset buttons have `id="submit-order"` and `id="reset-order"`.
- The menu submit button has `id="submit-cart"` and quantity fields use `qty_*` ids for later JavaScript.
- The order result area has `id="order-confirmation"`.
- Form inputs already have ids and names for later JavaScript, including `preferred_time`, `guest_count`, and `table_zone`.
- CSS includes state classes for later JavaScript: `.hidden`, `.selected`, `.success`, and `.error`.

## CSS Files

- `css/base.css` - shared correction layer for Dostyk colours, fonts, header, footer, buttons, photo borders, and skip link.
- `css/aiserik.css` - small correction layer for hero note, card images, menu lists, prices, promo code, and JavaScript-ready state classes.

Bootstrap does the main layout, spacing, navigation, grid, cards, buttons, and form styling. My own CSS stays short and only corrects project-specific details.

## Quality Pass List

- Removed unfinished `href="#"` and `action="#"` logic.
- Checked that every navigation link leads to a real page or real section.
- Checked that all three pages use the same navbar, footer, colours, and Bootstrap layout style.
- Added a visible order confirmation area so the form flow has an ending.
- Added exact time and table booking fields so delivery and booking paths are complete.
- Limited portion count and guest count to 10.
- Added extra food choices and a separate drinks section to the order form.
- Added a menu basket form with quantity fields so dishes can be selected before going to the order page.
- Added JavaScript-ready ids and state classes for the next assignment.
- Removed placeholder text from form fields; labels now explain each input.
- Kept real restaurant content, prices, phone number, address, and photos.

## Bootstrap Notes

- Bootstrap 5.3.3 is linked from CDN on every page.
- Every page has a responsive Bootstrap navbar with a working toggler.
- The project uses both `container-fluid` and `container`.
- The pages use Bootstrap `row` and `col-*` classes for responsive layout.
- The order form shows a nested Bootstrap `row` inside a `col-12` column.
- The project uses Bootstrap cards, alerts, buttons, and form classes.
- `bootstrap.md` explains which old CSS rules Bootstrap replaced.

## Local Use

Open `index.html` in a browser. No hosting or domain is required.

## Assignment 4-5: JavaScript

### Midterm correction (documented before use, no points)

These HTML/CSS changes were made after the `midterm` tag and before the JavaScript work. They are committed separately as a midterm correction, because the cart and the feedback flow need them:

- `menu.html` - the menu was changed to Bootstrap dish cards (`.menu-product`) with a basket form (`#menu-cart-form`), a category list (`.menu-category-nav`) and a cart panel (`#cart`, `#cart-items`, `#cart-total`, `#submit-cart`).
- `index.html`, `menu.html`, `order.html` - the footer got a feedback form (`#feedback-form`, `#feedback_text`, `#feedback-result`).
- `css/aiserik.css` - rules for the new blocks: `.menu-category-nav`, `.menu-product`, `.menu-qty`, `.cart-panel`, `.cart-empty`, `.feedback-box`.

After this correction HTML and CSS are frozen. The only later HTML change is the `<script src="js/..." defer>` links at the end of each page. All new interface elements (search controls, address fields, summary, error messages, review cards) are created with JavaScript DOM methods. No CSS rules were added after the correction; states use `classList` with Bootstrap classes and the midterm classes (`.selected`, `.success`, `.error`).

### JavaScript files

- `js/data.js` - arrays: `categories`, `menuItems` (44 dishes), `deliveryDistricts`, `promoCodes`, `reviews`.
- `js/main.js` - shared helpers, cart storage, review card function, footer feedback form (all pages).
- `js/index.js` - home page reviews and "open now" status.
- `js/menu.js` - menu search / category / sort, random suggestion, cart.
- `js/order.js` - checkout of the saved cart: delivery address, delivery price, minimum order, promo code, "add to order" suggestions, live summary, validation, demonstration confirmation.

### Functionality Plan

| Page | Visitor goal | Planned function | Expected result | Student |
|------|--------------|------------------|-----------------|---------|
| menu.html | Find a dish quickly | Search + category + sort controls, count, no-results state, reset | Only matching dishes are shown with a count | Yerbol Aiserik |
| menu.html | Collect dishes and see the price | Cart: add, +/-, remove, clear, totals, disabled checkout when empty | Correct subtotals, quantity and total after every change | Yerbol Aiserik |
| menu.html | Get an idea what to order | Random "today's suggestion" with `Math.random()` | One main dish / fast food is suggested, no discount promised | Yerbol Aiserik |
| order.html | Order the dishes chosen on the menu | Saved cart with +/-/remove, "add to order" suggestions (`Math.random()`), promo code KHAN2552 | Cart from menu.html appears here, total changes after every action | Yerbol Aiserik |
| order.html | Get food delivered | Address fields (district, street, house, flat, entrance, floor, intercom), delivery price by district, minimum order 3 000 ₸ | Delivery price is added, small orders are stopped with a message | Yerbol Aiserik |
| order.html | Know the price before sending | Live summary of dish, extras, drinks and menu cart | Total updates on every change | Yerbol Aiserik |
| order.html | Send an order / table request | Validation of 8+ fields, errors beside fields, focus on first error | Summary with demo reference number, no data sent | Yerbol Aiserik |
| all pages (shared) | Leave feedback | Footer form with validation and character counter | Message in the form, review card on the home page | Yerbol Aiserik |
| index.html | Read guest opinions, check if open | Review cards from one function, "open now" status | Cards sorted newest first, status text by hour | Yerbol Aiserik |

### Notes

- Prices with two sizes (for example water 0.5 l / 1 l) get a size select in the card, so the cart uses the real price of the chosen size.
- In the order summary the extras and drinks use the first (smaller) size price.
- Delivery prices: Оңтүстік-Шығыс (Юго-Восток, where the restaurant is) - 500 ₸, Күнгей - 700 ₸, Қала орталығы (Центр) - 800 ₸, Михайловка - 900 ₸, Сұрыптау (Сортировка) - 1 000 ₸, Майқұдық and Пришахтинск - 1 200 ₸. Minimum delivery order: 3 000 ₸ of food. Promo code KHAN2552 (from the footer) gives 10% off the food price. These values are in `js/data.js` and `js/order.js`.
- On `order.html` the "Мекенжай немесе ескерту" textarea label is changed by JavaScript to "Тапсырыс пікірі", because the address now has its own fields.
- The reference number (`DK-1234`) is only a demonstration number made with `Math.random()`; no real order, booking or payment is created and nothing is sent to a server.
- The three guest reviews in `js/data.js` are sample content for the demonstration.
- Dish photos: all 44 dishes have a photo in `images/menu/`, named by the dish id (for example `images/menu/sorpa.jpg`). The photos were resized to 800 px wide (about 12-46 KB each) so the menu loads fast. The path is in the `image` property in `js/data.js`; an empty `image` would show the card without a photo.
- The cart is kept in `localStorage`: it is filled on `menu.html` and ordered only on `order.html` (it is emptied after the demo confirmation). New reviews are also in `localStorage`. No passwords or personal data are stored.
