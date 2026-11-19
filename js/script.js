if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

(function setFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" stroke="%238A38F5" stroke-width="8" fill="none"/><line x1="50" y1="5" x2="50" y2="95" stroke="%238A38F5" stroke-width="8"/><line x1="50" y1="50" x2="15" y2="85" stroke="%238A38F5" stroke-width="8"/><line x1="50" y1="50" x2="85" y2="85" stroke="%238A38F5" stroke-width="8"/></svg>`;
    document.head.appendChild(link);
})();

// Product Auto-suggestions
const BASE_SEARCH_QUERIES = [
    'moog theremin',
    'moog synthesizer',
    'musical instruments',
    'synthesizer',
    'electronic music',
    'audio equipment',
    'apartments for rent',
    'apple macbook pro',
    'auto parts',
    'bicycle',
    'bookshelf',
    'camera lens',
    'cars and trucks',
    'coffee table',
    'computer monitor',
    'couch',
    'desk chair',
    'dining table',
    'electric guitar',
    'electronics',
    'for sale',
    'free stuff',
    'furniture',
    'gaming pc',
    'housing',
    'iphone',
    'kayak',
    'mountain bike',
    'moving boxes',
    'nintendo switch',
    'office desk',
    'patio furniture',
    'standing desk',
    'tools',
    'tv stand',
    'washer and dryer'
];
// Dynamically merge base queries with user-created listings & tags from localStorage
function getAutocompletePool() {
    const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
    const dynamicTerms = [];

    // Pull titles, categories, subcategories, and comma-separated tags from saved listings
    userListings.forEach(item => {
        if (item.title) dynamicTerms.push(item.title.toLowerCase().trim());
        if (item.category) dynamicTerms.push(item.category.replace(/-/g, ' ').toLowerCase().trim());
        if (item.subcategory) dynamicTerms.push(item.subcategory.replace(/-/g, ' ').toLowerCase().trim());
        if (item.tags) {
            item.tags.split(',').forEach(tag => {
                const cleanTag = tag.toLowerCase().trim();
                if (cleanTag) dynamicTerms.push(cleanTag);
            });
        }
    });
    // Also pull titles from any hardcoded ".item-title" cards currently on the page
    document.querySelectorAll('.item-title').forEach(el => {
        const titleText = el.textContent.toLowerCase().trim();
        if (titleText) dynamicTerms.push(titleText);
    });

    // Deduplicate and return clean list
    return [...new Set([...dynamicTerms, ...BASE_SEARCH_QUERIES].filter(Boolean))];
}

// Highlights the characters the user typed vs. the predicted completion
function formatAutocompleteMatch(suggestion, query) {
    if (!query) return suggestion;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'i');
    return suggestion.replace(regex, '<span class="autocomplete-match">$1</span>');
}

// Loading State for Search and Posting
let loadingNow = false;

