//ФАЙЛ -------INDEX------!!!!!

// === МОДАЛЬНОЕ ОКНО (только для index.html и других страниц, где есть #modal) ===
function initializeModal() {
    const modal = document.getElementById('modal');
    const claimButtons = document.querySelectorAll('#header-claim, #hero-claim, #footer-claim');
    const modalContinue = document.getElementById('modal-continue');

    if (!modal || !claimButtons.length || !modalContinue) {
        console.warn("Элементы модального окна не найдены, инициализация пропущена.");
        return;
    }

    claimButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    });

    modalContinue.addEventListener('click', () => {
        modal.classList.remove('active');
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSd43JD1m9aXU2vwiuilfgVJm-o7o_XOiPeAFBwVYSxU_r_9Mg/viewform  ', '_blank');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// === FAQ АККОРДЕОН (только для index.html, где есть .faq-question) ===
function initializeFaq() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) {
        console.warn("Элементы FAQ не найдены, инициализация пропущена.");
        return;
    }

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isOpen = answer.classList.contains('open');
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
            if (!isOpen) {
                answer.classList.add('open');
            }
        });
    });
}


// === ФУНКЦИОНАЛЬНОСТЬ МОДАЛЬНЫХ ОКОН ИЗОБРАЖЕНИЙ (только для index.html, где есть .cert-image и .modal-overlay-cert/.modal-overlay-warranty) ===
function initializeImageModals() {
    // Функция закрытия модального окна
    function closeCertModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Обработчик клика по изображению в секции сертификации
    const certImages = document.querySelectorAll('.cert-image');
    if (certImages.length) { // Проверяем, есть ли элементы
        certImages.forEach(img => {
            img.addEventListener('click', () => {
                const modalId = img.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                }
            });
        });

        // Обработчик клика по крестику закрытия
        document.querySelectorAll('.modal-close-cert, .modal-close-warranty').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const modalId = this.getAttribute('data-modal');
                closeCertModal(modalId);
            });
        });

        // Закрытие модального окна при клике на оверлей (фон)
        document.querySelectorAll('.modal-overlay-cert, .modal-overlay-warranty').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                // Проверяем, был ли клик именно на оверлее, а не на контенте модального окна
                if (e.target === overlay) {
                    const modalId = overlay.id;
                    closeCertModal(modalId);
                }
            });
        });

        // Закрытие модального окна при клике на увеличенное изображение внутри него
        document.querySelectorAll('.modal-cert-img, .modal-warranty-img').forEach(img => {
            img.addEventListener('click', function() {
                // Находим родительское модальное окно для этого изображения
                const modalContainer = this.closest('.modal-cert, .modal-warranty');
                if (modalContainer) {
                    // Находим оверлей, соответствующий этому модальному окну
                    const modalOverlay = modalContainer.closest('.modal-overlay-cert, .modal-overlay-warranty');
                    if (modalOverlay && modalOverlay.classList.contains('active')) {
                        // Находим ID оверлея и вызываем функцию закрытия
                        closeCertModal(modalOverlay.id);
                    }
                }
            });
        });

        // Закрытие модального окна при клике на любую область внутри контента (.modal-cert или .modal-warranty), кроме крестика
        document.querySelectorAll('.modal-cert, .modal-warranty').forEach(modalContent => {
            modalContent.addEventListener('click', function(e) {
                // Проверяем, был ли клик *внутри* контента модального окна (например, на фоне изображения)
                // и *не* был ли клик по крестику закрытия
                if (e.currentTarget === this && !this.querySelector('.modal-close-cert, .modal-close-warranty').contains(e.target)) {
                    // Находим оверлей, соответствующий этому модальному контенту
                    const modalOverlay = this.closest('.modal-overlay-cert, .modal-overlay-warranty');
                    if (modalOverlay && modalOverlay.classList.contains('active')) {
                        closeCertModal(modalOverlay.id);
                    }
                }
            });
        });
    } else {
        console.warn("Элементы модальных окон изображений не найдены, инициализация пропущена.");
    }
}

