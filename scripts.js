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
        'hPR.json',  // Fixed
        'hY01.json', // Fixed
        ...Array.from({ length: 99 }, (_, i) => `hSD${(i + 1).toString().padStart(2, '0')}.json`), // Dynamic for hSD01.json to hSD99.json
        ...Array.from({ length: 99 }, (_, i) => `hBP${(i + 1).toString().padStart(2, '0')}.json`)  // Dynamic for hBP01.json to hBP99.json
    ];

    function getImageUrl(set, cardNumber, rarity, hasAlternativeArt) {
        // Check if the checkbox is checked and if the card has alternative art
        if (altArtCheckbox.checked && hasAlternativeArt) {
            // Logic for alternative art URL
            const altRarityMap = {
                OSR: 'OUR', // Example mapping
                RR: 'UR',
                // Add more mappings as necessary
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
                        throw new Error(`File not found: ${file}`);
                    }
                    return response.json();  // Parse the response as JSON
                })
                .then(data => ({ setName, data }))  // Attach the setName to the data
                .catch(error => {
                    console.warn(error.message);  // Log a warning if the file is not found
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
        contentContainer.innerHTML = '';
        cardsToShow.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');

            // Generate the image URL dynamically
            const imageUrl = getImageUrl(card.setName, card.cardNumber, card.rarity, card.hasAlternativeArt);

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
        const showAltArt = altArtCheckbox.checked; // Get the checkbox state

        // Filter the cards based on various criteria
        filteredCardData = allCardData.filter(card => {
            const matchesSearch = card.name.toLowerCase().includes(searchText) || 
                                  card.cardNumber.toLowerCase().includes(searchText);
            const matchesSeries = selectedSeries === 'all' || card.setName === selectedSeries;
            const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
            const matchesBloomType = selectedBloomType === 'all' || card.bloomType === selectedBloomType;
            const matchesAltArt = !showAltArt || card.hasAlternativeArt;

            return matchesSearch && matchesSeries && matchesRarity && matchesBloomType && matchesAltArt;
        });

        displayCards(filteredCardData);
    }

    // Event listeners for search bar and filters
    searchBar.addEventListener('input', filterCards);
    seriesFilter.addEventListener('change', filterCards);
    rarityFilter.addEventListener('change', filterCards);
    bloomTypeFilter.addEventListener('change', filterCards);
    altArtCheckbox.addEventListener('change', filterCards);

    loadCardData();
});