function showLoadingState(message, nextStep) {
    if (loadingNow) return;
    loadingNow = true;

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-box" role="status" aria-live="polite">
            <div class="loading-spinner" aria-hidden="true"></div>
            <p class="loading-text"></p>
        </div>
    `;

    overlay.querySelector('.loading-text').textContent = message;
    document.body.appendChild(overlay);
    document.body.setAttribute('aria-busy', 'true');

    setTimeout(() => {
        overlay.remove();
        document.body.removeAttribute('aria-busy');
        loadingNow = false;
        nextStep();
    }, 1000);
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

    const heroSearch = document.getElementById('search-container');
    if (heroSearch) document.body.classList.add('has-hero-search');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    if (themeSwitch) {
        if (localStorage.getItem('theme') === 'dark') themeSwitch.checked = true;

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
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const accountLinks = Array.from(document.querySelectorAll('.nav-menu a')).filter(a => a.textContent.includes('Account'));
    
    accountLinks.forEach(link => {
        link.href = 'account.html'; 
        link.textContent = currentUser ? `Account (${currentUser.username})` : 'Log In / Sign Up';
    });

    // Account Page Logic
    if (window.location.pathname.includes('account.html')) {
        const authSection = document.getElementById('auth-section');
        const dashboardSection = document.getElementById('dashboard-section');
        const authForm = document.getElementById('auth-form');
        const toggleAuth = document.getElementById('toggle-auth');
        const authTitle = document.getElementById('auth-title');
        const authMessage = document.getElementById('auth-message');
        const logoutBtn = document.getElementById('logout-btn');

        // Field collections
        const loginFields = document.querySelectorAll('.login-only');
        const signupFields = document.querySelectorAll('.signup-only');

        // Login inputs
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        // Signup inputs
        const signupUsernameInput = document.getElementById('signup-username');
        const signupPasswordInput = document.getElementById('signup-password');
        const signupConfirmPasswordInput = document.getElementById('signup-confirm-password');
        const signupEmailInput = document.getElementById('signup-email');
        
        let isLoginMode = true;

        // Helper function to update input attributes and field visibility
    function updateFormMode() {
        loginFields.forEach(field => {
            field.style.display = isLoginMode ? 'block' : 'none';
        });
        signupFields.forEach(field => {
            field.style.display = isLoginMode ? 'none' : 'block';
        });

        // Set required attributes dynamically so hidden inputs don't block submission
        usernameInput.required = isLoginMode;
        passwordInput.required = isLoginMode;

        signupUsernameInput.required = !isLoginMode;
        signupPasswordInput.required = !isLoginMode;
        signupConfirmPasswordInput.required = !isLoginMode;
        signupEmailInput.required = !isLoginMode;
    }

    // Initialize initial state (Login Mode)
    updateFormMode();

    if (currentUser) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        document.getElementById('display-username').textContent = currentUser.username;
    }

    if (toggleAuth) {
        toggleAuth.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;

            authTitle.textContent = isLoginMode ? 'Log In' : 'Sign Up';
            toggleAuth.textContent = isLoginMode 
                ? 'Need an account? Sign up' 
                : 'Already have an account? Log in';
            authMessage.textContent = '';

            updateFormMode();
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            authMessage.textContent = '';
            let users = JSON.parse(localStorage.getItem('users') || '[]');

            if (isLoginMode) {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();

                const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    window.location.reload();
                } else {
                    authMessage.textContent = 'Invalid username or password.';

                    // Show login error under the password field too
                    const passwordFeedback = document.getElementById(
                        'validation-password'
                    );

                    if (passwordFeedback) {
                        passwordFeedback.textContent =
                            'Username or password is incorrect. Please try again.';

                        passwordFeedback.className = 'inline-feedback error';
                        passwordInput.classList.add('field-error');
                        passwordInput.classList.remove('field-valid');
                        passwordInput.setAttribute('aria-invalid', 'true');
                    }

                }
            } else {
                const username = signupUsernameInput.value.trim();
                const password = signupPasswordInput.value.trim();
                const confirmPassword = signupConfirmPasswordInput.value.trim();
                const email = signupEmailInput.value.trim();

                // 1. Password Match Check
                if (password !== confirmPassword) {
                    authMessage.textContent = 'Passwords do not match.';
                    return;
                }

                // 2. Duplicate Username Check
                if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                    authMessage.textContent = 'Username already exists.';
                    return;
                }

                // 3. Save New User
                const newUser = { username, email, password }; 
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                window.location.reload();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }
    }

    // Interactive Search Logic Classic Autocomplete
    const searchContainers = document.querySelectorAll('.js-search-container, #search-container');
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';

    // Remember the category when clicking the normal Post button
    const chosenCategory = urlParams.get('category');

    const postNav = document.querySelector(
        '.nav-menu a[href="formPage.html"]'
    );

    if (chosenCategory && postNav &&
        window.location.pathname.includes('searchResultsPage.html')) {

        postNav.href = 'formPage.html?category=' +
            encodeURIComponent(chosenCategory);
    }


    function executeProductSearch(queryText) {
        const query = queryText.trim().toLowerCase();
        const resultUrl = query ? `searchResultsPage.html?q=${encodeURIComponent(query)}` : 'searchResultsPage.html';

        showLoadingState('Searching listings...', () => {
            if (window.location.pathname.includes('searchResultsPage.html')) {
                window.history.pushState({}, '', resultUrl);
                filterListingsOnPage(query);
            } else {
                window.location.href = resultUrl;
            }
        });
    }

    function renderDropdownSuggestions(dropdownEl, inputEl, filterText) {
        const query = filterText.trim().toLowerCase();
        dropdownEl.innerHTML = '';

        const pool = getAutocompletePool();
        let matches = [];

        if (!query) {
            matches = pool.slice(0, 5);
        } else {
            // Rank terms that START with the query first, followed by terms that INCLUDE the query
            const startsWith = [];
            const includes = [];

            pool.forEach(term => {
                if (term.startsWith(query)) {
                    startsWith.push(term);
                } else if (term.includes(query)) {
                    includes.push(term);
                }
            });

            matches = [...startsWith, ...includes].slice(0, 7);
        }

        // If no preset matches, show a fallback "Search for..." row
        if (matches.length === 0 && query) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'autocomplete-row';
            emptyLi.dataset.value = query;
            emptyLi.innerHTML = `
                <span class="autocomplete-icon" aria-hidden="true">🔍</span>
                <span class="autocomplete-text"><span class="autocomplete-match">${filterText.trim()}</span></span>
            `;
            emptyLi.addEventListener('click', () => {
                dropdownEl.classList.remove('active');
                executeProductSearch(filterText);
            });
            dropdownEl.appendChild(emptyLi);
            return;
        }

        matches.forEach((term, index) => {
            const li = document.createElement('li');
            li.className = 'autocomplete-row';
            li.dataset.index = index;
            li.dataset.value = term;
            li.innerHTML = `
                <span class="autocomplete-icon" aria-hidden="true">🔍</span>
                <span class="autocomplete-text">${formatAutocompleteMatch(term, query)}</span>
            `;
            li.addEventListener('click', () => {
                inputEl.value = term;
                dropdownEl.classList.remove('active');
                executeProductSearch(term);
            });
            dropdownEl.appendChild(li);
        });
    }

    searchContainers.forEach(container => {
        const inputEl = container.querySelector('.js-search-input, #search-input');
        const dropdownEl = container.querySelector('.js-search-dropdown, #search-dropdown');
        if (!inputEl || !dropdownEl) return;

        let activeIndex = -1;

        if (initialQuery) inputEl.value = initialQuery;

        inputEl.addEventListener('focus', () => {
            activeIndex = -1;
            renderDropdownSuggestions(dropdownEl, inputEl, inputEl.value);
            dropdownEl.classList.add('active');
            if (categoriesDropdown) categoriesDropdown.classList.remove('active');
            if (catArrow) catArrow.textContent = '▼';
        });

        inputEl.addEventListener('input', () => {
            activeIndex = -1;
            renderDropdownSuggestions(dropdownEl, inputEl, inputEl.value);
            dropdownEl.classList.add('active');

            if (window.location.pathname.includes('searchResultsPage.html')) {
                filterListingsOnPage(inputEl.value.trim().toLowerCase());
            }
        });

        inputEl.addEventListener('keydown', (e) => {
            const items = dropdownEl.querySelectorAll('.autocomplete-row');
            const isOpen = dropdownEl.classList.contains('active') && items.length > 0;

            if (e.key === 'ArrowDown' && isOpen) {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
                items.forEach((item, i) => item.classList.toggle('keyboard-active', i === activeIndex));
                inputEl.value = items[activeIndex].dataset.value;
            } else if (e.key === 'ArrowUp' && isOpen) {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
                items.forEach((item, i) => item.classList.toggle('keyboard-active', i === activeIndex));
                inputEl.value = items[activeIndex].dataset.value;
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selectedValue = (isOpen && activeIndex >= 0) ? items[activeIndex].dataset.value : inputEl.value;
                dropdownEl.classList.remove('active');
                activeIndex = -1;
                executeProductSearch(selectedValue);
            } else if (e.key === 'Escape') {
                dropdownEl.classList.remove('active');
                activeIndex = -1;
                inputEl.blur();
            }
        });
    });

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

    // Grid Rendering & Filtering
    const itemListingsContainer = document.querySelector('.item-listings');
    const sortSelect = document.getElementById('sort-options');

    // Add user-created listings to the grid
    if (itemListingsContainer) {
        const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');

        userListings.forEach(listing => {
            const li = document.createElement('li');
            li.className = 'item';

            // Remember which category this listing belongs to
            li.dataset.category = listing.category || 'other';


            // Simple click to navigate to the listing page
            li.onclick = () => {
                window.location.href = `listing.html?id=${listing.id}`;
            };

            li.innerHTML = `
            <div class="item-image-wrapper">
                <img src="${listing.images ? listing.images[0] : listing.image}" alt="${listing.title}">
            </div>
            <div class="item-details">
                <span class="price">$${listing.price}</span>
                <h2 class="item-title">${listing.title}</h2>
                
                <!-- NEW: Flex container for location and date -->
                <div class="item-meta-row">
                    <span class="item-location">${listing.location}</span>
                    <span class="item-date">${listing.timestamp || ''}</span>
                </div>
                
                <span style="display: none;" class="search-category">${listing.category || ''}</span>
                <span style="display: none;" class="search-tags">${listing.subcategory || ''} ${listing.tags || ''}</span>
            </div>
        `;
            itemListingsContainer.prepend(li);
        });

        itemListingsContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                window.location.href = `formPage.html?edit=${this.getAttribute('data-id')}`;
            });
        });

        itemListingsContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();

                const idToDelete = this.getAttribute('data-id');

                let currentListings = JSON.parse(localStorage.getItem('userListings') || '[]');

                currentListings = currentListings.filter(l => String(l.id) !== String(idToDelete));

                localStorage.setItem('userListings', JSON.stringify(currentListings));

                this.closest('.item').remove();
            });
        });
    }

    // Synonym lookup for hardcoded items
    const ITEM_SYNONYM_MAP = {
        'moog theremin': ['moog', 'theremin', 'synthesizer', 'synth', 'electronic music', 'audio equipment', 'musical instruments', 'for sale']
    };

    
// Filter listings by search text and category
function filterListingsOnPage(queryText) {
    if (!itemListingsContainer) return;

    const query = queryText.trim().toLowerCase();
    const queryWords = query.split(/\s+/).filter(Boolean);

    // Find which category the user clicked
    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get('category');

    // Category names for page headings
    const categoryNames = {
        'community': 'Community',
        'services': 'Services',
        'for-sale': 'For Sale',
        'housing': 'Housing',
        'autos': 'Autos',
        'jobs': 'Jobs',
        'gigs': 'Gigs',
        'discussion-forums': 'Discussion Forums',
        'resumes': 'Resumes'
    };

    const categoryName = categoryNames[selectedCategory];
    const heading = document.querySelector('.results-page h1');

    // Update the page title
    if (heading) {
        heading.textContent = categoryName
            ? categoryName + ' Listings'
            : (query ? `Search results for "${queryText.trim()}"` : 'Search Results');
    }

    const items = itemListingsContainer.querySelectorAll('.item');
    let visibleCount = 0;

    items.forEach(item => {
        let text = item.textContent.toLowerCase();

        // Keep the existing Theremin search terms working
        if (text.includes('moog theremin')) {
            text += ' moog theremin synthesizer synth electronic music audio equipment musical instruments for sale';
        }

        // Check search text
        const matchesSearch = !query ||
            text.includes(query) ||
            queryWords.every(word => text.includes(word));

        // The five example listings are all For Sale
        const itemCategory = item.dataset.category || 'for-sale';

        // Check the selected category
        const matchesCategory =
            !categoryName || itemCategory === selectedCategory;

        // Show only matching listings
        const showItem = matchesSearch && matchesCategory;

        item.style.display = showItem ? '' : 'none';

        if (showItem) visibleCount++;
    });

    // Show a message if nothing matches
    let noResults = document.getElementById('no-results-msg');

    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'no-results-msg';
        noResults.className = 'no-results-message';
        itemListingsContainer.insertAdjacentElement('afterend', noResults);
    }

    if (visibleCount === 0) {
        noResults.textContent = categoryName
            ? (query
                ? `No ${categoryName} listings match "${queryText.trim()}".`
                : `No ${categoryName} listings yet.`)
            : `No results found for "${queryText.trim()}".`;

        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}


    if (itemListingsContainer && sortSelect) {
        filterListingsOnPage(initialQuery);
    }

    if (sortSelect && itemListingsContainer) {
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
                if (sortVal === 'date-newest') return indexA - indexB;
                return indexB - indexA;
            });

            items.forEach(item => itemListingsContainer.appendChild(item));
        });
    }

    const urlParamsStaticCheck = new URLSearchParams(window.location.search);


    if (!urlParamsStaticCheck.get('id')) {
        const mainImg = document.getElementById('main-listing-image');
        const thumbBtns = document.querySelectorAll('.thumbnail-btn');
        const dots = document.querySelectorAll('.dot');

        if (mainImg && thumbBtns.length > 0) {
            let currentStaticIndex = 0;

            function setActiveSlide(index) {
                currentStaticIndex = index;
                const targetThumb = thumbBtns[index];
                if (!targetThumb) return;

                mainImg.src = targetThumb.dataset.src;
                mainImg.alt = targetThumb.dataset.alt;

                thumbBtns.forEach((btn, i) => btn.classList.toggle('active', i === index));
                dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
            }

            thumbBtns.forEach(btn => btn.addEventListener('click', () => setActiveSlide(Number(btn.dataset.index))));
            dots.forEach(dot => dot.addEventListener('click', () => setActiveSlide(Number(dot.dataset.index))));

            mainImg.style.cursor = 'pointer';
            mainImg.addEventListener('click', () => {
                let nextIndex = currentStaticIndex + 1;
                if (nextIndex >= thumbBtns.length) {
                    nextIndex = 0;
                }
                setActiveSlide(nextIndex);
            });
        }
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

    
// Save and remove favorite listings
if (saveBtn) {
    const favoriteId =
        new URLSearchParams(window.location.search).get('id')
        || 'moog-theremin';

    if (currentUser) {
        const key = 'favorites_' + currentUser.username.toLowerCase();

        const savedItems = JSON.parse(
            localStorage.getItem(key) || '[]'
        );

        // Check if this listing was already saved
        const alreadySaved = savedItems.some(item => {
            return item.id === favoriteId;
        });

        saveBtn.classList.toggle('saved', alreadySaved);
        saveBtn.textContent = alreadySaved ? 'Saved' : 'Save';
    }

    saveBtn.addEventListener('click', () => {
        // Have the user log in first
        if (!currentUser) {
            window.location.href = 'account.html';
            return;
        }

        const key = 'favorites_' + currentUser.username.toLowerCase();

        let savedItems = JSON.parse(
            localStorage.getItem(key) || '[]'
        );

        const alreadySaved = savedItems.some(item => {
            return item.id === favoriteId;
        });

        if (alreadySaved) {
            // Remove from favorites
            savedItems = savedItems.filter(item => {
                return item.id !== favoriteId;
            });
        } else {
            // Get the listing title and save it
            const title = document.querySelector(
                '.listing-title-desktop'
            ).textContent;

            savedItems.push({
                id: favoriteId,
                title: title
            });
        }

        localStorage.setItem(key, JSON.stringify(savedItems));

        saveBtn.classList.toggle('saved', !alreadySaved);
        saveBtn.textContent = alreadySaved ? 'Save' : 'Saved';
    });
}


    // Create / Edit Listing Logic
    const listingForm = document.getElementById('listing-form');
    if (listingForm) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('You must be logged in to create or edit a listing.');
            window.location.href = 'account.html';
            return;
        }

        const postButton = listingForm.querySelector('.post-btn');
        const formMessage = document.getElementById('form-message');
        const photoInput = document.getElementById('photos');
        const photoBoxes = document.querySelectorAll('.photo-box');

        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');

        const categorySelect = document.getElementById('category');
        const subcategorySelect = document.getElementById('subcategory');

        const subcategoriesMap = {
            'for-sale': [
                { value: 'musical-instruments', label: 'Musical Instruments' },
                { value: 'electronics', label: 'Electronics' },
                { value: 'furniture', label: 'Furniture' },
                { value: 'tools', label: 'Tools' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'toys', label: 'Toys' },
                { value: 'sports', label: 'Sports' },
                { value: 'automotive', label: 'Automotive' },
                { value: 'books', label: 'Books' },
                { value: 'movies', label: 'Movies' },
                { value: 'music', label: 'Music' },
                { value: 'other', label: 'Other' }
            ]
        };

        if (categorySelect && subcategorySelect) {
            categorySelect.addEventListener('change', function () {
                const selectedCat = this.value;
                subcategorySelect.innerHTML = '<option value="">Select a subcategory...</option>';

                if (subcategoriesMap[selectedCat]) {
                    subcategoriesMap[selectedCat].forEach(sub => {
                        const opt = document.createElement('option');
                        opt.value = sub.value;
                        opt.textContent = sub.label;
                        subcategorySelect.appendChild(opt);
                    });
                    subcategorySelect.disabled = false;
                } else {
                    const opt = document.createElement('option');
                    opt.value = 'other';
                    opt.textContent = 'Other';
                    opt.selected = true;
                    subcategorySelect.appendChild(opt);
                }
            });
        }

        // Automatically choose the category from the URL
        const categoryFromLink = urlParams.get('category');

        if (!editId && categoryFromLink && categorySelect) {

            // Only select categories that exist in the form
            const found = Array.from(categorySelect.options).some(option => {
                return option.value === categoryFromLink;
            });

            if (found) {
                categorySelect.value = categoryFromLink;

                // Update the subcategory dropdown too
                categorySelect.dispatchEvent(new Event('change'));
            }
        }

        let currentImagesBase64 = []; 
        const photoContainer = document.getElementById('image-preview-container');
        const uploadTriggerBox = document.getElementById('upload-trigger-box');
        const photoMessage = document.getElementById('photo-message');

        function renderImagePreviews() {
            if (!photoContainer || !uploadTriggerBox) return;
            
            const existingPreviews = photoContainer.querySelectorAll('.preview-box');
            existingPreviews.forEach(box => box.remove());

            currentImagesBase64.forEach((base64, index) => {
                const previewBox = document.createElement('div');
                previewBox.className = 'photo-box preview-box';
                previewBox.style.border = 'none';
                previewBox.style.position = 'relative';
                
                previewBox.innerHTML = `
                    <img src="${base64}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">
                    <button type="button" class="remove-img-btn" data-index="${index}" aria-label="Remove image">✖</button>
                `;
                
                previewBox.querySelector('.remove-img-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    currentImagesBase64.splice(index, 1);
                    renderImagePreviews();
                });

                photoContainer.insertBefore(previewBox, uploadTriggerBox);
            });

            uploadTriggerBox.style.display = currentImagesBase64.length >= 10 ? 'none' : 'flex';
        }

        if (photoInput) {
            photoInput.addEventListener('change', function (e) {
                const files = Array.from(e.target.files);
                if (photoMessage) photoMessage.textContent = '';

                const availableSlots = 10 - currentImagesBase64.length;
                
                if (files.length > availableSlots) {
                    if (photoMessage) photoMessage.textContent = `You can only add ${availableSlots} more image(s).`;
                }

                const filesToProcess = files.slice(0, availableSlots);
                
                filesToProcess.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        currentImagesBase64.push(event.target.result);
                        renderImagePreviews(); // Re-render to show new image
                    };
                    reader.readAsDataURL(file);
                });
                
                // Clear input so same file can be chosen again if needed
                photoInput.value = ''; 
            });
        }



        // Auto-format price with commas
        const priceInput = document.getElementById('price');
        if (priceInput) {
            priceInput.addEventListener('input', function (e) {
                let rawValue = this.value.replace(/[^0-9]/g, '');
                if (rawValue !== '') {
                    this.value = parseInt(rawValue, 10).toLocaleString('en-US');
                } else {
                    this.value = '';
                }
            });
        }

        // Handle Edit Form Pre-fill
        if (editId) {
            const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
            const listingToEdit = userListings.find(l => l.id === editId);
            
            if (listingToEdit) {
                if (listingToEdit.owner !== currentUser.username) {
                    alert('You do not have permission to edit this listing.');
                    window.location.href = 'index.html';
                    return;
                }
                document.querySelector('.listing-page h1').textContent = 'Edit Listing';
                document.getElementById('listing-title').value = listingToEdit.title;
                const categoryInput = document.getElementById('category');
                categoryInput.value = listingToEdit.category;      
                categoryInput.dispatchEvent(new Event('change')); 
                if (document.getElementById('subcategory')) {
                    document.getElementById('subcategory').value = listingToEdit.subcategory || '';
                }  
                document.getElementById('price').value = listingToEdit.price;
                document.getElementById('location').value = listingToEdit.location;
                if (document.getElementById('tags')) document.getElementById('tags').value = listingToEdit.tags || '';
                document.getElementById('description').value = listingToEdit.description;
                
                if (listingToEdit.images && Array.isArray(listingToEdit.images)) {
                    currentImagesBase64 = [...listingToEdit.images];
                } else if (listingToEdit.image) {
                    currentImagesBase64 = [listingToEdit.image];
                }
                
                currentImagesBase64 = currentImagesBase64.filter(img => img !== 'images/placeholderImage.png');
                
                renderImagePreviews();
                postButton.textContent = 'Update Listing';
            }
        }


        listingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (postButton.disabled) return;

            postButton.disabled = true;
            
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const timestamp = `${dateString}, ${timeString}`;

            let existingListings = JSON.parse(localStorage.getItem('userListings') || '[]');

            const newListing = {
                id: editId ? editId : Date.now().toString(),
                owner: currentUser ? currentUser.username : '',
                title: document.getElementById('listing-title').value,
                category: document.getElementById('category').value,
                subcategory: document.getElementById('subcategory').value,
                price: document.getElementById('price').value,
                location: document.getElementById('location').value,
                tags: document.getElementById('tags').value, 
                description: document.getElementById('description').value,
                images: currentImagesBase64.length > 0 ? currentImagesBase64 : ['images/placeholderImage.png'],
                timestamp: editId ? (existingListings.find(l => l.id === editId)?.timestamp || timestamp) : timestamp
            };

            showLoadingState(editId ? 'Updating listing...' : 'Posting your listing...', () => {
                if (editId) {
                    const index = existingListings.findIndex(l => l.id === editId);
                    if (index !== -1) existingListings[index] = newListing;
                } else {
                    existingListings.push(newListing);
                }

                localStorage.setItem('userListings', JSON.stringify(existingListings));

                
                // Open the correct category after posting
                const categoryUrl = 'searchResultsPage.html?category=' +
                    encodeURIComponent(newListing.category);

                if (editId) {
                    // Return to the category after editing
                    window.location.href = categoryUrl;
                } else {
                    // Confirm the listing was posted
                    postButton.textContent = 'Posted!';

                    formMessage.textContent =
                        'Your listing has been posted! Opening its category...';

                    // Show confirmation, then redirect
                    setTimeout(() => {
                        window.location.href = categoryUrl;
                    }, 1200);
                }

            });
        });
    }

     // Return to Home Page
    const homeBtn = document.getElementById('home');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

   // Dynamic Listing Hydration
    if (window.location.pathname.includes('listing.html')) {
        const urlParams2 = new URLSearchParams(window.location.search);
        const listingId = urlParams2.get('id');

        if (listingId) {
            const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
            const listing = userListings.find(l => l.id === listingId);

            if (listing) {
                document.title = `$${listing.price} ${listing.title} - Craigslist`;

                const breadcrumbCategory = document.getElementById('breadcrumb-category');
                const breadcrumbSub = document.getElementById('breadcrumb-subcategory');
                const breadcrumbSep = document.getElementById('breadcrumb-separator');
                
                if (breadcrumbCategory && listing.category) {
                    const formattedCat = listing.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    breadcrumbCategory.textContent = formattedCat;
                    
                // Go back to the category this listing belongs to
                breadcrumbCategory.href =
                    `searchResultsPage.html?category=${encodeURIComponent(listing.category)}`;
                }
                
                if (breadcrumbSub && breadcrumbSep) {
                    if (listing.subcategory) {
                        // Format raw values like "musical-instruments" into "Musical Instruments"
                        const formattedSub = listing.subcategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        breadcrumbSub.textContent = formattedSub;
                        breadcrumbSub.href = `searchResultsPage.html?q=${listing.subcategory}`;
                        
                        breadcrumbSub.style.display = 'inline';
                        breadcrumbSep.style.display = 'inline';
                    } else {
                        // Hide the subcategory and the arrow if the user didn't choose one
                        breadcrumbSub.style.display = 'none';
                        breadcrumbSep.style.display = 'none';
                    }
                }


                const mobileTitle = document.querySelector('.listing-title-mobile');
                if (mobileTitle) mobileTitle.textContent = `$${listing.price} ${listing.title}`;

                const desktopTitle = document.querySelector('.listing-title-desktop');
                if (desktopTitle) desktopTitle.textContent = `$${listing.price} ${listing.title}`;

                const mainImage = document.getElementById('main-listing-image');
                if (mainImage) {
                    mainImage.src = listing.images ? listing.images[0] : listing.image;
                    mainImage.alt = listing.title;
                }

                const locationSubtitle = document.getElementById('listing-location');
                if (locationSubtitle) locationSubtitle.textContent = listing.location;

                const timestampSpan = document.getElementById('listing-timestamp');
                if (timestampSpan) timestampSpan.textContent = listing.timestamp || '';

                const badgesContainer = document.getElementById('listing-badges');
                if (badgesContainer) {
                    badgesContainer.innerHTML = ''; 
                    
                    if (listing.tags) {
                        const tagArray = listing.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                        tagArray.forEach(tag => {
                            const span = document.createElement('span');
                            span.className = 'badge';
                            span.textContent = tag;
                            badgesContainer.appendChild(span);
                        });
                    }
                }

                const descContainer = document.querySelector('.listing-description');
                if (descContainer) descContainer.innerHTML = `<p>${listing.description}</p>`;
                // --- NEW: Inject Seller Information ---
                const replyPanelElement = document.getElementById('reply-panel');
                if (replyPanelElement) {
                    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
                    // Find the user profile that matches the listing's owner
                    const sellerProfile = allUsers.find(u => u.username === listing.owner);

                    if (sellerProfile) {
                        // Use saved account details, fallback to username or 'Not provided' if blank
                        const sellerName = sellerProfile.fullName || sellerProfile.username;
                        const sellerEmail = sellerProfile.email || 'Not provided';
                        const sellerPhone = sellerProfile.phone || 'Not provided';

                        replyPanelElement.innerHTML = `
                            <h3>Contact Seller</h3>
                            <p><strong>Name:</strong> ${sellerName}</p>
                            <p><strong>Email:</strong> <a href="mailto:${sellerEmail}" style="color: var(--logo-color); text-decoration: none;">${sellerEmail}</a></p>
                            <p><strong>Phone:</strong> ${sellerPhone}</p>
                        `;
                    } else {
                        // Fallback for listings created before accounts were required
                        replyPanelElement.innerHTML = `
                            <h3>Contact Seller</h3>
                            <p><strong>Name:</strong> Unknown Seller</p>
                            <p><strong>Email:</strong> Not provided</p>
                            <p><strong>Phone:</strong> Not provided</p>
                        `;
                    }
                }

                const thumbRow = document.getElementById('thumbnail-row');
                const galleryDots = document.getElementById('gallery-dots');
                
                const imagesArray = listing.images || (listing.image ? [listing.image] : ['images/placeholderImage.png']);
                
                if (imagesArray.length > 1 && thumbRow && galleryDots) {
                    thumbRow.style.display = 'flex';
                    galleryDots.style.display = 'flex';
                    
                    thumbRow.innerHTML = '';
                    galleryDots.innerHTML = '';
                    
                    let currentIndex = 0; 
                    
                    const goToSlide = (index) => {
                        currentIndex = index;
                        if (mainImage) mainImage.src = imagesArray[currentIndex];
                        
                        Array.from(thumbRow.children).forEach((btn, i) => btn.classList.toggle('active', i === currentIndex));
                        Array.from(galleryDots.children).forEach((d, i) => d.classList.toggle('active', i === currentIndex));
                    };

                    imagesArray.forEach((imgBase64, index) => {
                        const thumbBtn = document.createElement('button');
                        thumbBtn.className = `thumbnail-btn ${index === 0 ? 'active' : ''}`;
                        thumbBtn.innerHTML = `<img src="${imgBase64}" alt="Thumbnail ${index + 1}">`;
                        thumbRow.appendChild(thumbBtn);
                        
                        const dot = document.createElement('button');
                        dot.className = `dot ${index === 0 ? 'active' : ''}`;
                        galleryDots.appendChild(dot);
                        
                        thumbBtn.addEventListener('click', () => goToSlide(index));
                        dot.addEventListener('click', () => goToSlide(index));
                    });
                    
                    if (mainImage) {
                        mainImage.style.cursor = 'pointer'; 
                        mainImage.addEventListener('click', () => {
                            let nextIndex = currentIndex + 1;
                            if (nextIndex >= imagesArray.length) {
                                nextIndex = 0;
                            }
                            goToSlide(nextIndex);
                        });
                    }

                } else {
                    if (thumbRow) thumbRow.style.display = 'none';
                    if (galleryDots) galleryDots.style.display = 'none';
                    if (mainImage) mainImage.style.cursor = 'default';
                }
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                
                if (currentUser && currentUser.username === listing.owner) {
                    const authorActions = document.createElement('div');
                    authorActions.style.display = 'flex';
                    authorActions.style.alignItems = 'center';
                    authorActions.style.gap = '1rem';
                    authorActions.style.marginTop = '1rem';
                    authorActions.style.padding = '1rem';
                    authorActions.style.backgroundColor = 'var(--secondary-color)';
                    authorActions.style.borderRadius = '8px';
                    authorActions.style.width = '100%';
                    authorActions.style.maxWidth = '420px'; 
                    
                    authorActions.innerHTML = `
                        <div style="flex: 1;"><strong>Post Options</strong></div>
                        <button class="btn" id="listing-edit-btn" style="padding: 0.5rem 1rem; width: auto; min-width: 0; font-size: 1rem; border: 1px solid var(--image-placehold); background-color: var(--background-color);">Edit</button>
                        <button class="btn" id="listing-delete-btn" style="padding: 0.5rem 1rem; width: auto; min-width: 0; font-size: 1rem; background-color: #ff4444; color: white;">Delete</button>
                    `;
                    
                    // Place it directly below the Reply/Save buttons instead of the description
                    const desktopActions = document.querySelector('.desktop-actions');
                    if (desktopActions) {
                        desktopActions.insertAdjacentElement('afterend', authorActions);
                    }

                    document.getElementById('listing-edit-btn').onclick = () => {
                        window.location.href = `formPage.html?edit=${listing.id}`;
                    };
                    
                    document.getElementById('listing-delete-btn').onclick = () => {
                        if (confirm('Are you sure you want to delete this listing permanently?')) {
                            let currentListings = JSON.parse(localStorage.getItem('userListings') || '[]');
                            currentListings = currentListings.filter(l => String(l.id) !== String(listing.id));
                            localStorage.setItem('userListings', JSON.stringify(currentListings));
                            
                            alert('Listing deleted.');
                            window.location.href = 'searchResultsPage.html'; 
                        }
                    };
                }
            }
        }
    }
}

// Initializer Watcher
const checkHeaderInterval = setInterval(() => {
    if (document.getElementById('hamburger-btn')) {
        clearInterval(checkHeaderInterval);
        initializeScripts();
    }
}, 50);
    // Run scripts even if the header does not load
setTimeout(() => {
    if (checkHeaderInterval) {
        clearInterval(checkHeaderInterval);
        if (!document.getElementById('hamburger-btn')) {
            initializeScripts();
        }
    }
}, 3000);


// Account sections (listings, favorites, and details)
function setupAccountDashboard() {
    const dashboard = document.getElementById('dashboard-section');
    if (!dashboard) return; // Only runs on account.html

    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) return; // User needs to log in first

    const tabs = document.querySelectorAll('.account-tab');
    const panels = document.querySelectorAll('.account-panel');

    // Switch between account sections
    function showPanel(panelId) {
        tabs.forEach(tab => {
            tab.classList.toggle(
                'active',
                tab.dataset.panel === panelId
            );
        });

        panels.forEach(panel => {
            panel.hidden = panel.id !== panelId;
        });

        if (panelId === 'settings-panel') {
            darkSetting.checked =
                document.body.classList.contains('dark-mode');
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            showPanel(tab.dataset.panel);
        });
    });

    // Allow links directly to a section
    const section = window.location.hash.substring(1);
    const allowed = [
        'listings-panel',
        'favorites-panel',
        'details-panel',
        'settings-panel'
    ];

    // Settings toggle
    const darkSetting = document.getElementById('account-dark-mode');

    darkSetting.addEventListener('change', () => {
        const isDark = darkSetting.checked;

        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Keep the header toggle matching
        const headerToggle = document.getElementById('theme-switch');
        if (headerToggle) headerToggle.checked = isDark;
    });

    showPanel(allowed.includes(section) ? section : 'listings-panel');

    // My Listings
    const myListings = document.getElementById('my-listings');
    const listings = JSON.parse(
        localStorage.getItem('userListings') || '[]'
    );

    const ownedListings = listings.filter(item => {
        return item.owner === user.username;
    });

    myListings.replaceChildren();

    if (ownedListings.length === 0) {
        myListings.textContent = 'You have not posted any listings yet.';
    } else {
        ownedListings.forEach(item => {
            const row = document.createElement('div');
            row.className = 'account-item';

            const title = document.createElement('strong');
            title.textContent = item.title;

            const info = document.createElement('p');
            info.textContent = '$' + item.price + ' • ' + item.location;

            const view = document.createElement('a');
            view.href = 'listing.html?id=' + encodeURIComponent(item.id);
            view.textContent = 'View Listing';

            row.append(title, info, view);
            myListings.appendChild(row);
        });
    }

    // Favorites
    const favoritesBox = document.getElementById('my-favorites');
    const favoritesKey = 'favorites_' + user.username.toLowerCase();

    function showFavorites() {
        const saved = JSON.parse(
            localStorage.getItem(favoritesKey) || '[]'
        );

        favoritesBox.replaceChildren();

        if (saved.length === 0) {
            favoritesBox.textContent =
                'No favorites yet. Save an item to see it here.';
            return;
        }

        saved.forEach(item => {
            const row = document.createElement('div');
            row.className = 'account-item';

            const title = document.createElement('strong');
            title.textContent = item.title;

            const view = document.createElement('a');
            view.href = item.id === 'moog-theremin'
                ? 'listing.html'
                : 'listing.html?id=' + encodeURIComponent(item.id);
            view.textContent = 'View';

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'account-remove';
            remove.textContent = 'Remove';

            remove.addEventListener('click', () => {
                const updated = saved.filter(savedItem => {
                    return savedItem.id !== item.id;
                });

                localStorage.setItem(
                    favoritesKey,
                    JSON.stringify(updated)
                );

                showFavorites();
            });

            row.append(title, view, remove);
            favoritesBox.appendChild(row);
        });
    }

    showFavorites();

    // Account Details Validation
    const detailsForm = document.getElementById('account-details-form');
    const nameField = document.getElementById('profile-name');
    const emailField = document.getElementById('profile-email');
    const phoneField = document.getElementById('profile-phone');
    const message = document.getElementById('details-message');

    const fields = [nameField, emailField, phoneField];

    // Fill in saved information if it exists
    nameField.value = user.fullName || '';
    emailField.value = user.email || '';
    phoneField.value = user.phone || '';

    // Check each field
    function checkField(field) {
        const value = field.value.trim();
        let error = '';

        if (field === nameField) {
            if (!value) {
                error = 'Please enter your full name.';
            } else if (value.length < 2) {
                error = 'Name must be at least 2 characters.';
            }
        }

        if (field === emailField) {
            if (!value) {
                error = 'Please enter your email.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                error = 'Enter an email like name@example.com.';
            }
        }

        if (field === phoneField) {
            const digits = value.replace(/\D/g, '');

            if (!value) {
                error = 'Please enter your phone number.';
            } else if (digits.length !== 10) {
                error = 'Enter a 10-digit phone number.';
            }
        }

        // Put the message under the correct field
        const feedback = document.getElementById(
            field.id + '-feedback'
        );

        feedback.textContent = error || 'Looks good!';
        feedback.className = 'account-feedback ' +
            (error ? 'error' : 'success');

        field.classList.toggle('invalid', !!error);
        field.classList.toggle('valid', !error);
        field.setAttribute('aria-invalid', String(!!error));

        return !error;
    }

    // Validate when typing or leaving a field
    fields.forEach(field => {
        field.addEventListener('input', () => checkField(field));
        field.addEventListener('blur', () => checkField(field));
    });

    // Save account information
    detailsForm.addEventListener('submit', event => {
        event.preventDefault();

        const results = fields.map(field => checkField(field));

        if (!results.every(Boolean)) {
            message.textContent = 'Please fix the highlighted fields.';
            return;
        }

        // Save information for our class prototype
        const updatedUser = {
            ...user,
            fullName: nameField.value.trim(),
            email: emailField.value.trim(),
            phone: phoneField.value.trim()
        };

        localStorage.setItem(
            'currentUser',
            JSON.stringify(updatedUser)
        );

        // Update the saved demo user too
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const index = users.findIndex(item => {
            return item.username === user.username;
        });

        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            localStorage.setItem('users', JSON.stringify(users));
        }

        message.textContent = 'Account details saved!';
    });
}

// Run the account code after the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAccountDashboard);
} else {
    setupAccountDashboard();
}


// Password Strength Checker for Sign Up

function setupSignupStrength() {
    const signupPassword = document.getElementById('signup-password');
    const confirmPassword = document.getElementById('signup-confirm-password');
    const loginPassword = document.getElementById('password');

    const strengthFill = document.getElementById('signup-strength-fill');
    const strengthMessage = document.getElementById('signup-strength-message');
    const strengthMeter = document.getElementById('signup-strength-meter');
    const authForm = document.getElementById('auth-form');

    // Show Password checkboxes
    const showLogin = document.getElementById('show-login-password');
    const showSignup = document.getElementById('show-signup-passwords');

    // Only run this on the account page
    if (!signupPassword || !strengthFill || !strengthMessage) return;

    // Show or hide login password
    if (showLogin && loginPassword) {
        function updateLoginPassword() {
            loginPassword.type = showLogin.checked ? 'text' : 'password';
        }

        showLogin.addEventListener('change', updateLoginPassword);
        updateLoginPassword();
    }

    // Show or hide both signup passwords
    if (showSignup && confirmPassword) {
        function updateSignupPasswords() {
            const type = showSignup.checked ? 'text' : 'password';

            signupPassword.type = type;
            confirmPassword.type = type;
        }

        showSignup.addEventListener('change', updateSignupPasswords);
        updateSignupPasswords();
    }

    // Check password strength while typing
    function checkStrength() {
        const password = signupPassword.value.trim();
        let level = 0;
        let message = 'Use at least 12 characters and a mix of characters.';

        // Check for different character types
        const types = [
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
            /[^a-zA-Z0-9]/.test(password)
        ].filter(Boolean).length;

        if (password.length === 0) {
            level = 0;
        } else if (password.length < 8) {
            level = 1;
            message = 'Too short. Use at least 12 characters.';
        } else if (password.length < 10 || types < 2) {
            level = 2;
            message = 'Fair. Add more characters and different types.';
        } else if (password.length < 12 || types < 3) {
            level = 3;
            message = 'Good. Use 12 characters and at least 3 types.';
        } else {
            level = 4;
            message = 'Strong password! You can create your account.';
        }

        // Update strength bar as the user types
        strengthFill.style.width = (level * 25) + '%';
        strengthFill.dataset.level = String(level);
        strengthMessage.textContent = message;

        if (strengthMeter) {
            strengthMeter.setAttribute('aria-valuenow', String(level));
        }

        // Show red border until password is strong
        signupPassword.classList.toggle(
            'signup-invalid',
            level > 0 && level < 4
        );

        // Show green border for strong passwords
        signupPassword.classList.toggle(
            'signup-valid',
            level === 4
        );

        // Only Strong passwords are accepted
        return level === 4;
    }

    // Check while typing or leaving the field
    signupPassword.addEventListener('input', checkStrength);
    signupPassword.addEventListener('blur', checkStrength);

    // Block signup if password is not strong enough
    if (authForm) {
        document.addEventListener('submit', (event) => {
            if (event.target !== authForm) return;

            const signupSection = signupPassword.closest('.signup-only');

            // Do not affect the Log In page
            if (!signupSection ||
                signupSection.getClientRects().length === 0) {
                return;
            }

            // Stop account creation if password is not Strong
            if (!checkStrength()) {
                event.preventDefault();

                // Show any other form errors too
                validateAllFormFields(authForm);

                event.stopImmediatePropagation();

                strengthMessage.textContent =
                    'Please create a Strong password before signing up.';

                signupPassword.classList.add('signup-invalid');
                signupPassword.focus();
            }
        }, true);
    }

    // Set the starting strength message
    checkStrength();
}

// Run password checker when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSignupStrength);
} else {
    setupSignupStrength();
}


// Inline Form Validation
// Checks Login, Sign Up, and Create Listing fields

// Find out what is wrong with each field
function getFormFieldError(field) {
    const value = field.value.trim();

    switch (field.id) {

        // Login Fields
        case 'username':
            return value ? '' : 'Enter your username to log in.';

        case 'password':
            return value ? '' : 'Enter your password to log in.';

        // Sign Up Username
        case 'signup-username': {
            if (!value) return 'Please create a username.';

            if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
                return 'Use 3-20 letters, numbers, or underscores.';
            }

            // Check if username is already taken
            const users = JSON.parse(
                localStorage.getItem('users') || '[]'
            );

            const taken = users.some(user =>
                user.username.toLowerCase() === value.toLowerCase()
            );

            if (taken) return 'That username is taken. Try another.';

            return '';
        }

        // Sign Up Password
        case 'signup-password': {
            const types = [
                /[a-z]/,
                /[A-Z]/,
                /[0-9]/,
                /[^a-zA-Z0-9]/
            ].filter(pattern => pattern.test(value)).length;

            if (value.length < 12) {
                return 'Add ' + (12 - value.length) +
                    ' more character(s) to reach 12.';
            }

            if (types < 3) {
                return 'Use at least 3 types: lowercase, uppercase, numbers, or symbols.';
            }

            return '';
        }

        // Confirm Password
        case 'signup-confirm-password': {
            if (!value) return 'Please confirm your password.';

            const password = document.getElementById(
                'signup-password'
            ).value.trim();

            if (value !== password) {
                return 'Passwords do not match. Enter the same password.';
            }

            return '';
        }

        // Sign Up Email
        case 'signup-email':
            if (!value) return 'Please enter your email address.';

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Enter a valid email, like name@example.com.';
            }

            return '';

        // Create Listing Title
        case 'listing-title':
            if (!value) return 'Enter a title for your listing.';

            if (value.length < 5) {
                return 'Use at least 5 characters for the title.';
            }

            if (value.length > 100) {
                return 'Keep the title under 100 characters.';
            }

            return '';

        // Category
        case 'category':
            return value ? '' : 'Please choose a category.';

        // Subcategory
        case 'subcategory':
            return value ? '' : 'Please choose a subcategory.';

        // Price
        case 'price': {
            if (!value) {
                return 'Enter a price (use 0 if the item is free).';
            }

            // Remove commas before checking the number
            const price = value.replace(/,/g, '');

            if (!/^\d+$/.test(price)) {
                return 'Enter a whole number, like 850 or 1,200.';
            }

            return '';
        }

        // Location
        case 'location':
            if (!value) return 'Enter a city or location.';

            if (value.length < 2) {
                return 'Enter at least 2 characters.';
            }

            return '';

        // Tags (optional)
        case 'tags':
            if (value.length > 150) {
                return 'Keep tags under 150 characters.';
            }

            return '';

        // Listing Description
        case 'description':
            if (!value) {
                return 'Describe the item you are posting.';
            }

            if (value.length < 20) {
                return 'Write at least 20 characters in the description.';
            }

            if (value.length > 2000) {
                return 'Keep the description under 2,000 characters.';
            }

            return '';
    }

    return '';
}


// Only check fields that are currently visible
function formFieldIsVisible(field) {
    const section = field.closest('.login-only, .signup-only');

    return !section || section.getClientRects().length > 0;
}


// Show error or success under the field
function validateFormField(field) {
    if (!formFieldIsVisible(field)) return true;

    const error = getFormFieldError(field);
    const feedback = document.getElementById(
        'validation-' + field.id
    );

    if (!feedback) return !error;

    // Display the message
    feedback.textContent = error ||
        (field.value.trim() ? 'Looks good!' : '');

    feedback.className = 'inline-feedback ' +
        (error ? 'error' : 'success');

    // Change the border color
    field.classList.toggle('field-error', !!error);

    field.classList.toggle(
        'field-valid',
        !error && !!field.value.trim()
    );

    field.setAttribute('aria-invalid', String(!!error));

    return !error;
}


// Check every field before submitting a form
function validateAllFormFields(form) {
    const fields = form.querySelectorAll('[data-check-field]');
    let allValid = true;
    let firstInvalid = null;

    fields.forEach(field => {
        if (!formFieldIsVisible(field)) return;

        if (!validateFormField(field)) {
            allValid = false;

            if (!firstInvalid) {
                firstInvalid = field;
            }
        }
    });

    // Move focus to the first incorrect field
    if (firstInvalid) firstInvalid.focus();

    return allValid;
}


// Set up validation on our existing forms
function setupInlineFormValidation() {

    // All fields that need validation
    const forms = {
        'auth-form': [
            'username',
            'password',
            'signup-username',
            'signup-password',
            'signup-confirm-password',
            'signup-email'
        ],

        'listing-form': [
            'listing-title',
            'category',
            'price',
            'subcategory',
            'location',
            'tags',
            'description'
        ]
    };

    Object.entries(forms).forEach(([formId, fieldIds]) => {
        const form = document.getElementById(formId);

        // Only run on pages with this form
        if (!form) return;

        // Use our inline errors instead of browser popups
        form.noValidate = true;

        fieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;

            field.dataset.checkField = 'true';

            // Add a message below the input automatically
            const feedback = document.createElement('p');
            feedback.id = 'validation-' + id;
            feedback.className = 'inline-feedback';
            feedback.setAttribute('aria-live', 'polite');

            field.insertAdjacentElement('afterend', feedback);

            // Link the message to its input
            const oldDescription =
                field.getAttribute('aria-describedby') || '';

            field.setAttribute(
                'aria-describedby',
                (oldDescription + ' ' + feedback.id).trim()
            );

            // Check while typing or leaving a field
            field.addEventListener('input', () => {
                validateFormField(field);
            });

            field.addEventListener('change', () => {
                validateFormField(field);
            });

            field.addEventListener('blur', () => {
                validateFormField(field);
            });
        });

        // Stop submission if something is incorrect
        form.addEventListener('submit', event => {
            if (!validateAllFormFields(form)) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    });

    // Recheck Confirm Password if Create Password changes
    const createPassword = document.getElementById(
        'signup-password'
    );

    const confirmPassword = document.getElementById(
        'signup-confirm-password'
    );

    if (createPassword && confirmPassword) {
        createPassword.addEventListener('input', () => {
            if (confirmPassword.value) {
                validateFormField(confirmPassword);
            }
        });
    }
}


// Run validation after the page loads
if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        setupInlineFormValidation
    );
} else {
    setupInlineFormValidation();
}




