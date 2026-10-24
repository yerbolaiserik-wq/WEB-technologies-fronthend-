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
