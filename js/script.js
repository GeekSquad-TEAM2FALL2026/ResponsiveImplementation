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