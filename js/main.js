/**
 * Tour Support System - Main Application Module
 * Core functionality and initialization
 * Version: 1.2 (FINAL – Stable & Maintainable)
 */

const TourSupportSystem = (function () {

    /* ===================== CONSTANTS ===================== */
    const APP_VERSION = '1.2';

    const TOAST_BG_MAP = {
        success: 'bg-success',
        danger: 'bg-danger',
        warning: 'bg-warning',
        info: 'bg-primary'
    };

    /* ===================== STATE ===================== */
    const state = {
        initialized: false,
        offline: !navigator.onLine,
        lastSync: null,
        pendingChanges: []
    };

    let lastSessionExtend = 0;

    /* ===================== INIT ===================== */
    function init() {
        if (state.initialized) return;

        console.log(`Tour Support System v${APP_VERSION} initializing...`);

        if (typeof DataManager === 'undefined') {
            console.error('DataManager not loaded');
            return;
        }

        if (typeof AuthSystem === 'undefined') {
            console.error('AuthSystem not loaded');
            return;
        }

        initializeModules();
        setupEventListeners();
        setupServiceWorker();
        checkForUpdates();
        setupPeriodicSync();

        state.initialized = true;
        console.log('Tour Support System initialized successfully');

        document.dispatchEvent(new CustomEvent('appInitialized'));
    }

    /* ===================== MODULE INIT ===================== */
    function initializeModules() {
        DataManager.init();

        if (!AuthSystem.isLoggedIn() && !isAuthPage()) {
            window.location.href = 'index.html';
            return;
        }

        if (
            window.location.pathname.includes('attendance.html') &&
            typeof AttendanceManager !== 'undefined' &&
            AttendanceManager.init
        ) {
            AttendanceManager.init();
        }

        setupRoleBasedUI();
        loadInitialData();
        setupNavigation();
    }

    function isAuthPage() {
        const path = window.location.pathname;
        return (
            path.includes('index.html') ||
            path === '/' ||
            path.endsWith('/')
        );
    }

    /* ===================== ROLE UI ===================== */
    function setupRoleBasedUI() {
        const user = AuthSystem.getCurrentUser();
        if (!user) return;

        document.querySelectorAll('.user-role-display')?.forEach(el => {
            el.innerHTML = `<i class="${user.icon} me-2"></i>${user.role}`;
        });

        updatePermissionBasedElements();
        updateLastLoginTime();
    }

    function updatePermissionBasedElements() {
        toggleElements('.edit-btn', AuthSystem.hasPermission('editAttendance'));
        toggleElements('.export-btn', AuthSystem.hasPermission('exportData'));
        toggleElements('.qr-scan-btn', AuthSystem.hasPermission('accessQR'));

        toggleElements('.faculty-only', AuthSystem.getRoleName() === 'Faculty');
        toggleElements('.leader-only', AuthSystem.getRoleName() === 'Student Leader');
    }

    function toggleElements(selector, visible) {
        document.querySelectorAll(selector)?.forEach(el => {
            el.style.display = visible ? '' : 'none';
        });
    }

    function updateLastLoginTime() {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.querySelectorAll('.last-login-time')?.forEach(el => {
            el.textContent = `Last login: ${time}`;
        });
    }

    /* ===================== DATA LOAD ===================== */
    function loadInitialData() {
        loadTourInfo();
        loadStatistics();
        loadRecentActivity();
    }

    function loadTourInfo() {
        const tourInfo = DataManager.getData('tourInfo');
        if (!tourInfo) return;

        document.querySelectorAll('.tour-name')?.forEach(el => el.textContent = tourInfo.name);
        document.querySelectorAll('.tour-dates')?.forEach(el =>
            el.textContent = `${tourInfo.dates.start} to ${tourInfo.dates.end}`
        );
        document.querySelectorAll('.tour-location')?.forEach(el =>
            el.textContent = `${tourInfo.state} Tour`
        );

        const facultyList = document.getElementById('facultyList');
        if (facultyList && tourInfo.faculty) {
            facultyList.innerHTML = tourInfo.faculty.map(f => `
                <div class="mb-2">
                    <strong>${f.name}</strong><br>
                    <small class="text-muted">${f.role}</small><br>
                    <small><i class="fas fa-phone me-1"></i>${f.contact}</small>
                </div>
            `).join('');
        }

        const leadersList = document.getElementById('leadersList');
        if (leadersList && tourInfo.studentLeaders) {
            leadersList.innerHTML = tourInfo.studentLeaders.map(l => `
                <div class="mb-2">
                    <strong>${l.name}</strong><br>
                    <small class="text-muted">${l.rollNumber} | Div ${l.division}</small><br>
                    <small><i class="fas fa-phone me-1"></i>${l.contact}</small>
                </div>
            `).join('');
        }
    }

    function loadStatistics() {
        const data = DataManager.getAllData();
        if (!data) return;

        const today = new Date().toISOString().split('T')[0];
        const attendance = data.attendance.find(a => a.date === today);
        const present = attendance ? attendance.records.filter(r => r.status === 'present').length : 0;

        document.querySelectorAll('.stat-total-students')?.forEach(el => el.textContent = data.students.length);
        document.querySelectorAll('.stat-present-today')?.forEach(el => el.textContent = present);
        document.querySelectorAll('.stat-health-alerts')?.forEach(el =>
            el.textContent = data.students.filter(s => s.healthAlert).length
        );

        const todayEvent = data.itinerary.find(i => i.date === today);
        document.querySelectorAll('.stat-today-event')?.forEach(el =>
            el.textContent = todayEvent ? todayEvent.place : 'No events today'
        );
    }

    function loadRecentActivity() {
        const logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');
        const recent = logs.slice(-5).reverse();
        const container = document.getElementById('recentActivity');

        if (!container) return;

        if (!recent.length) {
            container.innerHTML = `<small class="text-muted">No recent activity</small>`;
            return;
        }

        container.innerHTML = recent.map(log => `
            <div class="mb-2 p-2 border-start border-3 border-primary">
                <small>
                    <strong>${log.role}</strong> logged in<br>
                    <span class="text-muted">${formatTimeAgo(log.loginTime)}</span>
                </small>
            </div>
        `).join('');
    }

    function formatTimeAgo(iso) {
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} minutes ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hours ago`;
        return `${Math.floor(hrs / 24)} days ago`;
    }

    /* ===================== NAVIGATION ===================== */
    function setupNavigation() {
        const page = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.nav-link')?.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === page);
        });
    }

    /* ===================== EVENTS ===================== */
    function setupEventListeners() {
        window.addEventListener('online', () => handleConnectivity(true));
        window.addEventListener('offline', () => handleConnectivity(false));

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) AuthSystem.extendSession();
        });

        document.addEventListener('dataSaved', e => {
            state.lastSync = e.detail.timestamp;
        });

        document.addEventListener('attendanceUpdated', loadStatistics);

        document.addEventListener('click', e => {
            if (e.target.closest('.logout-btn')) {
                if (confirm('Logout?')) AuthSystem.logout();
            }
            extendSessionThrottled();
        });

        document.addEventListener('keypress', extendSessionThrottled);
        document.addEventListener('touchstart', extendSessionThrottled);
    }

    function extendSessionThrottled() {
        const now = Date.now();
        if (now - lastSessionExtend > 60000) {
            AuthSystem.extendSession();
            lastSessionExtend = now;
        }
    }

    function handleConnectivity(online) {
        state.offline = !online;
        showToast(online ? 'Back online' : 'Working offline', online ? 'success' : 'warning');
    }

    /* ===================== SERVICE WORKER ===================== */
    function setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .catch(err => console.warn('Service Worker failed:', err));
        }
    }

    function setupPeriodicSync() {
        setInterval(() => {
            if (navigator.onLine) state.lastSync = new Date().toISOString();
        }, 5 * 60 * 1000);
    }

    function checkForUpdates() {
        const saved = localStorage.getItem('appVersion');
        if (saved !== APP_VERSION) {
            localStorage.setItem('appVersion', APP_VERSION);
            showToast('Application updated successfully', 'info');
        }
    }

    /* ===================== TOAST ===================== */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast show position-fixed top-0 end-0 m-3`;
        toast.innerHTML = `
            <div class="toast-header ${TOAST_BG_MAP[type] || 'bg-primary'} text-white">
                <strong class="me-auto">Tour System</strong>
                <button class="btn-close btn-close-white"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /* ===================== EXPORTS ===================== */
    function exportAllData() {
        if (!AuthSystem.hasPermission('exportData')) {
            showToast('Export not allowed', 'warning');
            return;
        }
        const url = DataManager.exportData();
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = `tour_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    function importData(file) {
        if (!AuthSystem.hasPermission('exportData')) return;
        const reader = new FileReader();
        reader.onload = e => {
            DataManager.importData(e.target.result);
            showToast('Data imported', 'success');
            setTimeout(() => location.reload(), 1000);
        };
        reader.readAsText(file);
    }

    function getStatus() {
        return {
            ...state,
            userRole: AuthSystem.getRoleName(),
            totalStudents: DataManager.getData('students')?.length || 0
        };
    }

    /* ===================== PUBLIC API ===================== */
    return {
        init,
        exportAllData,
        importData,
        getStatus,
        showToast,
        reloadData: loadInitialData
    };

})();

/* ===================== BOOTSTRAP ===================== */
document.addEventListener('DOMContentLoaded', () => {
    TourSupportSystem.init();
});

window.TourSupportSystem = TourSupportSystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TourSupportSystem;
}
