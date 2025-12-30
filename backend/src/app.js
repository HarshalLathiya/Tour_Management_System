const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler } = require('./middlewares/error.middleware');
const { requestLogger } = require('./config/logger');
// Routes
const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const tourRoutes = require('./routes/tour.routes');
// const budgetRoutes = require('./routes/budget.routes');
// const expenseRoutes = require('./routes/expense.routes');
// const participantRoutes = require('./routes/participant.routes');
// const accommodationRoutes = require('./routes/accommodation.routes');
// const transportRoutes = require('./routes/transport.routes');
// const incidentRoutes = require('./routes/incident.routes');
// const organizationRoutes = require('./routes/organization.routes');
// const reportRoutes = require('./routes/report.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Logging
// app.use(morgan('combined', { stream: requestLogger }));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/tours', tourRoutes);
// app.use('/api/budgets', budgetRoutes);
// app.use('/api/expenses', expenseRoutes);
// app.use('/api/participants', participantRoutes);
// app.use('/api/accommodations', accommodationRoutes);
// app.use('/api/transports', transportRoutes);
// app.use('/api/incidents', incidentRoutes);
// app.use('/api/organizations', organizationRoutes);
// app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

module.exports = app;