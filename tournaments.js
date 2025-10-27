document.addEventListener('DOMContentLoaded', function() {
    const tournamentsContainer = document.getElementById('tournamentsContainer');

    function loadTournamentData() {
        fetch('tournaments.json')
            .then(response => response.json())
            .then(data => {
                displayTournaments(data);
            })
            .catch(error => {
                console.error('Failed to load tournament data:', error);
            });
    }

    function displayTournaments(tournaments) {
        tournaments.forEach(tournament => {
            const tournamentElement = document.createElement('div');
            tournamentElement.classList.add('tournament');

            const decklistHtml = tournament.decklist.map(card => {
                return `<li>${card.quantity}x ${card.cardName}</li>`;
            }).join('');

            tournamentElement.innerHTML = `
                <h3>${tournament.tournamentName}</h3>
                <p><strong>Date:</strong> ${tournament.date}</p>
                <p><strong>Winner:</strong> ${tournament.winner}</p>
                <h4>Decklist:</h4>
                <ul>
                    ${decklistHtml}
                </ul>
            `;
            tournamentsContainer.appendChild(tournamentElement);
        });
    }

    loadTournamentData();
});
