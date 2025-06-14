/**
 * qa-scripts.js
 * * This script fetches Q&A data from a JSON file and dynamically populates
 * the Q&A page. It also includes a search function to filter the results
 * based on user input.
 */
document.addEventListener('DOMContentLoaded', function() {
    const qaContainer = document.getElementById('qa-content');
    const loadingIndicator = document.getElementById('loading-indicator');
    const searchInput = document.getElementById('qaSearch');
    const noResultsMessage = document.getElementById('no-results');

    // This will store the complete list of Q&A items once fetched.
    let allQAData = [];

    /**
     * Fetches the Q&A data from the qa.json file.
     */
    function loadQAData() {
        loadingIndicator.style.display = 'block';

        fetch('qa.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                allQAData = data;
                displayQA(allQAData); // Display all Q&A initially
                loadingIndicator.style.display = 'none';
            })
            .catch(error => {
                console.error('Failed to load Q&A data:', error);
                qaContainer.innerHTML = '<p style="color: red; text-align: center;">Failed to load Q&A. Please try again later.</p>';
                loadingIndicator.style.display = 'none';
            });
    }

    /**
     * Filters the Q&A data based on the search input.
     */
    function filterQA() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        const filteredData = allQAData.filter(item => {
            // Check if search term is in the question
            if (item.question.toLowerCase().includes(searchTerm)) {
                return true;
            }
            // Check if search term is in the answer
            if (item.answer.toLowerCase().includes(searchTerm)) {
                return true;
            }
            // Check if search term matches any of the related cards
            if (item.relatedCards && item.relatedCards.some(card => card.toLowerCase().includes(searchTerm))) {
                return true;
            }
            return false;
        });

        displayQA(filteredData);
    }

    /**
     * Renders the Q&A data into HTML elements and appends them to the page.
     * @param {Array<Object>} qaData - An array of Q&A objects to display.
     */
    function displayQA(qaData) {
        qaContainer.innerHTML = ''; 

        // Show or hide the "no results" message
        if (qaData.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }

        qaData.forEach(item => {
            const qaItemElement = document.createElement('div');
            qaItemElement.classList.add('qa-item');

            // --- Build Related Cards HTML ---
            let relatedCardsHTML = '';
            if (item.relatedCards && item.relatedCards.length > 0) {
                relatedCardsHTML = `
                    <div class="related-cards">
                        <strong>Related Cards:</strong>
                        <span>${item.relatedCards.join(', ')}</span>
                    </div>
                `;
            }
            
            // --- Build Date/ID HTML ---
            let dateHTML = '';
            if (item.id && item.date) {
                const idText = item.id.toUpperCase();
                dateHTML = `<p class="qa-date">${idText} (${item.date})</p>`;
            } else if (item.id) {
                 dateHTML = `<p class="qa-date">${item.id.toUpperCase()}</p>`;
            }

            // --- Construct the final HTML for the Q&A item ---
            qaItemElement.innerHTML = `
                ${dateHTML}
                <p class="qa-question">Q: ${item.question}</p>
                <div class="qa-answer">
                    <p>A: ${item.answer}</p>
                    ${relatedCardsHTML}
                </div>
            `;
            
            qaContainer.appendChild(qaItemElement);
        });
    }

    // --- Event Listeners ---
    // Filter the Q&A list whenever the user types in the search box.
    searchInput.addEventListener('input', filterQA);

    // Initial call to load the Q&A data when the page loads.
    loadQAData();
});
