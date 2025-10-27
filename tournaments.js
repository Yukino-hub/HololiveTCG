document.addEventListener('DOMContentLoaded', function() {
    fetch('tournaments.json')
        .then(response => response.json())
        .then(data => {
            const tournamentsList = document.getElementById('tournamentsList');
            data.forEach(tournament => {
                const tournamentElement = document.createElement('div');
                tournamentElement.innerHTML = `<a href="${tournament.htmlUrl}">${tournament.name}</a>`;
                tournamentsList.appendChild(tournamentElement);
            });
        })
        .catch(error => console.error('Error fetching tournaments:', error));
});
