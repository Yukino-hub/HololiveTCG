 document.addEventListener('DOMContentLoaded', function() {
            const searchBar = document.getElementById('searchBar');
            const seriesFilter = document.getElementById('seriesFilter');
            const rarityFilter = document.getElementById('rarityFilter');
            const bloomTypeFilter = document.getElementById('bloomTypeFilter');
            const cardList = document.getElementById('cardList');
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

            // Load card data from JSON files
            const seriesFiles = ['hSD01.json', 'hBP01.json', 'hYS01.json', 'hPR.json', 'hY01.json'];

            seriesFiles.forEach(file => {
                fetch(file)
                    .then(response => response.json())
                    .then(data => {
                        cards = cards.concat(data);
                        displayCards(cards);
                    });
            });

            function displayCards(cards) {
                cardList.innerHTML = '';
                cards.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.classList.add('card');
                    cardElement.innerHTML = `
                        <img src="${card.image}" alt="${card.name}">
                        <p>${card.name}</p>
                        <p>${card.cardNumber}</p>
                    `;
                    cardElement.addEventListener('click', () => openModal(card));
                    cardList.appendChild(cardElement);
                });
            }

            searchBar.addEventListener('input', function() {
                filterCards();
            });

            seriesFilter.addEventListener('change', function() {
                filterCards();
            });

            rarityFilter.addEventListener('change', function() {
                filterCards();
            });

           bloomTypeFilter.addEventListener('change', function() {
               filterCards();
           });

            function filterCards() {
                const searchText = searchBar.value.toLowerCase();
                const selectedSeries = seriesFilter.value;
                const selectedRarity = rarityFilter.value;
                const selectedBloomType = bloomTypeFilter.value;


                const filteredCards = cards.filter(card => {
                   const matchesSearch = card.cardNumber.toLowerCase().includes(searchText);
                   const matchesSeries = selectedSeries ? card.cardNumber.startsWith(selectedSeries) : true;
                   const matchesRarity = selectedRarity ? card.rarity === selectedRarity : true;
                   const matchesBloomType = selectedBloomType ? (card.bloomLevel === selectedBloomType || card.type === selectedBloomType) : true;
                   return matchesSearch && matchesSeries && matchesRarity && matchesBloomType;
                    });
                displayCards(filteredCards);
                }


            window.openModal = function(card) {
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
            };

            window.closeModal = function(event) {
                if (event) event.stopPropagation();
                modal.style.display = 'none';
            };

            function toggleVisibility(element, value) {
                if (!value || value === 'N/A') {
                    element.classList.add('hidden');
                } else {
                    element.classList.remove('hidden');
                }
            }
        });
