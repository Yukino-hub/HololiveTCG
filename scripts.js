document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('contentContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchBar = document.getElementById('searchBar');
    const seriesFilter = document.getElementById('seriesFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const bloomTypeFilter = document.getElementById('bloomTypeFilter');
    const modal = document.getElementById('modal');
    const modalCloseIcon = document.getElementById('modalCloseIcon');

    const modalImage = document.getElementById('modalImage');
    const modalCardName = document.getElementById('modalCardName');
    const modalCardNumberContainer = document.getElementById('modalCardNumberContainer');
    const modalCardTagContainer = document.getElementById('modalCardTagContainer');
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
    const modalTag = document.getElementById('modalTags');
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

    function getImageUrl(set, cardNumber, rarity) {
        return `${baseUrl}${set}/${cardNumber}_${rarity}.png`;
    }

    let allCardData = [];
    let filteredCardData = [];
    const seriesFiles = ['hSD01.json', 'hBP01.json', 'hPR.json', 'hY01.json'];

    function loadCardData() {
        loadingIndicator.style.display = 'block';

        // Combine all JSON data from the seriesFiles
     Promise.all(seriesFiles.map(file => {
            const setName = file.split('.')[0];  // Extract set name from file (e.g., 'hBP01' from 'hBP01.json')
            return fetch(file).then(response => response.json().then(data => ({ setName, data })));
        }))
        .then(results => {
            allCardData = results.flatMap(result => {
                return result.data.map(card => ({ ...card, setName: result.setName })); // Add setName to each card
            });
            filteredCardData = allCardData; // Load all cards initially
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
        
        // Generate the image URL dynamically
        const imageUrl = getImageUrl(card.setName, card.cardNumber, card.rarity);

        cardElement.innerHTML = `
            <img data-src="${imageUrl}" alt="${card.name}" class="lazy-load">
            <p>${card.name}</p>
            <p>Card Number: ${card.cardNumber}</p>
        `;
        
        if (card.hasAlternativeArt) {
            cardElement.innerHTML += `
                <p>Alternative Art: 
                    <span class="colored-yes">Yes</span>
                </p>`;
        }

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

        filteredCardData = allCardData.filter(card => {
            const matchesSearch = card.cardNumber.toLowerCase().includes(searchText);
            const matchesSeries = selectedSeries ? card.cardNumber.startsWith(selectedSeries) : true;
            const matchesRarity = selectedRarity ? card.rarity === selectedRarity : true;
            const matchesBloomType = selectedBloomType ? (card.bloomLevel === selectedBloomType || card.type === selectedBloomType) : true;
            return matchesSearch && matchesSeries && matchesRarity && matchesBloomType;
        });

        displayCards(filteredCardData); // Update display based on filtered results
    }

    function openModal(card) {
        const modalImageContainer = document.getElementById('modalImageContainer');
        modalImageContainer.innerHTML = '';
    
        // Generate the image URL for the modal
        const imageUrl = getImageUrl(card.setName, card.cardNumber, card.rarity);
    
        const primaryImage = document.createElement('img');
        primaryImage.src = imageUrl;
        primaryImage.alt = card.name;
        modalImageContainer.appendChild(primaryImage);
        
        // Set the other modal data
        modalCardName.textContent = card.name || '';
        modalCardNumber.textContent = card.cardNumber || '';
        modalTag.textContent = card.tag || '';
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
        toggleVisibility(modalCardTagContainer, card.tag);
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
                    <p style="margin-top: 10px;"><strong>Skill Name:</strong> ${skill.name}</p>
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

    // Ensure the close icon works
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

    // Event Listeners
    searchBar.addEventListener('input', filterCards);
    seriesFilter.addEventListener('change', filterCards);
    rarityFilter.addEventListener('change', filterCards);
    bloomTypeFilter.addEventListener('change', filterCards);

    // Close modal
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initial load
    loadCardData();
});
