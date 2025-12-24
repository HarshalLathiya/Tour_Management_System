import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    hotelName: String,
    location: String,
    checkIn: Date,
    checkOut: Date,
    contactNumber: String
}, { timestamps: true });

export default mongoose.model('Accommodation', accommodationSchema);
