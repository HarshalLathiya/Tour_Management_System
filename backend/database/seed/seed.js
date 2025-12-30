const mongoose = require('mongoose');
const User = require('../../src/models/User.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tour_management';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ email: 'admin@tourmanagement.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const admin = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@tourmanagement.com',
            password: 'Admin123!',
            role: 'admin',
            isActive: true
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@tourmanagement.com');
        console.log('Password: Admin123!');
        
        const organizer = new User({
            firstName: 'Organizer',
            lastName: 'User',
            email: 'organizer@tourmanagement.com',
            password: 'Organizer123!',
            role: 'organizer',
            isActive: true
        });
        
        await organizer.save();
        console.log('Organizer user created');
        
        const participant = new User({
            firstName: 'Participant',
            lastName: 'User',
            email: 'participant@tourmanagement.com',
            password: 'Participant123!',
            role: 'participant',
            isActive: true
        });
        
        await participant.save();
        console.log('Participant user created');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedAdmin();
