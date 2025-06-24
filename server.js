const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const User = require('./models/user');

// Configura variabili ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connesso');
}).catch(err => {
  console.error('❌ Errore connessione MongoDB:', err.message);
});

// Setup view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'fidelitycashsupersegreta',
  resave: false,
  saveUninitialized: false
}));

// Rotta principale
app.get('/', (req, res) => {
  res.render('index', { error: null });
});

// Login
app.post('/login', async (req, res) => {
  const { cardCode, username } = req.body;

  try {
    const user = await User.findOne({ cardCode, username });

    if (!user) {
      return res.render('index', { error: 'Account non trovato.' });
    }

    req.session.user = {
      id: user._id,
      isAdmin: user.isAdmin,
    };

    if (user.isAdmin) {
      return res.redirect('/admin');
    } else {
      return res.redirect(`/user/${user._id}`);
    }
  } catch (err) {
    console.error(err);
    res.render('index', { error: 'Errore di accesso.' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Middleware per proteggere le rotte
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/');
}

function isAdmin(req, res, next) {
  if (req.session.user?.isAdmin) return next();
  res.redirect('/');
}

// Rotta admin protetta
app.get('/admin', isAdmin, (req, res) => {
  res.send('<h2>Benvenuto nella Dashboard Admin</h2><a href="/logout">Logout</a>');
});

// Rotta utente
app.get('/user/:id', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.redirect('/');
  res.send(`<h2>Ciao ${user.username}, hai ${user.points} CashPoints!</h2><a href="/logout">Logout</a>`);
});

// Avvia server
app.listen(PORT, () => {
  console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});