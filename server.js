require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());

// Connetti al DB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('Fidelity Card API Attiva ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server attivo sulla porta ${PORT}`));