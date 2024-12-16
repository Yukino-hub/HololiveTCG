document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('contentContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchBar = document.getElementById('searchBar');
    const seriesFilter = document.getElementById('seriesFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const bloomTypeFilter = document.getElementById('bloomTypeFilter');
    const altArtCheckbox = document.getElementById('altArtCheckbox'); // New checkbox element

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
    ...Array.from({ length: 4 }, (_, i) => `hSD${(i + 1).toString().padStart(2, '0')}.json`), // Dynamic for hSD01.json to hSD99.json
    ...Array.from({ length: 2 }, (_, i) => `hBP${(i + 1).toString().padStart(2, '0')}.json`), // Dynamic for hBP01.json to hBP99.json
    'hPR.json',  // Fixed
    'hY01.json' // Fixed
    ];

  function getImageUrl(set, cardNumber, rarity, hasAlternativeArt, hasFoils, hasFullArt, hasSigned) {
    // Handle signed cards (SEC rarity)
    if (signedCheckbox.checked && hasSigned) {
        return `${baseUrl}${set}/${cardNumber}_SEC.png`;
    }

    // Handle full art cards (SR rarity)
    if (fullartCheckbox.checked && hasFullArt) {
        return `${baseUrl}${set}/${cardNumber}_SR.png`;
    }

    // Handle foil cards (S rarity)
    if (foilCheckbox.checked && hasFoils) {
        return `${baseUrl}${set}/${cardNumber}_S.png`;
    }

    // Handle alternative art cards if the checkbox is checked
    if (altArtCheckbox.checked && hasAlternativeArt) {
        const altRarityMap = {
            OSR: 'OUR', // Example mapping
            RR: 'UR', 
        };
        const altRarity = altRarityMap[rarity] || rarity; // Default to original rarity if not found
        return `${baseUrl}${set}/${cardNumber}_${altRarity}.png`;
    }

    // Default URL for standard art
    return `${baseUrl}${set}/${cardNumber}_${rarity}.png`;
}


    function loadCardData() {
        loadingIndicator.style.display = 'block';

          

        // Combine all JSON data from the seriesFiles
    Promise.all(seriesFiles.map(file => {
    const setName = file.split('.')[0];  // Extract set name from file (e.g., 'hSD01' from 'hSD01.json')
    return fetch(file)  // Fetch the file
        .then(response => {
            if (!response.ok) {  // Check if the response is successful (200-299)
                //throw new Error(`File not found: ${file}`);
            }
            return response.json();  // Parse the response as JSON
        })
        .then(data => ({ setName, data }))  // Attach the setName to the data
        .catch(error => {
            //console.warn(error.message);  // Log a warning if the file is not found
            return { setName, data: [] };  // Return empty data if file is missing
        });
}))
.then(results => {
    // Combine the results into one array of cards, adding the set name to each card
    allCardData = results.flatMap(result => {
        return result.data.map(card => ({ ...card, setName: result.setName }));
    });
    
    // Initially show all card data
    filteredCardData = allCardData;
    
    // Display the cards (assuming displayCards is a function you defined)
    displayCards(filteredCardData);
    
    // Hide the loading indicator
    loadingIndicator.style.display = 'none';
})
.catch(error => {
    // Handle any errors that occur during fetch
    console.error('Failed to load card data:', error);
    
    // Hide the loading indicator if there's an error
    loadingIndicator.style.display = 'none';
});
    }
function displayCards(cardsToShow) {
   contentContainer.innerHTML = ''; // Clear previous cards

    cardsToShow.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        // Generate the base image URL dynamically
        const imageUrl = getImageUrl(
    card.setName,
    card.cardNumber,
    card.rarity,
    card.hasAlternativeArt,
    card.hasFoils,
    card.hasFullArt,
    card.hasSigned
    );

        // Create the card HTML
        cardElement.innerHTML = `
            <img data-src="${imageUrl}" alt="${card.name}" class="lazy-load">
            <p><strong>${card.name}</strong></p>
            <p>Card Number: ${card.cardNumber}</p>
            <p>Rarity: ${card.rarity}</p>
            <div class="special-attributes">
                ${card.hasAlternativeArt ? `<span class="badge alt-art">Alt Art</span>` : ''}
                ${card.hasFoils ? `<span class="badge foils">Foils</span>` : ''}
                ${card.hasFullArt ? `<span class="badge full-art">Full Art</span>` : ''}
                ${card.hasSigned ? `<span class="badge signed">Signed</span>` : ''}
            </div>
        `;

        // Add click event listener to open modal
        cardElement.addEventListener('click', () => openModal(card));

        // Append the card element to the container
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
    const showAltArt = altArtCheckbox.checked; // Get the checkbox state
    console.log("Checkbox state:", showAltArt);
    console.log("Filtered Card Data:", filteredCardData);

    // Filter the cards based on various criteria
    filteredCardData = allCardData.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchText) || 
                              card.cardNumber.toLowerCase().includes(searchText) || 
                              (card.tag && card.tag.toLowerCase().includes(searchText)); // Handle potential undefined tag
        const matchesSeries = selectedSeries ? card.cardNumber.startsWith(selectedSeries) : true;
        const matchesRarity = selectedRarity ? card.rarity === selectedRarity : true;
        const matchesBloomType = selectedBloomType ? (card.bloomLevel === selectedBloomType || card.type === selectedBloomType) : true;

       // Adjust the alt art matching condition
        const matchesAltArt = showAltArt ? (card.hasAlternativeArt === true) : true;

        return matchesSearch && matchesSeries && matchesRarity && matchesBloomType && matchesAltArt;
    });

    // Call displayCards with the current filtered data and the checkbox state
    displayCards(filteredCardData, showAltArt);
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

// Add the event listener for the alternative art checkbox here
altArtCheckbox.addEventListener('change', () => {
    filterCards(); // Call filterCards to reapply all filters
});

// Event listeners for other filters
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
