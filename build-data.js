const fs = require('fs');
const path = require('path');

const setsDir = path.join(__dirname, 'sets');
const outputFile = path.join(__dirname, 'sets', 'all_cards.json');
const validateOnly = process.argv.includes('--validate');

const EXPECTED_BOOL_FIELDS = ['hasAlternativeArt', 'hasSigned', 'hasFoils', 'hasFullArt', 'hasGrandPrix', 'hasHolomenRare'];
const TYPO_FIELDS = { hasFullart: 'hasFullArt', hasAlternateArt: 'hasAlternativeArt' };

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
    return fields.filter(Boolean).join(" ").toLowerCase();
}

function validateCard(card, file, issues) {
    const loc = `${file} → ${card.cardNumber || '(no cardNumber)'}`;
    if (!card.cardNumber) issues.push(`MISSING cardNumber in ${file}`);
    if (!card.name) issues.push(`MISSING name: ${loc}`);

    for (const [typo, correct] of Object.entries(TYPO_FIELDS)) {
        if (Object.prototype.hasOwnProperty.call(card, typo)) {
            issues.push(`FIELD TYPO "${typo}" should be "${correct}": ${loc}`);
        }
    }

    if (card.skills) {
        card.skills.forEach((skill, i) => {
            if (!skill.name) issues.push(`MISSING skill[${i}].name: ${loc}`);
        });
    }
}

function processDirectory(dir, allCards, seenNumbers, issues) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath, allCards, seenNumbers, issues);
        } else if (file.endsWith('.json') && file !== 'all_cards.json') {
            try {
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                const cards = JSON.parse(fileContent);

                if (!Array.isArray(cards)) {
                    issues.push(`NOT AN ARRAY: ${file}`);
                    continue;
                }

                const setName = path.basename(file, '.json');

                for (const card of cards) {
                    if (validateOnly) validateCard(card, file, issues);

                    if (card.cardNumber) {
                        if (seenNumbers.has(card.cardNumber)) {
                            issues.push(`DUPLICATE cardNumber "${card.cardNumber}" in ${file}`);
                        } else {
                            seenNumbers.add(card.cardNumber);
                        }
                    }

                    card.setName = setName;
                    card.searchString = generateSearchString(card);
                    allCards.push(card);
                }
                console.log(`Processed ${file} (${cards.length} cards)`);
            } catch (error) {
                issues.push(`PARSE ERROR in ${file}: ${error.message}`);
            }
        }
    }
}

function buildData() {
    if (validateOnly) console.log('Running in --validate mode (no output will be written)...\n');
    else console.log('Starting data consolidation...');

    const allCards = [];
    const seenNumbers = new Set();
    const issues = [];

    if (!fs.existsSync(setsDir)) {
        console.error(`Directory not found: ${setsDir}`);
        return;
    }

    processDirectory(setsDir, allCards, seenNumbers, issues);

    if (issues.length > 0) {
        console.warn(`\n⚠  ${issues.length} issue(s) found:`);
        issues.forEach(i => console.warn('  •', i));
    } else {
        console.log('\n✓ No data issues found.');
    }

    const fatal = issues.some(i => i.startsWith('PARSE ERROR') || i.startsWith('NOT AN ARRAY'));

    if (validateOnly) {
        console.log(`\nValidated ${allCards.length} cards. all_cards.json was NOT modified.`);
        process.exit(issues.length ? 1 : 0);
    }

    if (fatal) {
        console.error('\n✗ Aborting: source files are broken; all_cards.json was NOT regenerated.');
        process.exit(1);
    }

    try {
        fs.writeFileSync(outputFile, JSON.stringify(allCards, null, 2), 'utf-8');
        console.log(`\nSuccess! Consolidated ${allCards.length} cards into sets/all_cards.json`);
    } catch (error) {
        console.error('Error writing all_cards.json:', error);
        process.exit(1);
    }

    try {
        JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        console.log('✓ all_cards.json re-parsed OK.');
    } catch (error) {
        console.error('✗ all_cards.json is not valid JSON after write:', error.message);
        process.exit(1);
    }
}

buildData();
