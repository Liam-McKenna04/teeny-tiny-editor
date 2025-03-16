window.pell.init({
    element: document.getElementById('editor'),
    actions: []
});

editor.content.innerHTML = '<p>Start typing...</p>';

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