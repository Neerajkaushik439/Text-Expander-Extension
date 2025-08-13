document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-shortcut-form');
    const shortcutKeyInput = document.getElementById('shortcut-key');
    const expansionTextInput = document.getElementById('expansion-text');
    const shortcutsList = document.getElementById('shortcuts-list');

    // Load and display shortcuts when the popup opens
    loadShortcuts();

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const shortcutKey = shortcutKeyInput.value.trim();
        const expansionText = expansionTextInput.value.trim();

        if (shortcutKey && expansionText) {
            saveShortcut(shortcutKey, expansionText);
            form.reset();
        }
    });

    // Save a new shortcut to Chrome's synchronized storage
    function saveShortcut(key, text) {
        chrome.storage.sync.get('shortcuts', (data) => {
            let shortcuts = data.shortcuts || {};
            shortcuts[key] = text;
            chrome.storage.sync.set({ shortcuts }, () => {
                console.log('Shortcut saved:', key);
                displayShortcut(key, text); // Add the new shortcut to the list
            });
        });
    }

    // Load shortcuts from storage and display them
    function loadShortcuts() {
        chrome.storage.sync.get('shortcuts', (data) => {
            const shortcuts = data.shortcuts || {};
            shortcutsList.innerHTML = ''; // Clear the list before repopulating
            for (const key in shortcuts) {
                if (shortcuts.hasOwnProperty(key)) {
                    displayShortcut(key, shortcuts[key]);
                }
            }
        });
    }

    // Create and append a single shortcut element to the list
// Inside popup.js
function displayShortcut(key, text) {
    const shortcutElement = document.createElement('div');
    shortcutElement.classList.add('shortcut-item');
    shortcutElement.innerHTML = `
        <div class="shortcut-details">
            <span class="shortcut-key-display">${key}</span>
            <span class="expansion-text-display">${text}</span>
        </div>
        <!-- Use a Font Awesome icon for the delete button -->
        <button class="delete-button" data-key="${key}">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    shortcutsList.appendChild(shortcutElement);

    // ... rest of the function remains the same
}

    // Delete a shortcut from storage and update the UI
    function deleteShortcut(key) {
        chrome.storage.sync.get('shortcuts', (data) => {
            let shortcuts = data.shortcuts || {};
            delete shortcuts[key];
            chrome.storage.sync.set({ shortcuts }, () => {
                console.log('Shortcut deleted:', key);
                loadShortcuts(); // Reload the list to reflect the change
            });
        });
    }
});
