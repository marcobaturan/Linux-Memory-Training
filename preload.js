/**
 * Preload Script - Safely exposes restricted IPC methods to the renderer process.
 * This script runs in a privileged context with access to Node.js APIs, 
 * but exposes only a limited and secure API to the web-based UI.
 */

const { contextBridge, ipcRenderer } = require('electron');

// contextBridge creates a secure, isolated bridge between 'main' and 'renderer'
contextBridge.exposeInMainWorld('api', {
    /** 
     * getThemes: Requests the list of theme directories from the main process.
     * @returns {Promise<string[]>}
     */
    getThemes: () => ipcRenderer.invoke('get-themes'),

    /** 
     * getImages: Requests images for a specific theme from the main process.
     * @param {string} theme - The name of the theme folder.
     * @returns {Promise<string[]>} Base64 image data strings.
     */
    getImages: (theme) => ipcRenderer.invoke('get-images', theme),
});
