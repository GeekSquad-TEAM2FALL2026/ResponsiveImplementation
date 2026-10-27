const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');
const themeSwitch = document.getElementById('theme-switch');

const searchInput = document.getElementById('search-input');
const searchDropdown = document.getElementById('search-dropdown');
const categoriesBtn = document.getElementById('categories-btn');
const categoriesDropdown = document.getElementById('categories-dropdown');
const catArrow = document.getElementById('cat-arrow');

hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

searchInput.addEventListener('focus', () => {
    searchDropdown.classList.add('active');
    categoriesDropdown.classList.remove('active'); 
    catArrow.textContent = '▼'; // Reset arrow when opening search
});

categoriesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    categoriesDropdown.classList.toggle('active');
    searchDropdown.classList.remove('active');
    
    catArrow.textContent = categoriesDropdown.classList.contains('active') ? '▲' : '▼';
});

searchDropdown.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
        searchInput.value = item.textContent;
        searchDropdown.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove('active');
    }
    if (!categoriesBtn.contains(e.target) && !categoriesDropdown.contains(e.target)) {
        categoriesDropdown.classList.remove('active');
        catArrow.textContent = '▼'; 
    }
});



/** Product listing interactions (Gallery Switcher & Reply Panel) */
const mainImg = document.getElementById('main-listing-image');
const thumbBtns = document.querySelectorAll('.thumbnail-btn');
const dots = document.querySelectorAll('.dot');

if(mainImg && thumbBtns.length > 0) {
    function setActiveSlide(index) {
        const targetThumb = thumbBtns[index];
        if(!targetThumb) return;

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

if(replyPanel) {
    function toggleReplyPanel() {
        const isHidden = replyPanel.hasAttribute('hidden');
        if(isHidden) {
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

searchDropdown.querySelectorAll('li').forEach((item, index) => {
    item.addEventListener('click', () => {
        if (index === 0) {
            window.location.href = '/searchResultsPage.html?option=1';
        } else if (index === 1) {
            window.location.href = '/searchResultsPage.html?option=2';
        } else if (index === 2) {
            window.location.href = '/searchResultsPage.html?option=3';
        }
    });
});
