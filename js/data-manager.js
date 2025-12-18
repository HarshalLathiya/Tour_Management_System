/**
 * Tour Support System - Data Manager
 * Handles LocalStorage operations with versioning and integrity checks
 * Version: 1.2
 */

const DataManager = (function () {
    // Configuration
    const CONFIG = {
        STORAGE_KEY: 'tourSystem_v1.2',
        BACKUP_KEY: 'tourSystem_backup',
        VERSION: '1.2',
        AUTO_SAVE_INTERVAL: 30000, // 30 seconds
        MAX_BACKUPS: 5,
        EXPIRY_DAYS: 7
    };

    // Data schema definition
    const SCHEMA = {
        tourInfo: {
            name: 'Educational Tour 2024',
            college: 'Kamani Science and Prataprai Arts College, Amreli',
            academicYear: '2023-2024',
            dates: { start: '2024-03-10', end: '2024-03-15' },
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
            tourEndDate: '2024-03-15',
            autoCleanupDate: null
        }
    };

    // Initialize data manager
    function init() {
        // Check if data exists
        if (!localStorage.getItem(CONFIG.STORAGE_KEY)) {
            // Load sample data
            loadSampleData();
        } else {
            // Validate existing data
            validateAndMigrate();
        }

        // Setup auto-save
        setupAutoSave();

        // Check for data expiry
        checkExpiry();

        // Setup backup system
        setupBackupSystem();
    }

    // Load sample data
    function loadSampleData() {
        try {
            // Create sample data structure
            const sampleData = {
                ...SCHEMA,
                tourInfo: {
                    ...SCHEMA.tourInfo,
                    faculty: [
                        {
                            id: 1,
                            name: 'Dr. Ramesh Patel',
                            role: 'Tour Incharge',
                            contact: '+91-98765XXXXX',
                            email: 'ramesh.patel@college.edu'
                        },
                        {
                            id: 2,
                            name: 'Prof. Sunita Sharma',
                            role: 'Co-Incharge',
                            contact: '+91-98765XXXXY',
                            email: 'sunita.sharma@college.edu'
                        }
                    ],
                    studentLeaders: [
                        {
                            id: 1,
                            name: 'Priya Sharma',
                            rollNumber: 'BCA-101',
                            division: 'A',
                            contact: '+91-98765XXXXZ',
                            responsibilities: 'Attendance & Coordination'
                        },
                        {
                            id: 2,
                            name: 'Rajesh Kumar',
                            rollNumber: 'BCA-105',
                            division: 'B',
                            contact: '+91-98765XXXXW',
                            responsibilities: 'Safety & First Aid'
                        }
                    ],
                    emergencyInstructions: 'In case of emergency, immediately contact faculty incharge and follow safety protocols.'
                },
                students: generateSampleStudents(),
                attendance: generateSampleAttendance(),
                itinerary: generateSampleItinerary(),
                safety: generateSampleSafety(),
                documents: generateSampleDocuments()
            };

            // Calculate auto-cleanup date (7 days after tour ends)
            const tourEnd = new Date(sampleData.tourInfo.dates.end);
            tourEnd.setDate(tourEnd.getDate() + CONFIG.EXPIRY_DAYS);
            sampleData.metadata.autoCleanupDate = tourEnd.toISOString();

            // Save to localStorage
            saveData(sampleData);

            console.log('Sample data loaded successfully');

        } catch (error) {
            console.error('Error loading sample data:', error);
            throw new Error('Failed to initialize sample data');
        }
    }

    // Generate sample students
    function generateSampleStudents() {
        const divisions = ['A', 'B'];
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        const sampleNames = [
            'Amit Kumar', 'Priya Singh', 'Rajesh Patel', 'Sunita Verma',
            'Mohan Das', 'Neha Gupta', 'Rahul Sharma', 'Pooja Mehta',
            'Sanjay Roy', 'Anjali Kapoor', 'Vikram Singh', 'Deepa Nair',
            'Karan Malhotra', 'Swati Joshi', 'Rohan Desai'
        ];

        return sampleNames.map((name, index) => ({
            id: index + 1,
            fullName: name,
            rollNumber: `BCA-${String(index + 1).padStart(3, '0')}`,
            division: divisions[index % divisions.length],
            emergencyContact: `+91-98765${String(10000 + index).slice(1)}`,
            bloodGroup: bloodGroups[index % bloodGroups.length],
            healthAlert: index % 5 === 0, // 20% have health alerts
            healthNotes: index % 5 === 0 ? 'Has mild asthma, carries inhaler' : '',
            notes: '',
            checkedIn: false,
            lastSeen: null
        }));
    }

    // Generate sample attendance
    function generateSampleAttendance() {
        const dates = ['2024-03-10', '2024-03-11', '2024-03-12', '2024-03-13'];
        const places = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat'];
        const statuses = ['present', 'absent', 'permission'];

        return dates.map((date, index) => ({
            date: date,
            place: places[index],
            records: generateSampleStudents().slice(0, 10).map(student => ({
                studentId: student.id,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                timestamp: `${date} 09:00`,
                markedBy: 'system',
                notes: ''
            }))
        }));
    }

    // Generate sample itinerary
    function generateSampleItinerary() {
        return [
            {
                id: 1,
                date: '2024-03-10',
                place: 'Ahmedabad',
                reportingTime: '08:00',
                departureTime: '06:00',
                purpose: 'Visit to Science City and Educational Institutions',
                educationalRelevance: 'Understanding practical applications of computer science in research facilities',
                travelNotes: 'College bus departure at 06:00 from main gate. Estimated travel time: 2 hours.',
                emergencyContacts: {
                    hospital: 'Civil Hospital, Ahmedabad - 079-2268XXXX',
                    police: 'Madhupura Police Station - 100',
                    faculty: 'Dr. Ramesh Patel - +91-98765XXXXX'
                },
                coordinates: { lat: 23.0225, lng: 72.5714 }
            },
            {
                id: 2,
                date: '2024-03-11',
                place: 'Gandhinagar',
                reportingTime: '09:00',
                departureTime: '07:30',
                purpose: 'Visit to Government Technology Park',
                educationalRelevance: 'Exposure to government IT infrastructure and e-governance projects',
                travelNotes: 'Travel by hired bus. Carry water bottles and snacks.',
                emergencyContacts: {
                    hospital: 'General Hospital, Gandhinagar - 079-2325XXXX',
                    police: 'Sector 21 Police Station - 100',
                    faculty: 'Prof. Sunita Sharma - +91-98765XXXXY'
                },
                coordinates: { lat: 23.2156, lng: 72.6369 }
            }
        ];
    }

    // Generate sample safety data
    function generateSampleSafety() {
        return {
            emergencyContacts: [
                { type: 'Ambulance', number: '108', location: 'All Gujarat' },
                { type: 'Police', number: '100', location: 'Emergency' },
                { type: 'Fire', number: '101', location: 'Emergency' },
                { type: 'Women Helpline', number: '1091', location: '24x7' },
                { type: 'Tour Incharge', number: '+91-98765XXXXX', location: 'Primary Contact' }
            ],
            healthAlerts: [
                { studentId: 5, alert: 'Mild asthma', medication: 'Inhaler', contact: 'Faculty Incharge' },
                { studentId: 10, alert: 'Allergy to nuts', medication: 'Antihistamines', contact: 'Student Leader' }
            ],
            firstAid: [
                'For minor cuts: Clean with antiseptic and apply bandage',
                'For fever: Provide paracetamol (if available) and monitor temperature',
                'For dehydration: Provide ORS solution and rest in shade',
                'For asthma attack: Help use inhaler, keep in sitting position',
                'Emergency: Call 108 immediately for any serious condition'
            ],
            guidelines: [
                'Always travel in groups of at least 3 students',
                'Carry college ID card at all times',
                'Report any unusual incident immediately to faculty',
                'Stay hydrated and protect from sun exposure',
                'Follow COVID-19 safety protocols if applicable'
            ]
        };
    }

    // Generate sample documents
    function generateSampleDocuments() {
        return [
            {
                id: 1,
                title: 'College Tour Rules',
                content: 'All students must follow college code of conduct...',
                category: 'Rules'
            },
            {
                id: 2,
                title: 'Emergency Protocol',
                content: 'In case of emergency: 1. Stay calm 2. Contact faculty...',
                category: 'Safety'
            }
        ];
    }

    // Validate and migrate existing data
    function validateAndMigrate() {
        try {
            const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY));

            // Check version
            if (!data.metadata || data.metadata.version !== CONFIG.VERSION) {
                console.log('Migrating data to new version...');
                migrateData(data);
            }

            // Validate required fields
            if (!data.tourInfo || !data.students || !data.attendance) {
                throw new Error('Invalid data structure');
            }

            // Update last modified
            data.metadata.lastModified = new Date().toISOString();
            saveData(data);

        } catch (error) {
            console.error('Data validation failed:', error);
            // Create backup before resetting
            createBackup();
            // Reload sample data
            loadSampleData();
        }
    }

    // Migrate data to new version
    function migrateData(oldData) {
        // Create backup of old data
        createBackup('pre_migration');

        // Migration logic based on version
        const newData = {
            ...SCHEMA,
            ...oldData,
            metadata: {
                ...SCHEMA.metadata,
                ...oldData.metadata,
                version: CONFIG.VERSION,
                lastModified: new Date().toISOString()
            }
        };

        // Ensure all required arrays exist
        newData.students = newData.students || [];
        newData.attendance = newData.attendance || [];
        newData.itinerary = newData.itinerary || [];

        saveData(newData);
    }

    // Save data to localStorage
    function saveData(data) {
        try {
            // Update metadata
            data.metadata.lastModified = new Date().toISOString();
            data.metadata.lastModifiedBy = AuthSystem.getRoleName() || 'system';

            // Stringify with pretty print for debugging
            const jsonString = JSON.stringify(data, null, 2);

            // Save to localStorage
            localStorage.setItem(CONFIG.STORAGE_KEY, jsonString);

            // Trigger save event
            document.dispatchEvent(new CustomEvent('dataSaved', {
                detail: { timestamp: new Date().toISOString() }
            }));

            return true;

        } catch (error) {
            console.error('Error saving data:', error);

            // Try to save to backup if main save fails
            try {
                localStorage.setItem(CONFIG.BACKUP_KEY + '_emergency', JSON.stringify(data));
            } catch (e) {
                console.error('Emergency backup also failed:', e);
            }

            return false;
        }
    }

    // Get all data
    function getAllData() {
        try {
            const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY));

            if (!data) {
                throw new Error('No data found');
            }

            return data;

        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }

    // Get specific data section
    function getData(section) {
        const data = getAllData();
        return data ? data[section] : null;
    }

    // Update specific data section
    function updateData(section, newData) {
        const allData = getAllData();

        if (!allData) {
            throw new Error('No data available to update');
        }

        allData[section] = newData;
        return saveData(allData);
    }

    // Add item to array section
    function addItem(section, item) {
        const sectionData = getData(section) || [];
        sectionData.push(item);
        return updateData(section, sectionData);
    }

    // Update item in array section
    function updateItem(section, itemId, updates) {
        const sectionData = getData(section) || [];
        const index = sectionData.findIndex(item => item.id === itemId);

        if (index !== -1) {
            sectionData[index] = { ...sectionData[index], ...updates };
            return updateData(section, sectionData);
        }

        return false;
    }

    // Delete item from array section
    function deleteItem(section, itemId) {
        const sectionData = getData(section) || [];
        const filteredData = sectionData.filter(item => item.id !== itemId);
        return updateData(section, filteredData);
    }

    // Setup auto-save
    function setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            const data = getAllData();
            if (data) {
                saveData(data);
            }
        }, CONFIG.AUTO_SAVE_INTERVAL);

        // Also save on page unload
        window.addEventListener('beforeunload', () => {
            const data = getAllData();
            if (data) {
                saveData(data);
            }
        });
    }

    // Check data expiry
    function checkExpiry() {
        const data = getAllData();

        if (data && data.metadata.autoCleanupDate) {
            const cleanupDate = new Date(data.metadata.autoCleanupDate);
            const now = new Date();

            if (now > cleanupDate) {
                if (confirm('Tour data has expired. Clear all data?')) {
                    clearAllData();
                }
            }
        }
    }

    // Clear all data
    function clearAllData() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        localStorage.removeItem(CONFIG.BACKUP_KEY);
        console.log('All data cleared');
    }

    // Setup backup system
    function setupBackupSystem() {
        // Create daily backup
        const lastBackup = localStorage.getItem('lastBackupDate');
        const today = new Date().toDateString();

        if (lastBackup !== today) {
            createBackup('daily');
            localStorage.setItem('lastBackupDate', today);
        }
    }

    // Create backup
    function createBackup(type = 'manual') {
        try {
            const data = getAllData();
            if (!data) return;

            const backups = JSON.parse(localStorage.getItem('dataBackups') || '[]');

            backups.push({
                timestamp: new Date().toISOString(),
                type: type,
                data: data
            });

            // Keep only last N backups
            if (backups.length > CONFIG.MAX_BACKUPS) {
                backups.shift();
            }

            localStorage.setItem('dataBackups', JSON.stringify(backups));

        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }

    // Export data as JSON file
    function exportData() {
        const data = getAllData();
        if (!data) return null;

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        return url;
    }

    // Import data from JSON file
    function importData(jsonString) {
        try {
            const newData = JSON.parse(jsonString);

            // Validate imported data
            if (!newData.tourInfo || !newData.students) {
                throw new Error('Invalid data format');
            }

            // Create backup before import
            createBackup('pre_import');

            // Save imported data
            saveData(newData);

            return true;

        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Public API
    return {
        init: init,
        getAllData: getAllData,
        getData: getData,
        updateData: updateData,
        addItem: addItem,
        updateItem: updateItem,
        deleteItem: deleteItem,
        exportData: exportData,
        importData: importData,
        createBackup: createBackup,
        clearAllData: clearAllData,
        getConfig: () => CONFIG,
        getSchema: () => SCHEMA
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    DataManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}