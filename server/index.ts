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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