// КРИПТ ДЛЯ ЗАГРУЗКИ И ГЕНЕРАЦИИ КАРТОЧЕК//
// Скрипт для загрузки данных и генерации карточек на главной странице (горизонтальный скролл)
async function loadAndRenderBlogCardsMain(containerId, maxCards = 10) { // Увеличим maxCards для демонстрации скролла
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Контейнер с ID '${containerId}' не найден для рендеринга карточек на главной.`);
        return;
    }

    try {
        // Загружаем JSON файл
        const response = await fetch('articles_list.json');
        if (!response.ok) {
            throw new Error(`Ошибка загрузки articles_list.json: ${response.status} ${response.statusText}`);
        }
        const blogPosts = await response.json();

        // Очищаем контейнер
        container.innerHTML = '';

        // Ограничиваем количество отображаемых карточек (опционально, для примера)
        const postsToShow = blogPosts.slice(0, maxCards);

        // Создаём контейнер для карточек с горизонтальным скроллом
        const scrollContainer = document.createElement('div');
        scrollContainer.style.display = 'flex';
        scrollContainer.style.gap = '40px'; // Отступ между карточками
        scrollContainer.style.overflowX = 'auto'; // Горизонтальный скролл
        scrollContainer.style.padding = '10px 0'; // Небольшие отступы сверху/снизу
        scrollContainer.style.scrollbarWidth = 'thin'; // Для Firefox
        scrollContainer.style.msOverflowStyle = 'auto'; // Для IE/Edge
        // Стиль полосы прокрутки (опционально)
        scrollContainer.style.cssText += `
            scrollbar-width: thin;
            -ms-overflow-style: auto;
        `;
        // Стили для Webkit (Chrome, Safari, Edge)
        const style = document.createElement('style');
        style.textContent = `
            #${containerId} div::-webkit-scrollbar {
                height: 8px; /* Высота горизонтальной полосы прокрутки */
            }
            #${containerId} div::-webkit-scrollbar-track {
                background: rgba(211, 223, 240, 0.2); /* Цвет фона полосы */
                border-radius: 4px;
            }
            #${containerId} div::-webkit-scrollbar-thumb {
                background: var(--accent); /* Цвет бегунка */
                border-radius: 4px;
            }
            #${containerId} div::-webkit-scrollbar-thumb:hover {
                background: var(--accent2); /* Цвет бегунка при наведении */
            }
        `;
        document.head.appendChild(style);

        postsToShow.forEach(post => {
            const cardHTML = `
                <div class="glass-card" style="flex: 0 0 auto; width: 300px;"> <!-- Устанавливаем фиксированную ширину карточки и запрещаем сжиматься -->
                    <img src="${post.thumbnail}" alt="${post.alt}" title="${post.title}" style="width: 100%; height: auto; border-radius: 16px; margin-bottom: 15px;" loading="lazy">
                    <h3 style="color: var(--accent); margin-bottom: 10px; font-size: 1.3rem;">${post.title}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 15px; font-size: 1rem;">${post.description}</p>
                    <a href="${post.slug}.html" class="nav-link" style="display: inline-block; color: var(--accent); font-weight: 600;">Читать далее</a>
                </div>
            `;
            scrollContainer.innerHTML += cardHTML; // Добавляем карточку в скроллящийся контейнер
        });

        container.appendChild(scrollContainer); // Добавляем скроллящийся контейнер в основной контейнер

    } catch (error) {
        console.error('Ошибка при загрузке или отображении статей на главной:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Ошибка загрузки статей.</p>';
    }
}

//ФАЙЛ ------ARTICLE------- !!!!!!!!

// Скрипт для загрузки данных и генерации карточек на странице статей
async function loadAndRenderBlogCardsArticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Контейнер с ID '${containerId}' не найден для рендеринга карточек на странице статей.`);
        return;
    }

    try {
        // Загружаем JSON файл
        const response = await fetch('articles_list.json');
        if (!response.ok) {
            throw new Error(`Ошибка загрузки articles_list.json: ${response.status} ${response.statusText}`);
        }
        const blogPosts = await response.json();

        // Очищаем контейнер
        container.innerHTML = '';

        // Проходим по ВСЕМ статьям
        blogPosts.forEach(post => {
            const cardHTML = `
                <a href="${post.slug}.html" class="blog-card">
                    <img src="${post.thumbnail}" alt="${post.alt}" class="blog-card-img" loading="lazy">
                    <div class="blog-card-content">
                        <div>
                            <h3>${post.title}</h3>
                            <p>${post.description}</p>
                        </div>
                        <span class="read-more-link">Читать далее</span>
                    </div>
                </a>
            `;
            container.innerHTML += cardHTML; // Добавляем карточку в контейнер
        });

    } catch (error) {
        console.error('Ошибка при загрузке или отображении статей на странице блога:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Ошибка загрузки статей.</p>';
    }
}

