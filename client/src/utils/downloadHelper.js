/**
 * Convert JSON data to CSV string
 * @param {Array} data - Array of objects
 * @returns {String} - CSV string
 */
export const convertToCSV = (data) => {
    if (!data || !data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

/**
 * Trigger download of a file
 * @param {Blob|String} content - File content
 * @param {String} filename - Name of the file
 * @param {String} mimeType - MIME type (default: 'text/csv')
 */
export const downloadFile = (content, filename, mimeType = 'text/csv') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
