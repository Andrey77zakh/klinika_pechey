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



// === ФУНКЦИОНАЛЬНОСТЬ ГАМБУРГЕР МЕНЮ (Telegram-стиль, с левой стороны, с интерактивным свайпом) ===
function initializeHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenu = document.getElementById('mobile-menu');
  
  // Проверка элементов меню
  console.log('=== Checking menu elements ===');
  console.log('mobileMenu element:', mobileMenu);
  console.log('navLinks selector result:', document.querySelectorAll('.mobile-nav-link'));
  console.log('claimButtons selector result:', document.querySelectorAll('#header-claim, #hero-claim, #footer-claim, #mobile-claim'));

  const navLinks = document.querySelectorAll('.mobile-nav-link');
  const claimButtons = document.querySelectorAll('#header-claim, #hero-claim, #footer-claim, #mobile-claim');

  console.log('navLinks array length:', navLinks.length);
  console.log('claimButtons array length:', claimButtons.length);

  console.log('navLinks elements:', Array.from(navLinks));
  console.log('claimButtons elements:', Array.from(claimButtons));

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
    console.log('=== closeMenu called ===');
    mobileMenu.classList.remove('active');
    console.log('Removed active class from mobileMenu');
    
    // Убираем оверлей СРАЗУ
    mobileMenuOverlay.classList.remove('active');
    console.log('Removed active class from mobileMenuOverlay');
    
    document.body.style.overflow = '';
    console.log('Restored body overflow');
    
    // Показываем кнопку гамбургера
    hamburgerBtn.classList.remove('hidden');
    console.log('Removed hidden class from hamburgerBtn');
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

  // === ОБРАБОТЧИКИ КЛИКОВ ПО ССЫЛКАМ И КНОПКАМ ВНУТРИ МЕНЮ ===
  navLinks.forEach((link, index) => {
    console.log(`Setting up handler for link ${index}:`, link);
    console.log(`Link text: "${link.textContent.trim()}"`);
    console.log(`Link href: "${link.getAttribute('href')}"`);
    
    link.addEventListener('click', (e) => {
      console.log('=== CLICK ON NAV LINK DETECTED ===');
      console.log('isDragging state:', isDragging);
      console.log('Clicked link:', link);
      console.log('Clicked link href:', link.getAttribute('href'));
      
      const href = link.getAttribute('href');
      console.log('Href value:', href);
      console.log('Href type:', typeof href);
      
      // Явная проверка для якорных ссылок
      let isAnchorLink = false;
      
      if (href) {
        console.log('Href exists, checking conditions:');
        console.log('  startsWith("#"):', href.startsWith('#'));
        console.log('  includes("#"):', href.includes('#'));
        console.log('  startsWith("http://"):', href.startsWith('http://'));
        console.log('  startsWith("https://"):', href.startsWith('https://'));
        console.log('  startsWith("mailto:"):', href.startsWith('mailto:'));
        console.log('  startsWith("tel:"):', href.startsWith('tel:'));
        
        // Проверяем, начинается ли ссылка с #
        if (href.startsWith('#')) {
          console.log('  -> Starts with #, isAnchorLink = true');
          isAnchorLink = true;
        } 
        // Или содержит # и не начинается с протокола
        else if (href.includes('#') && 
                 !href.startsWith('http://') && 
                 !href.startsWith('https://') && 
                 !href.startsWith('mailto:') && 
                 !href.startsWith('tel:')) {
          console.log('  -> Contains # and does not start with protocol, isAnchorLink = true');
          isAnchorLink = true;
        } else {
          console.log('  -> None of the conditions matched, isAnchorLink = false');
        }
      } else {
        console.log('  -> Href is null/undefined, isAnchorLink = false');
      }
      
      console.log('Final isAnchorLink result:', isAnchorLink);
      
      if (isAnchorLink) {
        console.log('Internal anchor link detected, closing menu after delay');
        setTimeout(() => {
          closeMenu();
        }, 100);
      } else {
        console.log('External link detected, closing menu immediately');
        closeMenu();
      }
    });
  });

  // === СВАЙП ДЛЯ ЗАКРЫТИЯ МЕНЮ (Telegram-стиль: свайп влево по меню, чтобы задвинуть его влево) ===
  // Touch events для мобильных устройств
  mobileMenu.addEventListener('touchstart', e => {
    console.log('=== TOUCH START === isDragging before:', isDragging);
    console.log('Target of touchstart:', e.target);
    
    // Проверяем, является ли цель событие ссылкой или кнопкой
    const isLinkOrButton = e.target.closest('.mobile-nav-link') || e.target.closest('a');
    console.log('Is target a link/button:', !!isLinkOrButton);
    
    if (!mobileMenu.classList.contains('active') || isLinkOrButton) {
      console.log('Not starting drag because menu is not active or target is a link/button');
      return;
    }
    
    touchStartX = e.changedTouches[0].screenX;
    
    // Получаем текущее значение transform
    const currentTransform = getComputedStyle(mobileMenu).transform;
    if (currentTransform !== 'none' && currentTransform !== 'matrix(1, 0, 0, 1, 0, 0)') {
      const matrix = new DOMMatrixReadOnly(currentTransform);
      initialMenuTransform = matrix.m41;
    } else {
      initialMenuTransform = 0;
    }
    
    // Рассчитываем ширину меню при начале перетаскивания, если еще не рассчитана
    if (menuWidth === 0) {
      menuWidth = mobileMenu.getBoundingClientRect().width;
    }
    
    isDragging = true;
    // Отключаем CSS-переходы во время перетаскивания
    mobileMenu.style.transition = 'none';
    
    // Вызываем preventDefault только если мы действительно начинаем перетаскивание
    if (e.cancelable) e.preventDefault();
    console.log('=== TOUCH START END === isDragging set to:', isDragging);
  }, { passive: false });

  mobileMenu.addEventListener('touchmove', e => {
    console.log('=== TOUCH MOVE === isDragging:', isDragging);
    if (!isDragging) return;
    
    touchCurrentX = e.changedTouches[0].screenX;
    const deltaX = touchCurrentX - touchStartX;
    
    // Правильная логика: при движении пальца влево (deltaX < 0), меню должно уходить влево (transform должен уменьшаться)
    let newTransformX = initialMenuTransform + deltaX;
    
    // Ограничиваем движение: от -menuWidth (полностью закрыто) до 0 (полностью открыто)
    newTransformX = Math.max(Math.min(newTransformX, 0), -menuWidth);
    
    mobileMenu.style.transform = `translateX(${newTransformX}px)`;
    
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  mobileMenu.addEventListener('touchend', e => {
    console.log('=== TOUCH END === isDragging before:', isDragging);
    if (!isDragging) return;
    
    // Получаем текущее положение меню
    const currentTransformX = parseFloat(mobileMenu.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    const threshold = menuWidth * 0.3; // 30% от ширины меню

    // Включаем CSS-переход для анимации завершения
    mobileMenu.style.transition = 'transform 0.3s ease-out';

    // Если меню сдвинуто более чем на 30% влево (currentTransformX < -threshold), закрываем его
    if (currentTransformX < -threshold) {
      mobileMenu.style.transform = `translateX(${-menuWidth}px)`;

      const handleTransitionEnd = () => {
        mobileMenu.classList.remove('active');
        mobileMenu.style.transition = '';
        mobileMenu.style.transform = '';
        console.log('About to call closeMenu from touchend transition');
        closeMenu(); // Это уберет оверлей
        mobileMenu.removeEventListener('transitionend', handleTransitionEnd);
      };
      mobileMenu.addEventListener('transitionend', handleTransitionEnd, { once: true });
    } else {
      // Возвращаем меню обратно в открытое положение (0px)
      mobileMenu.style.transform = 'translateX(0px)';

      const handleReturnTransitionEnd = () => {
        mobileMenu.style.transition = '';
        mobileMenu.style.transform = '';
        // Меню возвращается в открытое состояние, оверлей должен остаться активным
        // Не вызываем closeMenu() при возврате!
        mobileMenu.classList.add('active'); // Убедимся, что класс active остается
        console.log('Menu returned to open state, overlay should remain active');
        mobileMenu.removeEventListener('transitionend', handleReturnTransitionEnd);
      };
      mobileMenu.addEventListener('transitionend', handleReturnTransitionEnd, { once: true });
    }

    isDragging = false;
    console.log('=== TOUCH END === isDragging set to:', isDragging);
  }, { passive: false });

  // Mouse events для тестирования на десктопе
  mobileMenu.addEventListener('mousedown', e => {
    console.log('=== MOUSE DOWN ON MENU === isDragging before:', isDragging);
    console.log('Target of mousedown:', e.target);
    
    // Проверяем, является ли цель событие ссылкой или кнопкой
    const isLinkOrButton = e.target.closest('.mobile-nav-link') || e.target.closest('a');
    console.log('Is target a link/button:', !!isLinkOrButton);
    
    if (!mobileMenu.classList.contains('active') || isLinkOrButton) {
      console.log('Not starting drag because menu is not active or target is a link/button');
      return;
    }
    
    touchStartX = e.screenX;
    
    const currentTransform = getComputedStyle(mobileMenu).transform;
    if (currentTransform !== 'none' && currentTransform !== 'matrix(1, 0, 0, 1, 0, 0)') {
      const matrix = new DOMMatrixReadOnly(currentTransform);
      initialMenuTransform = matrix.m41;
    } else {
      initialMenuTransform = 0;
    }
    
    if (menuWidth === 0) {
      menuWidth = mobileMenu.getBoundingClientRect().width;
    }
    
    isDragging = true;
    mobileMenu.style.transition = 'none';
    e.preventDefault();
    console.log('=== MOUSE DOWN ON MENU END === isDragging set to:', isDragging);
  });

  // Перемещаем mousemove и mouseup на mobileMenu
  mobileMenu.addEventListener('mousemove', e => {
    if (!isDragging) return;
    
    touchCurrentX = e.screenX;
    const deltaX = touchCurrentX - touchStartX;
    
    // При движении пальца влево (deltaX < 0), меню должно уходить влево
    let newTransformX = initialMenuTransform + deltaX;
    
    // Ограничиваем движение: от -menuWidth до 0
    newTransformX = Math.max(Math.min(newTransformX, 0), -menuWidth);
    
    mobileMenu.style.transform = `translateX(${newTransformX}px)`;
    e.preventDefault();
  });

  mobileMenu.addEventListener('mouseup', e => {
    console.log('=== MOUSE UP ON MENU === isDragging before:', isDragging);
    if (!isDragging) return;
    
    const currentTransformX = parseFloat(mobileMenu.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    const threshold = menuWidth * 0.3;
    
    mobileMenu.style.transition = 'transform 0.3s ease-out';

    if (currentTransformX < -threshold) {
      mobileMenu.style.transform = `translateX(${-menuWidth}px)`;

      const handleTransitionEnd = () => {
        mobileMenu.classList.remove('active');
        mobileMenu.style.transition = '';
        mobileMenu.style.transform = '';
        console.log('About to call closeMenu from mouseup transition');
        closeMenu(); // Это уберет оверлей
        mobileMenu.removeEventListener('transitionend', handleTransitionEnd);
      };
      mobileMenu.addEventListener('transitionend', handleTransitionEnd, { once: true });
    } else {
      mobileMenu.style.transform = 'translateX(0px)';

      const handleReturnTransitionEnd = () => {
        mobileMenu.style.transition = '';
        mobileMenu.style.transform = '';
        // Меню возвращается в открытое состояние, оверлей должен остаться активным
        // Не вызываем closeMenu() при возврате!
        mobileMenu.classList.add('active'); // Убедимся, что класс active остается
        console.log('Menu returned to open state, overlay should remain active');
        mobileMenu.removeEventListener('transitionend', handleReturnTransitionEnd);
      };
      mobileMenu.addEventListener('transitionend', handleReturnTransitionEnd, { once: true });
    }

    isDragging = false;
    console.log('=== MOUSE UP ON MENU END === isDragging set to:', isDragging);
  });
}




// === ФУНКЦИОНАЛЬНОСТЬ МОДАЛЬНОГО ОКНА ДЛЯ ПРОИЗВОЛЬНЫХ ИЗОБРАЖЕНИЙ (только для index.html, где есть .zoomable-image) ===
function initializeZoomableImages() {
    const zoomableImages = document.querySelectorAll('.zoomable-image');
    if (!zoomableImages.length) {
        console.warn("Элементы для увеличения (.zoomable-image) не найдены, инициализация пропущена.");
        return;
    }

    zoomableImages.forEach(img => {
        img.addEventListener('click', (event) => {
            const fullSrc = img.getAttribute('data-full-src');
            if (fullSrc) {
                console.log("Клик на масштабируемое изображение. Открываем:", fullSrc);
                // Вызываем существующую функцию открытия модального окна
                openImageModal(fullSrc, img.getAttribute('alt') || 'Увеличенное изображение', function() {
                    // Для масштабируемых изображений вне галереи может не требоваться возобновление автопрокрутки.
                    // Оставьте пустую функцию или добавьте другую логику, если нужно.
                    console.log("Модальное окно для масштабируемого изображения закрыто.");
                    // scheduleResumeAutoScroll(); // <-- Раскомментируйте, если хотите возобновлять прокрутку и тут, но это может быть неуместно.
                });
            }
        });
    });
}




// === ФУНКЦИОНАЛЬНОСТЬ НОВОГО МОДАЛЬНОГО ОКНА ДЛЯ ФОРМЫ ===
function initializeNewFormModal() {
    const formModal = document.getElementById('formModal');
    if (!formModal) {
        console.warn("Новое модальное окно #formModal не найдено, инициализация пропущена.");
        return;
    }

    // Кнопки, которые должны открывать новую форму
    const openFormButtons = document.querySelectorAll('#header-claim, #hero-claim, #footer-claim, #mobile-claim');
    const closeFormButton = document.getElementById('closeFormModal');

    // Открытие формы
    openFormButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем переход по href="#"
            console.log('Открытие модального окна: добавляем класс active'); // <--- Добавлено
            formModal.classList.add('active'); // Добавляем класс 'active' для отображения
        });
    });

    // Закрытие формы (крестик)
    closeFormButton.addEventListener('click', function() {
        console.log('Закрытие модального окна: клик по крестику, убираем класс active'); // <--- Добавлено
        formModal.classList.remove('active'); // Убираем класс 'active' для скрытия
    });

    // Закрытие формы (клик вне контента)
    formModal.addEventListener('click', function(event) {
        // Проверяем, кликнули ли *по оверлею*, а не по его дочернему элементу (плашке или форме)
        if (!event.target.closest('.modal-cert')) {
            console.log('Закрытие модального окна: клик по оверлею, убираем класс active'); // <--- Добавлено
            formModal.classList.remove('active'); // Убираем класс 'active' для скрытия
        }
    });

    // Опционально: Закрытие по клавише Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && formModal.classList.contains('active')) {
            console.log('Закрытие модального окна: нажата Escape, убираем класс active'); // <--- Добавлено
            formModal.classList.remove('active'); // Убираем класс 'active' для скрытия
        }
    });
}





