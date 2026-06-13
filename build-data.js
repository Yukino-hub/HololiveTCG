const fs = require('fs');
const path = require('path');
const setsDir = path.join(__dirname, 'sets');
const outputFile = path.join(__dirname, 'sets', 'all_cards.json');
const validateOnly = process.argv.includes('--validate');
const TYPO_FIELDS = { hasFullart: 'hasFullArt', hasAlternateArt: 'hasAlternativeArt' };
function generateSearchString(card) {
    const fields = [card.name, card.cardNumber, card.tag, card.ability, card.collabEffect,
        card.bloomEffect, card.giftEffect, card.extraEffect, card.oshiStageSkill,
        card.oshiSkill?.name, card.oshiSkill?.description, card.spOshiSkill?.name, card.spOshiSkill?.description,
        ...(card.skills?.map(s => (s.name || '') + " " + (s.description || '')) || [])];
    return fields.filter(Boolean).join(" ").toLowerCase();
}
function validateCard(card, file, issues) {
    const loc = `${file} → ${card.cardNumber || '(no cardNumber)'}`;
    if (!card.cardNumber) issues.push(`MISSING cardNumber in ${file}`);
    if (!card.name) issues.push(`MISSING name: ${loc}`);
    for (const [typo, correct] of Object.entries(TYPO_FIELDS)) if (Object.prototype.hasOwnProperty.call(card, typo)) issues.push(`FIELD TYPO "${typo}" should be "${correct}": ${loc}`);
    if (card.skills) card.skills.forEach((skill, i) => { if (!skill.name) issues.push(`MISSING skill[${i}].name: ${loc}`); });
}
function processDirectory(dir, allCards, seenNumbers, issues) {
    for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) processDirectory(fullPath, allCards, seenNumbers, issues);
        else if (file.endsWith('.json') && file !== 'all_cards.json') {
            let cards;
            try { cards = JSON.parse(fs.readFileSync(fullPath, 'utf-8')); } catch (e) { issues.push(`PARSE ERROR in ${file}: ${e.message}`); continue; }
            if (!Array.isArray(cards)) { issues.push(`NOT AN ARRAY: ${file}`); continue; }
            const setName = path.basename(file, '.json');
            for (const card of cards) {
                if (validateOnly) validateCard(card, file, issues);
                if (card.cardNumber) { if (seenNumbers.has(card.cardNumber)) issues.push(`DUPLICATE cardNumber "${card.cardNumber}" in ${file}`); else seenNumbers.add(card.cardNumber); }
                card.setName = setName; card.searchString = generateSearchString(card); allCards.push(card);
            }
        }
    }
}
const allCards=[], seen=new Set(), issues=[];
processDirectory(setsDir, allCards, seen, issues);
console.log(issues.length? `ISSUES (${issues.length}):\n`+issues.map(i=>'  • '+i).join('\n') : '✓ No validation issues');
console.log('total source cards:', allCards.length);
