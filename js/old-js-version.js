// Original file: main.js
(function () {
'use strict';



const CART_KEY = 'dostykCart';
const REVIEWS_KEY = 'dostykReviews';
const MAX_QTY = 20;
const MIN_FEEDBACK_LENGTH = 5;
const MAX_FEEDBACK_LENGTH = 200;

// Small helpers

// Creates an element
function createEl(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

// 2000 -> "2 000"
function formatNumber(number) {
    return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// 2000 -> "2 000 ₸"
function formatPrice(number) {
    return formatNumber(number) + ' ₸';
}


function findItem(id) {
    for (const item of menuItems) {
        if (item.id === id) {
            return item;
        }
    }
    return null;
}


function getItemLabel(item, sizeIndex) {
    if (item.sizes.length > 0) {
        return item.name + ' (' + item.sizes[sizeIndex] + ')';
    }
    return item.name;
}

function getLineTotal(line) {
    const item = findItem(line.id);
    return item.prices[line.sizeIndex] * line.qty;
}


function getCartTotal(cart) {
    let total = 0;
    for (const line of cart) {
        total += getLineTotal(line);
    }
    return total;
}


function getCartCount(cart) {
    let count = 0;
    for (const line of cart) {
        count += line.qty;
    }
    return count;
}


function generateReference(prefix) {
    return prefix + '-' + Math.floor(1000 + Math.random() * 9000);
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    const error = createEl('div', 'invalid-feedback error', 'Қате: ' + message);
    error.id = field.id + '-error';
    field.setAttribute('aria-describedby', error.id);
    field.insertAdjacentElement('afterend', error);
}


function clearFieldError(field) {
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    const old = document.getElementById(field.id + '-error');
    if (old !== null) {
        old.remove();
    }
}



function loadCart() {
    const cart = [];
    try {
        const saved = localStorage.getItem(CART_KEY);
        if (saved === null) {
            return cart;
        }
        for (const line of JSON.parse(saved)) {
            const item = findItem(line.id);
            const goodSize = Number.isInteger(line.sizeIndex) && line.sizeIndex >= 0;
            const goodQty = Number.isInteger(line.qty) && line.qty >= 1 && line.qty <= MAX_QTY;
            if (item !== null && goodSize && goodQty && line.sizeIndex < item.prices.length) {
                cart.push({ key: line.key, id: line.id, sizeIndex: line.sizeIndex, qty: line.qty });
            }
        }
    } catch (error) {
        return [];
    }
    return cart;
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        // Storage can be blocked by the browser. The cart still works on this page.
    }
}



function loadReviews() {
    try {
        const saved = localStorage.getItem(REVIEWS_KEY);
        if (saved === null) {
            return [];
        }
        return JSON.parse(saved);
    } catch (error) {
        return [];
    }
}

function saveReviews(list) {
    try {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
    } catch (error) {
        // Ignore blocked storage.
    }
}


function createReviewCard(review) {
    const col = createEl('div', 'col-12 col-md-6 col-lg-4');
    const card = createEl('article', 'card h-100 shadow-sm border-warning');
    const body = createEl('div', 'card-body');

    body.append(createEl('h3', 'h6 text-brand', review.name));
    if (review.rating >= 1 && review.rating <= 5) {
        const stars = createEl('p', 'mb-1', '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating));
        stars.setAttribute('aria-label', 'Баға: ' + review.rating + ' / 5');
        body.append(stars);
    }
    body.append(createEl('p', 'card-text', review.text));

    const time = createEl('time', 'small text-muted');
    time.dateTime = review.date;
    time.textContent = new Date(review.date).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
    body.append(time);

    card.append(body);
    col.append(card);
    return col;
}



function showFeedbackMessage(result, text, isError) {
    result.textContent = (isError ? 'Қате: ' : 'Дайын: ') + text;
    result.classList.toggle('text-warning', !isError);
    result.classList.toggle('text-white', isError);
    result.classList.toggle('fw-bold', isError);
}


function checkFeedback(text) {
    if (text === '') {
        return 'пікір жазыңыз.';
    }
    if (text.length < MIN_FEEDBACK_LENGTH) {
        return 'пікір кемінде ' + MIN_FEEDBACK_LENGTH + ' таңбадан тұруы керек.';
    }
    if (text.length > MAX_FEEDBACK_LENGTH) {
        return 'пікір ' + MAX_FEEDBACK_LENGTH + ' таңбадан аспауы керек.';
    }
    return '';
}

function setupFeedbackForm() {
    const form = document.getElementById('feedback-form');
    const input = document.getElementById('feedback_text');
    const result = document.getElementById('feedback-result');
    if (form === null || input === null || result === null) {
        return;
    }

    result.textContent = '';

    const counter = createEl('p', 'small mb-0 text-white-50', '0 / ' + MAX_FEEDBACK_LENGTH);
    counter.id = 'feedback-counter';
    form.insertBefore(counter, result);
    input.setAttribute('aria-describedby', 'feedback-counter feedback-result');

    input.addEventListener('input', function () {
        counter.textContent = input.value.length + ' / ' + MAX_FEEDBACK_LENGTH;
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const text = input.value.trim();
        const problem = checkFeedback(text);

        if (problem !== '') {
            input.classList.add('is-invalid');
            input.setAttribute('aria-invalid', 'true');
            showFeedbackMessage(result, problem, true);
            input.focus();
            return;
        }

        const saved = loadReviews();
        saved.push({ name: 'Қонақ', text: text, rating: 0, date: new Date().toISOString() });
        saveReviews(saved);

        input.value = '';
        counter.textContent = '0 / ' + MAX_FEEDBACK_LENGTH;
        showFeedbackMessage(result, 'рақмет! Пікіріңіз қабылданды (демо).', false);


        if (document.getElementById('reviews-list') !== null) {
            renderReviews();
        }
    });
}

setupFeedbackForm();
})();
// Original file: index.js
(function () {
'use strict';

// Home page:

const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;

let reviewsList = null;
let reviewsCount = null;
let clearButton = null;


function getOpenStatus(hour) {
    if (hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
        return 'Қазір дәмхана ашық (10:00 - 22:00).';
    }
    if (hour < OPEN_HOUR) {
        return 'Қазір жабық. Бүгін 10:00-де ашылады.';
    }
    return 'Қазір жабық. Ертең 10:00-де ашылады.';
}

function showOpenStatus() {
    const contact = document.getElementById('contact');
    if (contact === null) {
        return;
    }
    const status = createEl('p', 'col-12 fw-bold mb-0', getOpenStatus(new Date().getHours()));
    status.setAttribute('role', 'status');
    contact.append(status);
}


function renderReviews() {
    const saved = loadReviews();
    const all = reviews.concat(saved);
    all.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    reviewsList.replaceChildren();
    if (all.length === 0) {
        reviewsList.append(createEl('p', 'text-muted', 'Әзірге пікір жоқ. Төмендегі форма арқылы бірінші пікірді қалдырыңыз.'));
    }
    for (const review of all) {
        reviewsList.append(createReviewCard(review));
    }

    reviewsCount.textContent = 'Пікір саны: ' + all.length;
    clearButton.disabled = saved.length === 0;
}

function buildReviewsSection() {
    const main = document.getElementById('main-content');
    const contact = document.getElementById('contact');
    const section = createEl('section', 'mb-5');
    section.setAttribute('aria-labelledby', 'reviews-title');

    const header = createEl('div', 'd-flex flex-wrap justify-content-between align-items-center gap-2 mb-3');
    const title = createEl('h2', 'h3 text-brand mb-0', 'Қонақ пікірлері');
    title.id = 'reviews-title';
    clearButton = createEl('button', 'btn btn-outline-primary btn-sm', 'Менің пікірлерімді өшіру');
    clearButton.type = 'button';
    header.append(title, clearButton);

    reviewsCount = createEl('p', 'small text-muted');
    reviewsCount.setAttribute('role', 'status');
    reviewsList = createEl('div', 'row g-3');
    reviewsList.id = 'reviews-list';

    section.append(header, reviewsCount, reviewsList);
    main.insertBefore(section, contact);

    clearButton.addEventListener('click', function () {
        saveReviews([]);
        renderReviews();
    });
}

buildReviewsSection();
renderReviews();
showOpenStatus();
})();
// Original file: menu.js
(function () {
'use strict';

// Menu page

let cart = loadCart();
let featuredItem = null;

const menuForm = document.getElementById('menu-cart-form');
const cartItemsBox = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutButton = document.getElementById('submit-cart');

//Elements
let searchInput = null;
let categorySelect = null;
let sortSelect = null;
let countText = null;
let noResultsBox = null;
let featuredText = null;
let cartMessage = null;

// Data functions 

// Returns the dishes that match the search text and the category, sorted.
function filterItems(items, text, category, sortMode) {
    const result = [];
    for (const item of items) {
        const inText = item.name.toLowerCase().includes(text) || item.description.toLowerCase().includes(text);
        const inCategory = category === 'all' || item.category === category;
        if (inText && inCategory) {
            result.push(item);
        }
    }

    switch (sortMode) {
        case 'cheap':
            result.sort(function (a, b) { return a.prices[0] - b.prices[0]; });
            break;
        case 'expensive':
            result.sort(function (a, b) { return b.prices[0] - a.prices[0]; });
            break;
        default:
            break;
    }
    return result;
}

//price on a card
function getPriceText(item) {
    const parts = [];
    for (const price of item.prices) {
        parts.push(formatNumber(price));
    }
    return parts.join(' / ') + ' ₸';
}

// Random dish from the array.
function pickRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

// The suggestion is chosen only from main dishes and fast food.
function chooseFeaturedItem() {
    const candidates = [];
    for (const item of menuItems) {
        if (item.category === 'main-dishes' || item.category === 'fast-food') {
            candidates.push(item);
        }
    }
    return pickRandomItem(candidates);
}

// Creating elements

// One function creates every dish card from the array.
function createMenuCard(item) {
    const col = createEl('div', 'col-12 col-md-6 col-xl-4');
    const article = createEl('article', 'card menu-product h-100');
    article.dataset.menuItem = item.id;
    const body = createEl('div', 'card-body d-flex flex-column');

    // The photo is shown only when the dish has an image path in data.js.
    if (item.image !== '') {
        const photo = createEl('img', 'card-img-top');
        photo.src = item.image;
        photo.alt = item.name;
        photo.width = 400;
        photo.height = 225;
        photo.loading = 'lazy';
        article.append(photo);
    }

    body.append(createEl('p', 'h4 fw-bold mb-1', getPriceText(item)));
    body.append(createEl('h3', 'h5 text-brand', item.name));
    body.append(createEl('p', 'text-muted small flex-grow-1', item.description));

    if (item.sizes.length > 0) {
        const sizeSelect = createEl('select', 'form-select form-select-sm mb-2');
        sizeSelect.id = 'size_' + item.id;
        sizeSelect.name = 'size_' + item.id;
        sizeSelect.setAttribute('aria-label', item.name + ' көлемі');
        for (let i = 0; i < item.sizes.length; i++) {
            const option = createEl('option', '', item.sizes[i] + ' - ' + formatPrice(item.prices[i]));
            option.value = String(i);
            sizeSelect.append(option);
        }
        body.append(sizeSelect);
    }

    // Every click adds one portion. The amount is changed later in the cart with +/-.
    const button = createEl('button', 'btn btn-outline-primary btn-sm w-100', '+ Қосу');
    button.type = 'submit';
    button.name = 'selected_item';
    button.value = item.id;
    button.setAttribute('aria-label', item.name + ' себетке қосу');
    body.append(button);

    article.append(body);
    col.append(article);
    return col;
}

function createField(labelText, control, colClass) {
    const col = createEl('div', colClass);
    const label = createEl('label', 'form-label', labelText);
    label.htmlFor = control.id;
    col.append(label, control);
    return col;
}

// Builds search, category, sort, reset, count, no-results and the random suggestion.
function buildControls() {
    const card = createEl('section', 'card shadow-sm border-warning mb-4');
    card.setAttribute('aria-label', 'Мәзірді іздеу және сүзу');
    const body = createEl('div', 'card-body');
    const row = createEl('div', 'row g-3 align-items-end');

    searchInput = createEl('input', 'form-control');
    searchInput.type = 'search';
    searchInput.id = 'menu-search';
    searchInput.autocomplete = 'off';

    categorySelect = createEl('select', 'form-select');
    categorySelect.id = 'menu-category';
    const allOption = createEl('option', '', 'Барлық категориялар');
    allOption.value = 'all';
    categorySelect.append(allOption);
    for (const category of categories) {
        const option = createEl('option', '', category.name);
        option.value = category.id;
        categorySelect.append(option);
    }

    sortSelect = createEl('select', 'form-select');
    sortSelect.id = 'menu-sort';
    const sortOptions = [
        ['default', 'Әдепкі реті'],
        ['cheap', 'Бағасы: арзаннан қымбатқа'],
        ['expensive', 'Бағасы: қымбаттан арзанға']
    ];
    for (const pair of sortOptions) {
        const option = createEl('option', '', pair[1]);
        option.value = pair[0];
        sortSelect.append(option);
    }

    const resetButton = createEl('button', 'btn btn-outline-primary w-100', 'Тазалау');
    resetButton.type = 'button';
    const resetCol = createEl('div', 'col-12 col-md-2');
    resetCol.append(resetButton);

    row.append(
        createField('Тағам іздеу (Esc - тазалау)', searchInput, 'col-12 col-md-4'),
        createField('Категория', categorySelect, 'col-12 col-md-3'),
        createField('Сұрыптау', sortSelect, 'col-12 col-md-3'),
        resetCol
    );

    countText = createEl('p', 'fw-bold mt-3 mb-0');
    countText.setAttribute('role', 'status');

    noResultsBox = createEl('div', 'alert alert-warning mt-3 mb-0 d-none');
    noResultsBox.setAttribute('role', 'status');
    noResultsBox.append(createEl('span', '', 'Ештеңе табылмады. Басқа сөз жазыңыз немесе '));
    const noResultsReset = createEl('button', 'btn btn-sm btn-outline-primary', 'сүзгіні тазалаңыз');
    noResultsReset.type = 'button';
    noResultsBox.append(noResultsReset);

    const featuredBox = createEl('div', 'alert bg-soft-green border border-warning mt-3 mb-0');
    featuredText = createEl('p', 'mb-2');
    const featuredButton = createEl('button', 'btn btn-primary btn-sm', 'Себетке қосу');
    featuredButton.type = 'button';
    featuredBox.append(featuredText, featuredButton);

    body.append(row, countText, noResultsBox, featuredBox);
    card.append(body);
    document.getElementById('main-content').insertBefore(card, menuForm);

    // Events for the controls
    searchInput.addEventListener('input', renderMenu);
    categorySelect.addEventListener('change', renderMenu);
    sortSelect.addEventListener('change', renderMenu);
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            searchInput.value = '';
            renderMenu();
        }
    });
    resetButton.addEventListener('click', resetFilters);
    noResultsReset.addEventListener('click', resetFilters);
    featuredButton.addEventListener('click', function () {
        addToCart(featuredItem.id, 0, 1);
    });
}

// Message above the cart (success or error).
function buildCartMessage() {
    cartMessage = createEl('div', 'alert py-2 small d-none');
    cartMessage.setAttribute('role', 'status');
    cartItemsBox.parentElement.insertBefore(cartMessage, cartItemsBox);
}

function showCartMessage(text, isError) {
    cartMessage.classList.remove('d-none');
    cartMessage.classList.toggle('alert-danger', isError);
    cartMessage.classList.toggle('alert-success', !isError);
    cartMessage.textContent = (isError ? 'Қате: ' : 'Дайын: ') + text;
}

//Showing the menu 

function renderMenu() {
    const text = searchInput.value.trim().toLowerCase();
    const found = filterItems(menuItems, text, categorySelect.value, sortSelect.value);

    for (const category of categories) {
        const section = document.getElementById(category.id);
        const row = section.querySelector('.row');
        row.replaceChildren();
        let shown = 0;
        for (const item of found) {
            if (item.category === category.id) {
                row.append(createMenuCard(item));
                shown++;
            }
        }
        section.classList.toggle('d-none', shown === 0);
    }

    countText.textContent = 'Табылған тағам: ' + found.length + ' / ' + menuItems.length;
    noResultsBox.classList.toggle('d-none', found.length > 0);
    markSelectedCards();
}

function resetFilters() {
    searchInput.value = '';
    categorySelect.value = 'all';
    sortSelect.value = 'default';
    renderMenu();
    searchInput.focus();
}

// Cards that are already in the cart get the "selected" look.
function markSelectedCards() {
    for (const article of document.querySelectorAll('.menu-product')) {
        const inCart = cart.some(function (line) {
            return line.id === article.dataset.menuItem;
        });
        article.classList.toggle('selected', inCart);
        article.classList.toggle('border', inCart);
        article.classList.toggle('border-2', inCart);
        article.classList.toggle('border-warning', inCart);
    }
}

//Cart 

function createCartButton(text, action, key, style, label) {
    const button = createEl('button', 'btn btn-sm ' + style, text);
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.key = key;
    button.setAttribute('aria-label', label);
    return button;
}

function createCartLine(line) {
    const item = findItem(line.id);
    const name = getItemLabel(item, line.sizeIndex);
    const box = createEl('div', 'border-bottom py-2');
    box.append(createEl('p', 'fw-bold mb-1', name));

    const controls = createEl('div', 'd-flex align-items-center gap-1 flex-wrap');
    controls.append(
        createCartButton('−', 'minus', line.key, 'btn-outline-secondary', name + ': азайту'),
        createEl('span', 'px-2', String(line.qty)),
        createCartButton('+', 'plus', line.key, 'btn-outline-secondary', name + ': көбейту'),
        createEl('span', 'ms-auto', formatPrice(getLineTotal(line))),
        createCartButton('Өшіру', 'remove', line.key, 'btn-outline-danger', name + ': өшіру')
    );
    box.append(controls);
    return box;
}

function renderCart() {
    const empty = cart.length === 0;
    cartItemsBox.replaceChildren();
    cartItemsBox.classList.toggle('cart-empty', empty);
    cartItemsBox.classList.toggle('text-center', empty);
    cartItemsBox.classList.toggle('py-5', empty);

    if (empty) {
        cartItemsBox.append(createEl('p', 'h5 mb-2', 'Себет әзірше бос'));
        cartItemsBox.append(createEl('p', 'mb-0 text-muted', 'Тағамның «+ Қосу» батырмасын басыңыз.'));
    } else {
        for (const line of cart) {
            cartItemsBox.append(createCartLine(line));
        }
        cartItemsBox.append(createEl('p', 'mt-2 mb-2', 'Барлығы: ' + getCartCount(cart) + ' порция'));
        const clearButton = createCartButton('Себетті тазалау', 'clear', '', 'btn-outline-danger w-100', 'Себетті толық тазалау');
        cartItemsBox.append(clearButton);
    }

    cartTotal.textContent = formatPrice(getCartTotal(cart));
    checkoutButton.disabled = empty;
    saveCart(cart);
    markSelectedCards();
}

function addToCart(id, sizeIndex, qty) {
    const key = id + '-' + sizeIndex;
    const item = findItem(id);
    const existing = cart.find(function (line) {
        return line.key === key;
    });

    if (existing !== undefined && existing.qty + qty > MAX_QTY) {
        showCartMessage('бір тағамнан ' + MAX_QTY + ' порциядан артық алуға болмайды.', true);
        return;
    }
    if (existing !== undefined) {
        existing.qty += qty;
    } else {
        cart.push({ key: key, id: id, sizeIndex: sizeIndex, qty: qty });
    }
    renderCart();
    showCartMessage(getItemLabel(item, sizeIndex) + ' себетке қосылды.', false);
}

function changeQty(key, change) {
    const line = cart.find(function (oneLine) {
        return oneLine.key === key;
    });
    if (line === undefined) {
        return;
    }
    const newQty = line.qty + change;
    if (newQty < 1) {
        removeFromCart(key);
        return;
    }
    if (newQty > MAX_QTY) {
        showCartMessage('бір тағамнан ' + MAX_QTY + ' порциядан артық алуға болмайды.', true);
        return;
    }
    line.qty = newQty;
    renderCart();
}

function removeFromCart(key) {
    cart = cart.filter(function (line) {
        return line.key !== key;
    });
    renderCart();
    showCartMessage('тағам себеттен өшірілді.', false);
}

function clearCart() {
    cart = [];
    renderCart();
    showCartMessage('себет тазаланды.', false);
}

//Events 

// "+ Қосу" button of a card.
function addFromCard(button) {
    const article = button.closest('article');
    const sizeSelect = article.querySelector('select');
    const sizeIndex = sizeSelect !== null ? Number(sizeSelect.value) : 0;
    addToCart(button.value, sizeIndex, 1);
}

menuForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const button = event.submitter;

    if (button === checkoutButton) {
        if (cart.length === 0) {
            showCartMessage('алдымен себетке тағам қосыңыз.', true);
            return;
        }
        saveCart(cart);
        window.location.href = 'order.html';
        return;
    }
    if (button !== null && button.name === 'selected_item') {
        addFromCard(button);
    }
});

