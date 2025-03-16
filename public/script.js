// Initialize the editor
const editor = window.pell.init({
    element: document.getElementById('editor'),
    actions: []
});

// Get current page from URL or default to 'home'
const getCurrentPage = () => {
    const path = window.location.pathname.substring(1);
    return decodeURIComponent(path) || 'home';
};

// Update URL without reloading
const updateURL = (page) => {
    window.history.pushState({}, page, `/${encodeURIComponent(page)}`);
};

// Convert WikiLinks to HTML
const processWikiLinks = (content) => {
    return content.replace(/\[\[(.*?)\]\]/g, (match, pageName) => {
        const exists = localStorage.getItem(`page:${pageName}`) !== null;
        const className ='wiki-link';
        return `<a href="/${encodeURIComponent(pageName)}" class="${className}" data-page="${pageName}">${pageName}</a>`;
    });
};

// Load page content
const loadPage = (page) => {
    const content = localStorage.getItem(`page:${page}`) || '<p>Start typing...</p>';
    editor.content.innerHTML = processWikiLinks(content);
    document.title = `${page} - Teeny Tiny Wiki`;
};

// Save page content
const savePage = (page, content) => {
    localStorage.setItem(`page:${page}`, content);
};

// Initialize the current page
let currentPage = getCurrentPage();
loadPage(currentPage);

// Process wiki links after typing
let processTimeout;
editor.content.addEventListener('input', () => {
    const content = editor.content.innerHTML;
    savePage(currentPage, content);
    
    // Process wiki links after a short delay
    clearTimeout(processTimeout);
    processTimeout = setTimeout(() => {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        
        const range = sel.getRangeAt(0);
        const cursorOffset = range.startOffset;
        const cursorNode = range.startContainer;
        
        // Only process if we're in a text node and have potential wiki links
        if (cursorNode.nodeType !== Node.TEXT_NODE || !cursorNode.textContent.includes('[[')) return;
        
        const originalText = cursorNode.textContent;
        const beforeCursor = originalText.substring(0, cursorOffset);
        
        // Check if we just completed a wiki link
        if (beforeCursor.match(/\[\[[^\]]+\]\]$/)) {
            const parent = cursorNode.parentNode;
            parent.innerHTML = processWikiLinks(parent.innerHTML);
            
            // Place cursor at the end of the parent node
            const newRange = document.createRange();
            newRange.selectNodeContents(parent);
            newRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
    }, 100);
});

// Handle navigation
window.addEventListener('popstate', () => {
    currentPage = getCurrentPage();
    loadPage(currentPage);
});

// Handle clicks on wiki links
document.addEventListener('click', (e) => {
    const link = e.target.closest('.wiki-link, .new-page-link');
    if (link) {
        e.preventDefault();
        const page = link.dataset.page;
        currentPage = page;
        updateURL(page);
        loadPage(page);
    }
});

// Handle tab key
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