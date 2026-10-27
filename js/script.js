if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}
function initializeScripts() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const themeSwitch = document.getElementById('theme-switch');
    const categoriesBtn = document.getElementById('categories-btn');
    const categoriesDropdown = document.getElementById('categories-dropdown');
    const catArrow = document.getElementById('cat-arrow');

    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    if (themeSwitch) {
        if (localStorage.getItem('theme') === 'dark') {
            themeSwitch.checked = true;
        }

        themeSwitch.addEventListener('change', () => {
            if (themeSwitch.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    if (categoriesBtn && categoriesDropdown && catArrow) {
        categoriesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            categoriesDropdown.classList.toggle('active');
            
            if (searchDropdown) searchDropdown.classList.remove('active');
            catArrow.textContent = categoriesDropdown.classList.contains('active') ? '▲' : '▼';
        });
    }

    if (searchInput && searchDropdown) {
        searchInput.addEventListener('focus', () => {
            searchDropdown.classList.add('active');
            if (categoriesDropdown) categoriesDropdown.classList.remove('active'); 
            if (catArrow) catArrow.textContent = '▼'; // Reset arrow when opening search
        });

        searchDropdown.querySelectorAll('li').forEach((item, index) => {
            item.addEventListener('click', () => {
                searchInput.value = item.textContent;
                searchDropdown.classList.remove('active');
                
                if (index === 0) {
                    window.location.href = '/searchResultsPage.html?option=1';
                } else if (index === 1) {
                    window.location.href = '/searchResultsPage.html?option=2';
                } else if (index === 2) {
                    window.location.href = '/searchResultsPage.html?option=3';
                }
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (searchInput && searchDropdown && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('active');
        }
        if (categoriesBtn && categoriesDropdown && !categoriesBtn.contains(e.target) && !categoriesDropdown.contains(e.target)) {
            categoriesDropdown.classList.remove('active');
            if (catArrow) catArrow.textContent = '▼'; 
        }
    });

    const mainImg = document.getElementById('main-listing-image');
    const thumbBtns = document.querySelectorAll('.thumbnail-btn');
    const dots = document.querySelectorAll('.dot');

    if (mainImg && thumbBtns.length > 0) {
        function setActiveSlide(index) {
            const targetThumb = thumbBtns[index];
            if (!targetThumb) return;

            mainImg.src = targetThumb.dataset.src;
            mainImg.alt = targetThumb.dataset.alt;

            thumbBtns.forEach((btn, i) => btn.classList.toggle('active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }

        thumbBtns.forEach(btn => {
            btn.addEventListener('click', () => setActiveSlide(Number(btn.dataset.index)));
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => setActiveSlide(Number(dot.dataset.index)));
        });
    }

    const replyPanel = document.getElementById('reply-panel');
    const replyMobile = document.getElementById('reply-btn-mobile');
    const replyDesktop = document.getElementById('reply-btn-desktop');
    const saveBtn = document.getElementById('save-btn');

    if (replyPanel) {
        function toggleReplyPanel() {
            const isHidden = replyPanel.hasAttribute('hidden');
            if (isHidden) {
                replyPanel.removeAttribute('hidden');
                replyPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                replyPanel.setAttribute('hidden', '');
            }
        }

        if (replyMobile) replyMobile.addEventListener('click', toggleReplyPanel);
        if (replyDesktop) replyDesktop.addEventListener('click', toggleReplyPanel);
    }

    if (saveBtn) { 
        saveBtn.addEventListener('click', () =>  {
            const saved = saveBtn.classList.toggle('saved');
            saveBtn.textContent = saved ? 'Saved' : 'Save';
        });
    }

    const homeBtn = document.getElementById('home');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
}

const checkHeaderInterval = setInterval(() => {
    if (document.getElementById('hamburger-btn')) {
        clearInterval(checkHeaderInterval); // Stop checking
        initializeScripts(); // Run the scripts
    }
}, 50);

setTimeout(() => {
    if (checkHeaderInterval) {
        clearInterval(checkHeaderInterval);
        if (!document.getElementById('hamburger-btn')) {
            initializeScripts(); 
        }
    }
}, 3000);