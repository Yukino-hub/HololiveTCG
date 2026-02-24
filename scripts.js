document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('contentContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchBar = document.getElementById('searchBar');
    const seriesFilter = document.getElementById('seriesFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const bloomTypeFilter = document.getElementById('bloomTypeFilter');
    const altArtCheckbox = document.getElementById('altArtCheckbox');
    const fullArtCheckbox = document.getElementById('fullArtCheckbox');
    const foilCheckbox = document.getElementById('foilCheckbox');
    const signedCheckbox = document.getElementById('signedCheckbox');
    const grandprixCheckbox = document.getElementById('grandprixCheckbox');
    const holomenRareCheckbox = document.getElementById('holomenRareCheckbox');

    const tagsContainer = document.getElementById('tagsContainer');
    const clearButton = document.getElementById('clearButton');
    const toggleTagsBtn = document.getElementById('toggleTagsBtn');

    const modal = document.getElementById('modal');
    const modalCloseIcon = document.getElementById('modalCloseIcon');
    const backToTopBtn = document.getElementById('backToTopBtn');

    let allCardData = [];
    let filteredCardData = [];

    /**
     * Constructs the image URL for a card based on a priority system.
     * @param {object} card - The card data object from JSON.
     * @returns {string} The final image URL for the card.
     */
    function getImageUrl(card) {
        // Priority 1: Manual URL Override (handled by utils base function).
        if (card.manualUrl) {
            return getBaseImageUrl(card);
        }

        const imageTypeConfigs = [{
            condition: signedCheckbox.checked && card.hasSigned,
            directory: card.imageSet || card.setName,
            suffix: 'SEC'
        }, {
            condition: holomenRareCheckbox.checked && card.hasHolomenRare,
            directory: card.imageSet || card.setName,
            suffix: 'HR'
        }, {
            condition: fullArtCheckbox.checked && card.hasFullArt,
            directory: card.imageSet || card.setName,
            suffix: 'SR'
        }, {
            condition: altArtCheckbox.checked && card.hasAlternativeArt,
            directory: card.imageSet || card.setName,
            suffix: {
                OSR: 'OUR',
                RR: 'UR'
            } [card.rarity] || card.rarity
        }, {
            condition: foilCheckbox.checked && card.hasFoils,
            directory: card.imageSet || card.setName,
            suffix: 'S'
        }, {
            condition: grandprixCheckbox.checked && card.hasGrandPrix,
            directory: 'hPR',
            suffix: 'P'
        }, {
            condition: card.rarity === 'SY' && card.imageSet,
            directory: card.imageSet,
            suffix: 'SY'
        }];

        for (const config of imageTypeConfigs) {
            if (config.condition) {
                return `${baseUrl}${config.directory}/${card.cardNumber}_${config.suffix}.png`;
            }
        }

        // Default URL for standard art.
        return getBaseImageUrl(card);
    }

    function loadCardData() {
        loadingIndicator.style.display = 'block';

        fetchCardData()
            .then(data => {
                allCardData = data;
                filteredCardData = allCardData;
                displayCards(filteredCardData);
                extractAndDisplayTags(); // Extract and display tags
                loadingIndicator.style.display = 'none';
            })
            .catch(error => {
                console.error('Failed to load card data:', error);
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
            <p>Card Number: ${card.cardNumber}</p>
            <p>Rarity: ${card.rarity}</p>
            <div class="special-attributes">
                ${card.hasFoils ? `<span class="badge foils">Foils</span>` : ''}
                ${card.hasFullArt ? `<span class="badge full-art">Full Art</span>` : ''}
                ${card.hasAlternativeArt ? `<span class="badge alt-art">Alt Art</span>` : ''}
                ${card.hasSigned ? `<span class="badge signed">Signed</span>` : ''}
                ${card.hasGrandPrix ? `<span class="badge GrandPrix">GrandPrix</span>` : ''}
                 ${card.hasHolomenRare ? `<span class="badge HolomenRare">HolomenRare</span>` : ''}
            </div>
        `;

        cardElement.addEventListener('click', () => openModal(card));
        return cardElement;
    }

    function extractAndDisplayTags() {
        const tags = new Set();
        allCardData.forEach(card => {
            if (card.tag) {
                // Split tags string into individual tags and trim whitespace
                card.tag.split(' ').forEach(tag => {
                    if (tag.startsWith('#')) {
                        tags.add(tag);
                    }
                });
            }
        });

        const sortedTags = [...tags].sort();
        tagsContainer.innerHTML = ''; // Clear previous tags
        sortedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag-item');
            tagElement.textContent = tag;
            tagElement.addEventListener('click', () => {
                searchBar.value = tag;
                filterCards();
            });
            tagsContainer.appendChild(tagElement);
        });
    }

    function displayCards(cardsToShow) {
        contentContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        cardsToShow.forEach(card => {
            fragment.appendChild(createCardElement(card));
        });
        contentContainer.appendChild(fragment);
        initializeLazyLoading();
    }

    function filterCards() {
        const searchText = searchBar.value.toLowerCase();
        const selectedSeries = seriesFilter.value;
        const selectedRarity = rarityFilter.value;
        const selectedBloomType = bloomTypeFilter.value;
        const checkboxState = {
            altArt: altArtCheckbox.checked,
            fullArt: fullArtCheckbox.checked,
            foil: foilCheckbox.checked,
            signed: signedCheckbox.checked,
            grandprix: grandprixCheckbox.checked,
            holomenRare: holomenRareCheckbox.checked
        };

        filteredCardData = allCardData.filter(card => {
            return matchesSearchText(card, searchText) &&
                matchesSeries(card, selectedSeries) &&
                matchesRarity(card, selectedRarity) &&
                matchesBloomType(card, selectedBloomType) &&
                matchesCheckboxes(card, checkboxState);
        });

        displayCards(filteredCardData);
    }

    function matchesSearchText(card, searchText) {
        if (!searchText) return true;

        if (searchText.startsWith('bloom:')) {
            const term = searchText.substring(6).trim();
            return card.bloomEffect && card.bloomEffect.toLowerCase().includes(term);
        }

        if (searchText.startsWith('collab:')) {
            const term = searchText.substring(7).trim();
            return card.collabEffect && card.collabEffect.toLowerCase().includes(term);
        }

        // Optimized search using pre-computed string from utils.js
        return card.searchString.includes(searchText);
    }

    function matchesSeries(card, selectedSeries) {
        return !selectedSeries || card.cardNumber.startsWith(selectedSeries);
    }

    function matchesRarity(card, selectedRarity) {
        return !selectedRarity || card.rarity === selectedRarity;
    }

    function matchesBloomType(card, selectedBloomType) {
        return !selectedBloomType || card.bloomLevel === selectedBloomType || card.type === selectedBloomType;
    }

    function matchesCheckboxes(card, state) {
        return (!state.altArt || card.hasAlternativeArt) &&
            (!state.fullArt || card.hasFullArt) &&
            (!state.foil || card.hasFoils) &&
            (!state.signed || card.hasSigned) &&
            (!state.grandprix || card.hasGrandPrix) &&
            (!state.holomenRare || card.hasHolomenRare);
    }

    function openModal(card) {
        const modalImageContainer = document.getElementById('modalImageContainer');
        modalImageContainer.innerHTML = '';

        // Pass the entire card object to get the correct image URL (handling alt arts)
        const imageUrl = getImageUrl(card);

        const primaryImage = document.createElement('img');
        primaryImage.src = imageUrl;
        primaryImage.alt = card.name;
        modalImageContainer.appendChild(primaryImage);

        // Use shared population function from utils.js
        populateModalCommon(card);

        const modalContent = document.querySelector('#modal .modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }

        modal.style.display = 'flex';
    }

    function closeModal(event) {
        if (event) event.stopPropagation();
        modal.style.display = 'none';
    }

    if (modalCloseIcon) {
        modalCloseIcon.addEventListener('click', closeModal);
    }

    // Consolidated event listeners for all filter controls
    const filterControls = [
        altArtCheckbox, signedCheckbox, foilCheckbox, fullArtCheckbox, grandprixCheckbox, holomenRareCheckbox,
        seriesFilter, rarityFilter, bloomTypeFilter
    ];

    filterControls.forEach(control => {
        control.addEventListener('change', filterCards);
    });

    // Apply debounce to the search bar input to improve performance
    searchBar.addEventListener('input', debounce(filterCards, 300));

    clearButton.addEventListener('click', () => {
        searchBar.value = '';
        filterCards();
    });

    toggleTagsBtn.addEventListener('click', () => {
        tagsContainer.classList.toggle('hidden');
        if (tagsContainer.classList.contains('hidden')) {
            toggleTagsBtn.textContent = 'Show';
        } else {
            toggleTagsBtn.textContent = 'Hide';
        }
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    window.onscroll = function() {scrollFunction()};

    function scrollFunction() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopBtn.style.display = "block";
      } else {
        backToTopBtn.style.display = "none";
      }
    }

    backToTopBtn.addEventListener('click', () => {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    });

    loadCardData();
});
