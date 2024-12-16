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
        ...Array.from({ length: 4 }, (_, i) => `hSD${(i + 1).toString().padStart(2, '0')}.json`),
        ...Array.from({ length: 2 }, (_, i) => `hBP${(i + 1).toString().padStart(2, '0')}.json`),
        'hPR.json',
        'hY01.json'
    ];

    function getImageUrl(set, cardNumber, rarity, hasAlternativeArt, hasFoils, hasFullArt, hasSigned, imageSet) {

         const directory =  set; // Defaults to set
        
        // Handle signed cards (SEC rarity)
        if (signedCheckbox.checked && hasSigned) {
            return `${baseUrl}${directory}/${cardNumber}_SEC.png`;
        }

        // Handle full art cards (SR rarity)
       if (fullArtCheckbox.checked && hasFullArt) {
        const fullArtDirectory = imageSet || set; // use imageSet if provided, otherwise set
        return `${baseUrl}${fullArtDirectory}/${cardNumber}_SR.png`;
    }

        // Handle foil cards (S rarity)
        if (foilCheckbox.checked && hasFoils) {
            return `${baseUrl}${directory}/${cardNumber}_S.png`;
        }

        // Handle alternative art cards if the checkbox is checked
        if (altArtCheckbox.checked && hasAlternativeArt) {
            const altRarityMap = {
                OSR: 'OUR',
                RR: 'UR', 
            };
            const altRarity = altRarityMap[rarity] || rarity;
            return `${baseUrl}${directory}/${cardNumber}_${altRarity}.png`;
        }

         // New condition for SY rarity if imageSet is provided
        if (rarity === 'SY' && imageSet) {
            // If you'd like to use imageSet directory specifically for SY rarity:
            return `${baseUrl}${imageSet}/${cardNumber}_SY.png`;
        }


        // Default URL for standard art
        return `${baseUrl}${directory}/${cardNumber}_${rarity}.png`;
    }

    function loadCardData() {
        loadingIndicator.style.display = 'block';

        Promise.all(seriesFiles.map(file => {
            const setName = file.split('.')[0];
            return fetch(file)
                .then(response => {
                    if (!response.ok) {
                        // If file not found or error, continue with empty data
                    }
                    return response.json();
                })
                .then(data => ({ setName, data }))
                .catch(error => {
                    return { setName, data: [] };
                });
        }))
        .then(results => {
            allCardData = results.flatMap(result => {
                return result.data.map(card => ({ ...card, setName: result.setName }));
            });
            
            // Initially show all card data
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
        contentContainer.innerHTML = ''; // Clear previous cards

        cardsToShow.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');

            const imageUrl = getImageUrl(
                card.setName,
                card.cardNumber,
                card.rarity,
                card.hasAlternativeArt,
                card.hasFoils,
                card.hasFullArt,
                card.hasSigned,
                card.imageSet
            );

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
                </div>
            `;

            cardElement.addEventListener('click', () => openModal(card));
            contentContainer.appendChild(cardElement);
        });

        initializeLazyLoading();
    }

    function initializeLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load');

        const lazyLoad = (image) => {
            const src = image.getAttribute('data-src');
            if (src) {
                image.src = src;
                image.onload = () => image.classList.remove('lazy-load');
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    lazyLoad(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        lazyImages.forEach(image => {
            observer.observe(image);
        });
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
          
        filteredCardData = allCardData.filter(card => {
            const matchesSearch = card.name.toLowerCase().includes(searchText) || 
                                  card.cardNumber.toLowerCase().includes(searchText) || 
                                  (card.tag && card.tag.toLowerCase().includes(searchText));

            const matchesSeries = selectedSeries ? card.cardNumber.startsWith(selectedSeries) : true;
            const matchesRarity = selectedRarity ? card.rarity === selectedRarity : true;
            const matchesBloomType = selectedBloomType ? (card.bloomLevel === selectedBloomType || card.type === selectedBloomType) : true;

            // If a checkbox is checked, card must have that property
            const matchesAltArt = showAltArt ? card.hasAlternativeArt === true : true;
            const matchesFullArt = showFullArt ? card.hasFullArt === true : true;
            const matchesFoilCard = showFoil ? card.hasFoils === true : true;
            const matchesSignedCard = showSigned ? card.hasSigned === true : true;

            return matchesSearch &&
                   matchesSeries &&
                   matchesRarity &&
                   matchesBloomType &&
                   matchesAltArt &&
                   matchesFullArt &&
                   matchesFoilCard &&
                   matchesSignedCard;
        });

        displayCards(filteredCardData);
    }

    function openModal(card) {
        const modalImageContainer = document.getElementById('modalImageContainer');
        modalImageContainer.innerHTML = '';
    
        // Generate the image URL for the modal
        // Note: Pass all required card properties to get the correct image variant
        const imageUrl = getImageUrl(
            card.setName,
            card.cardNumber,
            card.rarity,
            card.hasAlternativeArt,
            card.hasFoils,
            card.hasFullArt,
            card.hasSigned
        );
    
        const primaryImage = document.createElement('img');
        primaryImage.src = imageUrl;
        primaryImage.alt = card.name;
        modalImageContainer.appendChild(primaryImage);
        
        // Set the other modal data
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

        // Toggle visibility based on content
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

        // Oshi Skill
        if (card.oshiSkill) {
            modalOshiSkill.classList.remove('hidden');
            modalOshiSkillName.textContent = card.oshiSkill.name || '';
            modalOshiSkillPower.textContent = card.oshiSkill.power || '';
            modalOshiSkillDescription.textContent = card.oshiSkill.description || '';
        } else {
            modalOshiSkill.classList.add('hidden');
        }

        // SP Oshi Skill
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
                const skillElement = document.createElement('div');
                skillElement.innerHTML = `
                    <p class="modal-skill"><strong>Skill Name:</strong> ${skill.name}</p>
                    <p><strong>DMG:</strong> ${skill.dmg || ''}</p>
                    ${skill.description ? `<p><strong>Description:</strong> ${skill.description}</p>` : ''}
                `;
                modalSkills.appendChild(skillElement);
            });
            modalSkills.classList.remove('hidden');
        } else {
            modalSkills.classList.add('hidden');
        }

        // Scroll the modal content container to the top
        const modalContent = document.querySelector('#modal .modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }

        // Display the modal
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
