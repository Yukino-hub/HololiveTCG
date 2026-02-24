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

    const modalImage = document.getElementById('modalImage');
    const modalCardName = document.getElementById('modalCardName');
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
    const baseUrl = "https://hololive-official-cardgame.com/wp-content/images/cardlist/";

    let allCardData = [];
    let filteredCardData = [];
    const seriesFiles = [
        ...Array.from({ length: 13 }, (_, i) => `hSD${(i + 1).toString().padStart(2, '0')}.json`),
        ...Array.from({ length: 6 }, (_, i) => `hBP${(i + 1).toString().padStart(2, '0')}.json`),
        'hPR.json',
        'hY01.json',
        'hY.json'
    ];

    /**
     * Debounce function to delay execution of a function until after a specified wait time
     * has elapsed since the last time it was invoked.
     * @param {Function} func The function to debounce.
     * @param {number} delay The number of milliseconds to delay.
     * @returns {Function} The new debounced function.
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Constructs the image URL for a card based on a priority system.
     * @param {object} card - The card data object from JSON.
     * @returns {string} The final image URL for the card.
     */
    function getImageUrl(card) {
        // Priority 1: Manual URL Override.
        if (card.manualUrl) {
            // Enforce HTTPS for manual URLs to prevent mixed content issues.
            return card.manualUrl.startsWith('http://') ? card.manualUrl.replace('http://', 'https://') : card.manualUrl;
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
        return `${baseUrl}${card.setName}/${card.cardNumber}_${card.rarity}.png`;
    }

    function loadCardData() {
        loadingIndicator.style.display = 'block';

        Promise.all(seriesFiles.map(file => {
                const setName = file.split('.')[0];
                return fetch(file)
                    .then(response => {
                        if (!response.ok) {
                            // If file not found or error, continue with empty data
                            return { setName, data: [] };
                        }
                        return response.json().then(data => ({ setName, data }));
                    })
                    .catch(error => {
                        console.error(`Error loading or parsing ${file}:`, error);
                        return { setName, data: [] };
                    });
            }))
            .then(results => {
                allCardData = results.flatMap(result => {
                    return result.data.map(card => ({...card, setName: result.setName }));
                });

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

        const searchableFields = [
            card.name,
            card.cardNumber,
            card.tag,
            card.ability,
            card.collabEffect,
            card.bloomEffect,
            card.giftEffect,
            card.extraEffect,
            card.oshiSkill?.description,
            card.spOshiSkill?.description,
            ...(card.skills?.map(s => s.description) || [])
        ];

        return searchableFields.some(field => field && field.toLowerCase().includes(searchText));
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

        // Pass the entire card object to get the correct image URL
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
            modalSkills.innerHTML = '<h3>Skills</h3>'; // It's okay to use innerHTML for a simple, static tag like this.
            card.skills.forEach(skill => {
                const skillContainer = document.createElement('div');

                // Create and append the skill name
                const skillNameP = document.createElement('p');
                skillNameP.classList.add('modal-skill');
                skillNameP.innerHTML = `<strong>Skill Name:</strong> ${skill.name}`; // Using innerHTML here is fine for the <strong> tag
                skillContainer.appendChild(skillNameP);

                // Create and append the DMG
                const skillDmgP = document.createElement('p');
                skillDmgP.innerHTML = `<strong>DMG:</strong> ${skill.dmg || ''}`;
                skillContainer.appendChild(skillDmgP);

                // Create and append the description using textContent
                if (skill.description) {
                    const skillDescP = document.createElement('p');
                    const strongTag = document.createElement('strong');
                    strongTag.textContent = 'Arts Effect: ';

                    skillDescP.appendChild(strongTag); // Add the "Arts Effect: " part
                    skillDescP.append(skill.description); // Append the description text, which will be correctly displayed

                    skillContainer.appendChild(skillDescP);
                }

                modalSkills.appendChild(skillContainer);
            });
            modalSkills.classList.remove('hidden');
        } else {
            modalSkills.classList.add('hidden');
        }

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

    function toggleVisibility(element, value) {
        if (!value || value === 'N/A') {
            element.classList.add('hidden');
        } else {
            element.classList.remove('hidden');
        }
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
