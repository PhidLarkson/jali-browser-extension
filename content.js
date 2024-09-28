chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    const selectedText = request.text;

    // Remove existing menu if present
    const existingMenu = document.getElementById('translateMenu');
    if (existingMenu) existingMenu.remove();

    // Create the translation menu
    const menu = document.createElement('div');
    menu.id = 'translateMenu';
    menu.className = 'translate-menu';
    menu.innerHTML = `
      <select id="languageDropdown" class="language-dropdown">
        <option value="tw">Twi</option>
        <option value="ee">Ewe</option>
        <option value="gaa">Ga</option>
        <option value="yo">Yoruba</option>
      </select>

      <div>
        <input type="checkbox" id="translateOnly" name="outputOption" value="translate">
        <label for="translateOnly">Translate</label>
        <input type="checkbox" id="audioOnly" name="outputOption" value="audio">
        <label for="audioOnly">Audio</label>
      </div><br>
      <button id="translateButton" class="translate-button">Translate</button>
      <div id="translationResult" class="translation-result" style="max-width:400px"></div><br>
      <audio id="translationAudio" controls style="display:none;"></audio>
    `;

    
    document.body.appendChild(menu);

    // Event listener for the submit button
    document.getElementById('translateButton').addEventListener('click', () => {
      const lang = document.getElementById('languageDropdown').value;
      const translateChecked = document.getElementById('translateOnly').checked;
      const audioChecked = document.getElementById('audioOnly').checked;

      const body = {
        "in": selectedText,
        "lang": `en-${lang}`
      };

      fetch('https://translation-api.ghananlp.org/v1/translate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': '9e262bab68f04e20aab7f5a9d0410c92'
        }
      })
      .then(response => response.ok ? response.json() : Promise.reject('Translation failed'))
      .then(data => {
        const translationResult = document.getElementById('translationResult');
        const translationAudio = document.getElementById('translationAudio');

        if (translateChecked) {
          translationResult.innerText = data;
        }

        if (audioChecked) {
          if (lang === 'tw') {
            const audioBody = {
              "text": data,
              "language": lang
            };

            fetch('https://translation-api.ghananlp.org/tts/v1/tts', {
              method: 'POST',
              body: JSON.stringify(audioBody),
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Ocp-Apim-Subscription-Key': '9e262bab68f04e20aab7f5a9d0410c92'
              }
            })
            .then(response => response.ok ? response.blob() : Promise.reject('Audio generation failed'))
            .then(blob => {
              const audioUrl = URL.createObjectURL(blob);
              translationAudio.src = audioUrl;
              translationAudio.style.display = 'block';
            })
            .catch(err => {
              translationResult.innerText = 'Audio generation failed';
              console.error(err);
            });
          } else {
            translationResult.innerText = 'Not available in that language';
          }
        }
      })
      .catch(err => {
        const translationResult = document.getElementById('translationResult');
        translationResult.innerText = 'Translation failed';
        console.error(err);
      });
    });
  }
});

// Remove the menu when the user clicks outside of it
document.addEventListener('click', (event) => {
  const translateMenu = document.getElementById('translateMenu');
  if (translateMenu && !translateMenu.contains(event.target)) {
    translateMenu.remove();
  }
});
const languageDropdown = document.getElementById('languageDropdown');
const translationResult = document.getElementById('translationResult');

if (languageDropdown.value === 'tw') {
  translationResult.innerText = 'Not available in that language';
} else {
}
