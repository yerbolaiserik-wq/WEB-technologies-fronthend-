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
