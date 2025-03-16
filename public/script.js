window.pell.init({
    element: document.getElementById('editor'),
    actions: []
});

// Load saved content from localStorage or use default
const savedContent = localStorage.getItem('editorContent') || '<p>Start typing...</p>';
editor.content.innerHTML = savedContent;

// Save content to localStorage whenever it changes
editor.content.addEventListener('input', () => {
    localStorage.setItem('editorContent', editor.content.innerHTML);
});

// Add tab key handling
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab' && document.activeElement === editor.content) {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand('insertText', false, '    '); // Insert 4 spaces
    }
}, true);

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

// Check for saved theme preference and update button text
const isDark = root.classList.contains('dark-mode');
themeToggle.textContent = isDark ? 'Dark' : 'Light';

themeToggle.addEventListener('click', () => {
    root.classList.toggle('dark-mode');
    const isDark = root.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? 'Dark' : 'Light';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});