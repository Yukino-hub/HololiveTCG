document.addEventListener('DOMContentLoaded', function() {
    const tournamentId = document.body.dataset.tournamentId;
    if (tournamentId) {
        fetch(`tournament-${tournamentId}.json`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('tournamentName').textContent = data.tournamentName;
                const tableBody = document.querySelector('#decksTable tbody');
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
                });
            })
            .catch(error => console.error('Error fetching tournament data:', error));
    }
});