const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
//Add
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const exportRoutes = require('./routes/exportRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config({ path: '../.env' });

const app = express();

// BUG #12: CORS misconfigured — accepts requests from any origin
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// BUG #4: No rate limiting on any route — brute force attacks possible
// express-rate-limit is installed but never applied
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' }
});

app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
