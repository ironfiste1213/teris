const urlparams = new URLSearchParams(window.location.search);
const finalScore = urlparams.get('score') || '0';
const finalTime = urlparams.get('time') || '0';
const scoreContainer = document.getElementById('score-container');
const form = document.getElementById('score-form');
const button = document.getElementById('submit-button');
const Errormessage = document.getElementById('error-message');
const submissionArea = document.getElementById('submission-area');
const scoreboardBody = document.querySelector('#scoreboard-table tbody');

scoreContainer.textContent = `SCORE: ${finalScore}`;

/**
 * Fetches scores from the server and displays them.
 */
async function fetchAndDisplayScores() {
    try {
        const res = await fetch('/api/scores');
        if (!res.ok) throw new Error('Could not load leaderboard.');
        const scores = await res.json();
        displayScores(scores);
    } catch (error) {
        console.error(error);
        scoreboardBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">${error.message}</td></tr>`;
    }
}


function displayScores(scores) {
    scoreboardBody.innerHTML = ''; // Clear existing scores
    scores.forEach(score => {
        const row = scoreboardBody.insertRow();
        row.innerHTML = `<td>${score.Rank || score.rank}</td><td>${score.Name || score.name}</td><td>${score.Score || score.score}</td><td>${score.Time || score.time}</td>`;
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
        const res = await fetch('/api/scores',
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scoreEntry) }
        )
        if (!res.ok) {
            await res.text().then(text => { throw new Error(text) });
        } else {
            const data = await res.json();
            Errormessage.textContent = `SAVED! YOUR RANK IS ${data.rank} OUT OF ${data.total}.`;
            displayScores(data.Scores);
            submissionArea.remove();

        }

    } catch (error) {
        Errormessage.textContent = error.message;
        button.disabled = false;
        button.textContent = 'SAVE SCORE';
    }
});

// Fetch and display scores when the page loads
fetchAndDisplayScores();