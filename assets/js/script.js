/**
 * Adgur PAI SD - Main Script
 * Handles Supabase interactions, statistics tracking, and general UI logic.
 */

const SUPABASE_URL = 'https://oisrtlcxdwgvzrxrlzpb.supabase.co'; 
const SUPABASE_KEY = 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc3J0bGN4ZHdndnpyeHJsenBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMzM3OTEsImV4cCI6MjA3ODYwOTc5MX0.aI162olkIydnJrRxLnC0NsBU9umySmd2nWSTt8Hc1ec';

// Initialize Supabase client
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches page views and download statistics from Supabase
 * Updates the corresponding DOM elements if they exist
 */
async function fetchStats() {
    const { data, error } = await _supabase.from('stats').select('*');
    if (data) {
        data.forEach(item => {
            const viewCountEl = document.getElementById('view-count');
            const downloadCountEl = document.getElementById('download-count');
            
            if (item.id === 'page_views' && viewCountEl) {
                viewCountEl.innerText = item.count.toLocaleString();
            }
            if (item.id === 'downloads' && downloadCountEl) {
                downloadCountEl.innerText = item.count.toLocaleString();
            }
        });
    }
}

/**
 * Increments the page view counter in Supabase and refreshes stats
 */
async function trackVisit() { 
    await _supabase.rpc('increment_stat', { row_id: 'page_views' }); 
    fetchStats(); 
}

/**
 * Increments the download counter in Supabase and refreshes stats
 */
async function trackDownload(e) { 
    await _supabase.rpc('increment_stat', { row_id: 'downloads' }); 
    fetchStats(); 
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Only track visits if we are on the main index page (where view-count exists)
    if(document.getElementById('view-count')) {
        trackVisit();
    }
    
    // Attach tracking to any download links (APK files)
    const downloadBtn = document.querySelector('a[href*=".apk"]');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', trackDownload);
    }
});