// Constants
const baseUrl = "https://hololive-official-cardgame.com/wp-content/images/cardlist/";
const seriesFiles = [
    ...Array.from({ length: 11 }, (_, i) => `hSD${(i + 1).toString().padStart(2, '0')}.json`),
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
 * Toggles the visibility of an element based on a value.
 * @param {HTMLElement} element The element to toggle.
 * @param {any} value The value to check. If falsy or 'N/A', the element is hidden.
 */
function toggleVisibility(element, value) {
    if (!value || value === 'N/A') {
        element.classList.add('hidden');
    } else {
        element.classList.remove('hidden');
    }
}

/**
 * Initializes intersection observer for lazy loading images.
 */
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

/**
 * Fetches card data from all series files.
 * @returns {Promise<Array>} A promise that resolves to a flat array of all card objects with setName.
 */
function fetchCardData() {
    return Promise.all(seriesFiles.map(file => {
        const setName = file.split('.')[0];
        return fetch(file)
            .then(response => {
                if (!response.ok) {
                    console.warn(`File not found or error: ${file}`);
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
        return results.flatMap(result => {
            return result.data.map(card => ({...card, setName: result.setName }));
        });
    });
}

/**
 * Constructs the image URL for a card based on options.
 * @param {object} card - The card data object.
 * @param {object} options - Options for image variations (foils, altArt, etc.).
 * @returns {string} The final image URL.
 */
function constructImageUrl(card, options = {}) {
    // Priority 1: Manual URL Override.
    if (card.manualUrl) {
        return card.manualUrl.startsWith('http://') ? card.manualUrl.replace('http://', 'https://') : card.manualUrl;
    }

    const imageTypeConfigs = [{
        condition: options.showSigned && card.hasSigned,
        directory: card.imageSet || card.setName,
        suffix: 'SEC'
    }, {
        condition: options.showHolomenRare && card.hasHolomenRare,
        directory: card.imageSet || card.setName,
        suffix: 'HR'
    }, {
        condition: options.showFullArt && card.hasFullArt,
        directory: card.imageSet || card.setName,
        suffix: 'SR'
    }, {
        condition: options.showAltArt && card.hasAlternativeArt,
        directory: card.imageSet || card.setName,
        suffix: {
            OSR: 'OUR',
            RR: 'UR'
        } [card.rarity] || card.rarity
    }, {
        condition: options.showFoil && card.hasFoils,
        directory: card.imageSet || card.setName,
        suffix: 'S'
    }, {
        condition: options.showGrandPrix && card.hasGrandPrix,
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

/**
 * Populates the common modal elements with card data.
 * @param {object} card - The card data object.
 */
function populateModalCommon(card) {
    const modalCardName = document.getElementById('modalCardName');
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

    if (modalCardName) modalCardName.textContent = card.name || '';
    if (modalCardNumber) modalCardNumber.textContent = card.cardNumber || '';
    if (modalCardTags) modalCardTags.textContent = card.tag || '';
    if (modalRarity) modalRarity.textContent = card.rarity || '';
    if (modalBloomLevel) modalBloomLevel.textContent = card.bloomLevel || '';
    if (modalHP) modalHP.textContent = card.hp || '';
    if (modalColor) modalColor.textContent = card.color || '';
    if (modalLives) modalLives.textContent = card.lives || '';
    if (modalBuzz) modalBuzz.textContent = card.buzz || '';
    if (modalType) modalType.textContent = card.type || '';
    if (modalAbility) modalAbility.textContent = card.ability || '';
    if (modalCollabEffect) modalCollabEffect.textContent = card.collabEffect || '';
    if (modalBloomEffect) modalBloomEffect.textContent = card.bloomEffect || '';
    if (modalGiftEffect) modalGiftEffect.textContent = card.giftEffect || '';
    if (modalExtraEffect) modalExtraEffect.textContent = card.extraEffect || '';
    if (modalSources) modalSources.textContent = card.source || '';

    // Visibility toggles
    toggleVisibility(document.getElementById('modalCardNumberContainer'), card.cardNumber);
    toggleVisibility(document.getElementById('modalCardTagsContainer'), card.tag);
    toggleVisibility(document.getElementById('modalRarityContainer'), card.rarity);
    toggleVisibility(document.getElementById('modalBloomLevelContainer'), card.bloomLevel);
    toggleVisibility(document.getElementById('modalHPContainer'), card.hp);
    toggleVisibility(document.getElementById('modalColorContainer'), card.color);
    toggleVisibility(document.getElementById('modalLivesContainer'), card.lives);
    toggleVisibility(document.getElementById('modalBuzzContainer'), card.buzz);
    toggleVisibility(document.getElementById('modalTypeContainer'), card.type);
    toggleVisibility(document.getElementById('modalAbilityContainer'), card.ability);
    toggleVisibility(document.getElementById('modalCollabEffectContainer'), card.collabEffect);
    toggleVisibility(document.getElementById('modalBloomEffectContainer'), card.bloomEffect);
    toggleVisibility(document.getElementById('modalGiftEffectContainer'), card.giftEffect);
    toggleVisibility(document.getElementById('modalExtraEffectContainer'), card.extraEffect);
    toggleVisibility(document.getElementById('modalSourcesContainer'), card.source);

    // Oshi Skill
    if (card.oshiSkill) {
        if (modalOshiSkill) modalOshiSkill.classList.remove('hidden');
        if (modalOshiSkillName) modalOshiSkillName.textContent = card.oshiSkill.name || '';
        if (modalOshiSkillPower) modalOshiSkillPower.textContent = card.oshiSkill.power || '';
        if (modalOshiSkillDescription) modalOshiSkillDescription.textContent = card.oshiSkill.description || '';
    } else {
        if (modalOshiSkill) modalOshiSkill.classList.add('hidden');
    }

    // SP Oshi Skill
    if (card.spOshiSkill) {
        if (modalSpOshiSkill) modalSpOshiSkill.classList.remove('hidden');
        if (modalSpOshiSkillName) modalSpOshiSkillName.textContent = card.spOshiSkill.name || '';
        if (modalSpOshiSkillPower) modalSpOshiSkillPower.textContent = card.spOshiSkill.power || '';
        if (modalSpOshiSkillDescription) modalSpOshiSkillDescription.textContent = card.spOshiSkill.description || '';
    } else {
        if (modalSpOshiSkill) modalSpOshiSkill.classList.add('hidden');
    }

    // Skills
    if (modalSkills) {
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
    }
}
