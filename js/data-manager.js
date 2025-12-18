/**
 * Tour Support System – Data Manager
 * Offline-first LocalStorage data layer
 * Version: 1.3 (stabilized)
 */

const DataManager = (function () {

    /* ==========================
       CONFIGURATION
    ========================== */
    const CONFIG = {
        STORAGE_KEY: 'tourSystem_data',
        BACKUP_KEY: 'tourSystem_backups',
        VERSION: '1.3',
        AUTO_SAVE_INTERVAL: 30000,
        MAX_BACKUPS: 5,
        EXPIRY_DAYS: 7
    };

    /* ==========================
       BASE SCHEMA
    ========================== */
    const SCHEMA = {
        tourInfo: {
            name: 'Educational Tour 2025',
            college: 'Kamani Science & Prataprai Arts College, Amreli',
            academicYear: '2025–2026',
            dates: { start: '2025-03-10', end: '2025-03-15' },
            state: 'Gujarat',
            faculty: [],
            studentLeaders: [],
            emergencyInstructions: ''
        },
        students: [],
        attendance: [],
        itinerary: [],
        safety: {
            emergencyContacts: [],
            healthAlerts: [],
            firstAid: [],
            guidelines: []
        },
        documents: [],
        metadata: {
            version: CONFIG.VERSION,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            autoCleanupDate: null
        }
    };

    /* ==========================
       INIT
    ========================== */
    function init() {
        if (!localStorage.getItem(CONFIG.STORAGE_KEY)) {
            seedInitialData();
        } else {
            validateData();
        }
        setupAutoSave();
        setupAutoBackup();
        checkExpiry();
    }

    /* ==========================
       INITIAL DATA
    ========================== */
    function seedInitialData() {
        const data = structuredClone(SCHEMA);

        const tourEnd = new Date(data.tourInfo.dates.end);
        tourEnd.setDate(tourEnd.getDate() + CONFIG.EXPIRY_DAYS);
        data.metadata.autoCleanupDate = tourEnd.toISOString();

        saveAll(data);
    }

    /* ==========================
       VALIDATION & MIGRATION
    ========================== */
    function validateData() {
        try {
            const data = getAll();
            if (!data?.tourInfo || !Array.isArray(data.students)) {
                throw new Error('Invalid data shape');
            }

            if (data.metadata.version !== CONFIG.VERSION) {
                migrateData(data);
            }
        } catch {
            createBackup('corrupt');
            seedInitialData();
        }
    }

    function migrateData(oldData) {
        const merged = {
            ...SCHEMA,
            ...oldData,
            metadata: {
                ...SCHEMA.metadata,
                ...oldData.metadata,
                version: CONFIG.VERSION,
                lastModified: new Date().toISOString()
            }
        };
        saveAll(merged);
    }

    /* ==========================
       CORE STORAGE
    ========================== */
    function saveAll(data) {
        data.metadata.lastModified = new Date().toISOString();
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        return true;
    }

    function getAll() {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function getData(section) {
        return getAll()?.[section] ?? null;
    }

    function updateData(section, value) {
        const data = getAll();
        if (!data) return false;
        data[section] = value;
        return saveAll(data);
    }

    /* ==========================
       COLLECTION HELPERS
    ========================== */
    function addItem(section, item) {
        const list = getData(section) || [];
        list.push(item);
        return updateData(section, list);
    }

    function updateItem(section, id, updates) {
        const list = getData(section) || [];
        const idx = list.findIndex(i => i.id === id);
        if (idx === -1) return false;
        list[idx] = { ...list[idx], ...updates };
        return updateData(section, list);
    }

    function deleteItem(section, id) {
        const list = (getData(section) || []).filter(i => i.id !== id);
        return updateData(section, list);
    }

    /* ==========================
       BACKUP SYSTEM
    ========================== */
    function setupAutoBackup() {
        const today = new Date().toDateString();
        const last = localStorage.getItem('lastBackupDate');

        if (today !== last) {
            createBackup('daily');
            localStorage.setItem('lastBackupDate', today);
        }
    }

    function createBackup(type = 'manual') {
        const data = getAll();
        if (!data) return;

        const backups = JSON.parse(localStorage.getItem(CONFIG.BACKUP_KEY) || '[]');
        backups.push({ type, timestamp: new Date().toISOString(), data });

        if (backups.length > CONFIG.MAX_BACKUPS) backups.shift();
        localStorage.setItem(CONFIG.BACKUP_KEY, JSON.stringify(backups));
    }

    /* ==========================
       EXPORT / IMPORT
    ========================== */
    function exportData() {
        const data = getAll();
        if (!data) return null;

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: 'application/json' }
        );
        return URL.createObjectURL(blob);
    }

    function importData(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.tourInfo || !parsed.students) return false;
            createBackup('pre-import');
            saveAll(parsed);
            return true;
        } catch {
            return false;
        }
    }

    /* ==========================
       SAFETY
    ========================== */
    function checkExpiry() {
        const data = getAll();
        if (!data?.metadata?.autoCleanupDate) return;

        if (new Date() > new Date(data.metadata.autoCleanupDate)) {
            clearAll();
        }
    }

    function clearAll() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        localStorage.removeItem(CONFIG.BACKUP_KEY);
    }

    /* ==========================
       AUTO SAVE
    ========================== */
    function setupAutoSave() {
        setInterval(() => {
            const data = getAll();
            if (data) saveAll(data);
        }, CONFIG.AUTO_SAVE_INTERVAL);
    }

    /* ==========================
       PUBLIC API
    ========================== */
    return {
        init,
        getAllData: getAll,
        getData,
        updateData,
        addItem,
        updateItem,
        deleteItem,
        exportData,
        importData,
        createBackup,
        clearAllData: clearAll,
        getConfig: () => CONFIG
    };

})();

/* ==========================
   BOOTSTRAP
========================== */
document.addEventListener('DOMContentLoaded', DataManager.init);
