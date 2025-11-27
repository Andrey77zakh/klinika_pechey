
//ФАЙЛ -------INDEX------!!!!!


// === МОДАЛЬНОЕ ОКНО ===
const modal = document.getElementById('modal');
const claimButtons = document.querySelectorAll('#header-claim, #hero-claim, #footer-claim');
const modalContinue = document.getElementById('modal-continue');

claimButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
    });
});

modalContinue.addEventListener('click', () => {
    modal.classList.remove('active');
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSd43JD1m9aXU2vwiuilfgVJm-o7o_XOiPeAFBwVYSxU_r_9Mg/viewform', '_blank');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
    modal.classList.remove('active');
    }
});

// === FAQ АККОРДЕОН ===
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const isOpen = answer.classList.contains('open');
    document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
    if (!isOpen) {
        answer.classList.add('open');
    }
    });
});


        // === ФУНКЦИОНАЛЬНОСТЬ МОДАЛЬНЫХ ОКОН ИЗОБРАЖЕНИЙ ===

// Функция закрытия модального окна
function closeCertModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Обработчик клика по изображению в секции сертификации
document.querySelectorAll('.cert-image').forEach(img => {
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

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadAndRenderBlogCardsMain('blog-grid-main', 10); // Показываем первые 10 статей или все, если меньше
});

// === ФУНКЦИОНАЛЬНОСТЬ КОПИРОВАНИЯ ТЕЛЕФОНА И ПОЧТЫ ===
document.addEventListener('DOMContentLoaded', function() {
    const phoneBtn = document.getElementById('copy-phone-btn');
    const emailBtn = document.getElementById('copy-email-btn');
    const phoneMsg = document.getElementById('phone-copied-message');
    const emailMsg = document.getElementById('email-copied-message');

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
    phoneBtn?.addEventListener('click', () => {
        copyToClipboard(phoneNumber, phoneMsg);
    });

    emailBtn?.addEventListener('click', () => {
        copyToClipboard(emailAddress, emailMsg);
    });
});





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

        // Вызываем функцию при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            loadAndRenderBlogCardsArticles('blog-grid-articles');
        });
        // === ФУНКЦИОНАЛЬНОСТЬ МОДАЛЬНОГО ОКНА (из index.html) ===
        const modalTrigger = document.getElementById('header-claim');
        const modalCloseBtn = document.getElementById('modal-continue');

        function openModal() { modal.classList.add('active'); }
        function closeModal() { modal.classList.remove('active'); }

        modalTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });

        modalCloseBtn.addEventListener('click', () => {
            // window.location.href = 'https://your-form-url.com';
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) { closeModal(); }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) { closeModal(); }
        });
