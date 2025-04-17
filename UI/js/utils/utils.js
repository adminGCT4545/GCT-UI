/**
 * KYNSEY AI - Utilities Module
 * 
 * Contains utility functions used throughout the application.
 */

// Create a global utils object
window.utils = {};

/**
 * Generate a random ID
 * @returns {string} A random ID
 */
window.utils.generateId = function() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Auto-resize a textarea based on its content
 * @param {HTMLTextAreaElement} textarea - The textarea element to resize
 */
window.utils.autoResizeTextarea = function(textarea) {
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - The HTML to sanitize
 * @returns {string} Sanitized HTML
 */
window.utils.sanitizeHTML = function(html) {
    if (!html) return '';
    
    // Simple sanitization for demo purposes
    // In a real implementation, use a library like DOMPurify
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Parse and sanitize markdown
 * @param {string} markdown - The markdown to parse and sanitize
 * @returns {string} Parsed and sanitized HTML
 */
window.utils.parseAndSanitizeMarkdown = function(markdown) {
    if (!markdown) return '';
    
    // Use marked library if available
    if (typeof marked !== 'undefined') {
        return marked.parse(markdown);
    }
    
    // Simple fallback if marked is not available
    return markdown
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

/**
 * Highlight code in an element using highlight.js
 * @param {HTMLElement} element - The element containing code to highlight
 */
window.utils.highlightCodeInElement = function(element) {
    if (!element) return;
    
    // Use highlight.js if available
    if (typeof hljs !== 'undefined') {
        const codeBlocks = element.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
            
            // Add copy button
            const pre = block.parentElement;
            if (pre && !pre.querySelector('.copy-code-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-code-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.onclick = (e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(block.textContent).then(() => {
                        copyBtn.textContent = 'Copied!';
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.textContent = 'Copy';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    });
                };
                pre.appendChild(copyBtn);
            }
        });
    }
}

/**
 * Get a file icon based on file type
 * @param {string} fileType - The MIME type of the file
 * @returns {string} An emoji representing the file type
 */
window.utils.getFileIcon = function(fileType) {
    if (!fileType) return '📄';
    
    if (fileType.startsWith('image/')) {
        return '🖼️';
    } else if (fileType.includes('pdf')) {
        return '📑';
    } else if (fileType.includes('word')) {
        return '📝';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) {
        return '📊';
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
        return '📊';
    } else if (fileType.includes('audio')) {
        return '🔊';
    } else if (fileType.includes('video')) {
        return '🎬';
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
        return '🗜️';
    } else if (fileType.includes('text')) {
        return '📄';
    } else {
        return '📄';
    }
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - The HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
window.utils.sanitizeHTML = function(html) {
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
window.utils.parseAndSanitizeMarkdown = function(markdown) {
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
    return window.utils.sanitizeHTML(html);
}

/**
 * Apply syntax highlighting to code elements
 * @param {HTMLElement} container - The container element with code blocks
 */
window.utils.highlightCodeInElement = function(container) {
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
                copyBtn.onclick = () => window.utils.copyCodeHandler(block, copyBtn);
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
window.utils.copyCodeHandler = function(codeBlock, button) {
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
window.utils.formatDate = function(date, includeTime = false) {
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
window.utils.debounce = function(func, wait = 300) {
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
window.utils.throttle = function(func, limit = 300) {
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
window.utils.getFileIcon = function(mimeType) {
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
window.utils.autoResizeTextarea = function(textarea) {
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
window.utils.isValidUrl = function(str) {
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
window.utils.truncateString = function(str, maxLength = 50) {
    if (!str || str.length <= maxLength) return str;
    
    return str.substring(0, maxLength - 3) + '...';
}
