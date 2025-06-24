require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔎 MONGO_URI:', process.env.MONGO_URI); // Debug
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connesso ✅');
  } catch (err) {
    console.error('Errore connessione MongoDB ❌', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;