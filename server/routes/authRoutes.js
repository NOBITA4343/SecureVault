const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// BUG #3: No Joi validation middleware applied to register or login
// Any malformed or empty data passes through directly to controller
const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required()
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  next();
};
router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/logout', protect, logout);

module.exports = router;
