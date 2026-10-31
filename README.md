# Dostyk Restaurant

Yerbol Aiserik, SE-2536. Assignment 4 jQuery study version of the same restaurant project, continuing the existing pages and 44 dishes.

## Pages and journeys

- `index.html`: introduction, existing restaurant photos, hours and contacts.
- `menu.html`: 44 dishes, search, category filtering, price sorting, size choices, suggestions and cart controls.
- `order.html`: saved cart checkout, direct food choices, extras/drinks, address fields, delivery fees, promo, pickup and table booking.
- All pages: footer feedback with validation, character counter and local storage.

1. Home -> Menu -> search/filter -> choose size -> add food -> adjust cart -> Order.
2. Order -> delivery or pickup -> customer/date/time/address -> check total and optional promo -> submit -> demo confirmation.
3. Order -> dine-in -> customer/date/time/guests/table -> capacity validation -> demo booking confirmation. Food is optional for booking.

## Scripts

- `js/data.js`: existing categories, 44 menu records, district fees, promo codes and sample review arrays.
- `js/jquery-app.js`: active implementation for every page, inside `$(function () { ... })`.
- `js/old-js-version.js`: pre-migration copies of the four original interaction files in separate scopes. Not linked to any page; kept for comparison.
- `js/main.js`, `js/index.js`, `js/menu.js`, `js/order.js`: retained original scripts, no longer loaded.

Every page loads the full jQuery 3.7.1 build from the official CDN before the application script. The full build provides effects. Only script references changed in the existing HTML; CSS files are unchanged. New controls, cards, lists, errors and summary blocks are created in code.

## Assignment 4 requirement map

| Requirement | Implementation |
| --- | --- |
| Rewrite three previous features | Feedback validation, array-built menu/reviews, service field visibility; comparison comments beside these features |
| Selectors | id `#menu-cart-form`, class `.menu-product`, elements `input, select, textarea`, attributes `[data-action]`, filters `:checked`, `:selected`, `:not(...)` |
| Traversal | `.find()` reads size choices, `.closest()` reaches cards/rows, `.parent()` finds field wrappers, `.siblings()` updates categories, `.each()` handles fields/cards |
| Two chains of at least three methods | `message()` has a commented chain; field-error and active-category updates also chain methods |
| DOM methods | `.text()` for all visitor text; `.html()` for fixed trusted demo notice; `.val()` for inputs; `.attr()` for identifiers/labels; `.prop()` for live required/disabled states |
| Events | Every handler uses `.on()`; click, input, change, submit, reset, keydown and storage events |
| Delegation | Stable menu/cart parents handle buttons created by card/list rendering; explanation comment near the menu handler |
| Effects | `.fadeIn()` reveals feedback/cart notices; `.fadeOut()` removes a cart row with a callback; `.slideUp()`/`.slideDown()` switch service fields and reveal confirmation |
| Validation | Trimmed values, per-field errors, email/phone/date/time/quantity checks, address rules, table capacity, errors rechecked while editing, reset after valid submission |

`.text()` inserts literal text. `.html()` parses markup, so it must never receive feedback or other untrusted values. `.attr('checked')` describes a checkbox's original HTML attribute, while `.prop('checked')` reads its current state. `.prop('required')` and `.prop('disabled')` control current form behavior. Browser checks improve usability; a production server must validate every value again.

The old comparison file contains the original feature names `setupFeedbackForm`, `createMenuCard`/`renderReviews`, `updateServiceFields` and `validateOrder`. Pure calculations and storage still use ordinary JavaScript; active DOM interactions use jQuery consistently.

## Rules and limitations

- Cart: 1–20 portions per dish/size. Main-form portions and guests: 1–10. Table capacity is checked separately (2, 3 or 4 seats).
- Multi-price items retain size selections, so cart totals use a definite price.
- Delivery food minimum: 3,000 tenge. Existing district fees are retained. KHAN2552 discounts food by 10%.
- Dates: today through 30 days ahead. Hours: 10:00–22:00. Past date/time is rejected.
- A saved cart can be checked out without choosing a duplicate main dish.
- Orders/bookings are demonstrations, not real restaurant requests. No payment is taken or personal order data stored. Confirmation explains this.
- Feedback and cart are stored in this browser. Feedback is not sent to administration. The public guest-review section has been removed; feedback still shows a result after submission.
- Existing content/photos are retained; the author should verify restaurant facts, pricing rules and photo ownership before real use.

## Verification

The local review copy includes `check-browser.cjs` as a development check rather than a runtime dependency. It covers filtering, cart actions and sizes, saved-cart checkout, delivery/promo calculations, validation/reset, booking without food, capacity and safe feedback. It checks all pages at 375, 768 and 1440 pixels, broken images, duplicate ids and browser errors. Official CDN assets are cached temporarily for repeatable tests.

Rerun the W3C validator on each HTML page before submission. No commits, tags or pushes are created automatically. Keep the existing `midterm` tag unchanged. Assignment 4 requires at least four meaningful commits across three different days (six commits if working alone), updated README and AI log, jQuery files and the unlinked original version. Defense is live; no report or recording is requested.

## AI assistance

The supplied assignment permits AI explanations but prohibits AI-written submission code. This AI-assisted implementation is a study/review version. The AI log records the code assistance truthfully; do not claim it was independently written. Agree permitted submission use with the instructor and study each feature before defense.

## Local use

Open `index.html`, or use VS Code Live Server for a consistent browser origin across pages. jQuery and Bootstrap use CDNs and need internet access. No backend is included.

Official references: [events/delegation](https://api.jquery.com/on/), [properties and attributes](https://api.jquery.com/prop/), [effects and callbacks](https://api.jquery.com/slideDown/).
