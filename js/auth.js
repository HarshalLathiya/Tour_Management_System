/**
 * Tour Support System - Authentication Module
 * Handles PIN-based authentication and role management
 * Version: 1.0
 */

const AuthSystem = (function () {
    // Configuration
    const CONFIG = {
        VERSION: '1.2',
        PINS: {
            FACULTY: '112233',   // Full access
            LEADER: '123456',    // Edit attendance + view
            VIEWER: '000000',    // Read-only access
            EMERGENCY: '911'     // Safety info only
        },
        SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
        STORAGE_KEY: 'tourSystem_v1.2',
        SESSION_KEY: 'tourSystem_session'
    };

    // User roles and permissions
    const ROLES = {
        FACULTY: {
            name: 'Faculty',
            icon: 'fas fa-user-tie',
            permissions: {
                viewDashboard: true,
                editAttendance: true,
                viewStudents: true,
                editStudents: false,
                viewItinerary: true,
                editItinerary: true,
                viewSafety: true,
                exportData: true,
                accessQR: true,
                emergencyAccess: true
            }
        },
        LEADER: {
            name: 'Student Leader',
            icon: 'fas fa-user-graduate',
            permissions: {
                viewDashboard: true,
                editAttendance: true,
                viewStudents: true,
                editStudents: false,
                viewItinerary: true,
                editItinerary: false,
                viewSafety: true,
                exportData: false,
                accessQR: true,
                emergencyAccess: false
            }
        },
        VIEWER: {
            name: 'View Only',
            icon: 'fas fa-eye',
            permissions: {
                viewDashboard: true,
                editAttendance: false,
                viewStudents: true,
                editStudents: false,
                viewItinerary: true,
                editItinerary: false,
                viewSafety: true,
                exportData: false,
                accessQR: false,
                emergencyAccess: false
            }
        },
        EMERGENCY: {
            name: 'Emergency Access',
            icon: 'fas fa-ambulance',
            permissions: {
                viewDashboard: false,
                editAttendance: false,
                viewStudents: false,
                editStudents: false,
                viewItinerary: true,
                editItinerary: false,
                viewSafety: true,
                exportData: false,
                accessQR: false,
                emergencyAccess: true
            }
        }
    };

    // Current user state
    let currentUser = null;
    let sessionTimer = null;

    // Initialize authentication system
    function init() {
        // Load saved session if exists
        loadSession();

        // Set up event listeners
        setupEventListeners();

        // Check for auto-logout
        checkAutoLogout();
    }

    // Set up event listeners for authentication
    function setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }

        // Emergency access button
        const emergencyBtn = document.getElementById('emergencyAccessBtn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', handleEmergencyAccess);
        }

        // PIN visibility toggle
        const togglePinBtn = document.getElementById('togglePin');
        if (togglePinBtn) {
            togglePinBtn.addEventListener('click', togglePinVisibility);
        }

        // Enter key on PIN field
        const pinField = document.getElementById('pin');
        if (pinField) {
            pinField.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }

        // Logout buttons
        document.addEventListener('click', function (e) {
            if (e.target.matches('.logout-btn') || e.target.closest('.logout-btn')) {
                logout();
            }
        });

        // Session timeout warning
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Handle login process
    function handleLogin() {
        const selectedRole = document.querySelector('input[name="role"]:checked')?.value;
        const pin = document.getElementById('pin')?.value?.trim();

        if (!selectedRole || !pin) {
            showAlert('Please select a role and enter PIN', 'warning');
            return;
        }

        // Verify PIN
        const role = verifyPIN(selectedRole, pin);

        if (role) {
            login(role);
        } else {
            showAlert('Invalid PIN for selected role', 'danger');
            // Clear PIN field after failed attempt
            document.getElementById('pin').value = '';
            document.getElementById('pin').focus();
        }
    }

    // Handle emergency access
    function handleEmergencyAccess() {
        login(ROLES.EMERGENCY);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('emergencyModal'));
        if (modal) modal.hide();
    }

    // Verify PIN against role
    function verifyPIN(selectedRole, pin) {
        switch (selectedRole) {
            case 'faculty':
                return pin === CONFIG.PINS.FACULTY ? ROLES.FACULTY : null;
            case 'leader':
                return pin === CONFIG.PINS.LEADER ? ROLES.LEADER : null;
            case 'viewer':
                return pin === CONFIG.PINS.VIEWER ? ROLES.VIEWER : null;
            default:
                return null;
        }
    }

    // Login user with specified role
    function login(role) {
        currentUser = {
            role: role.name,
            permissions: role.permissions,
            icon: role.icon,
            loginTime: new Date().getTime(),
            sessionId: generateSessionId()
        };

        // Save session
        saveSession();

        // Start session timer
        startSessionTimer();

        // Log access (for audit trail)
        logAccess();

        // Show success message
        showAlert(`Welcome ${role.name}!`, 'success');

        // Redirect based on role
        setTimeout(() => {
            if (role === ROLES.EMERGENCY) {
                window.location.href = 'safety.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1000);
    }

    // Logout user
    function logout() {
        // Clear session
        clearSession();

        // Clear current user
        currentUser = null;

        // Clear timer
        if (sessionTimer) {
            clearTimeout(sessionTimer);
            sessionTimer = null;
        }

        // Redirect to login
        window.location.href = 'index.html';
    }

    // Save session to localStorage
    function saveSession() {
        const session = {
            user: currentUser,
            timestamp: new Date().getTime(),
            version: CONFIG.VERSION
        };

        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
    }

    // Load session from localStorage
    function loadSession() {
        const sessionData = localStorage.getItem(CONFIG.SESSION_KEY);

        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);

                // Check if session is expired
                const now = new Date().getTime();
                if (now - session.timestamp < CONFIG.SESSION_DURATION) {
                    currentUser = session.user;
                    startSessionTimer();
                } else {
                    clearSession();
                }
            } catch (e) {
                console.error('Error loading session:', e);
                clearSession();
            }
        }
    }

    // Clear session
    function clearSession() {
        localStorage.removeItem(CONFIG.SESSION_KEY);
    }

    // Start session timer
    function startSessionTimer() {
        if (sessionTimer) {
            clearTimeout(sessionTimer);
        }

        sessionTimer = setTimeout(() => {
            showAlert('Session expired. Please login again.', 'warning');
            logout();
        }, CONFIG.SESSION_DURATION);
    }

    // Check for auto-logout
    function checkAutoLogout() {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = new Date().getTime();

        // Auto logout after 30 minutes of inactivity
        if (lastActivity && (now - lastActivity > 30 * 60 * 1000)) {
            logout();
        }
    }

    // Handle visibility change (tab switch)
    function handleVisibilityChange() {
        if (!document.hidden) {
            // Update last activity time
            localStorage.setItem('lastActivity', new Date().getTime());
        }
    }

    // Generate unique session ID
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Log access for audit trail
    function logAccess() {
        const logs = JSON.parse(localStorage.getItem('accessLogs') || '[]');

        logs.push({
            sessionId: currentUser.sessionId,
            role: currentUser.role,
            loginTime: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.shift();
        }

        localStorage.setItem('accessLogs', JSON.stringify(logs));
    }

    // Toggle PIN visibility
    function togglePinVisibility() {
        const pinField = document.getElementById('pin');
        const toggleBtn = document.getElementById('togglePin');

        if (pinField.type === 'password') {
            pinField.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            pinField.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    // Show alert message
    function showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.auth-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show auth-alert mt-3`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert after card
        const card = document.querySelector('.card');
        if (card) {
            card.parentNode.insertBefore(alertDiv, card.nextSibling);
        }
    }

    // Public API
    return {
        init: init,
        login: login,
        logout: logout,
        getCurrentUser: () => currentUser,
        hasPermission: (permission) => {
            if (!currentUser) return false;
            return currentUser.permissions[permission] === true;
        },
        isLoggedIn: () => currentUser !== null,
        getRoleName: () => currentUser ? currentUser.role : null,
        getRoleIcon: () => currentUser ? currentUser.icon : null,
        extendSession: () => {
            if (currentUser) {
                currentUser.loginTime = new Date().getTime();
                saveSession();
                startSessionTimer();
            }
        }
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    AuthSystem.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}