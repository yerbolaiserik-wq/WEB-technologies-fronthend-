'use strict';

// Menu categories
const categories = [
    { id: 'soups', name: 'Бірінші тағамдар' },
    { id: 'main-dishes', name: 'Екінші тағамдар' },
    { id: 'fast-food', name: 'Фаст-фуд' },
    { id: 'salads', name: 'Салаттар' },
    { id: 'extras', name: 'Қосымша' },
    { id: 'drinks', name: 'Сусындар' },
    { id: 'tea-list', name: 'Шай' }
];


const menuItems = [
    { id: 'sorpa', name: 'Сорпа', category: 'soups', prices: [2000], sizes: [], image: 'images/menu/sorpa.jpg', description: 'Ет сорпасы, картоп және көкөніс қосылады.' },
    { id: 'guyru_lagman', name: 'Гүйру лағман', category: 'soups', prices: [2000], sizes: [], image: 'images/menu/guyru_lagman.jpg', description: 'Қол кеспе, ет және көкөніс қосылған ыстық тағам.' },
    { id: 'tushpara', name: 'Тұшпара', category: 'soups', prices: [2000], sizes: [], image: 'images/menu/tushpara.jpg', description: 'Қамыр ішіне ет салынып, сорпамен беріледі.' },
    { id: 'naryn', name: 'Нарын', category: 'soups', prices: [2000], sizes: [], image: 'images/menu/naryn.jpg', description: 'Ет пен жұқа қамырдан дайындалатын ұлттық тағам.' },
    { id: 'bulon', name: 'Бульон', category: 'soups', prices: [700], sizes: [], image: 'images/menu/bulon.jpg', description: 'Жеңіл әрі ыстық ет сорпасы.' },

    { id: 'palau', name: 'Палау', category: 'main-dishes', prices: [2000], sizes: [], image: 'images/menu/palau.jpg', description: 'Күріш, ет, сәбіз және дәмдеуішпен дайындалады.' },
    { id: 'unquyrdaq', name: 'Ұнқуырдақ', category: 'main-dishes', prices: [2200], sizes: [], image: 'images/menu/unquyrdaq.jpg', description: 'Қуырылған ет және ұн қосылған қою тағам.' },
    { id: 'fried_lagman', name: 'Қуырылған лағман', category: 'main-dishes', prices: [2200], sizes: [], image: 'images/menu/fried_lagman.jpg', description: 'Кеспе, ет және көкөніс қуырылып беріледі.' },
    { id: 'quyrdaq', name: 'Қуырдақ', category: 'main-dishes', prices: [3800], sizes: [], image: 'images/menu/quyrdaq.jpg', description: 'Ет пен картоп қуырылып дайындалатын қою тағам.' },
    { id: 'qazan_kebab', name: 'Қазан кебаб', category: 'main-dishes', prices: [2900], sizes: [], image: 'images/menu/qazan_kebab.jpg', description: 'Қазанда дайындалған ет және картоп.' },
    { id: 'hanuma', name: 'Ханума', category: 'main-dishes', prices: [2000], sizes: [], image: 'images/menu/hanuma.jpg', description: 'Буға піскен қамырлы ұлттық тағам.' },
    { id: 'cabbage_roll', name: 'Орамжапырақ орамасы', category: 'main-dishes', prices: [2000], sizes: [], image: 'images/menu/cabbage_roll.jpg', description: 'Орамжапырақ ішіне ет пен күріш салынып дайындалады.' },
    { id: 'cutlet_puree', name: 'Картоп езбесімен котлет', category: 'main-dishes', prices: [2000], sizes: [], image: 'images/menu/cutlet_puree.jpg', description: 'Котлет жұмсақ картоп езбесімен бірге беріледі.' },
    { id: 'rice_sauce', name: 'Күрішпен тұздық', category: 'main-dishes', prices: [2000], sizes: [], image: 'images/menu/rice_sauce.jpg', description: 'Күріш және етті тұздық қосылған ыстық тағам.' },

    { id: 'margarita', name: 'Маргарита пиццасы', category: 'fast-food', prices: [2100], sizes: [], image: 'images/menu/margarita.jpg', description: 'Қызанақ соусы және ірімшік қосылған пицца.' },
    { id: 'four_cheese', name: 'Төрт сыр пиццасы', category: 'fast-food', prices: [2600], sizes: [], image: 'images/menu/four_cheese.jpg', description: 'Төрт түрлі ірімшік қосылған жұмсақ пицца.' },
    { id: 'pepperoni', name: 'Пепперони пиццасы', category: 'fast-food', prices: [2400], sizes: [], image: 'images/menu/pepperoni.jpg', description: 'Пепперони, ірімшік және қызанақ соусы.' },
    { id: 'bbq_pizza', name: 'BBQ пиццасы', category: 'fast-food', prices: [2400], sizes: [], image: 'images/menu/bbq_pizza.jpg', description: 'BBQ соусы, ет және ірімшік қосылған пицца.' },
    { id: 'cheese_sticks', name: 'Сыр таяқшалары', category: 'fast-food', prices: [1500], sizes: [], image: 'images/menu/cheese_sticks.jpg', description: 'Іші жұмсақ сыр, сырты қытырлақ тіскебасар.' },
    { id: 'nuggets', name: 'Наггетстер, 8 дана', category: 'fast-food', prices: [1500], sizes: [], image: 'images/menu/nuggets.jpg', description: 'Қытырлақ тауық наггетстері.' },
    { id: 'potato_wedges', name: 'Картоп бөліктері', category: 'fast-food', prices: [1500], sizes: [], image: 'images/menu/potato_wedges.jpg', description: 'Дәмдеуіш қосылған картоп бөліктері.' },
    { id: 'fries', name: 'Фри', category: 'fast-food', prices: [1000], sizes: [], image: 'images/menu/fries.jpg', description: 'Қытырлақ картоп фри.' },

    { id: 'olivye', name: 'Оливье', category: 'salads', prices: [1400], sizes: [], image: 'images/menu/olivye.jpg', description: 'Классикалық салат, көкөніс және майонез.' },
    { id: 'achik_chuchuk', name: 'Ачық-чучук', category: 'salads', prices: [1300], sizes: [], image: 'images/menu/achik_chuchuk.jpg', description: 'Қызанақ, пияз және көк шөп қосылған жеңіл салат.' },
    { id: 'balgin', name: 'Балғын', category: 'salads', prices: [1300], sizes: [], image: 'images/menu/balgin.jpg', description: 'Маусымдық көкөністерден дайындалған салат.' },

    { id: 'tandyr_nan', name: 'Тандыр нан', category: 'extras', prices: [150, 300], sizes: ['жарты', 'толық'], image: 'images/menu/tandyr_nan.jpg', description: 'Ыстық нан, жарты немесе толық порция.' },
    { id: 'ketchup', name: 'Кетчуп', category: 'extras', prices: [200], sizes: [], image: 'images/menu/ketchup.jpg', description: 'Пицца және фаст-фудқа арналған тұздық.' },
    { id: 'mayo', name: 'Майонез', category: 'extras', prices: [200], sizes: [], image: 'images/menu/mayo.jpg', description: 'Қосымша тұздық ретінде беріледі.' },
    { id: 'cheese_sauce', name: 'Сырлы тұздық', category: 'extras', prices: [200], sizes: [], image: 'images/menu/cheese_sauce.jpg', description: 'Фаст-фуд тағамдарына арналған тұздық.' },
    { id: 'jalapeno', name: 'Халапеньо', category: 'extras', prices: [200], sizes: [], image: 'images/menu/jalapeno.jpg', description: 'Ащы дәм қосатын қосымша.' },

    { id: 'soda', name: 'Coca-Cola, Pepsi, Fanta, Sprite', category: 'drinks', prices: [800], sizes: [], image: 'images/menu/soda.jpg', description: 'Газдалған салқын сусындар.' },
    { id: 'iced_tea', name: 'Maxi шай, Fuse tea', category: 'drinks', prices: [800], sizes: [], image: 'images/menu/iced_tea.jpg', description: 'Салқын шай түрлері.' },
    { id: 'water', name: 'Су', category: 'drinks', prices: [400, 600], sizes: ['0.5 л', '1 л'], image: 'images/menu/water.webp', description: 'Бөтелкедегі таза су.' },
    { id: 'turan_tea', name: 'Тұран шайы', category: 'drinks', prices: [500, 800], sizes: ['0.5 л', '1 л'], image: 'images/menu/turan_tea.jpg', description: 'Дайын салқын шай сусыны.' },
    { id: 'gorilla', name: 'Gorilla', category: 'drinks', prices: [700], sizes: [], image: 'images/menu/gorilla.webp', description: 'Энергетикалық сусын.' },
    { id: 'mojito', name: 'Мохито', category: 'drinks', prices: [800], sizes: [], image: 'images/menu/mojito.jpg', description: 'Салқын сергітетін сусын.' },
    { id: 'energy_drink', name: 'Анар, Dizzy, Zigi Zagi', category: 'drinks', prices: [600], sizes: [], image: 'images/menu/energy_drink.jpg', description: 'Салқын сусын түрлері.' },

    { id: 'black_tea', name: 'Қара шай', category: 'tea-list', prices: [300, 700], sizes: ['кесе', 'шәйнек'], image: 'images/menu/black_tea.jpg', description: 'Шәйнекпен немесе кесемен беріледі.' },
    { id: 'milk_tea', name: 'Сүтті шай', category: 'tea-list', prices: [300, 700], sizes: ['кесе', 'шәйнек'], image: 'images/menu/milk_tea.jpg', description: 'Сүт қосылған қара шай.' },
    { id: 'green_tea', name: 'Көк шай', category: 'tea-list', prices: [300, 700], sizes: ['кесе', 'шәйнек'], image: 'images/menu/green_tea.jpg', description: 'Жеңіл көк шай, кесемен немесе шәйнекпен.' },
    { id: 'tashkent_tea', name: 'Ташкент шайы', category: 'tea-list', prices: [1200, 1500], sizes: ['кіші', 'үлкен'], image: 'images/menu/tashkent_tea.jpg', description: 'Лимон, жалбыз және жеміс қосылған шай.' },
    { id: 'coffee', name: 'Кофе', category: 'tea-list', prices: [400, 1000], sizes: ['шағын', 'үлкен'], image: 'images/menu/coffee.webp', description: 'Ыстық кофе, шағын немесе үлкен көлем.' },
    { id: 'compote', name: 'Компот', category: 'tea-list', prices: [300, 800], sizes: ['кесе', 'құмыра'], image: 'images/menu/compote.jpg', description: 'Үй компоты, кесемен немесе құмырамен.' },
    { id: 'karkade', name: 'Каркаде', category: 'tea-list', prices: [300, 800], sizes: ['кесе', 'шәйнек'], image: 'images/menu/karkade.jpg', description: 'Жеміс дәмі бар қызыл шай.' }
];

