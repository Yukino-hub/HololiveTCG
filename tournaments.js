document.addEventListener('DOMContentLoaded', function() {
    fetch('tournaments.json')
        .then(response => response.json())
        .then(data => {
            const tournamentsTableBody = document.querySelector('#tournamentsTable tbody');
            data.forEach(tournament => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${tournament.image}" alt="${tournament.name}" class="tournament-image"></td>
                    <td><a href="${tournament.htmlUrl}">${tournament.name}</a></td>
                    <td>${tournament.location}</td>
                    <td>${tournament.date}</td>
                `;
                tournamentsTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching tournaments:', error));
});
