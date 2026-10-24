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
