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
                <span class="item-location">${listing.location}</span>
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

    function filterListingsOnPage(queryText) {
        if (!itemListingsContainer) return;
        const query = queryText.trim().toLowerCase();
        const queryWords = query.split(/\s+/).filter(Boolean);
        const items = Array.from(itemListingsContainer.querySelectorAll('.item'));
        const heading = document.querySelector('.results-page h1');

        if (heading) {
            heading.textContent = query ? `Search results for "${queryText.trim()}"` : 'Search Results';
        }

        let visibleCount = 0;
        items.forEach(item => {
            let searchableText = item.textContent.toLowerCase();

            // Automatically append synonyms if the card contains "moog theremin"
            Object.entries(ITEM_SYNONYM_MAP).forEach(([itemKey, keywords]) => {
                if (searchableText.includes(itemKey)) {
                    searchableText += ' ' + keywords.join(' ');
                }
            });

            // Check if the full phrase matches, OR if every individual word in the search query matches
            const isMatch = !query || 
                            searchableText.includes(query) || 
                            (queryWords.length > 0 && queryWords.every(word => searchableText.includes(word)));

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
                return indexA - indexB;
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
                images: currentImagesBase64.length > 0 ? currentImagesBase64 : ['images/placeholderImage.png']
            };

            showLoadingState(editId ? 'Updating listing...' : 'Posting your listing...', () => {
                let existingListings = JSON.parse(localStorage.getItem('userListings') || '[]');

                if (editId) {
                    const index = existingListings.findIndex(l => l.id === editId);
                    if (index !== -1) existingListings[index] = newListing;
                } else {
                    existingListings.push(newListing);
                }

                localStorage.setItem('userListings', JSON.stringify(existingListings));

                if (editId) {
                    window.location.href = 'searchResultsPage.html';
                } else {
                    postButton.disabled = false;
                    postButton.textContent = 'Post Another Listing';
                    formMessage.textContent = 'Your listing has been posted!';

                    listingForm.reset();
                    currentImagesBase64 = []; 
                    renderImagePreviews(); 
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
                    breadcrumbCategory.href = `searchResultsPage.html?q=${listing.category}`;
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

