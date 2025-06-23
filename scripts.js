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

    const modal = document.getElementById('modal');
    const modalCloseIcon = document.getElementById('modalCloseIcon');

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
        ...Array.from({ length: 7 }, (_, i) => `hSD${(i + 1).toString().padStart(2, '0')}.json`),
        ...Array.from({ length: 4 }, (_, i) => `hBP${(i + 1).toString().padStart(2, '0')}.json`),
        'hPR.json',
        'hY01.json',
        'hY.json'
    ];

    /**
     * Constructs the image URL for a card, allowing for a manual override.
     * The logic prioritizes image types in a specific order.
     * @param {object} card - The card data object from JSON.
     * @returns {string} The final image URL for the card.
     */
    function getImageUrl(card) {
        // Priority 1: Manual URL Override. If a card has `manualUrl`, use it immediately.
        // This is the most powerful override and ignores all other logic.
        // Ensure the property name in your JSON is "manualUrl" (case-sensitive).
        if (card.manualUrl) {
            return card.manualUrl;
        }
        
        // Handle signed cards (SEC rarity)
        if (signedCheckbox.checked && card.hasSigned) {
            const directory = card.imageSet || card.setName;
            return `${baseUrl}${directory}/${card.cardNumber}_SEC.png`;
        }
    
        // Handle full art cards (SR rarity)
        if (fullArtCheckbox.checked && card.hasFullArt) {
            const directory = card.imageSet || card.setName;
            return `${baseUrl}${directory}/${card.cardNumber}_SR.png`;
        }
    
        // Handle alternative art cards (OUR/UR)
        if (altArtCheckbox.checked && card.hasAlternativeArt) {
            const directory = card.imageSet || card.setName;
            const altRarityMap = {
                OSR: 'OUR',
                RR: 'UR', 
            };
            const altRarity = altRarityMap[card.rarity] || card.rarity;
            return `${baseUrl}${directory}/${card.cardNumber}_${altRarity}.png`;
        }
        
        // Handle foil cards (S rarity)
        if (foilCheckbox.checked && card.hasFoils) {
            const directory = card.imageSet || card.setName;
            return `${baseUrl}${directory}/${card.cardNumber}_S.png`;
        }
        
        // Handle Grandprix art cards (P rarity)
        if (grandprixCheckbox.checked && card.hasGrandPrix) {
            // Grand Prix cards are typically in the 'hPR' set.
            const directory = "hPR";
            return `${baseUrl}${directory}/${card.cardNumber}_P.png`;
        }
    
        // Handle specific rarities that might use imageSet, like SY, as a fallback.
        if (card.rarity === 'SY' && card.imageSet) {
            return `${baseUrl}${card.imageSet}/${card.cardNumber}_SY.png`;
        }
    
        // Default URL for standard art. This should always use the card's native `setName`.
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
                return result.data.map(card => ({ ...card, setName: result.setName }));
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

    function displayCards(cardsToShow) {
        contentContainer.innerHTML = '';

        cardsToShow.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');

            // Pass the entire card object to the getImageUrl function
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
                </div>
            `;

            cardElement.addEventListener('click', () => openModal(card));
            contentContainer.appendChild(cardElement);
        });

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
        const showAltArt = altArtCheckbox.checked;
        const showFullArt = fullArtCheckbox.checked;
        const showFoil = foilCheckbox.checked;
        const showSigned = signedCheckbox.checked;
        const showGrandprix = grandprixCheckbox.checked;
 
        filteredCardData = allCardData.filter(card => {
            let matchesSearch = true; // Default to true

            // --- Start of New Search Logic ---

            if (searchText.startsWith('bloom:')) {
                // Search only in Bloom Effect
                const term = searchText.substring(6).trim(); // Get text after "bloom:"
                matchesSearch = card.bloomEffect && card.bloomEffect.toLowerCase().includes(term);

            } else if (searchText.startsWith('collab:')) {
                // Search only in Collab Effect
                const term = searchText.substring(7).trim(); // Get text after "collab:"
                matchesSearch = card.collabEffect && card.collabEffect.toLowerCase().includes(term);

            } else if (searchText) {
                // General search (if search bar is not empty and has no prefix)
                 matchesSearch = card.name.toLowerCase().includes(searchText) || 
                                  card.cardNumber.toLowerCase().includes(searchText) || 
                                  (card.tag && card.tag.toLowerCase().includes(searchText)) ||
                                  (card.ability && card.ability.toLowerCase().includes(searchText)) ||
                                  (card.collabEffect && card.collabEffect.toLowerCase().includes(searchText)) ||
                                  (card.bloomEffect && card.bloomEffect.toLowerCase().includes(searchText)) ||
                                  (card.giftEffect && card.giftEffect.toLowerCase().includes(searchText)) ||
                                  (card.extraEffect && card.extraEffect.toLowerCase().includes(searchText)) ||
                                  (card.oshiSkill && card.oshiSkill.description && card.oshiSkill.description.toLowerCase().includes(searchText)) ||
                                  (card.spOshiSkill && card.spOshiSkill.description && card.spOshiSkill.description.toLowerCase().includes(searchText)) ||
                                  (card.skills && card.skills.some(skill => skill.description && skill.description.toLowerCase().includes(searchText)));
            }
            // --- End of New Search Logic ---

            const matchesSeries = selectedSeries ? card.cardNumber.startsWith(selectedSeries) : true;
            const matchesRarity = selectedRarity ? card.rarity === selectedRarity : true;
            const matchesBloomType = selectedBloomType ? (card.bloomLevel === selectedBloomType || card.type === selectedBloomType) : true;

            const matchesAltArt = showAltArt ? card.hasAlternativeArt === true : true;
            const matchesFullArt = showFullArt ? card.hasFullArt === true : true;
            const matchesFoilCard = showFoil ? card.hasFoils === true : true;
            const matchesSignedCard = showSigned ? card.hasSigned === true : true;
            const matchesGrandPrix = showGrandprix? card.hasGrandPrix === true : true;

            return matchesSearch &&
                   matchesSeries &&
                   matchesRarity &&
                   matchesBloomType &&
                   matchesAltArt &&
                   matchesFullArt &&
                   matchesFoilCard &&
                   matchesSignedCard && 
                   matchesGrandPrix;
        });

        displayCards(filteredCardData);
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

    altArtCheckbox.addEventListener('change', filterCards);
    signedCheckbox.addEventListener('change', filterCards);
    foilCheckbox.addEventListener('change', filterCards);
    fullArtCheckbox.addEventListener('change', filterCards);
    grandprixCheckbox.addEventListener('change', filterCards);

    searchBar.addEventListener('input', filterCards);
    seriesFilter.addEventListener('change', filterCards);
    rarityFilter.addEventListener('change', filterCards);
    bloomTypeFilter.addEventListener('change', filterCards);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    loadCardData();
});
