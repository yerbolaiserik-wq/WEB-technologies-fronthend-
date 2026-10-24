# JavaScript Checklist (Assignment 4-5)

| Requirement | File and lines |
|-------------|----------------|
| `js` folder, shared `main.js`, page files, `defer`, `'use strict'` | `js/*.js` line 1; script links at the end of `index.html`, `menu.html`, `order.html` |
| Array of objects (44 dishes, 5 properties each) | `js/data.js` 16-67 |
| Other arrays (categories, reviews) | `js/data.js` 4-12, 70-74 |
| `const` / `let` only, no `var`, no `==` / `!=` | all files |
| Loops over data (for...of, for) | `js/menu.js` 27, 51, 65, 102, 236-241; `js/order.js` 96, 105, 123, 134-151, 197-211 |
| Filter / find / sort / total | `js/menu.js` 25-46 (filterItems), 333 (find), 371 (filter); `js/main.js` 60-75 (totals); `js/order.js` 155-172 (prices), 249 (filter) |
| Reusable functions with parameters and return values | `js/main.js` 14, 31, 36, 46, 54, 60, 69, 78 |
| One function calls another | `getCartTotal` calls `getLineTotal` (`js/main.js` 60-66); `chooseFeaturedItem` calls `pickRandomItem` (`js/menu.js` 63-71) |
| Arithmetic | `js/main.js` 54-57; `js/order.js` 155-172 (discount, delivery, total) |
| if/else and switch | `js/menu.js` 35-44 (switch); `js/index.js` 13-21; `js/order.js` 500-597, 745-767 (switch) |
| Logical operators `&&`, `\|\|`, `!` | `js/menu.js` 28, 29, 407; `js/order.js` 163, 200-201, 436, 540-542, 570-576 |
| `===` and `!==` | `js/menu.js` 30, 394-410; `js/main.js` 112-120 |
| `Math.random()` (suggestion, demo reference number) | `js/menu.js` 62; `js/order.js` 208 (upsell); `js/main.js` 78-80 |
| Cards created from the array by one function (with photo when `image` is set) | `js/menu.js` 76-121 (createMenuCard), `js/main.js` 159-182 (createReviewCard) |
| Search + category + sort, count, no-results, reset | `js/menu.js` 132-214 (controls), 232-261 (renderMenu, resetFilters) |
| Cart: add, +/-, remove, clear, totals, empty state, disabled checkout | `js/menu.js` 278-382 |
| Order page: saved cart with +/-/remove, upsell, promo, delivery price, minimum order | `js/order.js` 131-172, 217-253, 383-444, 472-488 |
| Events: submit, click, input, change, keydown, reset | `js/menu.js` 200-211, 394-439; `js/order.js` 687-777; `js/main.js` 213-250 |
| DOM create / remove (`createElement`, `append`, `remove`, `replaceChildren`) | `js/main.js` 14-26, 83-103; `js/menu.js` 232-253, 305-328 |
| `classList` states (`d-none`, `is-invalid`, `selected`, `success`) | `js/menu.js` 223-228, 264-274; `js/main.js` 83-103 |
| Form validation (8+ fields, comparing fields, focus first error, no alert) | `js/order.js` 500-610, 687-704 |
| Demonstration confirmation, no data sent | `js/order.js` 612-685 |
| Feedback form with counter and validation | `js/main.js` 192-250 |
| Reviews: one card function, date/time, counter, validation | `js/main.js` 159-182, 192-250; `js/index.js` 34-51 |
| `textContent` for user text, no `innerHTML` | all files (`createEl` in `js/main.js` 14-26) |
