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
