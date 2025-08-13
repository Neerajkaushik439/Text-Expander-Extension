/*
 * This updated content script is responsible for detecting and expanding shortcuts.
 * It is now more reliable and doesn't depend on a temporary keystroke buffer.
 * Instead, it directly checks the value of the active text field.
 */

let shortcuts = {};

// Load shortcuts from storage when the script first runs
function loadShortcuts() {
    chrome.storage.sync.get('shortcuts', (data) => {
        shortcuts = data.shortcuts || {};
        console.log("Shortcuts loaded:", shortcuts);
    });
}

// Listen for changes in storage to update shortcuts in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.shortcuts) {
        shortcuts = changes.shortcuts.newValue || {};
        console.log("Shortcuts updated:", shortcuts);
    }
});

// Load shortcuts on script initialization
loadShortcuts();

document.addEventListener('keyup', (event) => {
    const activeElement = document.activeElement;

    // Check if the user is typing in a valid text input element
    if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && !activeElement.isContentEditable)) {
        return;
    }

    // Get the current text and the cursor position
    const isInputOrTextarea = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
    const elementText = isInputOrTextarea ? activeElement.value : activeElement.innerText;
    const cursorPosition = isInputOrTextarea ? activeElement.selectionStart : null;

    if (!elementText) return;

    // Iterate through all stored shortcuts to check for a match
    for (const shortcut in shortcuts) {
        if (shortcuts.hasOwnProperty(shortcut)) {
            // Check if the text ends with the shortcut
            if (elementText.endsWith(shortcut)) {
                // Get the text that comes before the shortcut
                const startText = elementText.slice(0, elementText.lastIndexOf(shortcut));
                const expansion = shortcuts[shortcut];
                const newText = startText + expansion;

                // Update the text in the active element
                if (isInputOrTextarea) {
                    activeElement.value = newText;
                    // Move the cursor to the end of the new text
                    activeElement.selectionStart = activeElement.selectionEnd = newText.length;
                } else {
                    activeElement.innerText = newText;
                    // For contenteditable, reposition the cursor
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(activeElement);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                console.log(`Expanded shortcut: ${shortcut}`);
                return; // Exit the loop after finding the first match
            }
        }
    }
});