// === ФУНКЦИОНАЛЬНОСТЬ ГАЛЕРЕИ РАБОТ (улучшенная автопрокрутка + ручное вмешательство) ===
function initializeGalleryScroll() {
    const sliderContainer = document.querySelector('.works-slider-container');
    const sliderTrack = document.querySelector('.works-slider-track');

    if (!sliderContainer || !sliderTrack) {
        console.warn("Элементы галереи работ не найдены, инициализация пропущена.");
        return;
    }

    // --- ПЕРЕМЕННЫЕ ---
    let autoScrollInterval = null;
    const resumeDelay = 3000; // Задержка в миллисекундах (3 секунды) перед возобновлением
    let scrollTimeoutId = null;
    let isManualInteraction = false; // Флаг, указывающий, было ли ручное взаимодействие

    // Рассчитываем ширину одного полного набора слайдов (13 слайдов)
    const slides = Array.from(sliderTrack.querySelectorAll('.works-slide'));
    const originalSlidesCount = 13;
    const originalSlidesSubset = slides.slice(0, originalSlidesCount);
    const originalSlidesWidth = originalSlidesSubset.reduce((acc, slide) => acc + slide.offsetWidth + 20, -20); // 20 - margin-right, -20 т.к. последний не имеет правого маргина

    console.log("Ширина ОДНОГО полного набора слайдов (13 шт.):", originalSlidesWidth); // Отладка

    // --- ФУНКЦИИ ---

    // Функция для начала автоматической прокрутки
    function startAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
        console.log("Автопрокрутка запущена.");
        autoScrollInterval = setInterval(() => {
            // Проверяем, достигли ли конца первого набора *после* добавления шага
            // Для этого проверим scrollLeft *до* изменения
            const currentScrollLeft = sliderContainer.scrollLeft;
            const step = 1; // Шаг прокрутки
            let newScrollLeft = currentScrollLeft + step;

            // Проверяем, нужно ли "перемотать"
            // "Перематываем", если мы находимся *внутри* или *на краю* первого набора и следующий шаг выходит за его пределы
            if (currentScrollLeft < originalSlidesWidth && newScrollLeft >= originalSlidesWidth) {
                // "Перематываем" в начало первого набора
                sliderContainer.scrollLeft = 0;
                console.log("Автопрокрутка: перемотка в начало."); // Отладка
            } else {
                // Применяем обычный шаг
                sliderContainer.scrollLeft = newScrollLeft;
            }
        }, 30); // Интервал для плавности
    }

    // Функция для остановки автоматической прокрутки
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
            console.log("Автопрокрутка остановлена.");
        }
    }

    // Функция для возобновления автопрокрутки через задержку
    function scheduleResumeAutoScroll() {
        // Сбрасываем предыдущий таймер, если он был
        if (scrollTimeoutId) {
            clearTimeout(scrollTimeoutId);
        }
        // Устанавливаем таймер для возобновления
        scrollTimeoutId = setTimeout(() => {
            console.log("Возобновление автопрокрутки после таймера.");
            startAutoScroll();
            isManualInteraction = false; // Сбрасываем флаг
        }, resumeDelay);
    }

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

    // 1. Обработчик для ручного скролла - ТОЛЬКО ДЛЯ КОРРЕКЦИИ ПОЗИЦИИ И ПРЕДОТВРАЩЕНИЯ ПРОБЛЕМ
    function handleScroll() {
        let currentScroll = sliderContainer.scrollLeft;
        if (currentScroll >= originalSlidesWidth) {
            console.log("Коррекция позиции (handleScroll): перемотка в начало.");
            sliderContainer.scrollLeft = 0;
        } else if (currentScroll < 0) { // Защита от случайного отрицательного значения
            console.log("Коррекция позиции (handleScroll): перемотка в конец.");
            sliderContainer.scrollLeft = originalSlidesWidth;
        }
        // Не останавливаем автопрокрутку здесь!
    }

    // 2. Обработчик для колеса мыши - останавливает и предотвращает горизонтальный скролл
    function handleWheel(event) {
        if (event.deltaX !== 0) { // Проверяем, был ли горизонтальный скролл
            event.preventDefault(); // Предотвращаем стандартное поведение горизонтального скролла
            // Останавливаем автопрокрутку при любом горизонтальном колесике
            if (!isManualInteraction) {
                 console.log("Ручное вмешательство обнаружено (wheel).");
                 isManualInteraction = true;
                 stopAutoScroll();
            }
            // Применяем изменение scrollLeft вручную
            sliderContainer.scrollLeft += event.deltaX;
            // Перезапускаем таймер при ручном скролле
            scheduleResumeAutoScroll();
        }
        // Вертикальный скролл не предотвращается и передается странице
    }

    // 3. Обработчики для touch (свайп) - останавливает
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let isTouchMovingHorizontally = false;

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartScrollLeft = sliderContainer.scrollLeft;
        isTouchMovingHorizontally = false; // Сбрасываем флаг при новом касании
        // Сбрасываем таймер при начале касания
        if (scrollTimeoutId) {
            clearTimeout(scrollTimeoutId);
        }
    }

    function handleTouchMove(e) {
        if (isTouchMovingHorizontally) {
            e.preventDefault(); // Предотвращаем прокрутку страницы по горизонтали
            const touchCurrentX = e.touches[0].clientX;
            const deltaX = touchStartX - touchCurrentX; // deltaX > 0 значит движение влево (влево = увеличение scrollLeft)

            // Останавливаем автопрокрутку при первом горизонтальном движении
            if (!isManualInteraction) {
                console.log("Ручное вмешательство обнаружено (touchmove horizontal).");
                isManualInteraction = true;
                stopAutoScroll();
            }

            // Применяем изменение
            sliderContainer.scrollLeft = touchStartScrollLeft + deltaX;
            // Перезапускаем таймер при ручном скролле
            scheduleResumeAutoScroll();
        } else {
            // Проверяем направление свайпа
            const touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;

            const deltaX = Math.abs(touchCurrentX - touchStartX);
            const deltaY = Math.abs(touchCurrentY - touchStartY);

            // Если горизонтальное движение больше вертикального и превышает порог
            if (deltaX > deltaY && deltaX > 10) {
                isTouchMovingHorizontally = true; // Устанавливаем флаг
                // Останавливаем автопрокрутку при определении горизонтального движения
                if (!isManualInteraction) {
                    console.log("Ручное вмешательство обнаружено (touchmove horizontal detected).");
                    isManualInteraction = true;
                    stopAutoScroll();
                }
                e.preventDefault(); // Предотвращаем прокрутку страницы

                // Применяем изменение сразу
                const currentDeltaX = touchStartX - touchCurrentX;
                sliderContainer.scrollLeft = touchStartScrollLeft + currentDeltaX;
                scheduleResumeAutoScroll();
            }
            // Если направление не определено как горизонтальное, не вызываем preventDefault,
            // и событие может быть обработано браузером как вертикальная прокрутка страницы.
        }
    }

    function handleTouchEnd() {
        // Сбрасываем флаг горизонтального движения
        isTouchMovingHorizontally = false;
        // Если была остановка, устанавливаем таймер для возобновления
        if (isManualInteraction) {
             scheduleResumeAutoScroll();
        }
    }

    // 4. Обработчики для drag мышью (тащении ползунка) - останавливает
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    function handleMouseDown(e) {
        // Останавливаем автопрокрутку при нажатии на контейнер
        if (!isManualInteraction) {
            console.log("Ручное вмешательство обнаружено (mousedown).");
            isManualInteraction = true;
            stopAutoScroll();
        }
        isDragging = true;
        dragStartX = e.clientX;
        dragStartScrollLeft = sliderContainer.scrollLeft;

        // Сбрасываем таймер при начале перетаскивания
        if (scrollTimeoutId) {
            clearTimeout(scrollTimeoutId);
        }

        e.preventDefault();
        sliderContainer.style.cursor = 'grabbing';
        sliderTrack.style.userSelect = 'none';
    }

    function handleMouseMove(e) {
        if (!isDragging) return;

        const dragCurrentX = e.clientX;
        const deltaX = dragStartX - dragCurrentX; // deltaX > 0 значит движение влево (влево = увеличение scrollLeft)

        // Применяем изменение
        sliderContainer.scrollLeft = dragStartScrollLeft + deltaX;

        // Перезапускаем таймер при ручном скролле
        scheduleResumeAutoScroll();
    }

    function handleMouseUp() {
        if (!isDragging) return;

        isDragging = false;
        sliderContainer.style.cursor = 'grab';
        sliderTrack.style.userSelect = '';

        // Устанавливаем таймер для возобновления автопрокрутки после окончания перетаскивания
        if (isManualInteraction) { // Проверяем, была ли остановка
             scheduleResumeAutoScroll();
        }
    }

    // --- ИНИЦИАЛИЗАЦИЯ (ПЕРВЫЙ БЛОК) ---
    // Начинаем автопрокрутку при загрузке
    startAutoScroll();

    // Добавляем слушатели
    sliderContainer.addEventListener('scroll', handleScroll);
    sliderContainer.addEventListener('wheel', handleWheel, { passive: false });
    sliderContainer.addEventListener('touchstart', handleTouchStart);
    sliderContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    sliderContainer.addEventListener('touchend', handleTouchEnd);

    // Новые слушатели для drag мышью
    sliderContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Устанавливаем начальный стиль курсора для подсказки
    sliderContainer.style.cursor = 'grab';

    // --- НОВОЕ: Обработчики кликов на иконку увеличения ---
    // Функция для обработки клика на иконку увеличения
    function handleZoomIconClick(event) {
        const clickedZoomIcon = event.target.closest('.zoom-icon'); // Находим ближайший родительский .zoom-icon
        if (clickedZoomIcon && sliderContainer.contains(clickedZoomIcon)) {
            const fullImageSrc = clickedZoomIcon.getAttribute('data-full-src');
            if (fullImageSrc) {
                console.log("Клик на иконку увеличения. Останавливаем автопрокрутку. Открываем:", fullImageSrc);
                // Останавливаем автопрокрутку (аналогично ручному взаимодействию)
                if (!isManualInteraction) {
                    isManualInteraction = true;
                    stopAutoScroll();
                }
                // Сбрасываем таймер, чтобы автопрокрутка не возобновилась сразу после закрытия
                if (scrollTimeoutId) {
                    clearTimeout(scrollTimeoutId);
                }

                // --- ТУТ ВАША ЛОГИКА ОТКРЫТИЯ МОДАЛЬНОГО ОКНА ---
                openImageModal(fullImageSrc, 'Увеличенное изображение', scheduleResumeAutoScroll); // Передаём путь, альт. текст и функцию onClose
            }
        }
    }

