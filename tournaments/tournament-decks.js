document.addEventListener('DOMContentLoaded', function() {
    const tournamentId = document.body.dataset.tournamentId;
    if (tournamentId) {
        fetch(`tournament-${tournamentId}.json`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('tournamentName').textContent = data.tournamentName;
                const tableBody = document.querySelector('#decksTable tbody');
                const container = document.querySelector('.container');

                data.topDecks.forEach(deck => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${deck.rank}</td>
                        <td>${deck.playerName}</td>
                        <td>${deck.buildName}</td>
                        <td>${deck.oshiCard}</td>
                        <td><a href="${deck.deckUrl}" target="_blank">View Deck</a></td>
                    `;
                    tableBody.appendChild(row);

                    if (deck.imageUrl) {
                        const deckImageSection = document.createElement('div');
                        deckImageSection.classList.add('tournament-deck');

                        const rankHeader = document.createElement('h3');
                        rankHeader.textContent = `${getRankText(deck.rank)} Place Decklist`;
                        deckImageSection.appendChild(rankHeader);

                        const deckImage = document.createElement('img');
                        deckImage.src = deck.imageUrl;
                        deckImage.alt = `${deck.playerName}'s Decklist`;
                        deckImage.classList.add('deck-image');
                        deckImageSection.appendChild(deckImage);

                        container.appendChild(deckImageSection);
                    }
                });
            })
            .catch(error => console.error('Error fetching tournament data:', error));
    }
});

function getRankText(rank) {
    // Handle numeric ranks with suffixes, and return strings as-is.
    if (typeof rank === 'number') {
        if (rank === 1) return '1st';
        if (rank === 2) return '2nd';
        if (rank === 3) return '3rd';
        return `${rank}th`;
    }
    return rank;
}
