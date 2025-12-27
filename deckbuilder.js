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
    const modalImage = document.getElementById('modalImage');
    const modalCardName = document.getElementById('modalCardName');
    const modalAddBtn = document.getElementById('modalAddBtn');

    // Modal Detail Elements
    const modalCardNumberContainer = document.getElementById('modalCardNumberContainer');
    const modalCardTagsContainer = document.getElementById('modalCardTagsContainer');
    const modalRarityContainer = document.getElementById('modalRarityContainer');
    const modalBloomLevelContainer = document.getElementById('modalBloomLevelContainer');
    const modalHPContainer = document.getElementById('modalHPContainer');
    const modalColorContainer = document.getElementById('modalColorContainer');
    const modalLivesContainer = document.getElementById('modalLivesContainer');
    const modalBuzzContainer = document.getElementById('modalBuzzContainer');
    const modalTypeContainer = document.getElementById('modalTypeContainer');
    const modalAbilityContainer = document.getElementById('modalAbilityContainer');
    const modalCollabEffectContainer = document.getElementById('modalCollabEffectContainer');
    const modalBloomEffectContainer = document.getElementById('modalBloomEffectContainer');
    const modalGiftEffectContainer = document.getElementById('modalGiftEffectContainer');
    const modalExtraEffectContainer = document.getElementById('modalExtraEffectContainer');
    const modalSourcesContainer = document.getElementById('modalSourcesContainer');

    const modalCardNumber = document.getElementById('modalCardNumber');
    const modalCardTags = document.getElementById('modalCardTags');
    const modalRarity = document.getElementById('modalRarity');
    const modalBloomLevel = document.getElementById('modalBloomLevel');
    const modalHP = document.getElementById('modalHP');
    const modalColor = document.getElementById('modalColor');
    const modalLives = document.getElementById('modalLives');
    const modalBuzz = document.getElementById('modalBuzz');
    const modalType = document.getElementById('modalType');
    const modalAbility = document.getElementById('modalAbility');
    const modalCollabEffect = document.getElementById('modalCollabEffect');
    const modalBloomEffect = document.getElementById('modalBloomEffect');
    const modalGiftEffect = document.getElementById('modalGiftEffect');
    const modalExtraEffect = document.getElementById('modalExtraEffect');
    const modalSources = document.getElementById('modalSources');

    const modalOshiSkill = document.getElementById('modalOshiSkill');
    const modalOshiSkillName = document.getElementById('modalOshiSkillName');
    const modalOshiSkillPower = document.getElementById('modalOshiSkillPower');
    const modalOshiSkillDescription = document.getElementById('modalOshiSkillDescription');

    const modalSpOshiSkill = document.getElementById('modalSpOshiSkill');
    const modalSpOshiSkillName = document.getElementById('modalSpOshiSkillName');
    const modalSpOshiSkillPower = document.getElementById('modalSpOshiSkillPower');
    const modalSpOshiSkillDescription = document.getElementById('modalSpOshiSkillDescription');

    const modalSkills = document.getElementById('modalSkills');

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

    // Variable to track currently selected card for modal
    let currentModalCard = null;

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
                    return result.data.map(card => {
                        const searchString = (card.name + card.cardNumber + (card.tag || '')).toLowerCase();
                        return { ...card, setName: result.setName, searchString };
                    });
                });
                filteredCardData = allCardData;
                displayCards(filteredCardData);
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

        modalCardName.textContent = card.name || '';
        modalCardNumber.textContent = card.cardNumber || '';
        modalCardTags.textContent = card.tag || '';
        modalRarity.textContent = card.rarity || '';
        modalBloomLevel.textContent = card.bloomLevel || '';
        modalHP.textContent = card.hp || '';
        modalColor.textContent = card.color || '';
        modalLives.textContent = card.lives || '';
        modalBuzz.textContent = card.buzz || '';
        modalType.textContent = card.type || '';
        modalAbility.textContent = card.ability || '';
        modalCollabEffect.textContent = card.collabEffect || '';
        modalBloomEffect.textContent = card.bloomEffect || '';
        modalGiftEffect.textContent = card.giftEffect || '';
        modalExtraEffect.textContent = card.extraEffect || '';
        modalSources.textContent = card.source || '';

        toggleVisibility(modalCardNumberContainer, card.cardNumber);
        toggleVisibility(modalCardTagsContainer, card.tag);
        toggleVisibility(modalRarityContainer, card.rarity);
        toggleVisibility(modalBloomLevelContainer, card.bloomLevel);
        toggleVisibility(modalHPContainer, card.hp);
        toggleVisibility(modalColorContainer, card.color);
        toggleVisibility(modalLivesContainer, card.lives);
        toggleVisibility(modalBuzzContainer, card.buzz);
        toggleVisibility(modalTypeContainer, card.type);
        toggleVisibility(modalAbilityContainer, card.ability);
        toggleVisibility(modalCollabEffectContainer, card.collabEffect);
        toggleVisibility(modalBloomEffectContainer, card.bloomEffect);
        toggleVisibility(modalGiftEffectContainer, card.giftEffect);
        toggleVisibility(modalExtraEffectContainer, card.extraEffect);
        toggleVisibility(modalSourcesContainer, card.source);

        if (card.oshiSkill) {
            modalOshiSkill.classList.remove('hidden');
            modalOshiSkillName.textContent = card.oshiSkill.name || '';
            modalOshiSkillPower.textContent = card.oshiSkill.power || '';
            modalOshiSkillDescription.textContent = card.oshiSkill.description || '';
        } else {
            modalOshiSkill.classList.add('hidden');
        }

        if (card.spOshiSkill) {
            modalSpOshiSkill.classList.remove('hidden');
            modalSpOshiSkillName.textContent = card.spOshiSkill.name || '';
            modalSpOshiSkillPower.textContent = card.spOshiSkill.power || '';
            modalSpOshiSkillDescription.textContent = card.spOshiSkill.description || '';
        } else {
            modalSpOshiSkill.classList.add('hidden');
        }
        // Skills
        if (card.skills && card.skills.length > 0) {
            modalSkills.innerHTML = '<h3>Skills</h3>';
            card.skills.forEach(skill => {
                const skillContainer = document.createElement('div');

                const skillNameP = document.createElement('p');
                skillNameP.classList.add('modal-skill');
                skillNameP.innerHTML = `<strong>Skill Name:</strong> ${skill.name}`;
                skillContainer.appendChild(skillNameP);

                const skillDmgP = document.createElement('p');
                skillDmgP.innerHTML = `<strong>DMG:</strong> ${skill.dmg || ''}`;
                skillContainer.appendChild(skillDmgP);

                if (skill.description) {
                    const skillDescP = document.createElement('p');
                    const strongTag = document.createElement('strong');
                    strongTag.textContent = 'Arts Effect: ';

                    skillDescP.appendChild(strongTag);
                    skillDescP.append(skill.description);
                    skillContainer.appendChild(skillDescP);
                }

                modalSkills.appendChild(skillContainer);
            });
            modalSkills.classList.remove('hidden');
        } else {
            modalSkills.classList.add('hidden');
        }

        modal.style.display = 'flex';
    }

    function closeModal(event) {
        if (event) event.stopPropagation();
        modal.style.display = 'none';
        currentModalCard = null;
    }

    function toggleVisibility(element, value) {
        if (!value || value === 'N/A') {
            element.classList.add('hidden');
        } else {
            element.classList.remove('hidden');
        }
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
            // No 4-copy limit for cheer deck? Usually cheer decks have many basic cheers.
            // The request says "cheer deck, min 20 cards, max 20cards, only rarity SY maybe added to here".
            // It does not explicitly mention 4-copy limit for cheer deck.
            // However, typical TCG rules might apply. Assuming standard rules, limit applies unless basic resource.
            // But SY are "Cheer" cards, likely basic resources.
            // Let's assume unlimited or high limit for now, or just check standard limit?
            // Actually, the example export shows "hY01-001":10, "hY02-001":10. So definitely > 4 allowed.
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
