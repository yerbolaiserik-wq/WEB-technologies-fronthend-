'use strict';

// jQuery 3.7.1 full build includes effects. Ready waits until the page DOM exists.
$(function () {
    const CART_KEY = 'dostykCart';
    const REVIEW_KEY = 'dostykReviews';
    const MAX_QTY = 20;
    let cart = readCart();
    let promo = null;
    const $order = $('#order-request-form');

    function el(tag, classes, text) {
        const $node = $('<' + tag + '>').addClass(classes || '');
        if (text !== undefined) $node.text(text);
        return $node;
    }
    function money(value) { return Number(value).toLocaleString('ru-RU') + ' ₸'; }
    function itemById(id) { return menuItems.find(function (item) { return item.id === id; }); }
    function label(item, size) { return item.name + (item.sizes.length ? ' (' + item.sizes[size] + ')' : ''); }
    function read(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : fallback;
        } catch (error) { return fallback; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch (error) { /* The current page remains usable when storage is blocked. */ }
    }
    function readCart() {
        const valid = [];
        read(CART_KEY, []).forEach(function (line) {
            if (!line || typeof line !== 'object') return;
            const item = itemById(line.id);
            if (!item || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > MAX_QTY ||
                !Number.isInteger(line.sizeIndex) || line.sizeIndex < 0 || line.sizeIndex >= item.prices.length) return;
            const key = line.id + '-' + line.sizeIndex;
            const previous = valid.find(function (saved) { return saved.key === key; });
            if (previous) previous.qty = Math.min(MAX_QTY, previous.qty + line.qty);
            else valid.push({key: key, id: line.id, sizeIndex: line.sizeIndex, qty: line.qty});
        });
        return valid;
    }
    function savedReviews() {
        return read(REVIEW_KEY, []).filter(function (review) {
            return review && typeof review.text === 'string' && typeof review.name === 'string' &&
                Number.isFinite(Date.parse(review.date));
        });
    }
    function total() {
        return cart.reduce(function (sum, line) { return sum + itemById(line.id).prices[line.sizeIndex] * line.qty; }, 0);
    }
    function button(text, action, value) {
        return el('button', 'btn btn-sm btn-outline-primary', text)
            .attr({type: 'button', 'data-action': action, 'data-value': value || ''});
    }
    function addItem(id, size) {
        const key = id + '-' + size;
        const line = cart.find(function (one) { return one.key === key; });
        if (line && line.qty >= MAX_QTY) return false;
        if (line) line.qty++;
        else cart.push({key: key, id: id, sizeIndex: size, qty: 1});
        write(CART_KEY, cart);
        return true;
    }
    function changeCart(action, key) {
        const line = cart.find(function (one) { return one.key === key; });
        if (action === 'clear') cart = [];
        if (line && action === 'plus') line.qty = Math.min(MAX_QTY, line.qty + 1);
        if (line && action === 'minus') line.qty--;
        cart = cart.filter(function (one) { return one.qty > 0 && !(action === 'remove' && one.key === key); });
        write(CART_KEY, cart);
    }
    function cartLine(line) {
        const item = itemById(line.id);
        const name = label(item, line.sizeIndex);
        const $row = el('li', 'border-bottom py-2').attr('data-key', line.key);
        $row.append(el('p', 'fw-bold mb-1 text-break', name));
        const $controls = el('div', 'd-flex flex-wrap align-items-center gap-1');
        $controls.append(button('−', 'minus', line.key).attr('aria-label', name + ': азайту'),
            el('span', 'px-2', line.qty), button('+', 'plus', line.key).attr('aria-label', name + ': көбейту')
                .prop('disabled', line.qty >= MAX_QTY),
            el('span', 'ms-auto', money(item.prices[line.sizeIndex] * line.qty)),
            button('Өшіру', 'remove', line.key).attr('aria-label', name + ': өшіру'));
        return $row.append($controls);
    }
    function renderCart($box) {
        $box.empty().removeClass('cart-empty text-center py-5');
        if (!cart.length) $box.append(el('p', 'mb-2', 'Себет әзірше бос. Мәзірден тағам қосыңыз.'));
        else {
            const $list = el('ul', 'list-unstyled mb-2');
            cart.forEach(function (line) { $list.append(cartLine(line)); });
            $box.append($list, button('Себетті тазалау', 'clear'));
        }
        $('#cart-total').text(money(total()));
        $('#submit-cart').prop('disabled', !cart.length);
        $('.menu-product').each(function () {
            const $card = $(this);
            const selected = cart.some(function (line) { return line.id === $card.attr('data-menu-item'); });
            $card.toggleClass('selected border border-2 border-warning', selected);
        });
    }
    function clearError($field) {
        $field.removeClass('is-invalid').removeAttr('aria-invalid');
        const errorId = $field.attr('id') + '-error';
        $('#' + errorId).remove();
        const description = ($field.attr('aria-describedby') || '').split(' ').filter(function (id) { return id && id !== errorId; });
        if (description.length) $field.attr('aria-describedby', description.join(' '));
        else $field.removeAttr('aria-describedby');
    }
    function fieldError($field, message) {
        clearError($field);
        const id = $field.attr('id') + '-error';
        $field.addClass('is-invalid').attr({'aria-invalid': 'true', 'aria-describedby': (($field.attr('aria-describedby') || '') + ' ' + id).trim()});
        el('div', 'invalid-feedback error', message).attr({id: id, role: 'alert'}).insertAfter($field);
    }
    function message($box, text) {
        // Chain: finish any old effect, replace safe text, then reveal the new message.
        $box.stop(true, true).text(text).fadeIn(180);
    }

    // Rewrite 1: .val(), .on(), .text(), .addClass() replace value/addEventListener/textContent/classList.
    // The jQuery feedback version is shorter because selection and updates can be chained.
    const $feedback = $('#feedback-form').prop('noValidate', true);
    const $feedbackInput = $('#feedback_text').prop('required', true).attr({minlength: 5, maxlength: 200});
    const $feedbackResult = $('#feedback-result').attr('role', 'status').empty();
    const $counter = el('p', 'small mb-0 text-white-50', '0 / 200').attr('id', 'feedback-counter').insertBefore($feedbackResult);
    $feedbackInput.attr('aria-describedby', 'feedback-counter feedback-result');
    $feedback.on('input', 'input', function () {
        const $input = $(this);
        $counter.text($input.val().length + ' / 200');
        if ($input.val().trim().length >= 5) clearError($input);
    });
    $feedback.on('submit', function (event) {
        // Without preventDefault the GET form reloads the page and exposes the comment in the URL.
        event.preventDefault();
        const text = $feedbackInput.val().trim();
        if (text.length < 5 || text.length > 200) {
            fieldError($feedbackInput, 'Пікір 5–200 таңбадан тұруы керек.');
            $feedbackInput.trigger('focus');
            return;
        }
        clearError($feedbackInput);
        const list = savedReviews();
        list.push({name: 'Қонақ', text: text, rating: 0, date: new Date().toISOString()});
        write(REVIEW_KEY, list);
        $feedbackInput.val('');
        $counter.text('0 / 200');
        message($feedbackResult, 'Рақмет! Пікір осы браузерде сақталды (демо).');
    });

    if ($('#contact').length) {
        const hour = Number(new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Almaty', hour: '2-digit', hourCycle: 'h23'}).format(new Date()));
        $('#contact').append(el('p', 'col-12 fw-bold', hour >= 10 && hour < 22 ? 'Қазір ашық: 10:00–22:00.' : 'Қазір жабық. Жұмыс уақыты: 10:00–22:00.'));
    }

    // Rewrite 2: .append(), .empty(), .find() replace createElement/appendChild/querySelector.
    // Cards from the array are shorter with jQuery; the filtering and sorting logic is unchanged.
    if ($('#menu-cart-form').length) setupMenu();
    function setupMenu() {
        const $form = $('#menu-cart-form');
        const $search = el('input', 'form-control').attr({id: 'menu-search', type: 'search', 'aria-label': 'Тағам іздеу'});
        const $category = el('select', 'form-select').attr({id: 'menu-category', 'aria-label': 'Категория'});
        $category.append(el('option', '', 'Барлық категориялар').val('all'));
        categories.forEach(function (category) { $category.append(el('option', '', category.name).val(category.id)); });
        const $sort = el('select', 'form-select').attr({id: 'menu-sort', 'aria-label': 'Сұрыптау'});
        [['default', 'Әдепкі реті'], ['cheap', 'Арзаннан қымбатқа'], ['expensive', 'Қымбаттан арзанға']].forEach(function (pair) {
            $sort.append(el('option', '', pair[1]).val(pair[0]));
        });
        const $controls = el('section', 'mb-4').attr('aria-label', 'Мәзірді іздеу және сүзу');
        const $row = el('div', 'row g-2');
        [$search, $category, $sort].forEach(function ($control) {
            $row.append(el('div', 'col-12 col-md-4').append(
                el('label', 'form-label', $control.attr('aria-label')).attr('for', $control.attr('id')), $control));
        });
        const $count = el('p', 'small mt-2 mb-2').attr('role', 'status');
        const $reset = button('Сүзгіні тазалау', 'reset-filter');
        $controls.append($row, $count, $reset).insertBefore($form);
        const $note = el('p', 'small mt-2').attr('role', 'status').insertBefore('#cart-items');
        const candidates = menuItems.filter(function (item) { return item.category === 'main-dishes'; });
        const featured = candidates[Math.floor(Math.random() * candidates.length)];
        const $suggest = button('+ ' + featured.name + ' · ' + money(featured.prices[0]), 'featured', featured.id);
        $controls.append(el('p', 'mt-3 mb-1', 'Бүгінгі ұсыныс'), $suggest);

        function renderMenu() {
            const text = $search.val().trim().toLocaleLowerCase();
            const found = menuItems.filter(function (item) {
                return (item.name + ' ' + item.description).toLocaleLowerCase().includes(text) &&
                    ($category.val() === 'all' || item.category === $category.val());
            });
            if ($sort.val() !== 'default') found.sort(function (a, b) { return ($sort.val() === 'cheap' ? 1 : -1) * (a.prices[0] - b.prices[0]); });
            categories.forEach(function (category) {
                const $section = $('#' + category.id);
                const $grid = $section.find('.row').first().empty();
                const items = found.filter(function (item) { return item.category === category.id; });
                $section.toggleClass('d-none', !items.length);
                items.forEach(function (item) { $grid.append(menuCard(item)); });
            });
            $count.text(found.length ? 'Табылған тағам: ' + found.length + ' / ' + menuItems.length : 'Ештеңе табылмады. Сүзгіні тазалаңыз.');
            renderCart($('#cart-items'));
        }
        $search.on('input', renderMenu).on('keydown', function (event) {
            if (event.key === 'Escape') { $(this).val(''); renderMenu(); }
        });
        $category.on('change', renderMenu);
        $sort.on('change', renderMenu);
        $reset.on('click', function () { $search.val(''); $category.val('all'); $sort.val('default'); renderMenu(); });
        $suggest.on('click', function () { addItem(featured.id, 0); renderMenu(); message($note, featured.name + ' себетке қосылды.'); });
        // Delegation: cards are rebuilt after filtering. Direct binding would miss the new buttons.
        $form.on('click', 'button[name="selected_item"]', function (event) {
            event.preventDefault(); // Otherwise this submit button would navigate to order.html.
            const $card = $(this).closest('.menu-product');
            const id = $card.attr('data-menu-item');
            const size = Number($card.find('select').val() || 0);
            const added = addItem(id, size);
            renderCart($('#cart-items'));
            message($note, added ? itemById(id).name + ' себетке қосылды.' : 'Бір тағамнан ең көбі 20 порция.');
        });
        $('#cart-items').on('click', 'button[data-action]', function () {
            const $button = $(this);
            const action = $button.attr('data-action');
            const key = $button.attr('data-value');
            if (action === 'remove') {
                // Callback removes data only after the visible row finishes fading out.
                $button.closest('li').fadeOut(160, function () { changeCart(action, key); renderCart($('#cart-items')); });
            } else { changeCart(action, key); renderCart($('#cart-items')); }
        });
        $form.on('submit', function (event) {
            event.preventDefault();
            if (cart.length) window.location.href = 'order.html';
            else message($note, 'Алдымен тағам қосыңыз.');
        });
        $('.menu-category-nav').on('click', 'a', function (event) {
            event.preventDefault();
            // siblings() removes the previous active category without inventing extra ids.
            $(this).addClass('active').attr('aria-current', 'true').siblings().removeClass('active').removeAttr('aria-current');
            $category.val($(this).attr('href').slice(1));
            $search.val('');
            renderMenu();
        });
        renderMenu();
    }
    function menuCard(item) {
        const $card = el('article', 'card menu-product h-100').attr('data-menu-item', item.id);
        if (item.image) $card.append(el('img', 'card-img-top').attr({src: item.image, alt: item.name, width: 400, height: 225, loading: 'lazy'}));
        const $body = el('div', 'card-body d-flex flex-column');
        $body.append(el('p', 'h4 fw-bold mb-1', item.prices.map(money).join(' / ')), el('h3', 'h5 text-brand', item.name),
            el('p', 'text-muted small flex-grow-1', item.description));
        if (item.sizes.length) {
            const $sizes = el('select', 'form-select form-select-sm mb-2').attr('aria-label', item.name + ' көлемі');
            item.sizes.forEach(function (size, index) { $sizes.append(el('option', '', size + ' · ' + money(item.prices[index])).val(index)); });
            $body.append($sizes);
        }
        $body.append(el('button', 'btn btn-outline-primary btn-sm w-100', '+ Қосу').attr({type: 'button', name: 'selected_item', value: item.id}));
        return el('div', 'col-12 col-md-6 col-xl-4').append($card.append($body));
    }

    if ($order.length) setupOrder();
    function setupOrder() {
        const aliases = {kuyrdak: 'quyrdaq', lagman: 'guyru_lagman', salad: 'achik_chuchuk', bread: 'tandyr_nan', potato: 'potato_wedges'};
        const $result = $('#order-confirmation').empty().attr({tabindex: -1, 'aria-live': 'polite'});
        $result.append(el('h2', 'h5 text-brand', 'Тапсырыс нәтижесі'), el('p', 'mb-0', 'Дұрыс толтырылған формадан кейін осы жерде демо нәтижесі көрсетіледі. Нақты тапсырыс жіберілмейді.'));
        $order.prop('noValidate', true);
        const $address = el('div', 'col-12').attr('id', 'delivery-address');
        const $addressRow = el('div', 'row g-3');
        $address.append(el('h2', 'h5 text-brand', 'Жеткізу мекенжайы'), $addressRow);
        const $district = el('select', 'form-select').attr({id: 'delivery_district', name: 'delivery_district'});
        $district.append(el('option', '', 'Ауданды таңдаңыз').val(''));
        deliveryDistricts.forEach(function (district) { $district.append(el('option', '', district.name + ' · ' + money(district.fee)).val(district.id)); });
        addField($addressRow, 'delivery_district', 'Аудан', $district);
        [['address_street', 'Көше', 'text'], ['address_house', 'Үй', 'text'], ['address_flat', 'Пәтер / кеңсе', 'text'],
            ['address_entrance', 'Кіреберіс (міндетті емес)', 'number'], ['address_floor', 'Қабат', 'number'], ['address_intercom', 'Домофон (міндетті емес)', 'text']].forEach(function (field) {
            addField($addressRow, field[0], field[1], el('input', 'form-control').attr({id: field[0], name: field[0], type: field[2]}));
        });
        const $booking = $('#guest_count').parent().prev().add($('#guest_count').parent()).add($('#table_zone').parent());
        $address.insertBefore($booking.first());
        $('label[for="comments"]').text('Тапсырыс пікірі (міндетті емес)');
        const $summary = el('section', 'col-12').attr('id', 'order-summary');
        const $basket = el('div').attr('id', 'order-cart');
        const $totals = el('div', 'border-top pt-2').attr('aria-live', 'polite');
        const $promoInput = el('input', 'form-control').attr({id: 'promo_code', type: 'text', name: 'promo_code'});
        const $promoResult = el('p', 'small mb-2').attr('role', 'status');
        const $offer = el('div', 'd-flex flex-wrap gap-2 mb-3');
        menuItems.filter(function (item) { return item.category === 'salads'; }).slice(0, 3).forEach(function (item) {
            $offer.append(button('+ ' + item.name + ' · ' + money(item.prices[0]), 'upsell', item.id));
        });
        $summary.append(el('h2', 'h5 text-brand', 'Себет және тапсырыс есебі'), $basket, $offer, $totals,
            el('label', 'form-label mt-2', 'Промокод').attr('for', 'promo_code'), $promoInput, button('Қолдану', 'promo'), $promoResult);
        $summary.insertBefore($('#submit-order').parent());
        const $generalError = el('p', 'error').attr({role: 'alert', id: 'order-error'}).insertBefore('#submit-order');
        const dateString = function (date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); };
        const lastDay = new Date(); lastDay.setDate(lastDay.getDate() + 30);
        $('#orderdate').attr({min: dateString(new Date()), max: dateString(lastDay)});
        function service() { return $order.find('[name="service_type"]:checked').val(); }
        function resolve(value) { return itemById(aliases[value] || value.replace(/-/g, '_')); }
        function orderLines() {
            const lines = cart.map(function (line) {
                const item = itemById(line.id);
                return {name: label(item, line.sizeIndex), qty: line.qty, sum: item.prices[line.sizeIndex] * line.qty};
            });
            const dish = resolve($('#main_dish').val());
            const portions = Number($('#portion_num').val());
            if (dish && Number.isInteger(portions) && portions >= 1 && portions <= 10) lines.push({name: dish.name, qty: portions, sum: dish.prices[0] * portions});
            $order.find('input[name="extras"]:checked, input[name="drinks"]:checked').each(function () {
                const item = resolve($(this).val());
                if (item) lines.push({name: item.name, qty: 1, sum: item.prices[0]});
            });
            return lines;
        }
        function prices() {
            const food = orderLines().reduce(function (sum, line) { return sum + line.sum; }, 0);
            const district = deliveryDistricts.find(function (one) { return one.id === $district.val(); });
            const fee = service() === 'delivery' && food && district ? district.fee : 0;
            const discount = promo ? Math.round(food * promo.percent / 100) : 0;
            return {food: food, fee: fee, discount: discount, total: food + fee - discount};
        }
        function refresh() {
            renderCart($basket);
            const $formLines = el('ul', 'list-unstyled mb-2');
            const savedLineCount = cart.length;
            orderLines().slice(savedLineCount).forEach(function (line) {
                $formLines.append(el('li', 'py-1 text-break', line.name + ' × ' + line.qty + ' = ' + money(line.sum)));
            });
            $basket.append($formLines);
            const amount = prices();
            $totals.empty().append(el('p', 'mb-1', 'Тағамдар: ' + money(amount.food)),
                el('p', 'mb-1', 'Жеңілдік: ' + money(amount.discount)), el('p', 'mb-1', 'Жеткізу: ' + money(amount.fee)),
                el('p', 'fw-bold', 'Барлығы: ' + money(amount.total)));
            if (service() === 'delivery' && amount.food < 3000) $totals.append(el('p', 'error', 'Жеткізудің ең аз тағам сомасы: 3 000 ₸.'));
            $('#main_dish').prop('required', !cart.length && service() !== 'dinein');
        }
        // Rewrite 3: .prop() and .slideDown/.slideUp replace disabled/classList toggles.
        // jQuery is clearer for the effect, while the delivery/dine-in conditions stay the same.
        function updateService(animate) {
            const delivery = service() === 'delivery';
            const dinein = service() === 'dinein';
            $address.find('input, select').prop('disabled', !delivery);
            $('#delivery_district, #address_street, #address_house, #address_flat, #address_floor').prop('required', delivery);
            $('#guest_count, #table_zone').prop('disabled', !dinein).prop('required', dinein);
            function reveal($part, visible) {
                $part.stop(true, true);
                if (visible) $part.removeClass('d-none').slideDown(animate ? 180 : 0);
                else $part.slideUp(animate ? 180 : 0, function () { $(this).addClass('d-none'); });
            }
            reveal($address, delivery);
            reveal($booking, dinein);
            $order.find(':disabled').each(function () { clearError($(this)); });
            refresh();
        }
        // validateOrder previously read DOM .value properties and inserted errors manually.
        // .val(), .each() and fieldError() shorten the DOM work; the checks themselves remain ordinary JS.
        function validateField($field) {
            if ($field.prop('disabled')) return '';
            const id = $field.attr('id');
            const value = String($field.val() || '').trim();
            if ($field.prop('required') && !value) return 'Бұл өрісті толтырыңыз.';
            if (!value) return '';
            if (id === 'username' && !/^[\p{L}][\p{L} .'-]{1,49}$/u.test(value)) return 'Аты-жөніңіз 2–50 әріптен тұруы керек.';
            if (id === 'useremail' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Email форматы дұрыс емес.';
            if (id === 'userphone' && !/^(\+7|8)\d{10}$/.test(value.replace(/[\s()-]/g, ''))) return 'Телефон: +7 немесе 8 және одан кейін 10 сан.';
            if (id === 'orderdate' && (value < dateString(new Date()) || value > dateString(lastDay))) return 'Күн бүгіннен бастап 30 күн ішінде болуы керек.';
            if (id === 'preferred_time') {
                if (value < '10:00' || value > '22:00') return 'Уақыт 10:00–22:00 аралығында болуы керек.';
                const selected = new Date($('#orderdate').val() + 'T' + value);
                if (Number.isFinite(selected.getTime()) && selected <= new Date()) return 'Келешектегі уақытты таңдаңыз.';
            }
            if ($field.attr('type') === 'number') {
                const limits = {portion_num: [1, 10], guest_count: [1, 10], address_floor: [1, 30], address_entrance: [1, 20]};
                const range = limits[id];
                if (range && (!Number.isInteger(Number(value)) || Number(value) < range[0] || Number(value) > range[1])) return 'Сан ' + range[0] + '–' + range[1] + ' аралығында болуы керек.';
            }
            if (id === 'guest_count' && Number(value) > {two: 2, three: 3, four: 4}[$('#table_zone').val()]) return 'Қонақ саны таңдалған үстел сыйымдылығынан артық.';
            if (id === 'address_street' && value.length < 3) return 'Көше атауы кемінде 3 таңба.';
            if (id === 'comments' && value.length > 500) return 'Пікір ең көбі 500 таңба.';
            return '';
        }
        function applyPromo() {
            const code = $promoInput.val().trim().toUpperCase();
            promo = promoCodes.find(function (entry) { return entry.code === code; }) || null;
            clearError($promoInput);
            if (!promo) { fieldError($promoInput, 'Промокод табылмады.'); $promoResult.text(''); }
            else $promoResult.text(promo.code + ': тағамдарға ' + promo.percent + '% жеңілдік.');
            refresh();
        }
        $order.on('click', 'button[data-action]', function () {
            const $button = $(this);
            const action = $button.attr('data-action');
            if (action === 'promo') { applyPromo(); return; }
            if (action === 'upsell') addItem($button.attr('data-value'), 0);
            else changeCart(action, $button.attr('data-value'));
            refresh();
        });
        $order.on('keydown', '#promo_code', function (event) {
            if (event.key === 'Enter') { event.preventDefault(); applyPromo(); }
        });
        $order.on('input change', 'input, select, textarea', function () {
            const $field = $(this);
            if ($field.is('[name="service_type"]')) updateService(true);
            if ($field.is('#promo_code')) { promo = null; $promoResult.text(''); }
            if ($field.hasClass('is-invalid')) {
                const problem = validateField($field);
                if (problem) fieldError($field, problem); else clearError($field);
            }
            if ($field.is('#table_zone')) {
                const problem = validateField($('#guest_count'));
                if (problem) fieldError($('#guest_count'), problem); else clearError($('#guest_count'));
            }
            refresh();
        });
        $order.on('submit', function (event) {
            event.preventDefault(); // A GET submit would reload and put personal information in the URL.
            // Browser validation improves usability; a real server must repeat all checks before accepting an order.
            $generalError.text('');
            let $first = null;
            $order.find('input:not([type="radio"]):not([type="checkbox"]), select, textarea').each(function () {
                const $field = $(this);
                if ($field.attr('type') === 'text' || $field.is('textarea') || $field.attr('type') === 'email' || $field.attr('type') === 'tel') $field.val(String($field.val() || '').trim());
                const problem = validateField($field);
                if (problem) { fieldError($field, problem); if (!$first) $first = $field; }
                else clearError($field);
            });
            const amount = prices();
            if (service() !== 'dinein' && !amount.food) {
                fieldError($('#main_dish'), 'Тағам таңдаңыз немесе себетке қосыңыз.');
                if (!$first) $first = $('#main_dish');
            }
            if (service() === 'delivery' && amount.food < 3000) $generalError.text('Жеткізу үшін кемінде 3 000 ₸ тағам таңдаңыз.');
            if ($first || $generalError.text()) { if ($first) $first.trigger('focus'); return; }
            const lines = orderLines();
            $result.stop(true, true).empty().addClass('success').append(el('h2', 'h5 text-brand', 'Сұраныс дайын (демо)'),
                el('p', 'fw-bold', 'DK-' + Math.floor(1000 + Math.random() * 9000)),
                el('p', '', $('#username').val() + ' · ' + $('#orderdate').val() + ' · ' + $('#preferred_time').val()),
                el('p', '', $order.find('[name="service_type"]:checked').siblings('label').text()));
            if (service() === 'delivery') $result.append(el('p', 'text-break', $district.find(':selected').text() + ', ' + $('#address_street').val() + ' ' + $('#address_house').val() + ', пәтер ' + $('#address_flat').val() + ', қабат ' + $('#address_floor').val()));
            if (service() === 'dinein') $result.append(el('p', '', $('#table_zone').find(':selected').text() + ' · ' + $('#guest_count').val() + ' қонақ'));
            const $list = el('ul');
            lines.forEach(function (line) { $list.append(el('li', 'text-break', line.name + ' × ' + line.qty + ' = ' + money(line.sum))); });
            $result.append($list, el('p', 'mb-1', 'Тағамдар: ' + money(amount.food)),
                el('p', 'mb-1', 'Жеңілдік: ' + money(amount.discount)),
                el('p', 'mb-1', 'Жеткізу: ' + money(amount.fee)), el('p', 'fw-bold', 'Барлығы: ' + money(amount.total)));
            // .html() is only for trusted static markup. Visitor text always uses .text().
            $result.append(el('p').html('<strong>Демо:</strong> деректер серверге жіберілмейді. Нақты тапсырыс немесе брондау жасалмайды.'));
            cart = []; write(CART_KEY, cart);
            $order.trigger('reset');
            $result.slideUp(0).slideDown(220, function () { $(this).trigger('focus'); });
        });
        $order.on('reset', function () {
            // The browser resets values after this handler, so refresh on the next task.
            setTimeout(function () {
                $order.find('.is-invalid').each(function () { clearError($(this)); });
                promo = null; $promoResult.text(''); $generalError.text('');
                updateService(false);
            }, 0);
        });
        updateService(false);
    }
    function addField($row, id, text, $control) {
        $row.append(el('div', 'col-12 col-md-6').append(el('label', 'form-label', text).attr('for', id), $control));
    }
    $(window).on('storage', function (event) {
        if (event.originalEvent.key === CART_KEY) {
            cart = readCart();
            if ($('#cart-items').length) renderCart($('#cart-items'));
            if ($order.length) $order.find('#main_dish').trigger('change');
        }
    });
});
