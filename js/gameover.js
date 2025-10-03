let finalScore = '0';
let finalTime = '00:00';
const scoreContainer = document.getElementById('score-container');
const form = document.getElementById('score-form');
const button = document.getElementById('submit-button');
const Errormessage = document.getElementById('error-message');
const submissionArea = document.getElementById('submission-area');
const scoreboardBody = document.querySelector('#scoreboard-table tbody');
const paginationControls = document.getElementById('pagination-controls');
let allScores = [];
let currentPage = 1;
const scoresPerPage = 5;

/**
 * Fetches scores from the server and displays them.
 */
async function fetchAndDisplayScores() {
    try {
        const res = await fetch('/api/score'); // <-- FIXED
        if (!res.ok) throw new Error('Could not load leaderboard.');
        const scores = await res.json();
        allScores = scores;
        currentPage = 1;
        updateLeaderboardView();
    } catch (error) {
        console.error(error);
        scoreboardBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">${error.message}</td></tr>`;
    }
}

function updateLeaderboardView() {
    displayScores();
    setupPagination();
}

function displayScores(scoresToDisplay = null) {
    const scores = scoresToDisplay || allScores;
    if (scoresToDisplay) {
        allScores = scores; // Update the main list if new data is provided
    }

    const startIndex = (currentPage - 1) * scoresPerPage;
    const endIndex = startIndex + scoresPerPage;
    const paginatedScores = allScores.slice(startIndex, endIndex);

    scoreboardBody.innerHTML = ''; // Clear existing scores
    if (allScores.length === 0) {
        paginationControls.innerHTML = ''; // Hide pagination if no scores
        scoreboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Be the first to set a score!</td></tr>';
        return;
    }

    paginatedScores.forEach(score => {
        const row = scoreboardBody.insertRow();
        row.innerHTML = `<td>${score.Rank || score.rank}</td><td>${score.Name || score.name}</td><td>${score.Score || score.score}</td><td>${score.Time || score.time}</td>`;
    });
}

function setupPagination() {
    const totalPages = Math.ceil(allScores.length / scoresPerPage);
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }

    paginationControls.innerHTML = `
        <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="next-page" ${currentPage < totalPages ? '' : 'disabled'}>&gt;</button>
    `;

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; updateLeaderboardView(); }
    });
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) { currentPage++; updateLeaderboardView(); }
    });
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name-input').trim();
    if (name === '') {
        Errormessage.textContent = 'Name cannot be empty.';
        return;
    } else if (name.length > 15) {
        Errormessage.textContent = 'Name cannot exceed 15 characters.';
        return;
    }

    Errormessage.textContent = '';

    const scoreEntry = {
        name: name,
        score: parseInt(finalScore, 10),
        time: finalTime
    };

    button.disabled = true;
    button.textContent = 'SAVING...';

    try {
        const res = await fetch('/api/score', // <-- FIXED
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scoreEntry) }
        )
        if (!res.ok) {
            await res.text().then(text => { throw new Error(text) });
        } else {
            const data = await res.json();
          //  Errormessage.textContent = `SAVED! YOUR RANK IS ${data.rank} OUT OF ${data.total}.`;
            allScores = data;
            currentPage = 1;
            updateLeaderboardView();
            submissionArea.remove();

        }

    } catch (error) {
        Errormessage.textContent = error.message;
        button.disabled = false;
        button.textContent = 'SAVE SCORE';
    }
});

async function initializePage() {
    scoreContainer.innerHTML = 'Loading...';
    try {
        // Fetch the player's final score and time from the temporary data endpoint
        const playerDataRes = await fetch('/api/playerdata');
        if (!playerDataRes.ok) {
            // This will happen on reload if the file is deleted.
            // Hide the form and show a generic message.
            submissionArea.remove();
            throw new Error(' Return to the main menu and show us what you can do!');
        }
        const playerData = await playerDataRes.json();
        finalScore = playerData.score || 0;
        finalTime = playerData.time || '00:00';
    } catch (error) {
        console.error(error);
        // If there's an error (like 404), we don't show the form, so just update the score display.
        scoreContainer.innerHTML = error.message;
    } finally {
        // Display the final score and time if fetched, otherwise the error message remains.
        if (finalScore !== '0') {
            scoreContainer.innerHTML = `SCORE: ${finalScore}<br>TIME: ${finalTime}`;
        }
        // Fetch and display the main leaderboard
        fetchAndDisplayScores();
    }
}

initializePage();