// Функция для открытия модального окна с изображением (полностью изолированное с stopPropagation)
function openImageModal(imageSrc, imageAlt) {
    console.log("Открываю модальное окно для:", imageSrc); // Отладочное сообщение

    // Создаём оверлей
    const overlay = document.createElement('div');
    // Применяем ВСЕ стили напрямую через .style
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000'; // Высокий z-index
    overlay.style.cursor = 'pointer';
    overlay.style.opacity = '1'; // Явно устанавливаем, чтобы был виден
    overlay.style.visibility = 'visible'; // Явно устанавливаем, чтобы был виден

    // --- ОСНОВНОЕ ИЗМЕНЕНИЕ: Останавливаем всплытие событий ---
    // Это предотвратит срабатывание глобальных обработчиков на события внутри этого overlay
    overlay.addEventListener('click', function(event) {
        // Остановить всплытие клика от самого оверлея
        event.stopPropagation();
    });
    // Можно также остановить и другие события, если глобальная система их использует
    // overlay.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    // overlay.addEventListener('mouseup', function(e) { e.stopPropagation(); });
    // overlay.addEventListener('touchstart', function(e) { e.stopPropagation(); });
    // overlay.addEventListener('touchend', function(e) { e.stopPropagation(); });

    // Создаём контейнер для изображения
    const imgContainer = document.createElement('div');
    imgContainer.style.position = 'relative';
    imgContainer.style.maxWidth = '90%';
    imgContainer.style.maxHeight = '90%';

    // Создаём само изображение
    const modalImg = document.createElement('img');
    modalImg.src = imageSrc;
    modalImg.alt = imageAlt || 'Увеличенное изображение';
    modalImg.style.maxWidth = '100%';
    modalImg.style.maxHeight = '100%';
    modalImg.style.display = 'block';
    modalImg.style.borderRadius = '8px'; // Опционально
    modalImg.style.objectFit = 'contain'; // Важно: изображение масштабируется пропорционально, не обрезаясь

    // Создаём кнопку закрытия (крестик)
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;'; // Символ крестика
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '-40px';
    closeBtn.style.right = '0';
    closeBtn.style.fontSize = '36px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10001'; // Должен быть выше изображения
    closeBtn.style.lineHeight = '1';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '0';

    // Добавляем элементы в DOM
    imgContainer.appendChild(modalImg);
    imgContainer.appendChild(closeBtn);
    overlay.appendChild(imgContainer);
    document.body.appendChild(overlay);

    // --- ЛОКАЛЬНАЯ ЛОГИКА ЗАКРЫТИЯ ---
    // Функция закрытия модального окна
    function closeModal() {
        console.log("Закрытие модального окна изображения. Возобновляем автопрокрутку.");
        // Удаляем оверлей и его содержимое
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        // Возобновляем автопрокрутку через таймер (как при других ручных взаимодействиях)
        scheduleResumeAutoScroll();

        // Удаляем глобальные обработчики, чтобы они не накапливались при открытии нескольких окон
        document.removeEventListener('keydown', handleEscKey);
    }

    // Обработчик для закрытия по клику на крестик
    closeBtn.addEventListener('click', function(event) {
            // Остановить всплытие клика от крестика
            event.stopPropagation();
            closeModal();
    });

    // Обработчик для закрытия по клику на оверлей (но не на контейнер с изображением)
    overlay.addEventListener('click', (e) => {
        // Если кликнули непосредственно по оверлею, а не по его дочерним элементам
        if (e.target === overlay) {
            closeModal();
        }
        // Всплытие уже остановлено выше для *любого* клика на overlay
    });

    // Локальная функция для закрытия по клавише Escape
    function handleEscKey(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    // Глобальный обработчик для закрытия по Esc
    document.addEventListener('keydown', handleEscKey);

    // --- /ЛОКАЛЬНАЯ ЛОГИКА ЗАКРЫТИЯ ---
}

    // Добавляем обработчик клика на контейнер, чтобы отфильтровать клики по иконке
    sliderContainer.addEventListener('click', handleZoomIconClick);

    // --- /НОВОЕ ---
} // Конец функции initializeGalleryScroll