cartItemsBox.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (button === null) {
        return;
    }
    const action = button.dataset.action;
    if (action === 'plus') {
        changeQty(button.dataset.key, 1);
    } else if (action === 'minus') {
        changeQty(button.dataset.key, -1);
    } else if (action === 'remove') {
        removeFromCart(button.dataset.key);
    } else if (action === 'clear') {
        clearCart();
    }
});

// Category links
for (const link of document.querySelectorAll('.menu-category-nav a')) {
    link.addEventListener('click', function () {
        for (const other of document.querySelectorAll('.menu-category-nav a')) {
            other.classList.remove('active');
            other.removeAttribute('aria-current');
        }
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
    });
}

//Start

menuForm.noValidate = true;
buildControls();
buildCartMessage();
featuredItem = chooseFeaturedItem();
featuredText.textContent = 'Бүгінгі ұсыныс: ' + featuredItem.name + ' - ' + getPriceText(featuredItem) +
    '. Ол кездейсоқ таңдалды, жеңілдік жоқ: баға мәзірдегідей.';
renderMenu();
renderCart();
})();
// Original file: order.js
(function () {
'use strict';

// Order page: the cart saved on menu.html is ordered here.
// Delivery address, delivery price, minimum order, promo code, "add to order"
// suggestions, live price summary, form validation and demonstration confirmation.

const orderForm = document.getElementById('order-request-form');
const nameInput = document.getElementById('username');
const emailInput = document.getElementById('useremail');
const phoneInput = document.getElementById('userphone');
const dateInput = document.getElementById('orderdate');
const timeInput = document.getElementById('preferred_time');
const portionInput = document.getElementById('portion_num');
const dishSelect = document.getElementById('main_dish');
const guestInput = document.getElementById('guest_count');
const tableSelect = document.getElementById('table_zone');
const commentsInput = document.getElementById('comments');
const submitButton = document.getElementById('submit-order');
const confirmBox = document.getElementById('order-confirmation');

const OPEN_TIME = '10:00';
const CLOSE_TIME = '22:00';
const MAX_DAYS_AHEAD = 30;
const MIN_DELIVERY_ORDER = 3000;

// Values of the order form that are different from the ids in the menu array.
const menuIdByValue = {
    kuyrdak: 'quyrdaq',
    lagman: 'guyru_lagman',
    salad: 'achik_chuchuk',
    bread: 'tandyr_nan',
    potato: 'potato_wedges'
};
const serviceNames = {
    delivery: 'Жеткізу',
    pickup: 'Өзім алып кетемін',
    dinein: 'Дәмханада жеймін'
};
// How many people fit at each table type.
const tableSeats = { two: 2, three: 3, four: 4 };

let menuCart = loadCart();
let appliedPromo = null;
let upsellItems = [];

// Elements that JavaScript creates:
let addressBox = null;
let addressFields = [];
let districtSelect = null;
let streetInput = null;
let houseInput = null;
let flatInput = null;
let entranceInput = null;
let floorInput = null;
let intercomInput = null;
let bookingParts = [];
let errorAlert = null;
let upsellBox = null;
let upsellList = null;
let summaryEmpty = null;
let summaryList = null;
let summaryTotals = null;
let minOrderNote = null;
let promoInput = null;
let promoMessage = null;

const startConfirmation = Array.from(confirmBox.childNodes).map(function (node) {
    return node.cloneNode(true);
});

/* ---------- Data functions ---------- */

function getMenuId(value) {
    if (value in menuIdByValue) {
        return menuIdByValue[value];
    }
    return value.replace(/-/g, '_');
}

function getService() {
    return orderForm.elements['service_type'].value;
}

function dateToString(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
}

function getNowTime() {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

function findDistrict(id) {
    for (const district of deliveryDistricts) {
        if (district.id === id) {
            return district;
        }
    }
    return null;
}

function findPromo(code) {
    for (const promo of promoCodes) {
        if (promo.code === code) {
            return promo;
        }
    }
    return null;
}

function makeLine(item, sizeIndex, qty, cartKey) {
    return {
        name: getItemLabel(item, sizeIndex),
        qty: qty,
        sum: item.prices[sizeIndex] * qty,
        cartKey: cartKey
    };
}

function getLinesTotal(lines) {
    let total = 0;
    for (const line of lines) {
        total += line.sum;
    }
    return total;
}

// All chosen dishes: the cart from menu.html, then main dish, extras and drinks of this form.
function buildOrderLines() {
    const lines = [];

    for (const cartLine of menuCart) {
        lines.push(makeLine(findItem(cartLine.id), cartLine.sizeIndex, cartLine.qty, cartLine.key));
    }

    const dish = findItem(getMenuId(dishSelect.value));
    const portions = Number(portionInput.value);
    if (dish !== null && Number.isInteger(portions) && portions >= 1 && portions <= 10) {
        lines.push(makeLine(dish, 0, portions, ''));
    }

    const boxes = orderForm.querySelectorAll('input[name="extras"]:checked, input[name="drinks"]:checked');
    for (const box of boxes) {
        const item = findItem(getMenuId(box.value));
        if (item !== null) {
            lines.push(makeLine(item, 0, 1, ''));
        }
    }
    return lines;
}

// Food price, promo discount, delivery price and the final total.
function calculatePrices(lines, service) {
    const subtotal = getLinesTotal(lines);
    let discount = 0;
    if (appliedPromo !== null) {
        discount = Math.round(subtotal * appliedPromo.percent / 100);
    }
    let delivery = 0;
    const district = findDistrict(districtSelect.value);
    if (service === 'delivery' && lines.length > 0 && district !== null) {
        delivery = district.fee;
    }
    return {
        subtotal: subtotal,
        discount: discount,
        delivery: delivery,
        total: subtotal - discount + delivery
    };
}

// "Степной 1-4, Бұқар жырау 30, пәтер 5, қабат 2"
function buildAddressText() {
    const district = findDistrict(districtSelect.value);
    const parts = [];
    if (district !== null) {
        parts.push(district.name);
    }
    parts.push(streetInput.value.trim() + ' ' + houseInput.value.trim());
    parts.push('пәтер/кеңсе ' + flatInput.value.trim());
    if (entranceInput.value.trim() !== '') {
        parts.push('кіреберіс ' + entranceInput.value.trim());
    }
    parts.push('қабат ' + floorInput.value.trim());
    if (intercomInput.value.trim() !== '') {
        parts.push('домофон ' + intercomInput.value.trim());
    }
    return parts.join(', ');
}

// Three random dishes that are not in the cart yet (Math.random).
function chooseUpsellItems(count) {
    const candidates = [];
    for (const item of menuItems) {
        const inCart = menuCart.some(function (line) {
            return line.id === item.id;
        });
        const smallDish = item.category === 'salads' || item.category === 'extras' || item.category === 'drinks';
        if (smallDish && !inCart) {
            candidates.push(item);
        }
    }

    const chosen = [];
    while (chosen.length < count && candidates.length > 0) {
        const index = Math.floor(Math.random() * candidates.length);
        chosen.push(candidates[index]);
        candidates.splice(index, 1);
    }
    return chosen;
}

// Cart from menu.html

function addToMenuCart(id) {
    const key = id + '-0';
    const line = menuCart.find(function (oneLine) {
        return oneLine.key === key;
    });
    if (line !== undefined && line.qty < MAX_QTY) {
        line.qty += 1;
    } else if (line === undefined) {
        menuCart.push({ key: key, id: id, sizeIndex: 0, qty: 1 });
    }
    saveCart(menuCart);
}

function changeMenuCartQty(key, change) {
    const line = menuCart.find(function (oneLine) {
        return oneLine.key === key;
    });
    if (line === undefined) {
        return;
    }
    const newQty = line.qty + change;
    if (newQty < 1) {
        removeFromMenuCart(key);
        return;
    }
    if (newQty <= MAX_QTY) {
        line.qty = newQty;
        saveCart(menuCart);
    }
}

function removeFromMenuCart(key) {
    menuCart = menuCart.filter(function (line) {
        return line.key !== key;
    });
    saveCart(menuCart);
}

/* ---------- Creating elements ---------- */

function createInputField(id, labelText, colClass, type) {
    const col = createEl('div', colClass);
    const label = createEl('label', 'form-label', labelText);
    label.htmlFor = id;
    const input = createEl('input', 'form-control');
    input.type = type;
    input.id = id;
    input.name = id;
    col.append(label, input);
    return { col: col, input: input };
}

function createActionButton(text, action, value, style, label) {
    const button = createEl('button', 'btn btn-sm ' + style, text);
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.value = value;
    if (label !== '') {
        button.setAttribute('aria-label', label);
    }
    return button;
}

// Address field
function buildAddressBox() {
    addressBox = createEl('div', 'col-12');
    const row = createEl('div', 'row g-3');
    const titleCol = createEl('div', 'col-12');
    titleCol.append(createEl('h2', 'h5 text-brand mt-3 mb-0', 'Жеткізу мекенжайы'));
    row.append(titleCol);

    const districtCol = createEl('div', 'col-12 col-md-6');
    const districtLabel = createEl('label', 'form-label', 'Аудан *');
    districtLabel.htmlFor = 'delivery_district';
    districtSelect = createEl('select', 'form-select');
    districtSelect.id = 'delivery_district';
    districtSelect.name = 'delivery_district';
    const firstOption = createEl('option', '', 'Ауданды таңдаңыз');
    firstOption.value = '';
    districtSelect.append(firstOption);
    for (const district of deliveryDistricts) {
        const option = createEl('option', '', district.name + ' - жеткізу ' + formatPrice(district.fee));
        option.value = district.id;
        districtSelect.append(option);
    }
    districtCol.append(districtLabel, districtSelect);

    const street = createInputField('address_street', 'Көше *', 'col-12 col-md-6', 'text');
    const house = createInputField('address_house', 'Үй *', 'col-6 col-md-3', 'text');
    const flat = createInputField('address_flat', 'Пәтер / кеңсе *', 'col-6 col-md-3', 'text');
    const entrance = createInputField('address_entrance', 'Кіреберіс', 'col-4 col-md-2', 'number');
    const floor = createInputField('address_floor', 'Қабат *', 'col-4 col-md-2', 'number');
    const intercom = createInputField('address_intercom', 'Домофон', 'col-4 col-md-2', 'text');

    streetInput = street.input;
    houseInput = house.input;
    flatInput = flat.input;
    entranceInput = entrance.input;
    floorInput = floor.input;
    intercomInput = intercom.input;
    streetInput.autocomplete = 'address-line1';
    addressFields = [districtSelect, streetInput, houseInput, flatInput, entranceInput, floorInput, intercomInput];

    row.append(districtCol, street.col, house.col, flat.col, entrance.col, floor.col, intercom.col);
    addressBox.append(row);

    const bookingTitle = guestInput.parentElement.previousElementSibling;
    orderForm.insertBefore(addressBox, bookingTitle);
    bookingParts = [bookingTitle, guestInput.parentElement, tableSelect.parentElement];

    document.querySelector('label[for="comments"]').textContent = 'Тапсырыс пікірі (міндетті емес)';
}

// Error box
function buildSummary() {
    const wrap = createEl('div', 'col-12');

    errorAlert = createEl('div', 'alert alert-danger d-none');
    errorAlert.setAttribute('role', 'alert');
    errorAlert.tabIndex = -1;

    upsellBox = createEl('div', 'card border-warning mb-3');
    const upsellBody = createEl('div', 'card-body');
    upsellBody.append(createEl('h2', 'h5 text-brand', 'Тапсырысқа қосамыз ба?'));
    upsellList = createEl('div', 'd-flex flex-wrap gap-2');
    upsellBody.append(upsellList);
    upsellBox.append(upsellBody);

    const box = createEl('div', 'alert bg-soft-green border border-warning mb-0');
    box.setAttribute('role', 'status');
    box.append(createEl('h2', 'h5 text-brand', 'Себет және тапсырыс есебі'));

    summaryEmpty = createEl('p', 'mb-2');
    summaryEmpty.append(createEl('span', '', 'Себет бос. '));
    const menuLink = createEl('a', '', 'Мәзірден тағам қосыңыз');
    menuLink.href = 'menu.html';
    summaryEmpty.append(menuLink, createEl('span', '', ' немесе төменде негізгі тағамды таңдаңыз.'));

    summaryList = createEl('ul', 'list-unstyled mb-2');
    summaryTotals = createEl('div', 'border-top pt-2');
    minOrderNote = createEl('p', 'fw-bold mt-2 mb-0 d-none');

    const promoLabel = createEl('label', 'form-label mt-3 mb-1', 'Промокод');
    promoLabel.htmlFor = 'promo_code';
    const promoRow = createEl('div', 'd-flex gap-2 align-items-start');
    const promoWrap = createEl('div', 'flex-grow-1');
    promoInput = createEl('input', 'form-control');
    promoInput.type = 'text';
    promoInput.id = 'promo_code';
    promoInput.name = 'promo_code';
    promoInput.autocomplete = 'off';
    promoWrap.append(promoInput);
    const promoButton = createActionButton('Қолдану', 'promo', '', 'btn-outline-primary', '');
    promoRow.append(promoWrap, promoButton);
    promoMessage = createEl('p', 'small success mb-0 mt-1');
    promoMessage.setAttribute('role', 'status');

    box.append(summaryEmpty, summaryList, summaryTotals, minOrderNote, promoLabel, promoRow, promoMessage);
    wrap.append(errorAlert, upsellBox, box);
    orderForm.insertBefore(wrap, submitButton.parentElement);
}



function renderUpsell() {
    upsellList.replaceChildren();
    for (const item of upsellItems) {
        const text = '+ ' + item.name + ' - ' + formatPrice(item.prices[0]);
        upsellList.append(createActionButton(text, 'upsell', item.id, 'btn-outline-primary', item.name + ' тапсырысқа қосу'));
    }
    upsellBox.classList.toggle('d-none', upsellItems.length === 0);
}

function createTotalRow(label, value, isBold) {
    const row = createEl('p', 'd-flex justify-content-between mb-1' + (isBold ? ' fw-bold' : ''));
    row.append(createEl('span', '', label), createEl('span', '', value));
    return row;
}

function renderSummary() {
    const lines = buildOrderLines();
    const service = getService();
    const prices = calculatePrices(lines, service);

    summaryList.replaceChildren();
    summaryEmpty.classList.toggle('d-none', lines.length > 0);

    for (const line of lines) {
        const item = createEl('li', 'd-flex flex-wrap align-items-center gap-1 border-bottom py-1');
        item.append(createEl('span', 'me-auto', line.name));
        if (line.cartKey !== '') {
            item.append(
                createActionButton('−', 'minus', line.cartKey, 'btn-outline-secondary', line.name + ': азайту'),
                createEl('span', 'px-2', String(line.qty)),
                createActionButton('+', 'plus', line.cartKey, 'btn-outline-secondary', line.name + ': көбейту')
            );
        } else {
            item.append(createEl('span', 'px-2', '× ' + line.qty));
        }
        item.append(createEl('span', 'ms-2', formatPrice(line.sum)));
        if (line.cartKey !== '') {
            item.append(createActionButton('Өшіру', 'remove', line.cartKey, 'btn-outline-danger', line.name + ': өшіру'));
        }
        summaryList.append(item);
    }

    summaryTotals.replaceChildren();
    summaryTotals.append(createTotalRow('Тағамдар', formatPrice(prices.subtotal), false));
    if (prices.discount > 0) {
        summaryTotals.append(createTotalRow('Промокод ' + appliedPromo.code + ' (-' + appliedPromo.percent + '%)', '−' + formatPrice(prices.discount), false));
    }
    if (service === 'delivery') {
        const deliveryText = districtSelect.value === '' ? 'ауданды таңдаңыз' : formatPrice(prices.delivery);
        summaryTotals.append(createTotalRow('Жеткізу', deliveryText, false));
    }
    summaryTotals.append(createTotalRow('Барлығы', formatPrice(prices.total), true));

    const tooSmall = service === 'delivery' && lines.length > 0 && prices.subtotal < MIN_DELIVERY_ORDER;
    minOrderNote.classList.toggle('d-none', !tooSmall);
    if (tooSmall) {
        minOrderNote.textContent = 'Назар аударыңыз: жеткізу ' + formatPrice(MIN_DELIVERY_ORDER) +
            '-ден басталады. Тағы ' + formatPrice(MIN_DELIVERY_ORDER - prices.subtotal) + ' қосыңыз.';
    }

    submitButton.disabled = lines.length === 0;
}

// Shows only the fields that the chosen service needs.
function updateServiceFields() {
    const service = getService();
    const dineIn = service === 'dinein';
    const delivery = service === 'delivery';

    guestInput.disabled = !dineIn;
    tableSelect.disabled = !dineIn;
    for (const part of bookingParts) {
        part.classList.toggle('d-none', !dineIn);
    }
    if (!dineIn) {
        clearFieldError(guestInput);
    }

    addressBox.classList.toggle('d-none', !delivery);
    for (const field of addressFields) {
        field.disabled = !delivery;
        if (!delivery) {
            clearFieldError(field);
        }
    }
}


function applyPromo() {
    const code = promoInput.value.trim().toUpperCase();
    clearFieldError(promoInput);
    promoMessage.textContent = '';
    appliedPromo = null;

    if (code === '') {
        showFieldError(promoInput, 'промокодты жазыңыз.');
    } else if (findPromo(code) === null) {
        showFieldError(promoInput, 'мұндай промокод жоқ.');
    } else {
        appliedPromo = findPromo(code);
        promoMessage.textContent = 'Дайын: ' + appliedPromo.code + ' қолданылды, тағамдарға ' + appliedPromo.percent + '% жеңілдік.';
    }
    renderSummary();
}

// Validation

function clearAllErrors() {
    const fields = orderForm.querySelectorAll('.is-invalid');
    for (const field of fields) {
        clearFieldError(field);
    }
    errorAlert.classList.add('d-none');
}

// Checks every field. Returns a list of {field, message}; field is null for a general error.
function validateOrder() {
    clearAllErrors();
    const errors = [];
    const service = getService();
    const lines = buildOrderLines();

    const name = nameInput.value.trim();
    if (name === '') {
        errors.push({ field: nameInput, message: 'аты-жөніңізді жазыңыз.' });
    } else if (!/^[\p{L}][\p{L} .'-]{1,49}$/u.test(name)) {
        errors.push({ field: nameInput, message: 'тек әріптер, 2-50 таңба жазыңыз.' });
    }

    const email = emailInput.value.trim();
    if (email === '') {
        errors.push({ field: emailInput, message: 'электронды поштаны жазыңыз.' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        errors.push({ field: emailInput, message: 'пошта үлгісі дұрыс емес (мысалы: name@mail.kz).' });
    }

    const phone = phoneInput.value.replace(/[\s()-]/g, '');
    if (phone === '') {
        errors.push({ field: phoneInput, message: 'телефон нөмірін жазыңыз.' });
    } else if (!/^(\+7|8)\d{10}$/.test(phone)) {
        errors.push({ field: phoneInput, message: 'нөмір +7 немесе 8-ден басталып, 10 санмен жалғасуы керек.' });
    }

    const today = dateToString(new Date());
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() + MAX_DAYS_AHEAD);
    if (dateInput.value === '') {
        errors.push({ field: dateInput, message: 'күнді таңдаңыз.' });
    } else if (dateInput.value < today) {
        errors.push({ field: dateInput, message: 'өткен күнді таңдауға болмайды.' });
    } else if (dateInput.value > dateToString(lastDay)) {
        errors.push({ field: dateInput, message: 'тапсырысты ' + MAX_DAYS_AHEAD + ' күн ішінде ғана беруге болады.' });
    }

    if (timeInput.value === '') {
        errors.push({ field: timeInput, message: 'уақытты таңдаңыз.' });
    } else if (timeInput.value < OPEN_TIME || timeInput.value > CLOSE_TIME) {
        errors.push({ field: timeInput, message: 'дәмхана ' + OPEN_TIME + ' - ' + CLOSE_TIME + ' аралығында жұмыс істейді.' });
    } else if (dateInput.value === today && timeInput.value <= getNowTime()) {
        errors.push({ field: timeInput, message: 'бүгін өтіп кеткен уақытты таңдауға болмайды.' });
    }

    const portions = Number(portionInput.value);
    if (dishSelect.value !== '' && (!Number.isInteger(portions) || portions < 1 || portions > 10)) {
        errors.push({ field: portionInput, message: 'порция саны 1-ден 10-ға дейін болуы керек.' });
    }

    if (lines.length === 0) {
        errors.push({ field: dishSelect, message: 'мәзірден тағам қосыңыз немесе негізгі тағамды таңдаңыз.' });
    }

    if (service === 'delivery') {
        const floor = Number(floorInput.value);
        const entrance = Number(entranceInput.value);
        if (districtSelect.value === '') {
            errors.push({ field: districtSelect, message: 'ауданды таңдаңыз.' });
        }
        if (streetInput.value.trim().length < 3) {
            errors.push({ field: streetInput, message: 'көше атауын жазыңыз (кемінде 3 таңба).' });
        }
        if (houseInput.value.trim() === '') {
            errors.push({ field: houseInput, message: 'үй нөмірін жазыңыз.' });
        }
        if (flatInput.value.trim() === '') {
            errors.push({ field: flatInput, message: 'пәтер немесе кеңсе нөмірін жазыңыз.' });
        }
        if (entranceInput.value.trim() !== '' && (!Number.isInteger(entrance) || entrance < 1 || entrance > 20)) {
            errors.push({ field: entranceInput, message: 'кіреберіс 1-ден 20-ға дейін.' });
        }
        if (floorInput.value.trim() === '' || !Number.isInteger(floor) || floor < 1 || floor > 30) {
            errors.push({ field: floorInput, message: 'қабат 1-ден 30-ға дейін.' });
        }
        if (lines.length > 0 && getLinesTotal(lines) < MIN_DELIVERY_ORDER) {
            errors.push({ field: null, message: 'жеткізу үшін тағамдар сомасы кемінде ' + formatPrice(MIN_DELIVERY_ORDER) + ' болуы керек.' });
        }
    }

    if (service === 'dinein') {
        const guests = Number(guestInput.value);
        const seats = tableSeats[tableSelect.value];
        if (guestInput.value.trim() === '' || !Number.isInteger(guests) || guests < 1 || guests > 10) {
            errors.push({ field: guestInput, message: 'қонақ саны 1-ден 10-ға дейін болуы керек.' });
        } else if (guests > seats) {
            errors.push({ field: guestInput, message: 'таңдалған үстелге ' + seats + ' адамнан артық сыймайды. Үлкен үстел таңдаңыз.' });
        }
    }

    for (const error of errors) {
        if (error.field !== null) {
            showFieldError(error.field, error.message);
        }
    }
    return errors;
}

function showErrorAlert(errors) {
    errorAlert.replaceChildren();
    errorAlert.append(createEl('p', 'fw-bold mb-1', 'Форма толық емес: ' + errors.length + ' қате табылды. Белгіленген өрістерді түзетіңіз.'));
    for (const error of errors) {
        if (error.field === null) {
            errorAlert.append(createEl('p', 'mb-0', 'Қате: ' + error.message));
        }
    }
    errorAlert.classList.remove('d-none');
}

// Confirmation 

function showConfirmation() {
    const lines = buildOrderLines();
    const service = getService();
    const prices = calculatePrices(lines, service);
    const details = [
        'Аты-жөні: ' + nameInput.value.trim(),
        'Байланыс: ' + emailInput.value.trim() + ', ' + phoneInput.value.trim(),
        'Күні мен уақыты: ' + dateInput.value + ', ' + timeInput.value,
        'Қызмет түрі: ' + serviceNames[service]
    ];
    if (service === 'delivery') {
        details.push('Мекенжай: ' + buildAddressText());
    }
    if (service === 'dinein') {
        const tableText = tableSelect.options[tableSelect.selectedIndex].text;
        details.push('Үстел: ' + tableText + ', қонақ саны: ' + guestInput.value);
    }
    if (commentsInput.value.trim() !== '') {
        details.push('Пікір: ' + commentsInput.value.trim());
    }

    confirmBox.replaceChildren();
    confirmBox.classList.add('success');
    confirmBox.append(createEl('h2', 'h5 text-brand', 'Тапсырыс сұранысы дайын (демо)'));
    confirmBox.append(createEl('p', 'fw-bold', 'Демо анықтамалық нөмір: ' + generateReference('DK')));

    const detailList = createEl('ul', 'mb-3');
    for (const text of details) {
        detailList.append(createEl('li', '', text));
    }
    confirmBox.append(detailList);

    const foodList = createEl('ul', 'mb-3');
    for (const line of lines) {
        foodList.append(createEl('li', '', line.name + ' × ' + line.qty + ' = ' + formatPrice(line.sum)));
    }
    confirmBox.append(foodList);

    confirmBox.append(createTotalRow('Тағамдар', formatPrice(prices.subtotal), false));
    if (prices.discount > 0) {
        confirmBox.append(createTotalRow('Промокод ' + appliedPromo.code, '−' + formatPrice(prices.discount), false));
    }
    if (service === 'delivery') {
        confirmBox.append(createTotalRow('Жеткізу', formatPrice(prices.delivery), false));
    }
    confirmBox.append(createTotalRow('Барлығы', formatPrice(prices.total), true));
    confirmBox.append(createEl('p', 'my-3', 'Бұл - тек демонстрация: деректер серверге жіберілмейді, нақты тапсырыс, үстел брондауы немесе төлем жасалмайды.'));

    const newOrder = createEl('button', 'btn btn-outline-primary', 'Жаңа тапсырыс');
    newOrder.type = 'button';
    newOrder.addEventListener('click', function () {
        orderForm.reset();
        nameInput.focus();
    });
    confirmBox.append(newOrder);

    // The saved cart is ordered now, so it is emptied.
    menuCart = [];
    saveCart(menuCart);
    renderSummary();

    confirmBox.tabIndex = -1;
    confirmBox.scrollIntoView({ block: 'center' });
    confirmBox.focus();
}

function restoreConfirmation() {
    confirmBox.classList.remove('success');
    confirmBox.replaceChildren(...startConfirmation.map(function (node) {
        return node.cloneNode(true);
    }));
}

// Events

orderForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const errors = validateOrder();

    if (errors.length > 0) {
        showErrorAlert(errors);
        const firstWithField = errors.find(function (error) {
            return error.field !== null;
        });
        if (firstWithField !== undefined) {
            firstWithField.field.focus();
        } else {
            errorAlert.focus();
        }
        return;
    }
    showConfirmation();
});

orderForm.addEventListener('reset', function () {
    clearAllErrors();
    restoreConfirmation();
    appliedPromo = null;
    promoMessage.textContent = '';
    // The form values are cleared after the reset event, so wait one moment.
    window.setTimeout(function () {
        updateServiceFields();
        renderSummary();
    }, 0);
});

function handleFieldChange(event) {
    if (event.target.classList.contains('is-invalid')) {
        clearFieldError(event.target);
    }
    updateServiceFields();
    renderSummary();
}
orderForm.addEventListener('input', handleFieldChange);
orderForm.addEventListener('change', handleFieldChange);

// Enter in the promo field applies the code instead of sending the form.
orderForm.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target === promoInput) {
        event.preventDefault();
        applyPromo();
    }
});

// Buttons made by JavaScript: cart +/-, remove, "add to order", promo.
orderForm.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (button === null) {
        return;
    }
    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
        case 'plus':
            changeMenuCartQty(value, 1);
            break;
        case 'minus':
            changeMenuCartQty(value, -1);
            break;
        case 'remove':
            removeFromMenuCart(value);
            break;
        case 'upsell':
            addToMenuCart(value);
            upsellItems = upsellItems.filter(function (item) {
                return item.id !== value;
            });
            renderUpsell();
            break;
        case 'promo':
            applyPromo();
            return;
        default:
            return;
    }
    renderSummary();
});

// Another tab (menu.html) changed the saved cart.
window.addEventListener('storage', function (event) {
    if (event.key === CART_KEY) {
        menuCart = loadCart();
        renderSummary();
    }
});

// Start

orderForm.noValidate = true;
dateInput.min = dateToString(new Date());
const lastAllowed = new Date();
lastAllowed.setDate(lastAllowed.getDate() + MAX_DAYS_AHEAD);
dateInput.max = dateToString(lastAllowed);

buildAddressBox();
buildSummary();
upsellItems = chooseUpsellItems(3);
renderUpsell();
updateServiceFields();
renderSummary();
})();
