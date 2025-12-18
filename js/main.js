/**
 * Tour Support System - Main Application Module
 * Core functionality and initialization
 * Version: 1.2
 */

const TourSupportSystem = (function () {
    // Application state
    const state = {
        initialized: false,
        offline: !navigator.onLine,
        lastSync: null,
        pendingChanges: []
    };

    // Initialize application
    function init() {
        if (state.initialized) return;

        console.log('Tour Support System v1.2 Initializing...');

        // Initialize modules in order
        initializeModules();

        // Setup application events
        setupEventListeners();

        // Setup service worker for offline capability
        setupServiceWorker();

        // Check for updates
        checkForUpdates();

        // Setup periodic sync
        setupPeriodicSync();

        state.initialized = true;
        console.log('Tour Support System initialized successfully');

        // Dispatch initialized event
        document.dispatchEvent(new CustomEvent('appInitialized'));
    }

    // Initialize all modules
    function initializeModules() {
        // Check authentication first
        if (!AuthSystem.isLoggedIn() && !isAuthPage()) {
            window.location.href = 'index.html';
            return;
        }

        // Initialize Data Manager
        DataManager.init();

        // Initialize Attendance Manager if on attendance page
        if (window.location.pathname.includes('attendance.html')) {
            AttendanceManager.init();
        }

        // Setup UI based on user role
        setupRoleBasedUI();

        // Load initial data
        loadInitialData();

        // Setup navigation
        setupNavigation();
    }

    // Check if current page is auth page
    function isAuthPage() {
        return window.location.pathname.includes('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/');
    }

    // Setup role-based UI
    function setupRoleBasedUI() {
        const user = AuthSystem.getCurrentUser();
        if (!user) return;

        // Update role display
        const roleElements = document.querySelectorAll('.user-role-display');
        roleElements.forEach(el => {
            el.innerHTML = `
                <i class="${user.icon} me-2"></i>
                ${user.role}
            `;
        });

        // Show/hide elements based on permissions
        updatePermissionBasedElements();

        // Update last login time
        updateLastLoginTime();
    }

    // Update UI elements based on permissions
    function updatePermissionBasedElements() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.style.display = AuthSystem.hasPermission('editAttendance') ? '' : 'none';
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.style.display = AuthSystem.hasPermission('exportData') ? '' : 'none';
        });

        // QR scan buttons
        document.querySelectorAll('.qr-scan-btn').forEach(btn => {
            btn.style.display = AuthSystem.hasPermission('accessQR') ? '' : 'none';
        });

        // Faculty-only sections
        document.querySelectorAll('.faculty-only').forEach(el => {
            el.style.display = AuthSystem.getRoleName() === 'Faculty' ? '' : 'none';
        });

        // Leader-only sections
        document.querySelectorAll('.leader-only').forEach(el => {
            el.style.display = AuthSystem.getRoleName() === 'Student Leader' ? '' : 'none';
        });
    }

    // Update last login time
    function updateLastLoginTime() {
        const timeElements = document.querySelectorAll('.last-login-time');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        timeElements.forEach(el => {
            el.textContent = `Last login: ${timeString}`;
        });
    }

    // Load initial data
    function loadInitialData() {
        // Load tour info
        loadTourInfo();

        // Load statistics
        loadStatistics();

        // Load recent activity
        loadRecentActivity();
    }

    // Load tour information
    function loadTourInfo() {
        const tourInfo = DataManager.getData('tourInfo');
        if (!tourInfo) return;

        // Update tour name
        document.querySelectorAll('.tour-name').forEach(el => {
            el.textContent = tourInfo.name;
        });

        // Update tour dates
        document.querySelectorAll('.tour-dates').forEach(el => {
            el.textContent = `${tourInfo.dates.start} to ${tourInfo.dates.end}`;
        });

        // Update tour location
        document.querySelectorAll('.tour-location').forEach(el => {
            el.textContent = `${tourInfo.state} Tour`;
        });

        // Update faculty list
        const facultyList = document.getElementById('facultyList');
        if (facultyList && tourInfo.faculty) {
            facultyList.innerHTML = tourInfo.faculty.map(faculty => `
                <div class="faculty-item mb-2">
                    <strong>${faculty.name}</strong><br>
                    <small class="text-muted">${faculty.role}</small><br>
                    <small><i class="fas fa-phone me-1"></i>${faculty.contact}</small>
                </div>
            `).join('');
        }

        // Update student leaders list
        const leadersList = document.getElementById('leadersList');
        if (leadersList && tourInfo.studentLeaders) {
            leadersList.innerHTML = tourInfo.studentLeaders.map(leader => `
                <div class="leader-item mb-2">
                    <strong>${leader.name}</strong><br>
                    <small class="text-muted">${leader.rollNumber} | Div ${leader.division}</small><br>
                    <small><i class="fas fa-phone me-1"></i>${leader.contact}</small>
                </div>
            `).join('');
        }
    }

    // Load statistics
    function loadStatistics() {
        const data = DataManager.getAllData();
        if (!data) return;

        const totalStudents = data.students.length;
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = data.attendance.find(a => a.date === today);
        const presentCount = todayAttendance ?
            todayAttendance.records.filter(r => r.status === 'present').length : 0;

        // Update stats cards
        document.querySelectorAll('.stat-total-students').forEach(el => {
            el.textContent = totalStudents;
        });

        document.querySelectorAll('.stat-present-today').forEach(el => {
            el.textContent = presentCount;
        });

        // Update health alerts count
        const healthAlertCount = data.students.filter(s => s.healthAlert).length;
        document.querySelectorAll('.stat-health-alerts').forEach(el => {
            el.textContent = healthAlertCount;
        });

        // Update upcoming events
        const itinerary = data.itinerary || [];
        const todayItinerary = itinerary.find(item => item.date === today);
        document.querySelectorAll('.stat-today-event').forEach(el => {
            el.textContent = todayItinerary ? todayItinerary.place : 'No events today';
        });
    }

    // Load recent activity
    function loadRecentActivity() {
        const activityLog = JSON.parse(localStorage.getItem('accessLogs') || '[]');
        const recentActivity = activityLog.slice(-5).reverse(); // Last 5 entries

        const activityList = document.getElementById('recentActivity');
        if (activityList) {
            activityList.innerHTML = recentActivity.map(log => `
                <div class="activity-item mb-2 p-2 border-start border-3 border-primary">
                    <small>
                        <strong>${log.role}</strong> logged in<br>
                        <span class="text-muted">${formatTimeAgo(log.loginTime)}</span>
                    </small>
                </div>
            `).join('');
        }
    }

    // Format time ago
    function formatTimeAgo(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    }

    // Setup navigation
    function setupNavigation() {
        // Highlight current page in navigation
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage ||
                (currentPage === '' && linkPage === 'dashboard.html')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });

        // Setup back button
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Setup home button
        const homeButton = document.getElementById('homeButton');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Data events
        document.addEventListener('dataSaved', handleDataSaved);
        document.addEventListener('attendanceUpdated', handleAttendanceUpdated);

        // Logout button
        document.addEventListener('click', function (e) {
            if (e.target.matches('.logout-btn') || e.target.closest('.logout-btn')) {
                if (confirm('Are you sure you want to logout?')) {
                    AuthSystem.logout();
                }
            }
        });

        // Session extend on user activity
        document.addEventListener('click', extendSession);
        document.addEventListener('keypress', extendSession);
        document.addEventListener('touchstart', extendSession);

        // Print functionality
        document.addEventListener('click', function (e) {
            if (e.target.matches('.print-btn') || e.target.closest('.print-btn')) {
                window.print();
            }
        });
    }

    // Handle online status
    function handleOnline() {
        state.offline = false;
        showToast('Back online', 'success');

        // Sync any pending changes
        syncPendingChanges();
    }

    // Handle offline status
    function handleOffline() {
        state.offline = true;
        showToast('Working offline', 'warning');
    }

    // Handle visibility change
    function handleVisibilityChange() {
        if (!document.hidden) {
            // Extend session when tab becomes visible
            AuthSystem.extendSession();
        }
    }

    // Handle data saved event
    function handleDataSaved(event) {
        state.lastSync = event.detail.timestamp;

        // Update last sync display
        document.querySelectorAll('.last-sync-time').forEach(el => {
            el.textContent = `Last sync: ${formatTimeAgo(state.lastSync)}`;
        });
    }

    // Handle attendance updated event
    function handleAttendanceUpdated(event) {
        // Reload statistics
        loadStatistics();
    }

    // Extend session on user activity
    function extendSession() {
        AuthSystem.extendSession();
    }

    // Setup service worker for offline capability
    function setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    // Setup periodic sync
    function setupPeriodicSync() {
        // Sync every 5 minutes when online
        setInterval(() => {
            if (navigator.onLine) {
                syncData();
            }
        }, 5 * 60 * 1000);
    }

    // Sync data (placeholder for future cloud sync)
    function syncData() {
        // This would sync with Google Sheets if implemented
        console.log('Data sync triggered');
        state.lastSync = new Date().toISOString();
    }

    // Sync pending changes
    function syncPendingChanges() {
        if (state.pendingChanges.length > 0) {
            console.log(`Syncing ${state.pendingChanges.length} pending changes`);
            state.pendingChanges = [];
        }
    }

    // Check for updates
    function checkForUpdates() {
        // Check localStorage version vs current version
        const savedVersion = localStorage.getItem('appVersion');
        const currentVersion = '1.2';

        if (savedVersion !== currentVersion) {
            console.log(`Updating from ${savedVersion} to ${currentVersion}`);

            // Clear old data if major version change
            if (savedVersion && savedVersion.split('.')[0] !== currentVersion.split('.')[0]) {
                localStorage.clear();
            }

            localStorage.setItem('appVersion', currentVersion);

            showToast('Application updated successfully', 'info');
        }
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        // Use existing toast system or create one
        if (typeof AttendanceManager !== 'undefined' && AttendanceManager.showToast) {
            AttendanceManager.showToast(message, type);
        } else {
            // Fallback toast
            const toast = document.createElement('div');
            toast.className = `toast show position-fixed top-0 end-0 m-3`;
            toast.innerHTML = `
                <div class="toast-header bg-${type} text-white">
                    <strong class="me-auto">Tour System</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    // Export data
    function exportAllData() {
        if (!AuthSystem.hasPermission('exportData')) {
            showToast('Export not available for your role', 'warning');
            return;
        }

        const url = DataManager.exportData();
        if (!url) {
            showToast('No data to export', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = `tour_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        showToast('Data exported successfully', 'success');
    }

    // Import data
    function importData(file) {
        if (!AuthSystem.hasPermission('exportData')) {
            showToast('Import not available for your role', 'danger');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const success = DataManager.importData(e.target.result);
            if (success) {
                showToast('Data imported successfully', 'success');
                // Reload page to reflect changes
                setTimeout(() => location.reload(), 1000);
            } else {
                showToast('Failed to import data', 'danger');
            }
        };
        reader.readAsText(file);
    }

    // Get application status
    function getStatus() {
        return {
            ...state,
            userRole: AuthSystem.getRoleName(),
            totalStudents: DataManager.getData('students')?.length || 0,
            dataSize: localStorage.getItem(DataManager.getConfig().STORAGE_KEY)?.length || 0
        };
    }

    // Public API
    return {
        init: init,
        exportAllData: exportAllData,
        importData: importData,
        getStatus: getStatus,
        showToast: showToast,
        reloadData: loadInitialData
    };
})();

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    TourSupportSystem.init();
});

// Make available globally
window.TourSupportSystem = TourSupportSystem;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TourSupportSystem;
}