/**
 * Tour Support System – Authentication Module
 * Static, PIN-based, role-controlled access
 * Offline-first | No backend dependency
 * Version: 1.3 (stabilized)
 */

const AuthSystem = (function () {

    /* ==========================
       CONFIGURATION (CENTRALIZED)
    ========================== */
    const CONFIG = {
        VERSION: '1.3',
        SESSION_KEY: 'tourSystem_session',
        ACTIVITY_KEY: 'tourSystem_lastActivity',
        LOG_KEY: 'tourSystem_accessLogs',
        SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
        INACTIVITY_LIMIT: 30 * 60 * 1000,     // 30 minutes
        PINS: {
            FACULTY: '112233',
            LEADER: '123456',
            VIEWER: '000000'
        }
    };

    /* ==========================
       ROLE DEFINITIONS
    ========================== */
    const ROLES = {
        FACULTY: {
            key: 'FACULTY',
            name: 'Faculty',
            icon: 'fas fa-user-tie',
            permissions: {
                viewDashboard: true,
                editAttendance: true,
                viewStudents: true,
                viewItinerary: true,
                editItinerary: true,
                viewSafety: true,
                exportData: true
            }
        },
        LEADER: {
            key: 'LEADER',
            name: 'Student Leader',
            icon: 'fas fa-user-graduate',
            permissions: {
                viewDashboard: true,
                editAttendance: true,
                viewStudents: true,
                viewItinerary: true,
                editItinerary: false,
                viewSafety: true,
                exportData: false
            }
        },
        VIEWER: {
            key: 'VIEWER',
            name: 'View Only',
            icon: 'fas fa-eye',
            permissions: {
                viewDashboard: true,
                editAttendance: false,
                viewStudents: true,
                viewItinerary: true,
                editItinerary: false,
                viewSafety: true,
                exportData: false
            }
        },
        EMERGENCY: {
            key: 'EMERGENCY',
            name: 'Emergency Access',
            icon: 'fas fa-ambulance',
            permissions: {
                viewDashboard: false,
                editAttendance: false,
                viewStudents: false,
                viewItinerary: true,
                viewSafety: true,
                exportData: false
            }
        }
    };

    /* ==========================
       INTERNAL STATE
    ========================== */
    let currentUser = null;
    let sessionTimer = null;

    /* ==========================
       INITIALIZATION
    ========================== */
    function init() {
        restoreSession();
        bindUIEvents();
        trackActivity();
        enforceInactivityLogout();
    }

    /* ==========================
       EVENT BINDINGS
    ========================== */
    function bindUIEvents() {

        document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
        document.getElementById('emergencyAccessBtn')?.addEventListener('click', emergencyLogin);
        document.getElementById('togglePin')?.addEventListener('click', togglePinVisibility);

        document.getElementById('pin')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleLogin();
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) logout();
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) updateLastActivity();
        });
    }

    /* ==========================
       LOGIN HANDLING
    ========================== */
    function handleLogin() {
        const roleKey = document.querySelector('input[name="role"]:checked')?.value;
        const pin = document.getElementById('pin')?.value.trim();

        if (!roleKey || !pin) {
            showAlert('Role selection and PIN are required.', 'warning');
            return;
        }

        const role = verifyPIN(roleKey, pin);
        if (!role) {
            showAlert('Invalid PIN for selected role.', 'danger');
            document.getElementById('pin').value = '';
            return;
        }

        establishSession(role);
        redirectAfterLogin(role);
    }

    function emergencyLogin() {
        establishSession(ROLES.EMERGENCY);
        redirectAfterLogin(ROLES.EMERGENCY);
    }

    function verifyPIN(roleKey, pin) {
        if (roleKey === 'faculty' && pin === CONFIG.PINS.FACULTY) return ROLES.FACULTY;
        if (roleKey === 'leader' && pin === CONFIG.PINS.LEADER) return ROLES.LEADER;
        if (roleKey === 'viewer' && pin === CONFIG.PINS.VIEWER) return ROLES.VIEWER;
        return null;
    }

    /* ==========================
       SESSION MANAGEMENT
    ========================== */
    function establishSession(role) {
        currentUser = {
            roleKey: role.key,
            roleName: role.name,
            icon: role.icon,
            permissions: role.permissions,
            timestamp: Date.now(),
            sessionId: generateSessionId()
        };

        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(currentUser));
        updateLastActivity();
        startSessionTimer();
        logAccess();
    }

    function restoreSession() {
        try {
            const stored = JSON.parse(localStorage.getItem(CONFIG.SESSION_KEY));
            if (!stored) return;

            if (Date.now() - stored.timestamp > CONFIG.SESSION_DURATION) {
                clearSession();
                return;
            }

            currentUser = stored;
            startSessionTimer();

        } catch {
            clearSession();
        }
    }

    function clearSession() {
        localStorage.removeItem(CONFIG.SESSION_KEY);
        currentUser = null;
    }

    function logout() {
        clearSession();
        clearTimeout(sessionTimer);
        window.location.replace('index.html');
    }

    function startSessionTimer() {
        clearTimeout(sessionTimer);
        sessionTimer = setTimeout(() => {
            showAlert('Session expired. Please login again.', 'warning');
            logout();
        }, CONFIG.SESSION_DURATION);
    }

    /* ==========================
       ACTIVITY & SECURITY
    ========================== */
    function updateLastActivity() {
        localStorage.setItem(CONFIG.ACTIVITY_KEY, Date.now());
    }

    function trackActivity() {
        ['click', 'keydown', 'mousemove', 'touchstart'].forEach(evt =>
            document.addEventListener(evt, updateLastActivity, { passive: true })
        );
    }

    function enforceInactivityLogout() {
        setInterval(() => {
            const last = parseInt(localStorage.getItem(CONFIG.ACTIVITY_KEY), 10);
            if (last && Date.now() - last > CONFIG.INACTIVITY_LIMIT) {
                logout();
            }
        }, 60 * 1000);
    }

    /* ==========================
       UTILITIES
    ========================== */
    function redirectAfterLogin(role) {
        setTimeout(() => {
            window.location.replace(
                role.key === 'EMERGENCY' ? 'safety.html' : 'dashboard.html'
            );
        }, 800);
    }

    function generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    function logAccess() {
        const logs = JSON.parse(localStorage.getItem(CONFIG.LOG_KEY) || '[]');
        logs.push({
            role: currentUser.roleName,
            time: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        if (logs.length > 50) logs.shift();
        localStorage.setItem(CONFIG.LOG_KEY, JSON.stringify(logs));
    }

    function togglePinVisibility() {
        const pin = document.getElementById('pin');
        const btn = document.getElementById('togglePin');
        if (!pin || !btn) return;

        pin.type = pin.type === 'password' ? 'text' : 'password';
        btn.innerHTML = pin.type === 'password'
            ? '<i class="fas fa-eye"></i>'
            : '<i class="fas fa-eye-slash"></i>';
    }

    function showAlert(message, type = 'info') {
        document.querySelector('.auth-alert')?.remove();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show auth-alert mt-3`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.querySelector('.card')?.after(alert);
    }

    /* ==========================
       PUBLIC API
    ========================== */
    return {
        init,
        logout,
        isLoggedIn: () => !!currentUser,
        getCurrentUser: () => currentUser,
        hasPermission: (perm) => !!currentUser?.permissions?.[perm],
        getRoleName: () => currentUser?.roleName || null
    };

})();

/* ==========================
   BOOTSTRAP
========================== */
document.addEventListener('DOMContentLoaded', AuthSystem.init);
