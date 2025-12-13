document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('contentContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchBar = document.getElementById('searchBar');
    const seriesFilter = document.getElementById('seriesFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const bloomTypeFilter = document.getElementById('bloomTypeFilter');
    // const altArtCheckbox = document.getElementById('altArtCheckbox'); // Only kept alt art for simplicity in UI, if needed add others

    // Deck State
    const deck = {
        oshi: [],
        main: []
    };

    // UI Elements
    const oshiCountEl = document.getElementById('oshiCount');
    const deckCountEl = document.getElementById('deckCount');
    const deckValidationStatusEl = document.getElementById('deckValidationStatus');
    const oshiListEl = document.getElementById('oshiList');
    const mainDeckListEl = document.getElementById('mainDeckList');
    const clearDeckBtn = document.getElementById('clearDeckBtn');

    const baseUrl = "https://hololive-official-cardgame.com/wp-content/images/cardlist/";
    let allCardData = [];
    let filteredCardData = [];
    const seriesFiles = [
        ...Array.from({ length: 11 }, (_, i) => `hSD${(i + 1).toString().padStart(2, '0')}.json`),
        ...Array.from({ length: 6 }, (_, i) => `hBP${(i + 1).toString().padStart(2, '0')}.json`),
        'hPR.json',
        'hY01.json',
        'hY.json'
    ];

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function getImageUrl(card) {
        if (card.manualUrl) {
            return card.manualUrl.startsWith('http://') ? card.manualUrl.replace('http://', 'https://') : card.manualUrl;
        }
        // Default URL for standard art (simplest for deck builder)
        return `${baseUrl}${card.setName}/${card.cardNumber}_${card.rarity}.png`;
    }

    function loadCardData() {
        loadingIndicator.style.display = 'block';
        Promise.all(seriesFiles.map(file => {
                const setName = file.split('.')[0];
                return fetch(file)
                    .then(response => response.ok ? response.json().then(data => ({ setName, data })) : { setName, data: [] })
                    .catch(error => ({ setName, data: [] }));
            }))
            .then(results => {
                allCardData = results.flatMap(result => {
                    return result.data.map(card => ({...card, setName: result.setName }));
                });
                filteredCardData = allCardData;
                displayCards(filteredCardData);
                loadingIndicator.style.display = 'none';
            });
    }

    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        const imageUrl = getImageUrl(card);

        cardElement.innerHTML = `
            <img data-src="${imageUrl}" alt="${card.name}" class="lazy-load">
            <p><strong>${card.name}</strong></p>
            <p>${card.cardNumber}</p>
            <button class="add-btn">Add</button>
        `;

        cardElement.querySelector('.add-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            addToDeck(card);
        });

        // Optional: Open modal on click (omitted for brevity, can add later if requested)

        return cardElement;
    }

    function displayCards(cardsToShow) {
        contentContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        // Limit to first 100 to avoid lag, add pagination or infinite scroll later if needed
        // For now, just show first 50 or so, or implement virtual scroll.
        // Actually, user filters are powerful enough. Let's show a reasonable amount or all if filtered.
        const limit = cardsToShow.length > 200 ? 200 : cardsToShow.length;

        for(let i=0; i<limit; i++) {
             fragment.appendChild(createCardElement(cardsToShow[i]));
        }

        if (cardsToShow.length > limit) {
             const moreMsg = document.createElement('div');
             moreMsg.textContent = `...and ${cardsToShow.length - limit} more. Use filters to narrow down.`;
             fragment.appendChild(moreMsg);
        }

        contentContainer.appendChild(fragment);
        initializeLazyLoading();
    }

    function initializeLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    const src = image.getAttribute('data-src');
                    if (src) {
                        image.src = src;
                        image.onload = () => image.classList.remove('lazy-load');
                    }
                    observer.unobserve(image);
                }
            });
        });
        lazyImages.forEach(image => observer.observe(image));
    }

    function filterCards() {
        const searchText = searchBar.value.toLowerCase();
        const selectedSeries = seriesFilter.value;
        const selectedRarity = rarityFilter.value;
        const selectedBloomType = bloomTypeFilter.value;

        filteredCardData = allCardData.filter(card => {
            // Reusing basic logic
             const matchesSearch = !searchText ||
                card.name.toLowerCase().includes(searchText) ||
                card.cardNumber.toLowerCase().includes(searchText) ||
                (card.tag && card.tag.toLowerCase().includes(searchText));

             const matchesSeries = !selectedSeries || card.cardNumber.startsWith(selectedSeries);
             const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
             const matchesBloom = !selectedBloomType || card.bloomLevel === selectedBloomType || card.type === selectedBloomType;

             return matchesSearch && matchesSeries && matchesRarity && matchesBloom;
        });
        displayCards(filteredCardData);
    }

    // --- Deck Management ---

    function addToDeck(card) {
        // Determine if Oshi or Main deck based on card type
        // Usually Oshi cards have rarity 'OSR' or are specific types?
        // Let's assume user decides or we infer from card data.
        // The project has 'oshiSkill' field. If it has oshiSkill, it's an Oshi card?
        // Or checking card type == 'Oshi'? (I need to check data structure)

        // Determine if Oshi or Main deck based on card type
        const isOshi = card.type === 'Oshi' || card.cardType === 'Oshi' || (card.oshiSkill && card.oshiSkill.name) || card.rarity === 'OSR';

        if (isOshi) {
            // Add to Oshi deck
            // Check duplicates if needed? Oshi deck usually allows different oshis?
            deck.oshi.push(card);
        } else {
            // Add to Main deck
            if (deck.main.length >= 50) {
                alert("Main deck cannot exceed 50 cards.");
                return;
            }
            // Check 4-copy limit
            const count = deck.main.filter(c => c.cardNumber === card.cardNumber).length;
            if (count >= 4) {
                 alert("Cannot have more than 4 copies of the same card.");
                 return;
            }
            deck.main.push(card);
        }
        updateDeckUI();
    }

    function removeFromDeck(listType, index) {
        if (listType === 'oshi') {
            deck.oshi.splice(index, 1);
        } else {
            deck.main.splice(index, 1);
        }
        updateDeckUI();
    }

    function updateDeckUI() {
        oshiListEl.innerHTML = '';
        mainDeckListEl.innerHTML = '';

        deck.oshi.forEach((card, index) => {
            const el = createDeckListElement(card, 'oshi', index);
            oshiListEl.appendChild(el);
        });

        deck.main.forEach((card, index) => {
            const el = createDeckListElement(card, 'main', index);
            mainDeckListEl.appendChild(el);
        });

        oshiCountEl.textContent = deck.oshi.length;
        deckCountEl.textContent = deck.main.length;

        validateDeck();
    }

    function createDeckListElement(card, listType, index) {
        const div = document.createElement('div');
        div.classList.add('deck-card-item');
        div.innerHTML = `
            <span class="card-name" title="${card.name}">${card.name} (${card.cardNumber})</span>
            <button class="remove-btn">x</button>
        `;
        div.querySelector('.remove-btn').addEventListener('click', () => removeFromDeck(listType, index));
        return div;
    }

    function validateDeck() {
        const oshiValid = deck.oshi.length >= 1;
        const deckValid = deck.main.length === 50;

        if (oshiValid && deckValid) {
            deckValidationStatusEl.textContent = "Valid Deck";
            deckValidationStatusEl.className = "valid";
        } else {
            let msg = "Invalid Deck: ";
            if (!oshiValid) msg += "Need at least 1 Oshi. ";
            if (!deckValid) msg += `Need 50 cards (have ${deck.main.length}).`;
            deckValidationStatusEl.textContent = msg;
            deckValidationStatusEl.className = "invalid";
        }
    }

    clearDeckBtn.addEventListener('click', () => {
        if(confirm("Clear current deck?")) {
            deck.oshi = [];
            deck.main = [];
            updateDeckUI();
        }
    });

    // Event Listeners
    searchBar.addEventListener('input', debounce(filterCards, 300));
    seriesFilter.addEventListener('change', filterCards);
    rarityFilter.addEventListener('change', filterCards);
    bloomTypeFilter.addEventListener('change', filterCards);

    // Initial Load
    loadCardData();
});