//ФАЙЛ ------BLOG1   BLOG2    BLOG3     и др.------- !!!!!!!!

// Скрипт для загрузки данных и генерации карточек других статей
async function loadAndRenderOtherBlogCards(containerId, currentSlug, maxCards = 10) { // maxCards - ограничение количества
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Контейнер с ID '${containerId}' не найден для рендеринга других статей.`);
        return;
    }

    try {
        // Загружаем JSON файл
        const response = await fetch('articles_list.json');
        if (!response.ok) {
            throw new Error(`Ошибка загрузки articles_list.json: ${response.status} ${response.statusText}`);
        }
        const blogPosts = await response.json();

        // Очищаем контейнер
        container.innerHTML = '';

        // Фильтруем, чтобы исключить текущую статью
        const otherPosts = blogPosts.filter(post => post.slug !== currentSlug);

        // Ограничиваем количество отображаемых карточек
        const postsToShow = otherPosts.slice(0, maxCards);

        postsToShow.forEach(post => {
            const cardHTML = `
                <div class="glass-card" style="flex: 0 0 auto; width: 300px; margin: 0; height: fit-content;"> <!-- Устанавливаем фиксированную ширину карточки и запрещаем сжиматься -->
                    <img src="${post.thumbnail}" alt="${post.alt}" title="${post.title}" style="width: 100%; height: auto; border-radius: 16px; margin-bottom: 15px;" loading="lazy">
                    <h3 style="color: var(--accent); margin-bottom: 10px; font-size: 1.3rem;">${post.title}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 15px; font-size: 1rem;">${post.description}</p>
                    <a href="${post.slug}.html" class="nav-link" style="display: inline-block; color: var(--accent); font-weight: 600;">Читать далее</a>
                </div>
            `;
            container.innerHTML += cardHTML; // Добавляем карточку в контейнер
        });

        if (postsToShow.length === 0) {
            container.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-secondary);">Других статей пока нет.</p>';
        }

    } catch (error) {
        console.error('Ошибка при загрузке или отображении других статей:', error);
        container.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-secondary);">Ошибка загрузки других статей.</p>';
    }
}


// === ФУНКЦИОНАЛЬНОСТЬ КОПИРОВАНИЯ ТЕЛЕФОНА И ПОЧТЫ (только для страниц, где есть #copy-phone-btn и #copy-email-btn) ===
function initializeCopyButtons() {
    const phoneBtn = document.getElementById('copy-phone-btn');
    const emailBtn = document.getElementById('copy-email-btn');
    const phoneMsg = document.getElementById('phone-copied-message');
    const emailMsg = document.getElementById('email-copied-message');

    if (!phoneBtn || !emailBtn) {
        console.warn("Кнопки копирования не найдены, инициализация пропущена.");
        return;
    }

    // Тексты для копирования
    const phoneNumber = '+7 (960) 218-84-00';
    const emailAddress = 'klinika-pechey@mail.ru';

    // Функция для копирования текста и показа сообщения
    function copyToClipboard(text, messageElement) {
        navigator.clipboard.writeText(text).then(function() {
            // Показываем сообщение
            messageElement.style.display = 'inline';
            // Скрываем через 2 секунды
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 2000);
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            // Можно показать альтернативное сообщение об ошибке
        });
    }

    // Обработчики кликов
    phoneBtn.addEventListener('click', () => {
        copyToClipboard(phoneNumber, phoneMsg);
    });

    emailBtn.addEventListener('click', () => {
        copyToClipboard(emailAddress, emailMsg);
    });
}


// === ФУНКЦИОНАЛЬНОСТЬ МОДАЛЬНОГО ОКНА (для страниц, где есть #header-claim и #modal-continue) ===
function initializePageModal() {
    const modalTrigger = document.getElementById('header-claim');
    const modalCloseBtn = document.getElementById('modal-continue');
    const modal = document.getElementById('modal'); // Ищем модальное окно

    if (!modal || !modalTrigger || !modalCloseBtn) {
        console.warn("Элементы модального окна на странице статьи не найдены, инициализация пропущена.");
        return;
    }

    function openModal() { modal.classList.add('active'); }
    function closeModal() { modal.classList.remove('active'); }

    modalTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    modalCloseBtn.addEventListener('click', () => {
        closeModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) { closeModal(); }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) { closeModal(); }
    });
}

// === ФУНКЦИОНАЛЬНОСТЬ СКРЫТИЯ/ПОЯВЛЕНИЯ ШАПКИ (только для страниц, где есть #main-header) ===
function initializeHeaderHide() {
    const header = document.getElementById('main-header'); // Проверяем, есть ли элемент
    if (!header) {
        console.warn("Элемент шапки #main-header не найден, инициализация пропущена.");
        return;
    }

    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    window.addEventListener('scroll', function() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Если прокручиваем вниз
        if (currentScrollTop > lastScrollTop) {
            header.classList.add('hidden');
        // Если прокручиваем вверх
        } else {
            header.classList.remove('hidden');
        }

        // Обновляем последнюю позицию прокрутки
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // Для iOS
    });
}


// === СКРИПТ ДЛЯ АКТИВАЦИИ ССЫЛКИ "БЛОГ" В ШАПКЕ ===
function initializeBlogLink() {
    // Находим все навигационные ссылки
    const navLinks = document.querySelectorAll('.nav-link');

    // Пройдемся по всем ссылкам
    navLinks.forEach(link => {
        // Проверяем, ведёт ли ссылка на article.html (страницу со списком статей)
        // или является ли текущая страница (например, blog1.html) отличной от index.html
        // и при этом ссылка ведёт на article.html
        if (link.getAttribute('href') === 'article.html') {
            // Убираем класс 'active' у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            // Добавляем класс 'active' к найденной ссылке "Блог"
            link.classList.add('active');
            // Прерываем цикл, так как нашли нужную ссылку
            return;
        }
    });
}



/// === ФУНКЦИОНАЛЬНОСТЬ ГАМБУРГЕР МЕНЮ (Telegram-стиль, с левой стороны, с интерактивным свайпом) ===
function initializeHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.mobile-nav-link');
  const claimButtons = document.querySelectorAll('#header-claim, #hero-claim, #footer-claim, #mobile-claim');

  // Переменные для отслеживания свайпа
  let touchStartX = 0;
  let touchCurrentX = 0;
  let touchEndX = 0;
  let menuWidth = 0;
  let initialMenuTransform = 0;
  let isDragging = false;

  if (!hamburgerBtn) {
    console.warn("Кнопка гамбургер-меню не найдена, инициализация пропущена.");
    return;
  }

  // Функция открытия меню
  function openMenu() {
    // Рассчитываем ширину меню перед открытием
    mobileMenu.classList.remove('active');
    mobileMenu.style.transform = 'translateX(-100%)'; // Убеждаемся, что скрыто
    menuWidth = mobileMenu.getBoundingClientRect().width;
    mobileMenu.style.transform = ''; // Сбрасываем стиль перед активацией
    mobileMenu.classList.add('active'); // Применяем CSS-анимацию открытия
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Скрываем кнопку гамбургера
    hamburgerBtn.classList.add('hidden');
  }

  // Функция закрытия меню
  function closeMenu() {
    mobileMenu.classList.remove('active');
    setTimeout(() => {
      mobileMenuOverlay.classList.remove('active');
    }, 300);
    document.body.style.overflow = '';
    // Показываем кнопку гамбургера
    hamburgerBtn.classList.remove('hidden');
  }

  // Обработчик клика по гамбургеру
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMenu();
  });

  // Обработчик клика по оверлею (вне меню)
  mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) {
      closeMenu();
    }
  });

  // Обработчик клика по ссылкам и кнопке внутри меню
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        setTimeout(() => {
          closeMenu();
        }, 100);
      } else {
        closeMenu();
      }
    });
  });

  claimButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setTimeout(() => {
        closeMenu();
      }, 100);
    });
  });

// === СВАЙП ДЛЯ ЗАКРЫТИЯ МЕНЮ (Telegram-стиль: свайп влево по меню, чтобы задвинуть его влево) ===
// Touch events для мобильных устройств
mobileMenu.addEventListener('touchstart', e => {
    console.log('=== TOUCH START ===');
    console.log('Menu active:', mobileMenu.classList.contains('active'));
    
    if (!mobileMenu.classList.contains('active')) return;
    
    touchStartX = e.changedTouches[0].screenX;
    console.log('touchStartX:', touchStartX);
    
    // Получаем текущее значение transform
    const currentTransform = getComputedStyle(mobileMenu).transform;
    console.log('Current transform:', currentTransform);
    
    if (currentTransform !== 'none' && currentTransform !== 'matrix(1, 0, 0, 1, 0, 0)') {
        const matrix = new DOMMatrixReadOnly(currentTransform);
        initialMenuTransform = matrix.m41;
    } else {
        initialMenuTransform = 0;
    }
    
    console.log('initialMenuTransform:', initialMenuTransform);
    
    // Рассчитываем ширину меню при начале перетаскивания, если еще не рассчитана
    if (menuWidth === 0) {
        menuWidth = mobileMenu.getBoundingClientRect().width;
    }
    console.log('menuWidth:', menuWidth);
    
    isDragging = true;
    // Отключаем CSS-переходы во время перетаскивания
    mobileMenu.style.transition = 'none';
    console.log('Transition set to none');
    
    if (e.cancelable) e.preventDefault();
}, { passive: false });

mobileMenu.addEventListener('touchmove', e => {
    if (!isDragging) return;
    
    touchCurrentX = e.changedTouches[0].screenX;
    const deltaX = touchCurrentX - touchStartX;
    
    console.log('=== TOUCH MOVE ===');
    console.log('touchCurrentX:', touchCurrentX);
    console.log('deltaX:', deltaX);
    console.log('initialMenuTransform:', initialMenuTransform);
    
    // Правильная логика: при движении пальца влево (deltaX < 0), меню должно уходить влево (transform должен уменьшаться)
    // Это означает, что мы ДОБАВЛЯЕМ deltaX, а не вычитаем
    let newTransformX = initialMenuTransform + deltaX;
    console.log('Calculated newTransformX before limits:', newTransformX);
    
    // Ограничиваем движение: от -menuWidth (полностью закрыто) до 0 (полностью открыто)
    // Меняем местами мин и макс, чтобы диапазон был [-menuWidth, 0]
    newTransformX = Math.max(Math.min(newTransformX, 0), -menuWidth);
    console.log('newTransformX after limits:', newTransformX);
    
    mobileMenu.style.transform = `translateX(${newTransformX}px)`;
    console.log('Applied transform:', mobileMenu.style.transform);
    
    // Проверим, действительно ли стиль был применен
    const appliedTransform = getComputedStyle(mobileMenu).transform;
    console.log('Actual computed transform after setting:', appliedTransform);
    
    if (e.cancelable) e.preventDefault();
}, { passive: false });

mobileMenu.addEventListener('touchend', e => {
    if (!isDragging) return;
    
    console.log('=== TOUCH END ===');
    
    // Получаем текущее положение меню
    const currentTransformX = parseFloat(mobileMenu.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    const threshold = menuWidth * 0.3; // 30% от ширины меню

    console.log('Final transform:', currentTransformX);
    console.log('Threshold:', threshold);
    console.log('Should close:', currentTransformX < -threshold);

    // Включаем CSS-переход для анимации завершения
    mobileMenu.style.transition = 'transform 0.3s ease-out';
    console.log('Transition restored');

    // Если меню сдвинуто более чем на 30% влево (currentTransformX < -threshold), закрываем его
    if (currentTransformX < -threshold) {
        console.log('Closing menu');
        mobileMenu.style.transform = `translateX(${-menuWidth}px)`;

        const handleTransitionEnd = () => {
            mobileMenu.classList.remove('active');
            mobileMenu.style.transition = '';
            mobileMenu.style.transform = '';
            closeMenu();
            console.log('Menu closed');
            mobileMenu.removeEventListener('transitionend', handleTransitionEnd);
        };
        mobileMenu.addEventListener('transitionend', handleTransitionEnd, { once: true });
    } else {
        console.log('Returning menu');
        // Возвращаем меню обратно в открытое положение (0px)
        mobileMenu.style.transform = 'translateX(0px)';

        const handleReturnTransitionEnd = () => {
            mobileMenu.style.transition = '';
            mobileMenu.style.transform = '';
            mobileMenu.removeEventListener('transitionend', handleReturnTransitionEnd);
        };
        mobileMenu.addEventListener('transitionend', handleReturnTransitionEnd, { once: true });
    }

    isDragging = false;
});

// Mouse events для тестирования на десктопе
mobileMenu.addEventListener('mousedown', e => {
    console.log('=== MOUSE DOWN ===');
    console.log('Menu active:', mobileMenu.classList.contains('active'));
    
    if (!mobileMenu.classList.contains('active')) return;
    
    touchStartX = e.screenX;
    console.log('touchStartX:', touchStartX);
    
    const currentTransform = getComputedStyle(mobileMenu).transform;
    console.log('Current transform:', currentTransform);
    
    if (currentTransform !== 'none' && currentTransform !== 'matrix(1, 0, 0, 1, 0, 0)') {
        const matrix = new DOMMatrixReadOnly(currentTransform);
        initialMenuTransform = matrix.m41;
    } else {
        initialMenuTransform = 0;
    }
    
    console.log('initialMenuTransform:', initialMenuTransform);
    
    if (menuWidth === 0) {
        menuWidth = mobileMenu.getBoundingClientRect().width;
    }
    console.log('menuWidth:', menuWidth);
    
    isDragging = true;
    mobileMenu.style.transition = 'none';
    console.log('Transition set to none');
    e.preventDefault();
});

document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    
    touchCurrentX = e.screenX;
    const deltaX = touchCurrentX - touchStartX;
    
    console.log('=== MOUSE MOVE ===');
    console.log('touchCurrentX:', touchCurrentX);
    console.log('deltaX:', deltaX);
    console.log('initialMenuTransform:', initialMenuTransform);
    
    // При движении пальца влево (deltaX < 0), меню должно уходить влево
    let newTransformX = initialMenuTransform + deltaX;
    console.log('Calculated newTransformX before limits:', newTransformX);
    
    // Ограничиваем движение: от -menuWidth до 0
    newTransformX = Math.max(Math.min(newTransformX, 0), -menuWidth);
    console.log('newTransformX after limits:', newTransformX);
    
    mobileMenu.style.transform = `translateX(${newTransformX}px)`;
    console.log('Applied transform:', mobileMenu.style.transform);
    
    const appliedTransform = getComputedStyle(mobileMenu).transform;
    console.log('Actual computed transform after setting:', appliedTransform);
    
    e.preventDefault();
});

document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    
    console.log('=== MOUSE UP ===');
    
    const currentTransformX = parseFloat(mobileMenu.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    const threshold = menuWidth * 0.3;
    
    console.log('Final transform:', currentTransformX);
    console.log('Threshold:', threshold);
    console.log('Should close:', currentTransformX < -threshold);

    mobileMenu.style.transition = 'transform 0.3s ease-out';
    console.log('Transition restored');

    if (currentTransformX < -threshold) {
        console.log('Closing menu');
        mobileMenu.style.transform = `translateX(${-menuWidth}px)`;

        const handleTransitionEnd = () => {
            mobileMenu.classList.remove('active');
            mobileMenu.style.transition = '';
            mobileMenu.style.transform = '';
            closeMenu();
            console.log('Menu closed');
            mobileMenu.removeEventListener('transitionend', handleTransitionEnd);
        };
        mobileMenu.addEventListener('transitionend', handleTransitionEnd, { once: true });
    } else {
        console.log('Returning menu');
        mobileMenu.style.transform = 'translateX(0px)';

        const handleReturnTransitionEnd = () => {
            mobileMenu.style.transition = '';
            mobileMenu.style.transform = '';
            mobileMenu.removeEventListener('transitionend', handleReturnTransitionEnd);
        };
        mobileMenu.addEventListener('transitionend', handleReturnTransitionEnd, { once: true });
    }

    isDragging = false;
});
}





// === ВЫЗОВ ФУНКЦИЙ ЗАГРУЗКИ СТАТЕЙ И ИНИЦИАЛИЗАЦИИ ===
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация функций, которые могут понадобиться на разных страницах
    initializeBlogLink(); // Активация ссылки "Блог" работает везде
    initializeHamburgerMenu(); // Инициализация гамбургер-меню (Telegram-стиль) работает везде

    // Проверяем, находимся ли мы на странице index.html
    if (document.getElementById('blog-grid-main')) {
        // Находимся на index.html
        loadAndRenderBlogCardsMain('blog-grid-main', 10);
        initializeModal(); // Инициализируем модальное окно для index.html
        initializeFaq(); // Инициализируем FAQ для index.html
        initializeImageModals(); // Инициализируем модальные окна изображений для index.html
    }

    // Проверяем, находимся ли мы на странице article.html
    if (document.getElementById('-')) { // Используем ID из Вашего article.html
        // Находимся на article.html
        loadAndRenderBlogCardsArticles('-');
        initializePageModal(); // Инициализируем модальное окно для article.html
    }

    // Проверяем, находимся ли мы на странице статьи (например, blog1.html, blog2.html и т.д.)
    if (document.getElementById('other-articles-grid')) {
        // Находимся на странице статьи (например, blog1.html)
        // Определяем slug текущей статьи из URL
        // Берём последнюю часть URL (путь) и убираем .html
        const path = window.location.pathname;
        const slug = path.split('/').pop().replace('.html', '');
        // Вызываем функцию для загрузки *других* статей
        // Например, если находимся на blog1.html, slug будет 'blog1'
        loadAndRenderOtherBlogCards('other-articles-grid', slug, 10);
        initializePageModal(); // Инициализируем модальное окно для страниц статей
    }

    // Инициализация копирования и скрытия шапки, если элементы существуют
    initializeCopyButtons(); // Копирование работает на index.html, article.html, blog1.html и т.д.
    initializeHeaderHide(); // Скрытие шапки работает на index.html, article.html, blog1.html и т.д.
});