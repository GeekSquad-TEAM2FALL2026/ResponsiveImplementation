if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Product Auto-suggestions
const PRODUCTS_SUGGESTIONS = [
    {title: 'Moog Theremin', category: 'Musical Instruments', keywords: ['moog', 'theremin', 'synthesizer', 'synth', 'electronic music', 'audio equipment']},
    { title: 'Item 2', category: 'For Sale', price: '$50', keywords: 'description for item 2' },
    { title: 'Item 3', category: 'For Sale', price: '$25', keywords: 'description for item 3' },
    { title: 'Item 4', category: 'For Sale', price: '$200', keywords: 'description for item 4' },
    { title: 'Item 5', category: 'For Sale', price: '$550', keywords: 'description for item 5' }
];


function initializeScripts() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const themeSwitch = document.getElementById('theme-switch');
    const categoriesBtn = document.getElementById('categories-btn');
    const categoriesDropdown = document.getElementById('categories-dropdown');
    const catArrow = document.getElementById('cat-arrow');

    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');

    // Hide Header Search on main page for larger hero search bar
    const heroSearch = document.getElementById('search-container');
    if (heroSearch) {
        document.body.classList.add('has-hero-search');
    }

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

    // Interactive Search Logic for hero search and header search
    const searchContainers = document.querySelectorAll('.js-search-container, #search-container');
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';

    function executeProductSearch(queryText) {
        const trimmed = queryText.trim().toLowerCase();
        const isResultPage = window.location.pathname.includes('searchResultsPage.html');

        if (isResultPage) {
            // Update URL without reloading the page
            const newUrl = trimmed ? `/searchResultsPage.html?q=${encodeURIComponent(trimmed)}` : '/searchResultsPage.html';
            window.history.pushState({}, '', newUrl);
            filterListingsOnPage(trimmed);
        } else {
            // Redirect to search results page with query
            const targetUrl = trimmed ? `/searchResultsPage.html?q=${encodeURIComponent(trimmed)}` : '/searchResultsPage.html';
            window.location.href = targetUrl;
        }
    }

    function renderDropdownSuggestions(dropdownEl, inputEl, filterText) {
        const query = filterText.trim().toLowerCase();
        dropdownEl.innerHTML = '';
        
        const matches = PRODUCTS_SUGGESTIONS.filter(item => {
            if (!query) return true; // Show all if query is empty
            return (
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                KeywordsStr.toLowerCase().includes(query)
            );
        });

        if (matches.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.textContent = `Search all listings for "${filterText.trim()}"`;
            emptyLi.addEventListener('click', () => {
                dropdownEl.classList.remove('active');
                executeProductSearch(filterText);
            });
            dropdownEl.appendChild(emptyLi);
            return;
        }

        matches.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="dropdown-item-row">
                    <div class="dropdown-item-main">
                        <span>${item.title}</span>
                        <span class="dropdown-item-category">in ${item.category}</span>
                    </div>
                    <span class="dropdown-item-price">${item.price}</span>
                </div>
            `;
            li.addEventListener('click', () => {
                inputEl.value = item.title;
                dropdownEl.classList.remove('active');
                executeProductSearch(item.title);
            });
            dropdownEl.appendChild(li);
        });
    }

    // Search Containers
    searchContainers.forEach(container => {
        const inputEl = container.querySelector('.js-search-input, #search-input');
        const dropdownEl = container.querySelector('.js-search-dropdown, #search-dropdown');
        if (!inputEl || !dropdownEl) return;

        if(initialQuery) {
            inputEl.value = initialQuery;
        }

        inputEl.addEventListener('focus', () => {
            renderDropdownSuggestions(dropdownEl, inputEl, inputEl.value);
            dropdownEl.classList.add('active');
            if (categoriesDropdown) categoriesDropdown.classList.remove('active');
            if (catArrow) catArrow.textContent = '▼'; // Reset arrow when opening search
        });

        inputEl.addEventListener('input', () => {
            renderDropdownSuggestions(dropdownEl, inputEl, inputEl.value);
            dropdownEl.classList.add('active');

            // If on search results page, update the URL and filter listings without reloading
            if (window.location.pathname.includes('searchResultsPage.html')) {
                filterListingsOnPage(inputEl.value.trim().toLowerCase());
            }
        });

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                dropdownEl.classList.remove('active');
                executeProductSearch(inputEl.value);
            } else if (e.key === 'Escape') {
                dropdownEl.classList.remove('active');
                inputEl.blur();
            }
        });
    });

    // close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        searchContainers.forEach(container => {
            const dropdownEl = container.querySelector('.js-search-dropdown, #search-dropdown');
            if (dropdownEl && !container.contains(e.target)) {
                dropdownEl.classList.remove('active');
            }
        });

        if (categoriesBtn && categoriesDropdown && !categoriesBtn.contains(e.target) && !categoriesDropdown.contains(e.target)) {
            categoriesDropdown.classList.remove('active');
            if (catArrow) catArrow.textContent = '▼';
        }
    });

    // filter and sort product cards on search results page
    const itemListingsContainer = document.getElementById('item-listings');
    const sortSelect = document.getElementById('sort-options');

    function filterListingsOnPage(queryText) {
        if (!itemListingsContainer) return;
        const query = queryText.trim().toLowerCase();
        const items = Array.from(itemListingsContainer.querySelectorAll('.item'));
        const heading = document.querySelector('.results-page h1');

        if (heading) {
            heading.textContent = query ? `Search results for "${queryText.trim()}"` : 'Search Results';
        }

        let visibleCount = 0;
        items.forEach(item => {
            const textContent = item.textContent.toLowerCase();
            const isMatch = !query || textContent.includes(query);
            item.style.display = isMatch ? '' : 'none';
            if (isMatch) visibleCount++;
        });

        let noResultsEl = document.getElementById('no-results-msg');
        if (visibleCount === 0) {
            if (!noResultsEl) {
                noResultsEl = document.createElement('div');
                noResultsEl.id = 'no-results-msg';
                noResultsEl.className = 'no-results-message';
                itemListingsContainer.insertAdjacentElement('afterend', noResultsEl);
            }
            noResultsEl.textContent = `No results found for "${queryText.trim()}"`;
            noResultsEl.style.display = 'block';
        } else if (noResultsEl) {
            noResultsEl.style.display = 'none';
        }
    }

    if (itemListingsContainer && sortSelect) {
        filterListingsOnPage(initialQuery);
    }

    if (sortSelect && itemListingsContainer) {
        // Store original order using correct container reference
        Array.from(itemListingsContainer.querySelectorAll('.item')).forEach((item, index) => {
            item.dataset.originalIndex = index;
        });

        sortSelect.addEventListener('change', () => {
            const items = Array.from(itemListingsContainer.querySelectorAll('.item'));
            const sortVal = sortSelect.value;

            items.sort((a, b) => {
                const priceA = parseFloat((a.querySelector('.price')?.textContent || '0').replace(/[^0-9.-]+/g, '')) || 0;
                const priceB = parseFloat((b.querySelector('.price')?.textContent || '0').replace(/[^0-9.-]+/g, '')) || 0;
                const indexA = parseInt(a.dataset.originalIndex, 10) || 0;
                const indexB = parseInt(b.dataset.originalIndex, 10) || 0;

                if (sortVal === 'price-asc') return priceA - priceB;
                if (sortVal === 'price-desc') return priceB - priceA;
                if (sortVal === 'date-newest') return indexB - indexA;
                return indexA - indexB; // default / featured
            });

            items.forEach(item => itemListingsContainer.appendChild(item));
        });
    }

    // listing page gallery and reply panel logic
    const mainImg = document.getElementById('main-listing-image');
    const thumbBtns = document.querySelectorAll('.thumbnail-btn');
    const dots = document.querySelectorAll('.dot');

    if (mainImg && thumbBtns.length > 0) {
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
        if(replyMobile) replyMobile.addEventListener('click', toggleReplyPanel);
        if(replyDesktop) replyDesktop.addEventListener('click', toggleReplyPanel);
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