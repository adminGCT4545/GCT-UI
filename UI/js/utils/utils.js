/**
 * Utility Functions
 * 
 * This file contains general utility functions used throughout the application.
 */

/**
 * Generate a unique ID
 * @returns {string} A unique ID string
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - The HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
    if (!html) return '';
    
    // If DOMPurify is available, use it
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(html);
    }
    
    // Simple sanitization fallback
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html;
    return tempDiv.innerHTML;
}

/**
 * Parse and sanitize markdown content
 * @param {string} markdown - The markdown content to parse and sanitize
 * @returns {string} Sanitized HTML from markdown
 */
export function parseAndSanitizeMarkdown(markdown) {
    if (!markdown) return '';
    
    let html = '';
    
    // If marked is available, use it to parse markdown
    if (typeof marked !== 'undefined') {
        html = marked.parse(markdown);
    } else {
        // Simple fallback for markdown parsing
        html = markdown
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
        html = `<p>${html}</p>`;
    }
    
    // Sanitize the resulting HTML
    return sanitizeHTML(html);
}

/**
 * Apply syntax highlighting to code elements
 * @param {HTMLElement} container - The container element with code blocks
 */
export function highlightCodeInElement(container) {
    if (!container) return;
    
    const codeBlocks = container.querySelectorAll('pre code');
    if (codeBlocks.length === 0) return;
    
    // If highlight.js is available, use it
    if (typeof hljs !== 'undefined') {
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
            
            // Add copy button to code blocks
            const pre = block.parentElement;
            if (pre && !pre.querySelector('.copy-code-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-code-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.onclick = () => copyCodeHandler(block, copyBtn);
                pre.style.position = 'relative';
                pre.appendChild(copyBtn);
            }
        });
    }
}

/**
 * Handle copying code to clipboard
 * @param {HTMLElement} codeBlock - The code block element
 * @param {HTMLElement} button - The copy button element
 */
export function copyCodeHandler(codeBlock, button) {
    if (!codeBlock || !button) return;
    
    const code = codeBlock.textContent;
    
    // Use clipboard API if available
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code)
            .then(() => {
                button.textContent = 'Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code: ', err);
                button.textContent = 'Error';
                
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
    } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
            button.textContent = 'Error';
            
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        }
        
        document.body.removeChild(textarea);
    }
}

/**
 * Format a date for display
 * @param {string|Date} date - The date to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = false) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString(undefined, options);
}

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle a function to limit how often it can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Get file icon based on MIME type
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} Icon character
 */
export function getFileIcon(mimeType) {
    if (!mimeType) return '📎';
    
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.startsWith('text/')) return '📜';
    if (mimeType.includes('dicom')) return '⚕️';
    
    return '📎';
}

/**
 * Auto-resize a textarea based on its content
 * @param {HTMLTextAreaElement} textarea - The textarea element to resize
 */
export function autoResizeTextarea(textarea) {
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to the scrollHeight
    textarea.style.height = textarea.scrollHeight + 'px';
}

/**
 * Check if a string is a valid URL
 * @param {string} str - The string to check
 * @returns {boolean} Whether the string is a valid URL
 */
export function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength = 50) {
    if (!str || str.length <= maxLength) return str;
    
    return str.substring(0, maxLength - 3) + '...';
}
