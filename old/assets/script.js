// =================================================================
// 1. KONFIGURASI SUPABASE
// =================================================================
const SUPABASE_URL = 'https://oisrtlcxdwgvzrxrlzpb.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc3J0bGN4ZHdndnpyeHJsenBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMzM3OTEsImV4cCI6MjA3ODYwOTc5MX0.aI162olkIydnJrRxLnC0NsBU9umySmd2nWSTt8Hc1ec'; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =================================================================
// 2. FUNGSI TRACK DOWNLOAD (TABEL BARU)
// =================================================================

async function trackDownload(kelasId, targetUrl) {
    
    // A. BUKA LINK DULUAN (Supaya User Senang/Cepat)
    if (targetUrl) {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        // Deteksi jika file zip/doc/pdf untuk trigger download
        if (/\.(zip|rar|pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(targetUrl)) {
            link.setAttribute('download', '');
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // B. UPDATE TAMPILAN ANGKA SECARA LANGSUNG (Optimistic UI)
    const counterElement = document.querySelector(`.download-counter[data-kelas="${kelasId}"]`);
    if (counterElement) {
        let currentCount = parseInt(counterElement.innerText) || 0;
        counterElement.innerText = currentCount + 1;
    }

    // C. UPDATE DATABASE (TABEL BARU: kelas_downloads)
    try {
        // Panggil fungsi 'tambah_unduhan' yang kita buat di SQL Editor
        const { error } = await _supabase.rpc('tambah_unduhan', { 
            nama_kelas: kelasId 
        });

        if (error) console.error("Gagal update DB:", error);
        else console.log("Berhasil update unduhan:", kelasId);

    } catch (err) {
        console.error("Error tracking:", err);
    }
}

// =================================================================
// 3. FUNGSI LOAD DATA (SAAT WEBSITE DIBUKA)
// =================================================================

async function loadDownloadStats() {
    // Ambil data dari tabel 'kelas_downloads'
    const { data, error } = await _supabase
        .from('kelas_downloads')
        .select('kelas, jumlah_unduhan');

    if (error) {
        console.error("Gagal memuat statistik:", error);
        return;
    }

    if (data) {
        data.forEach(item => {
            // Cari elemen HTML yang punya data-kelas="kelas_1", dll
            const element = document.querySelector(`.download-counter[data-kelas="${item.kelas}"]`);
            if (element) {
                element.innerText = item.jumlah_unduhan;
            }
        });
    }
}

// =================================================================
// 4. INISIALISASI
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDownloadStats(); // Muat angka saat web dibuka

    // C. Animasi Menu Hamburger (X to Bars)
    const myOffcanvas = document.getElementById('offcanvasNavbar');
    const menuIcon = document.getElementById('menuIcon');
    if(myOffcanvas && menuIcon) {
        myOffcanvas.addEventListener('show.bs.offcanvas', () => {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times', 'fa-spin');
            setTimeout(() => menuIcon.classList.remove('fa-spin'), 300);
        });
        myOffcanvas.addEventListener('hide.bs.offcanvas', () => {
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars', 'fa-spin');
            setTimeout(() => menuIcon.classList.remove('fa-spin'), 300);
        });
    }
    
});