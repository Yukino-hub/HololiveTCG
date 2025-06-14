/**
 * qa-scripts.js
 * * This script fetches Q&A data from a JSON file and dynamically populates
 * the Q&A page. This makes it easy to update questions and answers
 * without editing the HTML file directly.
 */
document.addEventListener('DOMContentLoaded', function() {
    const qaContainer = document.getElementById('qa-content');
    const loadingIndicator = document.getElementById('loading-indicator');

    /**
     * Fetches the Q&A data from the qa.json file.
     */
    function loadQAData() {
        // Show the loading indicator while we fetch data
        loadingIndicator.style.display = 'block';

        fetch('qa.json')
            .then(response => {
                // Check if the request was successful
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                // Parse the JSON data from the response
                return response.json();
            })
            .then(data => {
                // Once data is loaded, display it and hide the loading indicator
                displayQA(data);
                loadingIndicator.style.display = 'none';
            })
            .catch(error => {
                // If there's an error, log it and show an error message on the page
                console.error('Failed to load Q&A data:', error);
                qaContainer.innerHTML = '<p style="color: red; text-align: center;">Failed to load Q&A. Please try again later.</p>';
                loadingIndicator.style.display = 'none';
            });
    }

    /**
     * Renders the Q&A data into HTML elements and appends them to the page.
     * @param {Array<Object>} qaData - An array of Q&A objects.
     */
    function displayQA(qaData) {
        // Clear any previous content
        qaContainer.innerHTML = ''; 

        // Loop through each Q&A item in the data
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
                dateHTML = `<p class="qa-date">${item.id.toUpperCase()} (${item.date})</p>`;
            } else if (item.id && !item.date) {
                 // For general FAQs without a date
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
            
            // Add the newly created element to the container
            qaContainer.appendChild(qaItemElement);
        });
    }

    // Initial call to load the Q&A data when the page loads
    loadQAData();
});
