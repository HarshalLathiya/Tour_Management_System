import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pool from './db';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly!' });
});

// Database connection test route
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected successfully!', result: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

// Tours endpoints
app.get('/api/tours', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tours ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours.' });
  }
});

app.post('/api/tours', async (req, res) => {
  const { name, description, start_date, end_date, destination, price, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tours (name, description, start_date, end_date, destination, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, start_date, end_date, destination, price, status || 'planned']
    );
    res.status(201).json({ id: (result as any).insertId, name, description, start_date, end_date, destination, price, status });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: 'Failed to create tour.' });
  }
});

// Announcements endpoints
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, content, tour_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO announcements (title, content, tour_id) VALUES (?, ?, ?)',
      [title, content, tour_id]
    );
    res.status(201).json({ id: (result as any).insertId, title, content, tour_id });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

// Attendance endpoints
app.get('/api/attendance', async (req, res) => {
  const { itinerary_id } = req.query;
  try {
    let query = 'SELECT * FROM attendance';
    const params = [];
    if (itinerary_id) {
      query += ' WHERE itinerary_id = ?';
      params.push(itinerary_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
});

app.post('/api/attendance', async (req, res) => {
  const { user_id, tour_id, date, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO attendance (user_id, tour_id, date, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
      [user_id, tour_id, date, status, status]
    );
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance.' });
  }
});

// Participants endpoints (Mocked or simple for now)
app.get('/api/tours/:id/participants', async (req, res) => {
  try {
    // In a real app, you'd join with a users/profiles table
    const [rows] = await pool.query('SELECT * FROM users WHERE role = "tourist"');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants.' });
  }
});

// Budgets endpoints
app.get('/api/budgets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM budgets ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
});

// Expenses endpoints
app.get('/api/expenses', async (req, res) => {
  const { tour_id } = req.query;
  try {
    let query = 'SELECT * FROM expenses';
    const params = [];
    if (tour_id) {
      query += ' WHERE tour_id = ?';
      params.push(tour_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { tour_id, amount, category, description } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO expenses (tour_id, amount, category, description) VALUES (?, ?, ?, ?)',
      [tour_id, amount, category, description]
    );
    res.status(201).json({ id: (result as any).insertId, tour_id, amount, category, description });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense.' });
  }
});

// Safety Protocols endpoints
app.get('/api/safety-protocols', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM safety_protocols ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching safety protocols:', error);
    res.status(500).json({ error: 'Failed to fetch safety protocols.' });
  }
});

// Incidents endpoints
app.get('/api/incidents', async (req, res) => {
  const { tour_id } = req.query;
  try {
    let query = 'SELECT * FROM incidents';
    const params = [];
    if (tour_id) {
      query += ' WHERE tour_id = ?';
      params.push(tour_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents.' });
  }
});

app.post('/api/incidents', async (req, res) => {
  const { tour_id, reported_by, title, description, location, severity, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO incidents (tour_id, reported_by, title, description, location, severity, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tour_id, reported_by, title, description, location, severity, status || 'OPEN']
    );
    res.status(201).json({ id: (result as any).insertId, tour_id, reported_by, title, description, location, severity, status });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident.' });
  }
});

app.patch('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE incidents SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Incident updated successfully' });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
