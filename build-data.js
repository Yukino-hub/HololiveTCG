const fs = require('fs');
const path = require('path');

const setsDir = path.join(__dirname, 'sets');
const outputFile = path.join(__dirname, 'sets', 'all_cards.json');

/**
 * Generates a comprehensive search string for a card.
 * Includes name, card number, tags, abilities, effects, and skill descriptions.
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

function processDirectory(dir, allCards) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath, allCards);
        } else if (file.endsWith('.json') && file !== 'all_cards.json') {
            try {
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                const cards = JSON.parse(fileContent);
                const setName = path.basename(file, '.json');

                for (const card of cards) {
                    // Inject metadata into the card object
                    card.setName = setName;
                    card.searchString = generateSearchString(card);
                    allCards.push(card);
                }
                console.log(`Processed ${file} (${cards.length} cards)`);
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }
    }
}

function buildData() {
    console.log('Starting data consolidation...');
    const allCards = [];
    
    if (!fs.existsSync(setsDir)) {
        console.error(`Directory not found: ${setsDir}`);
        return;
    }

    processDirectory(setsDir, allCards);

    try {
        fs.writeFileSync(outputFile, JSON.stringify(allCards, null, 2), 'utf-8');
        console.log(`\nSuccess! Consolidated ${allCards.length} cards into sets/all_cards.json`);
    } catch (error) {
        console.error('Error writing all_cards.json:', error);
    }
}

buildData();
