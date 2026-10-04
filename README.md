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
