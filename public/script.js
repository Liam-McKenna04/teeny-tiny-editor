const editor = window.pell.init({
    element: document.getElementById('editor'),
    actions: [],
    onChange: html => {
        const content = editor.content.innerHTML;
        savePage(currentPage, content);
    }
});

// Set placeholder for the editor
editor.content.setAttribute('data-placeholder', 'Start typing...');

const formatPageName = (pageName) => {
    return pageName.trim().replace(/\s+/g, '-');
};

const getCurrentPage = () => {
    const path = window.location.pathname.substring(1);
    return decodeURIComponent(path) || 'home';
};

const updateURL = (page) => {
    const formattedPage = formatPageName(page);
    window.history.pushState({}, formattedPage, `/${encodeURIComponent(formattedPage)}`);
};

const processWikiLinks = (content) => {
    return content.replace(/\[\[(.*?)\]\]/g, (match, pageName) => {
        const formattedPage = formatPageName(pageName);
        const exists = localStorage.getItem(`page:${formattedPage}`) !== null;
        const className = 'wiki-link';
        return `<a href="/${encodeURIComponent(formattedPage)}" class="${className}" data-page="${formattedPage}">${pageName}</a>`;
    });
};

const loadPage = (page) => {
    const formattedPage = formatPageName(page);
    const content = localStorage.getItem(`page:${formattedPage}`);
    editor.content.innerHTML = content ? processWikiLinks(content) : '';
    document.title = `${formattedPage} - Teeny Tiny Editor`;
};

const savePage = (page, content) => {
    const formattedPage = formatPageName(page);
    localStorage.setItem(`page:${formattedPage}`, content);
};

let currentPage = getCurrentPage();
loadPage(currentPage);

let processTimeout;
let isProcessing = false;
editor.content.addEventListener('input', () => {
    if (isProcessing) return;
    
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
            isProcessing = true;
            const parent = cursorNode.parentNode;
            const originalHTML = parent.innerHTML;
            parent.innerHTML = processWikiLinks(parent.innerHTML);
            
            // Find the last wiki link in the parent node
            const wikiLinks = parent.getElementsByClassName('wiki-link');
            if (wikiLinks.length > 0) {
                const lastLink = wikiLinks[wikiLinks.length - 1];
                // Place cursor after the last wiki link
                const newRange = document.createRange();
                newRange.setStartAfter(lastLink);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
            isProcessing = false;
        }
    }, 100);
});

window.addEventListener('popstate', () => {
    currentPage = getCurrentPage();
    loadPage(currentPage);
});

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

document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab' && document.activeElement === editor.content) {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand('insertText', false, '    '); // Insert 4 spaces as a tab
    }
}, true);

const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

const isDark = root.classList.contains('dark-mode');
themeToggle.textContent = isDark ? 'Dark' : 'Light';

themeToggle.addEventListener('click', () => {
    root.classList.toggle('dark-mode');
    const isDark = root.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? 'Dark' : 'Light';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});