// Delivery destinations
const deliveryDistricts = [
    { id: 'center', name: 'Қала орталығы (Центр)', fee: 800 },
    { id: 'southeast', name: 'Оңтүстік-Шығыс (Юго-Восток)', fee: 500 },
    { id: 'maikuduk', name: 'Майқұдық', fee: 1200 },
    { id: 'prishakhtinsk', name: 'Пришахтинск', fee: 1200 },
    { id: 'sortirovka', name: 'Сұрыптау (Сортировка)', fee: 1000 },
    { id: 'mikhailovka', name: 'Михайловка', fee: 900 },
    { id: 'kungey', name: 'Күнгей', fee: 700 }
];


const promoCodes = [
    { code: 'KHAN2552', percent: 10 }
];


const reviews = [
    { name: 'Айгерім', text: 'Палау өте дәмді, порциясы үлкен. Қызмет көрсету жылдам болды.', rating: 5, date: '2026-09-14T19:30:00' },
    { name: 'Нұрлан', text: 'Достарымызбен келдік, қуырдақ ұнады. Үстел тыныш жерде болды.', rating: 4, date: '2026-09-20T13:10:00' },
    { name: 'Динара', text: 'Лағман ыстық берілді, шай да жақсы. Тағы келеміз.', rating: 5, date: '2026-10-02T18:45:00' }
];
