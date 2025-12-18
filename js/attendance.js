/**
 * Tour Support System - Attendance Module
 * Handles attendance marking, tracking, and reporting
 * Version: 1.0
 */

const AttendanceManager = (function () {
    // Attendance status definitions
    const STATUS = {
        PRESENT: {
            code: 'present',
            label: 'Present',
            icon: 'fas fa-check-circle',
            color: 'success',
            badgeClass: 'status-present'
        },
        ABSENT: {
            code: 'absent',
            label: 'Absent',
            icon: 'fas fa-times-circle',
            color: 'danger',
            badgeClass: 'status-absent'
        },
        PERMISSION: {
            code: 'permission',
            label: 'With Permission',
            icon: 'fas fa-user-clock',
            color: 'warning',
            badgeClass: 'status-permission'
        }
    };

    // Current attendance session
    let currentSession = null;
    let qrScanner = null;

    // Initialize attendance module
    function init() {
        if (!AuthSystem.hasPermission('editAttendance') &&
            !AuthSystem.hasPermission('viewDashboard')) {
            return; // No permission
        }

        loadCurrentSession();
        setupEventListeners();
        updateAttendanceDisplay();
    }

    // Load current attendance session
    function loadCurrentSession() {
        const today = new Date().toISOString().split('T')[0];
        const itinerary = DataManager.getData('itinerary') || [];

        // Find today's itinerary item
        const todayItinerary = itinerary.find(item => item.date === today);

        if (todayItinerary) {
            currentSession = {
                date: today,
                place: todayItinerary.place,
                itineraryId: todayItinerary.id,
                records: getAttendanceRecords(today)
            };
        }
    }

    // Get attendance records for a date
    function getAttendanceRecords(date) {
        const attendanceData = DataManager.getData('attendance') || [];
        const dateAttendance = attendanceData.find(a => a.date === date);

        if (dateAttendance) {
            return dateAttendance.records;
        }

        // Create new attendance record for date
        const students = DataManager.getData('students') || [];
        const newRecords = students.map(student => ({
            studentId: student.id,
            status: 'absent', // Default to absent
            timestamp: null,
            markedBy: null,
            notes: ''
        }));

        return newRecords;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Status change buttons
        document.addEventListener('click', function (e) {
            if (e.target.matches('.attendance-status-btn')) {
                const studentId = parseInt(e.target.dataset.studentId);
                const status = e.target.dataset.status;
                markAttendance(studentId, status);
            }

            if (e.target.matches('.mark-all-present')) {
                markAllPresent();
            }

            if (e.target.matches('.start-qr-scan')) {
                startQRScan();
            }

            if (e.target.matches('.export-attendance')) {
                exportAttendanceReport();
            }
        });

        // Notes input
        document.addEventListener('change', function (e) {
            if (e.target.matches('.attendance-notes')) {
                const studentId = parseInt(e.target.dataset.studentId);
                const notes = e.target.value;
                updateAttendanceNotes(studentId, notes);
            }
        });
    }

    // Mark attendance for a student
    function markAttendance(studentId, status) {
        if (!AuthSystem.hasPermission('editAttendance')) {
            showToast('You do not have permission to edit attendance', 'danger');
            return;
        }

        if (!currentSession) {
            showToast('No active attendance session', 'warning');
            return;
        }

        const student = getStudentById(studentId);
        if (!student) {
            showToast('Student not found', 'danger');
            return;
        }

        // Find or create record
        let record = currentSession.records.find(r => r.studentId === studentId);

        if (!record) {
            record = {
                studentId: studentId,
                status: status,
                timestamp: new Date().toISOString(),
                markedBy: AuthSystem.getRoleName(),
                notes: ''
            };
            currentSession.records.push(record);
        } else {
            record.status = status;
            record.timestamp = new Date().toISOString();
            record.markedBy = AuthSystem.getRoleName();
        }

        // Update student checked-in status
        updateStudentCheckedIn(studentId, status === 'present');

        // Save to data manager
        saveAttendanceSession();

        // Update UI
        updateStudentStatusDisplay(studentId, status);

        // Show confirmation
        showToast(`Marked ${student.fullName} as ${STATUS[status.toUpperCase()].label}`, 'success');

        // Play confirmation sound if enabled
        playConfirmationSound();
    }

    // Mark all students present
    function markAllPresent() {
        if (!AuthSystem.hasPermission('editAttendance')) {
            showToast('Permission denied', 'danger');
            return;
        }

        if (!confirm('Mark all students as present?')) {
            return;
        }

        const students = DataManager.getData('students') || [];

        students.forEach(student => {
            markAttendance(student.id, 'present');
        });

        showToast('All students marked present', 'success');
    }

    // Update attendance notes
    function updateAttendanceNotes(studentId, notes) {
        const record = currentSession.records.find(r => r.studentId === studentId);

        if (record) {
            record.notes = notes;
            saveAttendanceSession();
        }
    }

    // Save attendance session to data manager
    function saveAttendanceSession() {
        if (!currentSession) return;

        const attendanceData = DataManager.getData('attendance') || [];

        // Find existing record for date
        const existingIndex = attendanceData.findIndex(a => a.date === currentSession.date);

        if (existingIndex !== -1) {
            attendanceData[existingIndex] = {
                date: currentSession.date,
                place: currentSession.place,
                records: currentSession.records
            };
        } else {
            attendanceData.push({
                date: currentSession.date,
                place: currentSession.place,
                records: currentSession.records
            });
        }

        DataManager.updateData('attendance', attendanceData);

        // Trigger update event
        document.dispatchEvent(new CustomEvent('attendanceUpdated', {
            detail: { date: currentSession.date, count: currentSession.records.length }
        }));
    }

    // Update student checked-in status
    function updateStudentCheckedIn(studentId, checkedIn) {
        const students = DataManager.getData('students') || [];
        const studentIndex = students.findIndex(s => s.id === studentId);

        if (studentIndex !== -1) {
            students[studentIndex].checkedIn = checkedIn;
            students[studentIndex].lastSeen = checkedIn ? new Date().toISOString() : null;
            DataManager.updateData('students', students);
        }
    }

    // Update UI display
    function updateAttendanceDisplay() {
        if (!currentSession) {
            showNoSessionMessage();
            return;
        }

        updateSessionHeader();
        updateAttendanceTable();
        updateStatistics();
    }

    // Update session header
    function updateSessionHeader() {
        const headerElement = document.getElementById('attendanceHeader');
        if (headerElement) {
            headerElement.innerHTML = `
                <h3>Attendance for ${currentSession.date}</h3>
                <p class="text-muted">
                    <i class="fas fa-map-marker-alt"></i> ${currentSession.place}
                    <span class="ms-3">
                        <i class="fas fa-users"></i> 
                        ${getPresentCount()} of ${currentSession.records.length} present
                    </span>
                </p>
            `;
        }
    }

    // Update attendance table
    function updateAttendanceTable() {
        const tableBody = document.getElementById('attendanceTableBody');
        if (!tableBody) return;

        const students = DataManager.getData('students') || [];
        const canEdit = AuthSystem.hasPermission('editAttendance');

        tableBody.innerHTML = '';

        currentSession.records.forEach(record => {
            const student = getStudentById(record.studentId);
            if (!student) return;

            const status = STATUS[record.status.toUpperCase()] || STATUS.ABSENT;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${student.fullName}</strong><br>
                    <small class="text-muted">${student.rollNumber} | Div ${student.division}</small>
                    ${student.healthAlert ?
                    '<span class="badge bg-danger ms-2 health-alert">Health Alert</span>' : ''}
                </td>
                <td>
                    <span class="status-badge ${status.badgeClass}">
                        <i class="${status.icon} me-1"></i>${status.label}
                    </span>
                </td>
                <td>
                    ${record.timestamp ?
                    `<small>${formatTime(record.timestamp)}<br>by ${record.markedBy}</small>` :
                    '<small class="text-muted">Not marked</small>'}
                </td>
                <td>
                    ${canEdit ? `
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-success attendance-status-btn" 
                                    data-student-id="${student.id}" data-status="present">
                                <i class="fas fa-check"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger attendance-status-btn" 
                                    data-student-id="${student.id}" data-status="absent">
                                <i class="fas fa-times"></i>
                            </button>
                            <button type="button" class="btn btn-outline-warning attendance-status-btn" 
                                    data-student-id="${student.id}" data-status="permission">
                                <i class="fas fa-clock"></i>
                            </button>
                        </div>
                        <input type="text" class="form-control form-control-sm mt-1 attendance-notes" 
                               placeholder="Notes" data-student-id="${student.id}"
                               value="${record.notes || ''}">
                    ` : `
                        <small>${record.notes || 'No notes'}</small>
                    `}
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Update statistics display
    function updateStatistics() {
        const presentCount = getPresentCount();
        const absentCount = getAbsentCount();
        const permissionCount = getPermissionCount();
        const total = currentSession.records.length;

        // Update stats cards if they exist
        const statsContainer = document.getElementById('attendanceStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-value text-success">${presentCount}</div>
                        <div class="stat-label">Present</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-value text-danger">${absentCount}</div>
                        <div class="stat-label">Absent</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-value text-warning">${permissionCount}</div>
                        <div class="stat-label">With Permission</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-value">${total}</div>
                        <div class="stat-label">Total Students</div>
                    </div>
                </div>
            `;
        }

        // Update progress bar
        const progressBar = document.getElementById('attendanceProgress');
        if (progressBar) {
            const percentage = total > 0 ? (presentCount / total) * 100 : 0;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
            progressBar.textContent = `${Math.round(percentage)}%`;
        }
    }

    // Get student by ID
    function getStudentById(studentId) {
        const students = DataManager.getData('students') || [];
        return students.find(s => s.id === studentId);
    }

    // Get count of present students
    function getPresentCount() {
        return currentSession.records.filter(r => r.status === 'present').length;
    }

    // Get count of absent students
    function getAbsentCount() {
        return currentSession.records.filter(r => r.status === 'absent').length;
    }

    // Get count of students with permission
    function getPermissionCount() {
        return currentSession.records.filter(r => r.status === 'permission').length;
    }

    // Update individual student status display
    function updateStudentStatusDisplay(studentId, status) {
        const statusElement = document.querySelector(`[data-student-id="${studentId}"] .status-badge`);
        if (statusElement) {
            const statusObj = STATUS[status.toUpperCase()] || STATUS.ABSENT;
            statusElement.className = `status-badge ${statusObj.badgeClass}`;
            statusElement.innerHTML = `<i class="${statusObj.icon} me-1"></i>${statusObj.label}`;
        }
    }

    // Show no session message
    function showNoSessionMessage() {
        const container = document.getElementById('attendanceContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h3>No Attendance Session Active</h3>
                    <p class="text-muted">There is no scheduled tour activity for today.</p>
                    <button class="btn btn-primary mt-3" onclick="window.location.href='itinerary.html'">
                        <i class="fas fa-calendar-alt me-2"></i>View Itinerary
                    </button>
                </div>
            `;
        }
    }

    // Start QR code scanning
    function startQRScan() {
        if (!AuthSystem.hasPermission('accessQR')) {
            showToast('QR scanning not available for your role', 'warning');
            return;
        }

        // Create QR scanner overlay
        const overlay = document.createElement('div');
        overlay.className = 'qr-scanner-overlay';
        overlay.innerHTML = `
            <div class="qr-scanner-container">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">
                        <i class="fas fa-qrcode me-2"></i>Scan Student QR Code
                    </h5>
                    <button type="button" class="btn-close" id="closeQrScanner"></button>
                </div>
                
                <div id="qr-reader" style="width: 100%"></div>
                
                <div class="mt-3 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Point camera at student's QR code ID
                    </div>
                    <button class="btn btn-outline-secondary" id="manualEntryBtn">
                        <i class="fas fa-keyboard me-2"></i>Manual Entry
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Setup scanner
        setupQRScanner(overlay);

        // Setup close button
        document.getElementById('closeQrScanner').addEventListener('click', () => {
            overlay.remove();
            if (qrScanner) {
                qrScanner.stop();
                qrScanner = null;
            }
        });

        // Manual entry button
        document.getElementById('manualEntryBtn').addEventListener('click', () => {
            overlay.remove();
            showManualEntryDialog();
        });
    }

    // Setup QR scanner
    function setupQRScanner(container) {
        // Check if QR scanner library is available
        if (typeof Html5QrcodeScanner === 'undefined') {
            // Load QR scanner library dynamically
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode@2.3.4/html5-qrcode.min.js';
            script.onload = () => initializeScanner(container);
            document.head.appendChild(script);
        } else {
            initializeScanner(container);
        }
    }

    // Initialize QR scanner
    function initializeScanner(container) {
        try {
            qrScanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: 250 },
                /* verbose= */ false
            );

            qrScanner.render(onQRScanSuccess, onQRScanError);

        } catch (error) {
            console.error('QR Scanner error:', error);
            container.querySelector('#qr-reader').innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    QR Scanner not supported on this device
                </div>
            `;
        }
    }

    // Handle QR scan success
    function onQRScanSuccess(decodedText) {
        try {
            const studentData = JSON.parse(decodedText);

            if (studentData.id && studentData.rollNumber) {
                // Mark student present
                markAttendance(studentData.id, 'present');

                // Close scanner
                const overlay = document.querySelector('.qr-scanner-overlay');
                if (overlay) overlay.remove();

                if (qrScanner) {
                    qrScanner.stop();
                    qrScanner = null;
                }

                // Show success message
                showToast(`Scanned: ${studentData.fullName}`, 'success');

            } else {
                throw new Error('Invalid QR code format');
            }

        } catch (error) {
            console.error('QR decode error:', error);
            showToast('Invalid QR code', 'danger');
        }
    }

    // Handle QR scan error
    function onQRScanError(error) {
        // Silently handle errors - scanner will keep trying
        console.debug('QR scan error:', error);
    }

    // Show manual entry dialog
    function showManualEntryDialog() {
        const students = DataManager.getData('students') || [];

        const options = students.map(student =>
            `<option value="${student.id}">${student.rollNumber} - ${student.fullName}</option>`
        ).join('');

        const dialogHTML = `
            <div class="modal fade" id="manualEntryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-keyboard me-2"></i>Manual Attendance Entry
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Select Student</label>
                                <select class="form-select" id="manualStudentSelect">
                                    <option value="">Choose a student...</option>
                                    ${options}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <div class="btn-group w-100" role="group">
                                    <button type="button" class="btn btn-outline-success" data-status="present">
                                        <i class="fas fa-check me-2"></i>Present
                                    </button>
                                    <button type="button" class="btn btn-outline-warning" data-status="permission">
                                        <i class="fas fa-clock me-2"></i>With Permission
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmManualEntry">
                                <i class="fas fa-check me-2"></i>Mark Attendance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = dialogHTML;
        document.body.appendChild(modalContainer);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('manualEntryModal'));
        modal.show();

        // Setup event listeners
        document.getElementById('confirmManualEntry').addEventListener('click', () => {
            const studentId = document.getElementById('manualStudentSelect').value;
            const status = document.querySelector('.btn-group .btn.active')?.dataset.status || 'present';

            if (!studentId) {
                showToast('Please select a student', 'warning');
                return;
            }

            markAttendance(parseInt(studentId), status);
            modal.hide();

            // Clean up
            setTimeout(() => {
                modalContainer.remove();
            }, 300);
        });

        // Status button selection
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.btn-group .btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Auto-select first status button
        document.querySelector('.btn-group .btn').classList.add('active');
    }

    // Export attendance report
    function exportAttendanceReport() {
        if (!AuthSystem.hasPermission('exportData')) {
            showToast('Export not available for your role', 'warning');
            return;
        }

        const data = DataManager.getAllData();
        if (!data) return;

        // Create CSV content
        let csvContent = "Date,Place,Student Roll No,Student Name,Division,Status,Time Marked,Marked By,Notes\n";

        data.attendance.forEach(session => {
            session.records.forEach(record => {
                const student = getStudentById(record.studentId);
                if (student) {
                    const row = [
                        session.date,
                        session.place,
                        student.rollNumber,
                        student.fullName,
                        student.division,
                        record.status.toUpperCase(),
                        record.timestamp || 'Not marked',
                        record.markedBy || '',
                        `"${(record.notes || '').replace(/"/g, '""')}"`
                    ];

                    csvContent += row.join(',') + '\n';
                }
            });
        });

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Attendance report exported successfully', 'success');
    }

    // Format time for display
    function formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1060;
            `;
            document.body.appendChild(toastContainer);
        }

        // Create toast
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' :
                type === 'danger' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Show toast
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();

        // Remove after hide
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    // Play confirmation sound
    function playConfirmationSound() {
        // Create audio context if allowed
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);

        } catch (error) {
            // Silent fail - audio not essential
        }
    }

    // Public API
    return {
        init: init,
        markAttendance: markAttendance,
        markAllPresent: markAllPresent,
        getCurrentSession: () => currentSession,
        getStatistics: () => ({
            present: getPresentCount(),
            absent: getAbsentCount(),
            permission: getPermissionCount(),
            total: currentSession ? currentSession.records.length : 0
        }),
        exportReport: exportAttendanceReport
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    AttendanceManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttendanceManager;
}