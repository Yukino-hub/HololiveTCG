document.addEventListener('DOMContentLoaded', function() {
    const decks = [
        {
            name: 'Winner Deck',
            imageUrl: 'https://hololive-cardgame.dev/images/decks/deck1.png'
        }
    ];

    const decksContainer = document.getElementById('decksContainer');
    decks.forEach(deck => {
        const deckElement = document.createElement('div');
        deckElement.classList.add('tournament-deck');
        deckElement.innerHTML = `
            <h3>${deck.name}</h3>
            <img src="${deck.imageUrl}" alt="${deck.name}" class="deck-image">
        `;
        decksContainer.appendChild(deckElement);
    });
});