// Вызов функции инициализации, когда DOM готов
document.addEventListener('DOMContentLoaded', initializeGalleryScroll);







// === ГЛОБАЛЬНАЯ ФУНКЦИЯ ОТКРЫТИЯ МОДАЛЬНОГО ОКНА ИЗОБРАЖЕНИЯ ===
// Принимает путь к изображению, альт. текст и функцию onClose, которая вызывается при закрытии
function openImageModal(imageSrc, imageAlt, onClose) {
    console.log("Открываю модальное окно для:", imageSrc); // Отладочное сообщение

    // Создаём оверлей
    const overlay = document.createElement('div');
    // Применяем ВСЕ стили напрямую через .style
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000'; // Высокий z-index
    overlay.style.cursor = 'pointer';
    overlay.style.opacity = '1'; // Явно устанавливаем, чтобы был виден
    overlay.style.visibility = 'visible'; // Явно устанавливаем, чтобы был виден

    // Создаём контейнер для изображения
    const imgContainer = document.createElement('div');
    imgContainer.style.position = 'relative';
    imgContainer.style.maxWidth = '90%';
    imgContainer.style.maxHeight = '90%';

    // Создаём само изображение
    const modalImg = document.createElement('img');
    modalImg.src = imageSrc;
    modalImg.alt = imageAlt || 'Увеличенное изображение';
    modalImg.style.maxWidth = '100%';
    modalImg.style.maxHeight = '100%';
    modalImg.style.display = 'block';
    modalImg.style.borderRadius = '8px'; // Опционально
    modalImg.style.objectFit = 'contain'; // Важно: изображение масштабируется пропорционально, не обрезаясь

    // Создаём кнопку закрытия (крестик)
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;'; // Символ крестика
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '-40px';
    closeBtn.style.right = '0';
    closeBtn.style.fontSize = '36px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10001'; // Должен быть выше изображения
    closeBtn.style.lineHeight = '1';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '0';

    // Добавляем элементы в DOM
    imgContainer.appendChild(modalImg);
    imgContainer.appendChild(closeBtn);
    overlay.appendChild(imgContainer);
    document.body.appendChild(overlay);

    // --- ЛОКАЛЬНАЯ ЛОГИКА ЗАКРЫТИЯ ---
    // Функция закрытия модального окна
    function closeModal() {
        console.log("Закрытие модального окна изображения.");
        // Удаляем оверлей и его содержимое
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        // Вызываем переданную функцию onClose, например, scheduleResumeAutoScroll
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
        // Удаляем глобальные обработчики, чтобы они не накапливались при открытии нескольких окон
        document.removeEventListener('keydown', handleEscKey);
    }

    // Обработчик для закрытия по клику на крестик
    closeBtn.addEventListener('click', function(event) {
         // Остановить всплытие клика от крестика
         event.stopPropagation();
         closeModal();
    });

    // Обработчик для закрытия по клику на оверлей (но не на контейнер с изображением)
    overlay.addEventListener('click', (e) => {
        // Если кликнули непосредственно по оверлею, а не по его дочерним элементам
        if (e.target === overlay) {
            closeModal();
        }
        // Всплытие уже остановлено выше для *любого* клика на overlay - НЕТ, ЭТО НЕ ТАК
        // Всплытие останавливается ТОЛЬКО в обработчике closeBtn
    });

    // Локальная функция для закрытия по клавише Escape
    function handleEscKey(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    // Глобальный обработчик для закрытия по Esc
    document.addEventListener('keydown', handleEscKey);
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
        // initializeModal(); // <-- ЗАКОММЕНТИРОВАЛИ ИЛИ УДАЛИЛИ СТАРУЮ ИНИЦИАЛИЗАЦИЮ
        initializeNewFormModal(); // <-- ДОБАВИЛИ НОВУЮ ИНИЦИАЛИЗАЦИЮ
        initializeFaq(); // Инициализируем FAQ для index.html
        initializeImageModals(); // Инициализируем модальные окна изображений для index.html
        // --- ДОБАВИЛИ ВЫЗОВ НОВОЙ ФУНКЦИИ ГАЛЕРЕИ ---
        initializeZoomableImages(); // <-- ДОБАВЬТЕ ЭТУ СТРОКУ
    }

    // Проверяем, находимся ли мы на странице article.html
    if (document.getElementById('-')) { // Используем ID из Вашего article.html
        loadAndRenderBlogCardsArticles('-');
    }

    // Проверяем, находимся ли мы на странице статьи (например, blog1.html, blog2.html и т.д.)
    if (document.getElementById('other-articles-grid')) {
        // Находимся на странице статьи (например, blog1.html)
        // Определяем slug текущей статьи из URL
        const path = window.location.pathname;
        const slug = path.split('/').pop().replace('.html', '');
        // Вызываем функцию для загрузки *других* статей
        loadAndRenderOtherBlogCards('other-articles-grid', slug, 10);
    }

    // Инициализация копирования и скрытия шапки, если элементы существуют
    initializeCopyButtons(); // Копирование работает на index.html, article.html, blog1.html и т.д.
    initializeHeaderHide(); // Скрытие шапки работает на index.html, article.html, blog1.html и т.д.

    // --- КОД ОТПРАВКИ ФОРМЫ (уже был, но убедимся, что URL правильный) ---
    const form = document.getElementById('stoveForm');
    if (form) { // Проверяем, существует ли форма на текущей странице
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Предотвращаем стандартную отправку формы

            const formData = new FormData(form);
            const messageDiv = document.getElementById('formMessage');
            const submitButton = form.querySelector('button[type="submit"]');

            messageDiv.innerHTML = 'Отправляем заявку...';
            submitButton.disabled = true;

            // --- ИСПОЛЬЗУЕМ ВАШ ПРАВИЛЬНЫЙ URL С /exec В КОНЦЕ ---
            // ВАЖНО: УБЕРИТЕ ПРОБЕЛЫ В КОНЦЕ URL!
            // Правильный URL (убраны пробелы):
            fetch('https://script.google.com/macros/s/AKfycbyZT2RfZ7d2ie5fEqtjFks9He21h4auLCmUBf0_htXqQyAqtMB0cpNhx2g8ydM3oAFNlw/exec', { // <--- УБРАНЫ ПРОБЕЛЫ!
                method: 'POST',
                body: formData, // formData автоматически устанавливает правильный Content-Type
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.result === 'success') {
                    messageDiv.innerHTML = '<p style="color: green;">Спасибо! Ваша заявка принята.</p>';
                    form.reset(); // Очищаем форму
                    // Опционально: закрыть модальное окно через 2 секунды
                    // setTimeout(() => { document.getElementById('formModal').classList.remove('active'); }, 2000);
                } else {
                    messageDiv.innerHTML = `<p style="color: red;">Ошибка: ${data.message}</p>`;
                }
            })
            .catch(error => {
                console.error('Ошибка при отправке формы:', error);
                messageDiv.innerHTML = '<p style="color: red;">Произошла ошибка при отправке. Пожалуйста, попробуйте позже.</p>';
            })
            .finally(() => {
                submitButton.disabled = false;
            });
        });
    } else {
        console.warn("Форма с id='stoveForm' не найдена на этой странице.");
    }
});
