document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('contentContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchBar = document.getElementById('searchBar');
    const seriesFilter = document.getElementById('seriesFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const bloomTypeFilter = document.getElementById('bloomTypeFilter');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');

    const modalCardName = document.getElementById('modalCardName');
    const modalCardNumberContainer = document.getElementById('modalCardNumberContainer');
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

    let cards = [];
    let filteredCards = [];
    let isLoading = false;
    let currentPage = 1;
    const pageSize = 20; // Number of cards per page
    const seriesFiles = ['hSD01.json', 'hBP01.json', 'hYS01.json', 'hPR.json', 'hY01.json'];
    let loadedFiles = new Set(); // Keep track of loaded files

    function loadCards() {
        if (isLoading) return;
        isLoading = true;
        loadingIndicator.style.display = 'block';

        // Check if we have more files to load
        const fileIndex = (currentPage - 1) % seriesFiles.length;
        const file = seriesFiles[fileIndex];

        if (loadedFiles.has(file)) {
            isLoading = false;
            loadingIndicator.style.display = 'none';
            return;
        }

        fetch(file)
            .then(response => response.json())
            .then(data => {
                cards = cards.concat(data);
                loadedFiles.add(file);
                filteredCards = cards.slice(0, currentPage * pageSize); // Slice cards to display
                displayCards(filteredCards);
                isLoading = false;
                loadingIndicator.style.display = 'none';
            })
            .catch(() => {
                isLoading = false;
                loadingIndicator.style.display = 'none';
            });
    }

    function displayCards(cardsToShow) {
        contentContainer.innerHTML = '';
        cardsToShow.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.innerHTML = `
                <img src="${card.image}" alt="${card.name}">
                <p>${card.name}</p>
                <p>${card.cardNumber}</p>
            `;
            cardElement.addEventListener('click', () => openModal(card));
            contentContainer.appendChild(cardElement);
        });
    }

    function filterCards() {
        const searchText = searchBar.value.toLowerCase();
        const selectedSeries = seriesFilter.value;
        const selectedRarity = rarityFilter.value;
        const selectedBloomType = bloomTypeFilter.value;

        filteredCards = cards.filter(card => {
            const matchesSearch = card.cardNumber.toLowerCase().includes(searchText);
            const matchesSeries = selectedSeries ? card.cardNumber.startsWith(selectedSeries) : true;
            const matchesRarity = selectedRarity ? card.rarity === selectedRarity : true;
            const matchesBloomType = selectedBloomType ? (card.bloomLevel === selectedBloomType || card.type === selectedBloomType) : true;
            return matchesSearch && matchesSeries && matchesRarity && matchesBloomType;
        });

        displayCards(filteredCards.slice(0, currentPage * pageSize));
    }

    function openModal(card) {
        modalImage.src = card.image;
        modalCardName.textContent = card.name || '';
        modalCardNumber.textContent = card.cardNumber || '';
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

        modal.style.display = 'flex';
    }

    function closeModal(event) {
        if (event) event.stopPropagation();
        modal.style.display = 'none';
    }

    function toggleVisibility(element, value) {
        if (!value || value === 'N/A') {
            element.classList.add('hidden');
        } else {
            element.classList.remove('hidden');
        }
    }

    searchBar.addEventListener('input', filterCards);
    seriesFilter.addEventListener('change', filterCards);
    rarityFilter.addEventListener('change', filterCards);
    bloomTypeFilter.addEventListener('change', filterCards);

    window.openModal = openModal;
    window.closeModal = closeModal;

    // Load the initial set of cards
    loadCards();

    // Handle infinite scrolling
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 && !isLoading) {
            currentPage++;
            loadCards();
        }
    });
});
