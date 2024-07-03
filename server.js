const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const moment = require('moment');
const path = require('path');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'expense',
  password: 'postgres',
  port: 5432,
});

app.use(bodyParser.json());

// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Add an expense
app.post('/api/expenses', async (req, res) => {
  const { expense_name, expense_category, amount, expense_date } = req.body;
  const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
  const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO expenses (expense_name, expense_category, amount, expense_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [expense_name, expense_category, amount, expense_date, created_at, updated_at]
    );
    client.release();
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).send('Error adding expense');
  }
});

// Edit an expense
app.put('/api/expenses/:id', async (req, res) => {
  const { expense_name, expense_category, amount, expense_date } = req.body;
  const updated_at = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE expenses SET expense_name = $1, expense_category = $2, amount = $3, expense_date = $4, updated_at = $5 WHERE id = $6 RETURNING *',
      [expense_name, expense_category, amount, expense_date, updated_at, req.params.id]
    );
    client.release();
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).send('Error updating expense');
  }
});

// Delete an expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
    client.release();
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).send('Error deleting expense');
  }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving expenses:', err);
    res.status(500).send('Error retrieving expenses');
  }
});

// Get expenses by category
app.get('/api/expenses/category/:category', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM expenses WHERE expense_category = $1 ORDER BY expense_date DESC', [req.params.category]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving expenses by category:', err);
    res.status(500).send('Error retrieving expenses by category');
  }
});

// Get expenses by month and year
app.get('/api/expenses/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const startOfMonth = moment(`${year}-${month}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
  const endOfMonth = moment(startOfMonth).endOf('month').format('YYYY-MM-DD');

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM expenses WHERE expense_date BETWEEN $1 AND $2 ORDER BY expense_date DESC', [startOfMonth, endOfMonth]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving expenses by month and year:', err);
    res.status(500).send('Error retrieving expenses by month and year');
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
