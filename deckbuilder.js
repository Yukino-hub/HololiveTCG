document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('contentContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchBar = document.getElementById('searchBar');
    const seriesFilter = document.getElementById('seriesFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const bloomTypeFilter = document.getElementById('bloomTypeFilter');

    // Modal Elements
    const modal = document.getElementById('modal');
    const modalCloseIcon = document.getElementById('modalCloseIcon');
    const modalAddBtn = document.getElementById('modalAddBtn');

    // Deck State
    const deck = {
        oshi: [],
        main: [],
        cheer: []
    };

    // UI Elements
    const oshiCountEl = document.getElementById('oshiCount');
    const deckCountEl = document.getElementById('deckCount');
    const cheerCountEl = document.getElementById('cheerCount');
    const deckValidationStatusEl = document.getElementById('deckValidationStatus');
    const oshiListEl = document.getElementById('oshiList');
    const mainDeckListEl = document.getElementById('mainDeckList');
    const cheerDeckListEl = document.getElementById('cheerDeckList');
    const clearDeckBtn = document.getElementById('clearDeckBtn');
    const exportDeckBtn = document.getElementById('exportDeckBtn');

    let allCardData = [];
    let filteredCardData = [];

    // Variable to track currently selected card for modal
    let currentModalCard = null;

    function getImageUrl(card) {
        return constructImageUrl(card);
    }

    function loadCardData() {
        loadingIndicator.style.display = 'block';
        fetchCardData()
            .then(data => {
                allCardData = data.map(card => {
                     const searchString = (card.name + card.cardNumber + (card.tag || '')).toLowerCase();
                     return { ...card, searchString };
                });
                filteredCardData = allCardData;
                displayCards(filteredCardData);
                loadingIndicator.style.display = 'none';
            })
            .catch(error => {
                 console.error('Failed to load card data:', error);
                 loadingIndicator.style.display = 'none';
            });
    }

    function getCardCount(card) {
        // Count in oshi, main deck, and cheer deck
        const oshiCount = deck.oshi.filter(c => c.cardNumber === card.cardNumber).length;
        const mainCount = deck.main.filter(c => c.cardNumber === card.cardNumber).length;
        const cheerCount = deck.cheer.filter(c => c.cardNumber === card.cardNumber).length;
        return oshiCount + mainCount + cheerCount;
    }

    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.cardNumber = card.cardNumber; // Add data attribute

        const imageUrl = getImageUrl(card);
        const count = getCardCount(card);

        cardElement.innerHTML = `
            <img data-src="${imageUrl}" alt="${card.name}" class="lazy-load">
            <p><strong>${card.name}</strong></p>
            <p>${card.cardNumber}</p>
            <p class="card-quantity ${count > 0 ? 'active' : ''}">In Deck: ${count}</p>
            <button class="add-btn">Add</button>
        `;

        // Open modal on click (excluding the add button)
        cardElement.addEventListener('click', () => {
            openModal(card);
        });

        // Add button specific handler
        cardElement.querySelector('.add-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            addToDeck(card);
        });

        return cardElement;
    }

    function displayCards(cardsToShow) {
        contentContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        // Limit to avoid lag
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

    function updateCardGridQuantity(card) {
        const count = getCardCount(card);
        const cardElements = document.querySelectorAll(`.card[data-card-number="${card.cardNumber}"]`);

        cardElements.forEach(el => {
            const quantityEl = el.querySelector('.card-quantity');
            if (quantityEl) {
                quantityEl.textContent = `In Deck: ${count}`;
                if (count > 0) {
                    quantityEl.classList.add('active');
                } else {
                    quantityEl.classList.remove('active');
                }
            }
        });
    }

    function filterCards() {
        const searchText = searchBar.value.toLowerCase();
        const selectedSeries = seriesFilter.value;
        const selectedRarity = rarityFilter.value;
        const selectedBloomType = bloomTypeFilter.value;

        filteredCardData = allCardData.filter(card => {
             const matchesSearch = !searchText || card.searchString.includes(searchText);

             const matchesSeries = !selectedSeries || card.cardNumber.startsWith(selectedSeries);
             const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
             const matchesBloom = !selectedBloomType || card.bloomLevel === selectedBloomType || card.type === selectedBloomType;

             return matchesSearch && matchesSeries && matchesRarity && matchesBloom;
        });
        displayCards(filteredCardData);
    }

    // --- Modal Logic ---
    function openModal(card) {
        currentModalCard = card;
        const modalImageContainer = document.getElementById('modalImageContainer');
        modalImageContainer.innerHTML = '';

        const imageUrl = getImageUrl(card);

        const primaryImage = document.createElement('img');
        primaryImage.src = imageUrl;
        primaryImage.alt = card.name;
        modalImageContainer.appendChild(primaryImage);

        // Populate common fields
        populateModalCommon(card);

        modal.style.display = 'flex';
    }

    function closeModal(event) {
        if (event) event.stopPropagation();
        modal.style.display = 'none';
        currentModalCard = null;
    }

    // --- Deck Management ---

    function addToDeck(card) {
        // Determine deck based on card type/rarity
        const isOshi = card.type === 'Oshi' || card.cardType === 'Oshi' || (card.oshiSkill && card.oshiSkill.name) || card.rarity === 'OSR';
        const isCheer = card.rarity === 'SY';

        if (isOshi) {
            // Add to Oshi deck
            if (deck.oshi.length >= 1) {
                alert("You can only have 1 Oshi card.");
                return;
            }
            deck.oshi.push(card);
        } else if (isCheer) {
            // Add to Cheer deck
            if (deck.cheer.length >= 20) {
                alert("Cheer deck cannot exceed 20 cards.");
                return;
            }
            deck.cheer.push(card);
        } else {
            // Add to Main deck
            if (card.rarity === 'SY') {
                alert("Cheer cards (SY) cannot be added to the Main Deck.");
                return;
            }

            if (deck.main.length >= 50) {
                alert("Main deck cannot exceed 50 cards.");
                return;
            }

            // Check 4-copy limit
            // Check if card has "unlimited" effect
            const isUnlimited = card.extraEffect && card.extraEffect.includes("You may include any number of this holomem in the deck");
            const count = deck.main.filter(c => c.cardNumber === card.cardNumber).length;

            if (!isUnlimited && count >= 4) {
                 alert("Cannot have more than 4 copies of the same card.");
                 return;
            }
            deck.main.push(card);
        }
        updateDeckUI();
        updateCardGridQuantity(card);
    }

    function removeOneInstanceFromDeck(listType, cardNumber) {
        const list = listType === 'oshi' ? deck.oshi : (listType === 'cheer' ? deck.cheer : deck.main);
        const index = list.findIndex(c => c.cardNumber === cardNumber);

        if (index !== -1) {
            const card = list[index];
            list.splice(index, 1);
            updateDeckUI();
            updateCardGridQuantity(card);
        }
    }

    function updateDeckUI() {
        oshiListEl.innerHTML = '';
        mainDeckListEl.innerHTML = '';
        cheerDeckListEl.innerHTML = '';

        // Group cards by cardNumber
        const groupedOshi = groupCards(deck.oshi);
        const groupedMain = groupCards(deck.main);
        const groupedCheer = groupCards(deck.cheer);

        groupedOshi.forEach(group => {
            const el = createDeckListElement(group, 'oshi');
            oshiListEl.appendChild(el);
        });

        groupedMain.forEach(group => {
            const el = createDeckListElement(group, 'main');
            mainDeckListEl.appendChild(el);
        });

        groupedCheer.forEach(group => {
            const el = createDeckListElement(group, 'cheer');
            cheerDeckListEl.appendChild(el);
        });

        oshiCountEl.textContent = deck.oshi.length;
        deckCountEl.textContent = deck.main.length;
        cheerCountEl.textContent = deck.cheer.length;

        validateDeck();
    }

    function groupCards(cardList) {
        const groups = {};
        cardList.forEach(card => {
            if (!groups[card.cardNumber]) {
                groups[card.cardNumber] = {
                    card: card,
                    count: 0
                };
            }
            groups[card.cardNumber].count++;
        });
        return Object.values(groups);
    }

    function createDeckListElement(group, listType) {
        const card = group.card;
        const count = group.count;
        const div = document.createElement('div');
        div.classList.add('deck-card-item');

        const imageUrl = getImageUrl(card);

        div.innerHTML = `
            <img src="${imageUrl}" alt="${card.name}" class="deck-card-thumb">
            <div class="deck-card-info">
                <div class="card-name" title="${card.name}">${card.name}</div>
                <div class="card-id">${card.cardNumber}</div>
            </div>
            <div class="deck-card-quantity">x${count}</div>
            <button class="remove-btn" title="Remove one copy">-</button>
        `;

        // Click to open modal
        div.addEventListener('click', () => {
             openModal(card);
        });

        // Remove button
        div.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening modal
            removeOneInstanceFromDeck(listType, card.cardNumber);
        });

        return div;
    }

    function validateDeck() {
        const oshiValid = deck.oshi.length === 1;
        const deckValid = deck.main.length === 50;
        const cheerValid = deck.cheer.length === 20;

        if (oshiValid && deckValid && cheerValid) {
            deckValidationStatusEl.textContent = "Valid Deck";
            deckValidationStatusEl.className = "valid";
        } else {
            let msg = "Invalid Deck: ";
            if (!oshiValid) msg += "Need exactly 1 Oshi. ";
            if (!deckValid) msg += `Need 50 cards (have ${deck.main.length}). `;
            if (!cheerValid) msg += `Need 20 cheer cards (have ${deck.cheer.length}).`;
            deckValidationStatusEl.textContent = msg;
            deckValidationStatusEl.className = "invalid";
        }
    }

    clearDeckBtn.addEventListener('click', () => {
        if(confirm("Clear current deck?")) {
            const allCardsInDeck = [...deck.oshi, ...deck.main, ...deck.cheer];
            deck.oshi = [];
            deck.main = [];
            deck.cheer = [];
            updateDeckUI();

            // Unique cards to avoid multiple updates for same card
            const uniqueCards = [...new Map(allCardsInDeck.map(item => [item.cardNumber, item])).values()];
            uniqueCards.forEach(c => updateCardGridQuantity(c));
        }
    });

    function exportDeck() {
        // Helper to convert array to map of counts
        const countCards = (list) => {
            const counts = {};
            list.forEach(c => {
                counts[c.cardNumber] = (counts[c.cardNumber] || 0) + 1;
            });
            return counts;
        };

        const exportData = {
            oshi: deck.oshi.length > 0 ? deck.oshi[0].cardNumber : "",
            deck: countCards(deck.main),
            cheer_deck: countCards(deck.cheer)
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "decklist.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    if (exportDeckBtn) {
        exportDeckBtn.addEventListener('click', exportDeck);
    }

    // Event Listeners
    searchBar.addEventListener('input', debounce(filterCards, 300));
    seriesFilter.addEventListener('change', filterCards);
    rarityFilter.addEventListener('change', filterCards);
    bloomTypeFilter.addEventListener('change', filterCards);

    if (modalCloseIcon) {
        modalCloseIcon.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modalAddBtn.addEventListener('click', () => {
        if (currentModalCard) {
            addToDeck(currentModalCard);
            // Optionally close modal after adding, or keep open to see details
            // user feedback: maybe a small toast? For now just add.
        }
    });

    // Initial Load
    loadCardData();
});
