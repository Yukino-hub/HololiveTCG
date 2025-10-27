document.addEventListener('DOMContentLoaded', function() {
    const tournaments = [
        { id: 1, name: 'Tournament 1' }
    ];

    const tournamentsList = document.getElementById('tournamentsList');
    tournaments.forEach(tournament => {
        const tournamentElement = document.createElement('div');
        tournamentElement.innerHTML = `<a href="tournaments/tournament-${tournament.id}.html">${tournament.name}</a>`;
        tournamentsList.appendChild(tournamentElement);
    });
});