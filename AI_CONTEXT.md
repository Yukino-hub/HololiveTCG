# Hololive TCG — AI Agent Context Document

This document is written for AI agents (Claude, Gemini, etc.) to quickly understand the project domain, codebase structure, JSON data schema, game mechanics, and translation conventions. Read this before making any edits to card data or project files.

---

## Project Overview

This is a **fan-made card browser and deck builder** for the [Hololive Official Card Game](https://hololive-official-cardgame.com/), a physical trading card game published by Cover Corp featuring Hololive VTubers. The project is a static website hosted at **https://hololive-cardgame.dev/**.

- All card text in this project is in **English** (translated from Japanese originals).
- Translations are credited to **ogbajoj & yukino**.
- The site is not affiliated with Cover Corp or Hololive Production.
- There is no build step — all files are plain HTML, CSS, and JavaScript served statically.

---

## Repository Layout

```
HololiveTCG/
├── index.html          # Main card browser (search, filter, view cards)
├── deckbuilder.html    # Deck building interface
├── tournaments.html    # Tournament information page
├── scripts.js          # Card display logic for index.html
├── deckbuilder.js      # Deck building logic
├── utils.js            # Shared data loading & utilities (loads all JSON sets)
├── navbar.js           # Shared navigation bar component
├── tournaments.js      # Tournament page logic
├── styles.css          # Main stylesheet
├── deckbuilder.css     # Deck builder stylesheet
├── tournament.css      # Tournament page stylesheet
├── tournaments.json    # Tournament event data
├── README.md           # Short disclaimer / attribution
├── AI_CONTEXT.md       # This file
├── images/             # Card image assets (local overrides)
│   └── WGP25-26/       # World Grand Prix 2025–26 exclusive images
├── tournaments/        # Tournament image assets
├── UAT/                # User acceptance testing files
└── sets/               # All card JSON data
    ├── hBP/            # Booster Pack sets
    │   ├── hBP01.json  # Booster Pack 01
    │   ├── hBP02.json
    │   ├── ...
    │   └── hBP07.json  # Booster Pack 07 (latest as of writing)
    ├── hSD/            # Starter Deck sets
    │   ├── hSD01.json
    │   ├── ...
    │   └── hSD13.json
    ├── hPR.json        # Promo cards
    ├── hY01.json       # Special / collaboration set
    └── hY.json         # Special / collaboration set
```

**Set naming convention:** `h` prefix + product type code + zero-padded number.
- `hBP` = Booster Pack
- `hSD` = Starter Deck
- `hPR` = Promo
- `hY` = Cheer cards (エールカード sets)

**Card number format:** `{setCode}-{3-digit number}` — e.g., `hBP01-014`, `hSD03-002`.

**Image source:** Card images are fetched from the official Hololive CDN at:
`https://hololive-official-cardgame.com/wp-content/images/cardlist/{setCode}/{cardNumber}_{rarity}.png`

---

## Card JSON Schema

Each set file is a **JSON array of card objects**. There are two top-level card categories: **Holomem** (character cards) and **Support** (spell/item/event cards), plus a special **Oshi** (leader) subtype of Holomem.

### Common Fields (all cards)

| Field | Type | Description |
|-------|------|-------------|
| `cardNumber` | string | Unique card ID, format `hBP01-001`. Primary key. |
| `name` | string | Card name in English (character or item name). |
| `rarity` | string | Card rarity. See rarity table below. |
| `limited` | boolean | If `true`, only 1 LIMITED card total may be played per turn (regardless of card name). Also cannot be played on the first player's first turn. |
| `buzz` | boolean | If `true`, this is a Buzz-type Holomem. When a Buzz Holomem is downed, its controller loses 2 Life instead of the normal 1. |
| `hasAlternativeArt` | boolean | An alternate art print exists. |
| `hasFullArt` | boolean | A full-art print exists. |
| `hasSigned` | boolean | A signed/signature edition print exists. |
| `hasGrandPrix` | boolean | A World Grand Prix exclusive print exists. |
| `hasHolomenRare` | boolean | A Holomen Rare print exists. |
| `hasFoils` | boolean | A foil print exists. |
| `imageSet` | string | If present, fetch the card image from this set folder instead of the card's own set (used when a reprint appears in a later set). E.g., `"imageSet": "hBP05"`. |
| `manualUrl` | string | Full URL override for the card image, bypassing the CDN pattern entirely. |
| `source` | string | Human-readable note about where a special card came from (e.g., `"Top 4 WGP2025"`, `"Birthday merch"`). |

### Rarity Values

| Value | Name |
|-------|------|
| `C` | Common |
| `U` | Uncommon |
| `R` | Rare |
| `RR` | Double Rare |
| `OSR` | Oshi Rare (leader cards) |
| `HR` | Holo Rare |
| `SY` | Cheers card |
| `P` | Promo |

---

### Oshi (Leader) Cards

Oshi cards are the leader of a player's deck. They sit face-up in the Oshi zone and are never directly attacked. They have `lives` and `color` instead of `hp` and `bloomLevel`.

| Field | Type | Description |
|-------|------|-------------|
| `lives` | number | Number of Life cards protecting the Oshi (typically 5 or 6). |
| `color` | string | The Oshi's color identity. See color values below. |
| `oshiSkill` | object | The standard Oshi Skill. See skill object structure below. |
| `spOshiSkill` | object | The Special (SP) Oshi Skill, usable once per game. |
| `oshiStageSkill` | string | A passive ability active while this Oshi is in play (introduced in hBP07). Format: `"Skill Name : Effect text."` |

**Oshi Skill object structure:**
```json
{
  "name": "ぎゅっきゅっ",
  "power": 3,
  "description": "[Once per turn] Set the opponent's center holomem's remaining HP to 50."
}
```
- `name`: Japanese skill name (leave in Japanese — not translated).
- `power`: Oshi Point cost to activate this skill.
- `description`: Translated English effect text.

**Full Oshi card example:**
```json
{
  "cardNumber": "hBP01-001",
  "name": "Amane Kanata",
  "rarity": "OSR",
  "lives": 5,
  "color": "White",
  "oshiSkill": {
    "name": "ぎゅっきゅっ",
    "power": 3,
    "description": "[Once per turn] Set the opponent's center holomem's remaining HP to 50."
  },
  "spOshiSkill": {
    "name": "握りつぶしちゃうと",
    "power": 2,
    "description": "[Once per game] During this turn, 1 of your holomem gets Arts+50. Then, if that holomem's color is white, it gets Arts+50."
  },
  "hasAlternativeArt": true
}
```

---

### Holomem Cards

Holomem are the main character cards placed on the Stage. They have HP, attack skills, and optional triggered effects.

| Field | Type | Description |
|-------|------|-------------|
| `bloomLevel` | string | Evolution level: `Spot`, `Debut`, `1st`, or `2nd`. |
| `hp` | number | Maximum HP of this Holomem. |
| `color` | string | Color identity. See color values below. |
| `tag` | string | Space-separated hashtag attributes (e.g., `"#JP #Gen4 #Singing"`). Used for card synergies. |
| `skills` | array | Array of Arts (attacks). See skill array structure below. |
| `bloomEffect` | string | Triggered effect that resolves when this card Blooms (evolves) onto another Holomem. Format: `"Japanese Name : Translated effect text."` |
| `collabEffect` | string | Triggered effect when this Holomem moves to the Collab position. Format: `"Japanese Name : Translated effect text."` |
| `giftEffect` | string | A special passive bonus effect this Holomem provides. |
| `extraEffect` | string | Additional rules text that applies while this card is in the deck or in play (e.g., "You may include any number of this holomem in the deck."). |

**Skills array structure:**
```json
"skills": [
  {
    "name": "+漆黒の翼+",
    "dmg": "100",
    "description": "If your opponent's holomem is downed by this Arts, and the dealt Damage was greater than the remaining HP by 50 or more, your opponent gets Life-1."
  }
]
```
- `name`: Japanese Arts name (leave in Japanese — not translated).
- `dmg`: Damage value as a string or number (both are valid in existing data). Use strings for consistency.
- `description`: Translated English additional effect text. Omit this field entirely if the Arts has no extra effect.

**Full Holomem card examples:**

Debut Holomem (no effects):
```json
{
  "cardNumber": "hBP01-009",
  "name": "Amane Kanata",
  "rarity": "C",
  "bloomLevel": "Debut",
  "hp": 90,
  "color": "White",
  "tag": "#JP #Gen4 #Singing",
  "skills": [
    {
      "name": "こんかなた〜",
      "dmg": "40",
      "description": "This Arts can only target the opponent's center holomem."
    }
  ],
  "extraEffect": "You may include any number of this holomem in the deck."
}
```

1st Bloom Holomem (with bloomEffect):
```json
{
  "cardNumber": "hBP01-012",
  "name": "Amane Kanata",
  "rarity": "U",
  "bloomLevel": "1st",
  "hp": 120,
  "color": "White",
  "tag": "#JP #Gen4 #Singing",
  "bloomEffect": "アイドルかなたそを : You may roll a die once:If it is 3 or less, reveal 1 mascot from your deck, and attach it to your holomem. Then, shuffle the deck.",
  "skills": [
    {
      "name": "い~っぱい応援して!",
      "dmg": "40"
    }
  ]
}
```

2nd Bloom Holomem (with collabEffect):
```json
{
  "cardNumber": "hBP01-014",
  "name": "Amane Kanata",
  "rarity": "RR",
  "bloomLevel": "2nd",
  "hp": 200,
  "color": "White",
  "tag": "#JP #Gen4 #Singing",
  "collabEffect": "堕ちた天使 : Deal 50 Special Damage to your opponent's center holomem.",
  "skills": [
    {
      "name": "+漆黒の翼+",
      "dmg": "100",
      "description": "If your opponent's holomem is downed by this Arts, and the dealt Damage was greater than the remaining HP by 50 or more, your opponent gets Life-1.."
    }
  ],
  "hasAlternativeArt": true
}
```

---

### Support Cards

Support cards are played from hand during the Main Step. They have a `type` and `ability` instead of bloom/skill fields.

**Support subtypes and behavior:**
- **Item, Event, Staff** — one-shot: resolve the effect, then archive the card.
- **Tool, Mascot** — attach to a Holomem on Stage. Remain attached while active. Maximum 1 Tool and 1 Mascot per Holomem.
- **Fan** — attach to a Holomem. No limit on number of Fans per Holomem.

Attached cards (Tool/Mascot/Fan) go to the Archive when the Holomem they are on is downed.

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Support subtype. One of: `"Support (Item)"`, `"Support (Event)"`, `"Support (Staff)"`, `"Support (Tool)"`, `"Support (Mascot)"`, `"Support (Fan)"`. |
| `ability` | string | Full translated English text of the card's effect. |

**Full Support card example:**
```json
{
  "cardNumber": "hBP01-102",
  "name": "Idol Microphone",
  "type": "Support (Item)",
  "rarity": "U",
  "limited": true,
  "ability": "This card can only be used if you have 6 or less cards in hand excluding this card. Look at the top 4 cards of your deck. Reveal any number of holomem with #Singing from among them, and add the revealed holomem to hand. Then, return the remaining cards to the bottom of the deck in any order."
}
```

---

### Color Values

| Value | Notes |
|-------|-------|
| `White` | |
| `Green` | |
| `Red` | |
| `Blue` | |
| `Purple` | |
| `Yellow` | |
| `Colorless` | No color; when used as an Arts cost it means "any 1 Cheer of any color." |
| `Red/Blue` | Multi-color card — counts as both Red and Blue. |
| `White & Green` | Multi-color card — counts as both White and Green. |

---

## Game Mechanics Glossary

These terms appear frequently in translated card effect text. Use them consistently.

| Term | Definition |
|------|-----------|
| **Oshi** | The leader card placed face-up in the Oshi position. Never attacked directly; protected by Life cards. Activates Oshi Skills by archiving Holo Power. |
| **Holomem** | A character card placed on the Stage (playing field). |
| **Bloom** | Evolving a Holomem by placing a card of the same name and a higher Bloom level on top of it. Triggers the new card's `bloomEffect`. All attached Cheers, Support cards, stacked cards, damage, and status (rested/active) carry over. Cannot Bloom on either player's first turn, on the same turn a Holomem was placed, or if the Bloom target's HP is lower than the accumulated damage. Each Holomem can only Bloom once per turn. |
| **Collab** | A Main Step action that moves an active (un-rested) Back Holomem to the Collab position. When Collab is performed, the top card of the deck is placed face-down in the Holo Power area. Can only be done once per turn. Triggers the moving card's `collabEffect`. |
| **Arts** | An attack on a Holomem card used during the Performance Step. Requires Cheers attached to the using Holomem that match the cost icons (Cheers are NOT archived when Arts is used). Deals `dmg` base damage. |
| **Special Attack (特攻)** | A bonus damage icon on an Arts card. If the target Holomem's color matches the Special Attack icon, that bonus amount is added to the Arts damage. Written as e.g. `+50 vs blue`. |
| **Cheer** | The energy resource. Cheers come from the 20-card Cheer Deck and are sent (attached) to Holomem once per turn during the Cheer Step. Attached Cheers are used to pay Arts costs and Oshi Skill costs. Cheers have colors. |
| **Cheer Deck** | A separate 20-card deck consisting entirely of Cheer cards. Not the same as the main deck. Any number of same-numbered Cheer cards are allowed. |
| **Stage** | The playing field where Holomem are placed. Has a maximum of 6 Holomem (not counting the Oshi). Consists of Center, Collab, and Back positions. |
| **Center position** | The active frontline slot. The Center Holomem can use Arts and can be targeted by opponent's Arts. |
| **Back position** | Supporting slots behind the center. Up to 5 Holomem can be in back positions (combined with center/collab = 6 max). Cannot be directly targeted by Arts. |
| **Collab position** | The slot next to the center, occupied during a Collab action. The Collab Holomem can also use Arts. At the start of each turn (Reset Step), the Collab Holomem moves back to a Back position (rested). |
| **Rested (お休み)** | A Holomem placed sideways (tapped). Rested Holomem cannot use Arts, Collab, or Baton Touch, but can still Bloom and be moved by card effects. All Holomem are woken up (set active) during the Reset Step. |
| **Lives** | The Oshi's durability. Each Life card absorbs one lethal hit. When all Lives are gone, that player loses. |
| **Life** | A single Life card placed face-down from the Cheer Deck at game start. When a Holomem is downed, the owner loses 1 Life — that Life card is revealed and the Cheer shown is sent to any Holomem. |
| **Holo Power** | A face-down card zone accumulating cards from the top of the deck. Cards are added to Holo Power each time a Collab is performed. Oshi Skills are paid for by archiving Holo Power cards (most recently added first). |
| **Oshi Skill** | An activated ability on the Oshi card. Paid by archiving Holo Power cards equal to the `power` cost value. Can be used once per turn by default (or as specified). |
| **SP Oshi Skill** | The Special Oshi Skill on the Oshi card. Same cost mechanic as Oshi Skill but can only be used once per game. |
| **Oshi Stage Skill** | A passive ability (`oshiStageSkill`) that is always active while the Oshi is in play (no activation cost). Introduced in hBP07. |
| **Baton Touch** | A Main Step action that swaps the Center Holomem with a Back Holomem. Cost is archiving Cheers attached to the Center Holomem (as specified by the `baton touch` cost on the card). Both the Center and the chosen Back Holomem must be active (un-rested). Only usable once per turn (outside of card effects). |
| **Down / Downed** | A Holomem whose accumulated damage equals or exceeds its HP is downed. The downed Holomem (and all cards stacked on it, plus all attached cards) moves to the Archive. Its controller loses 1 Life (or 2 for Buzz Holomem). |
| **Archive** | The discard pile. Used-up Support cards (Item/Event/Staff) go here after use. Downed Holomem and their attached cards go here. Also a cost: "archive" a card or Cheer means discard it. |
| **Special Damage** | Damage dealt directly to any Holomem (including Back Holomem), bypassing the normal rule that Arts only targets Center or Collab Holomem. |
| **Buzz** | A special Holomem subtype. Indicated by `"buzz": true` in JSON. When a Buzz Holomem is downed, its controller loses 2 Life instead of the normal 1. |
| **Spot** | A special Bloom level. Spot Holomem cannot Bloom onto or be Bloomed by any other Holomem. Can be played to the Back position from hand like a Debut Holomem. |
| **Limited** | A card marked `"limited": true`. Only 1 LIMITED card (of any name) may be played per turn. Also cannot be played on the first player's first turn. |
| **Tags** | Hashtag attributes on Holomem (e.g., `#JP`, `#Gen4`, `#Singing`, `#Promise`, `#HoloX`). Tags have no inherent rules meaning but are referenced by many card effects. |
| **Arts+N** | Increase the damage of an Arts by N for that use. E.g., `Arts+50`. |
| **Life-N** | Reduce the specified player's Life count by N. E.g., `Life-1`. |
| **HP-N / HP Reduction** | Reduce remaining HP by N (does not deal damage; does not trigger damage-based effects). |
| **Reattach** | Move a Cheer from one Holomem to another without going through the Cheer Deck. |
| **Recover / Restore HP** | Reduce accumulated damage on a Holomem by the specified amount (HP cannot exceed its printed maximum). |

---

## Deck Construction Rules

| Component | Rule |
|-----------|------|
| Oshi | Exactly 1 Oshi Holomem card (not counted in the 50-card main deck). |
| Main deck | Exactly 50 cards. Only Holomem and Support cards (no Cheer or Oshi). Max 4 copies per card number. Exception: cards with `extraEffect: "You may include any number of this holomem in the deck."` |
| Cheer deck | Exactly 20 Cheer cards. Any number of the same card number is allowed. |
| Starting lives | Set at game start: top N cards of the Cheer deck go to the Life area face-down (N = Oshi's `lives` value). |

---

## Turn Structure

Each turn proceeds through these steps in order. **The first player skips the Performance Step on their very first turn.** Both players skip the Reset Step on their respective first turns.

| Step | What happens |
|------|-------------|
| **Reset Step** | (1) Wake up (un-rest) all your Holomem. (2) Move your Collab Holomem back to a Back position and rest it. (3) If you have no Center Holomem, move one from Back to Center. |
| **Hand Step** | Draw 1 card from your deck. If your deck is empty, you lose. |
| **Cheer Step** | Reveal the top card of your Cheer deck and send it to any of your Holomem. (If Cheer deck is empty, skip; you do not lose.) |
| **Main Step** | In any order, any number of times: play Debut/Spot Holomem to Back, Bloom a Holomem, Collab a Back Holomem (once per turn), use an Oshi Skill or SP Oshi Skill, play Support cards, perform Baton Touch (once per turn). |
| **Performance Step** | Use Arts with your Center Holomem and/or Collab Holomem in any order. Each un-rested Holomem may use 1 Arts per turn. Arts targets opponent's Center or Collab Holomem (unless Special Damage). |
| **End Step** | "This turn" effects expire. If you have no Center Holomem, move one from Back. Then opponent's turn begins. |

**Bloom rules summary:** Same name required, Bloom level must go up (Debut→1st→2nd; same level is also allowed for 1st→1st or 2nd→2nd); cannot Bloom on first turn, on the turn the Holomem was placed, or to a card whose HP ≤ current accumulated damage; once per Holomem per turn.

---

## Win Conditions

A player wins when their opponent meets any of these conditions:
1. **Life reaches 0** — opponent has no Life cards remaining.
2. **Deck out** — opponent cannot draw during their Hand Step because their deck is empty.
3. **No Holomem on Stage** — opponent has no Holomem on the Stage (the Oshi in the Oshi position does not count).

---

## Translation Conventions

Follow these rules when writing or editing the English `description`, `ability`, `bloomEffect`, `collabEffect`, `giftEffect`, and `extraEffect` fields.

### Skill and Ability Names
- `skills[].name`, `oshiSkill.name`, `spOshiSkill.name` — **leave in Japanese**. Do not translate.
- `bloomEffect` and `collabEffect` format: `"Japanese Name : English effect text."` — the Japanese name before the colon is kept; only the text after the colon is translated.

### Timing / Frequency Keywords
Wrap timing constraints in square brackets at the **start** of the description:
- `[Once per turn]` — can only be activated once per turn.
- `[Once per game]` — can only be activated once for the entire game.
- `[1/Turn]` — shorthand for once per turn (used in some `oshiStageSkill` entries).

### Damage and Stat Notation
- Attack damage buffs: `Arts+50` (no spaces around the `+`).
- Damage penalties: `-50 Damage` (with a space before Damage).
- Life reduction: `Life-1` (no spaces).
- HP set/reduce effects: `remaining HP to 50` or `HP-50`.

### Targeting Language
Use this exact phrasing consistently:
- `your center holomem` / `your opponent's center holomem`
- `your back holomem` / `your opponent's back holomem`
- `your collab holomem` / `your opponent's collab holomem`
- `1 of your holomem` / `1 of your opponent's holomem`
- `your [center holomem and collab holomem]` — square brackets when grouping multiple positions.

### Tag References
Reference tags with a `#` prefix: `your holomem with #Singing`, `holomem with #Promise`.

### Card References
Named card references use angle brackets: `<Tsunomaki Watame>`, `<Akai Haato>`.

### Cheer Effects
- Attaching: `attach N Cheer(s) to...` or `send N cheers from your cheer deck to...`
- Archiving a Cheer as a cost: `You may archive 1 [green cheer or blue cheer] from this holomem:`
- Reattaching: `reattach 1 cheer from this holomem to your other holomem with #Promise`

### Deck Manipulation
- Looking at top cards: `Look at the top N cards of your deck.`
- Revealing and taking: `Reveal 1 [Debut holomem or 1st holomem] from your deck, and add it to hand. Then, shuffle the deck.`
- Placing on Stage directly: `reveal 1 Debut holomem from your deck, and place it on Stage. Then, shuffle the deck.`
- Bottom of deck: `return the remaining cards to the bottom of the deck in any order.`

### Conditional Effects
Use a colon (`:`) to separate the condition from the result (no space before colon):
- `You may archive 1 card from your hand:Reveal 1 1st holomem other than Buzz from your deck, and add it to hand.`
- `Usable if your holomem is downed during the opponent's turn:Reattach all green cheers...`

### Bloom Level References
- `Debut holomem`, `1st holomem`, `2nd holomem`, `Spot holomem` — lowercase "holomem", capitalized level name.
- `other than Buzz` — when excluding Buzz cards from a search effect.

---

## How to Add or Update Cards

1. Identify the correct set file (e.g., `sets/hBP/hBP07.json` for Booster Pack 07).
2. Each file is a flat JSON array — append the new card object to the end of the array.
3. Use the correct `cardNumber` format matching the set: `hBP07-###`.
4. For Holomem cards: populate `bloomLevel`, `hp`, `color`, `tag`, `skills`, and any applicable effect fields.
5. For Oshi cards: populate `lives`, `color`, `oshiSkill`, and `spOshiSkill`.
6. For Support cards: populate `type` and `ability`.
7. Write all effect text in English following the translation conventions above.
8. Leave all skill `name` fields (and the prefix before `:` in bloomEffect/collabEffect) in Japanese.
9. Add boolean variant flags (`hasAlternativeArt`, `hasFullArt`, etc.) only if those variants actually exist for the card.
10. Only add `imageSet` if the card image lives in a different set's folder on the CDN.
11. Only add `manualUrl` if the card uses a completely custom image URL not following the CDN pattern.

### Validation Checklist
- JSON is valid (no trailing commas, balanced brackets).
- `cardNumber` is unique across all sets.
- `color` and `bloomLevel` use exact values from the schema tables above.
- Effect text follows the translation conventions (bracket keywords, colon separators, consistent targeting language).
- Open `index.html` in a browser and search for the card by name to confirm it loads correctly.
- Check the browser console for JSON parse errors.
