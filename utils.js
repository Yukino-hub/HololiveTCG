// utils.js - Shared utilities for Hololive TCG

// Constants
const baseUrl = "https://hololive-official-cardgame.com/wp-content/images/cardlist/";
const seriesFiles = [
    ...Array.from({ length: 13 }, (_, i) => `sets/hSD/hSD${(i + 1).toString().padStart(2, '0')}.json`),
    ...Array.from({ length: 7 }, (_, i) => `sets/hBP/hBP${(i + 1).toString().padStart(2, '0')}.json`),
    'sets/hPR.json',
    'sets/hY01.json',
    'sets/hY.json'
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
 * Constructs the base image URL for a card.
 * Handles manual override and default pattern.
 * @param {object} card - The card data object from JSON.
 * @returns {string} The image URL.
 */
function getBaseImageUrl(card) {
    if (card.manualUrl) {
        // Enforce HTTPS for manual URLs to prevent mixed content issues.
        return card.manualUrl.startsWith('http://') ? card.manualUrl.replace('http://', 'https://') : card.manualUrl;
    }
    // Default URL for standard art.
    return `${baseUrl}${card.setName}/${card.cardNumber}_${card.rarity}.png`;
}

/**
 * Generates a comprehensive search string for a card.
 * Includes name, card number, tags, abilities, effects, and skill descriptions.
 * @param {object} card - The card object.
 * @returns {string} The lowercase search string.
 */
function generateSearchString(card) {
    const fields = [
        card.name,
        card.cardNumber,
        card.tag,
        card.ability,
        card.collabEffect,
        card.bloomEffect,
        card.giftEffect,
        card.extraEffect,
        card.oshiStageSkill,
        card.oshiSkill?.name,
        card.oshiSkill?.description,
        card.spOshiSkill?.name,
        card.spOshiSkill?.description,
        ...(card.skills?.map(s => (s.name || '') + " " + (s.description || '')) || [])
    ];
    // Filter out null/undefined/empty strings and join
    return fields.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Fetches card data from the configured series files.
 * @returns {Promise<Array>} A promise that resolves to the flat array of all card data.
 */
function fetchCardData() {
    return Promise.all(seriesFiles.map(file => {
        const setName = file.split('/').pop().split('.')[0];
        return fetch(file)
            .then(response => {
                if (!response.ok) {
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
            return result.data.map(card => {
                // Add setName and pre-computed searchString to each card
                return {
                    ...card,
                    setName: result.setName,
                    searchString: generateSearchString(card)
                };
            });
        });
    });
}

/**
 * Toggles visibility of an element based on a value.
 * @param {HTMLElement} element - The DOM element.
 * @param {string|null} value - The value to check.
 */
function toggleVisibility(element, value) {
    if (!element) return;
    if (!value || value === 'N/A') {
        element.classList.add('hidden');
    } else {
        element.classList.remove('hidden');
    }
}

/**
 * Populates the common fields of the card detail modal.
 * Assumes standard ID naming convention (modalCardName, etc.) used in both pages.
 * @param {object} card - The card object.
 */
function populateModalCommon(card) {
    // Elements (fetching by ID here ensures we get the current page's elements)
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
    const modalOshiStageSkill = document.getElementById('modalOshiStageSkill');
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

    // Containers (for visibility toggling)
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
    const modalOshiStageSkillContainer = document.getElementById('modalOshiStageSkillContainer');
    const modalExtraEffectContainer = document.getElementById('modalExtraEffectContainer');
    const modalSourcesContainer = document.getElementById('modalSourcesContainer');


    // Populate Text Content
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
    if (modalOshiStageSkill) modalOshiStageSkill.textContent = card.oshiStageSkill || '';
    if (modalExtraEffect) modalExtraEffect.textContent = card.extraEffect || '';
    if (modalSources) modalSources.textContent = card.source || '';

    // Toggle Visibility
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
    toggleVisibility(modalOshiStageSkillContainer, card.oshiStageSkill);
    toggleVisibility(modalExtraEffectContainer, card.extraEffect);
    toggleVisibility(modalSourcesContainer, card.source);

    // Oshi Skill
    if (card.oshiSkill && modalOshiSkill) {
        modalOshiSkill.classList.remove('hidden');
        if (modalOshiSkillName) modalOshiSkillName.textContent = card.oshiSkill.name || '';
        if (modalOshiSkillPower) modalOshiSkillPower.textContent = card.oshiSkill.power || '';
        if (modalOshiSkillDescription) modalOshiSkillDescription.textContent = card.oshiSkill.description || '';
    } else if (modalOshiSkill) {
        modalOshiSkill.classList.add('hidden');
    }

    // SP Oshi Skill
    if (card.spOshiSkill && modalSpOshiSkill) {
        modalSpOshiSkill.classList.remove('hidden');
        if (modalSpOshiSkillName) modalSpOshiSkillName.textContent = card.spOshiSkill.name || '';
        if (modalSpOshiSkillPower) modalSpOshiSkillPower.textContent = card.spOshiSkill.power || '';
        if (modalSpOshiSkillDescription) modalSpOshiSkillDescription.textContent = card.spOshiSkill.description || '';
    } else if (modalSpOshiSkill) {
        modalSpOshiSkill.classList.add('hidden');
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

/**
 * Initializes lazy loading for images with class 'lazy-load'.
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
