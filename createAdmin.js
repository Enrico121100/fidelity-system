// ✅ FILE: server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// MONGOOSE SETUP
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connesso'))
  .catch((err) => console.error('❌ Errore MongoDB:', err.message));

// MODELLI
const User = mongoose.model('User', new mongoose.Schema({
  cardCode: String,
  username: String,
  points: { type: Number, default: 0 },
}));

// CONFIGURAZIONI
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'segreto-fidelity-cash',
  resave: false,
  saveUninitialized: false,
}));

// 🔒 MIDDLEWARE PROTEZIONE
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/?error=accesso');
}

function isAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/?error=accesso');

  const { cardCode, username } = req.session.user;
  if (cardCode === 'Sicilia1211' && username === 'Admin') {
    return next();
  }
  return res.redirect('/?error=admin');
}

// ROTTE
app.get('/', (req, res) => {
  res.render('index', { error: req.query.error });
});

app.post('/login', async (req, res) => {
  const { cardCode, username } = req.body;
  const user = await User.findOne({ cardCode, username });

  if (!user) {
    return res.redirect('/?error=notfound');
  }

  req.session.user = {
    id: user._id,
    cardCode: user.cardCode,
    username: user.username,
  };

  if (cardCode === 'Sicilia1211' && username === 'Admin') {
    return res.redirect('/admin');
  } else {
    return res.redirect('/utente');
  }
});

app.get('/admin', isAdmin, async (req, res) => {
  const utenti = await User.find({ cardCode: { $ne: 'Sicilia1211' } });
  res.render('admin', { utenti });
});

app.post('/admin/aggiungi-utente', isAdmin, async (req, res) => {
  const { cardCode, username } = req.body;
  await User.create({ cardCode, username });
  res.redirect('/admin');
});

app.post('/admin/aggiungi-punti', isAdmin, async (req, res) => {
  const { userId, punti } = req.body;
  await User.findByIdAndUpdate(userId, { $inc: { points: parseInt(punti) } });
  res.redirect('/admin');
});

app.get('/utente', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  res.render('utente', { user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.use((req, res) => {
  res.status(404).redirect('/');
});

app.listen(PORT, () => {
  console.log(`✅ Server attivo sulla porta ${PORT}`);
});