document.addEventListener('DOMContentLoaded', function() {
    const tournamentId = document.body.dataset.tournamentId;
    if (tournamentId) {
        fetch(`tournament-${tournamentId}.json`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('tournamentName').textContent = data.tournamentName;
                const decksContainer = document.getElementById('decksContainer');
                data.topDecks.forEach(deck => {
                    const deckElement = document.createElement('div');
                    deckElement.classList.add('deck');
                    deckElement.innerHTML = `
                        <h3>${deck.rank}</h3>
                        <p>Player: ${deck.playerName}</p>
                        <a href="${deck.deckUrl}" target="_blank">View Deck</a>
                    `;
                    decksContainer.appendChild(deckElement);
                });
            })
            .catch(error => console.error('Error fetching tournament data:', error));
    }
});