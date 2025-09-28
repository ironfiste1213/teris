const urlparams = new URLSearchParams(window.location.search);
const finalScore = urlparams.get('score') || '0';
const finalTime = urlparams.get('time') || '0';
const form = document.getElementById('score-form');
const button = document.getElementById('submit-button');



form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name-input').trim();
    if (name === '') {
        document.getElementById('error-message').textContent = 'Name cannot be empty.';
        return;
    } else if (name.length > 15) {
        document.getElementById('error-message').textContent = 'Name cannot exceed 15 characters.';
        return;
    }

    document.getElementById('error-message').textContent = '';

    const scoreEntry = {
        name: name,
        score: parseInt(finalScore, 10),
        time: finalTime
    };

    button.disabled = true;
    button.textContent = 'SAVING...';

    try {
      const  res = await fetch('/api/scores',
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scoreEntry) }
        )
        if (!res.ok) {
            await res.text().then(text => { throw new Error(text) });
        }
        button.textContent = 'SAVED!';
    } catch (error) {
        document.getElementById('error-message').textContent = error.message;
        button.disabled = false;
        button.textContent = 'SAVE SCORE';
    }
});