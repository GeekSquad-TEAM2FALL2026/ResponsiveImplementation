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
const PRODUCTS_SUGGESTIONS = [
    { title: 'Moog Theremin', category: 'Musical Instruments', price: '$800', keywords: ['moog', 'theremin', 'synthesizer', 'synth', 'electronic music', 'audio equipment'] },
    { title: 'Item 2', category: 'For Sale', price: '$50', keywords: 'description for item 2' },
    { title: 'Item 3', category: 'For Sale', price: '$25', keywords: 'description for item 3' },
    { title: 'Item 4', category: 'For Sale', price: '$200', keywords: 'description for item 4' },
    { title: 'Item 5', category: 'For Sale', price: '$550', keywords: 'description for item 5' }
];

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
        
        let isLoginMode = true;

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
                toggleAuth.textContent = isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Log in';
                authMessage.textContent = '';
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                let users = JSON.parse(localStorage.getItem('users') || '[]');

                if (isLoginMode) {
                    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
                    if (user) {
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        window.location.reload();
                    } else {
                        authMessage.textContent = 'Invalid username or password.';
                    }
                } else {
                    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                        authMessage.textContent = 'Username already exists.';
                    } else {
                        const newUser = { username, password }; 
                        users.push(newUser);
                        localStorage.setItem('users', JSON.stringify(users));
                        localStorage.setItem('currentUser', JSON.stringify(newUser));
                        window.location.reload();
                    }
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

    // Interactive Search Logic
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

        const matches = PRODUCTS_SUGGESTIONS.filter(item => {
            if (!query) return true;
            const KeywordsStr = Array.isArray(item.keywords) ? item.keywords.join(' ') : item.keywords;
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

    searchContainers.forEach(container => {
        const inputEl = container.querySelector('.js-search-input, #search-input');
        const dropdownEl = container.querySelector('.js-search-dropdown, #search-dropdown');
        if (!inputEl || !dropdownEl) return;

        if (initialQuery) inputEl.value = initialQuery;

        inputEl.addEventListener('focus', () => {
            renderDropdownSuggestions(dropdownEl, inputEl, inputEl.value);
            dropdownEl.classList.add('active');
            if (categoriesDropdown) categoriesDropdown.classList.remove('active');
            if (catArrow) catArrow.textContent = '▼';
        });

        inputEl.addEventListener('input', () => {
            renderDropdownSuggestions(dropdownEl, inputEl, inputEl.value);
            dropdownEl.classList.add('active');

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

    // Listing Page UI Logic
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

        thumbBtns.forEach(btn => btn.addEventListener('click', () => setActiveSlide(Number(btn.dataset.index))));
        dots.forEach(dot => dot.addEventListener('click', () => setActiveSlide(Number(dot.dataset.index))));
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
        saveBtn.addEventListener('click', () => {
            const saved = saveBtn.classList.toggle('saved');
            saveBtn.textContent = saved ? 'Saved' : 'Save';
        });
    }

    // Create / Edit Listing Logic
    const listingForm = document.getElementById('listing-form');
    if (listingForm) {
        const postButton = listingForm.querySelector('.post-btn');
        const formMessage = document.getElementById('form-message');
        const photoInput = document.getElementById('photos');
        const photoBoxes = document.querySelectorAll('.photo-box');

        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');

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
                document.querySelector('.listing-page h1').textContent = 'Edit Listing';
                document.getElementById('listing-title').value = listingToEdit.title;
                document.getElementById('category').value = listingToEdit.category;
                document.getElementById('price').value = listingToEdit.price;
                document.getElementById('location').value = listingToEdit.location;
                if (document.getElementById('tags')) document.getElementById('tags').value = listingToEdit.tags || '';
                document.getElementById('description').value = listingToEdit.description;
                
                // Moved safely inside the null check
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
                title: document.getElementById('listing-title').value,
                category: document.getElementById('category').value,
                price: document.getElementById('price').value,
                location: document.getElementById('location').value,
                tags: document.getElementById('tags').value, // NEW: Capture tags
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
                    currentImagesBase64 = []; // Reset the array
                    renderImagePreviews();    // Clear the visual preview boxes
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

                const thumbRow = document.getElementById('thumbnail-row');
                if (thumbRow) thumbRow.style.display = 'none';
                const galleryDots = document.getElementById('gallery-dots');
                if (galleryDots) galleryDots.style.display = 'none';

                if (localStorage.getItem('isLoggedIn') === 'true') {
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
                        <button class="btn" id="listing-edit-btn" style="padding: 0.5rem 1rem; width: auto; min-width: 0; font-size: 1rem;">Edit</button>
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
