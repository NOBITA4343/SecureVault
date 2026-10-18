const Vault = require('../models/Vault');
const crypto = require('crypto');
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    Buffer.alloc(16, 0)
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};

// Get all vault entries
const getVaultEntries = async (req, res) => {
  try {
    // BUG #8: No pagination — returns ALL records at once
    // BUG #5: Returns all users' entries, not just logged-in user's
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const entries = await Vault.find({ userId: req.user._id }).skip(skip).limit(limit);

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add vault entry
const addVaultEntry = async (req, res) => {
  const { siteName, siteUrl, username, password, category, notes } = req.body;

  try {
    // BUG #2: Password stored in plain text — no encryption applied
    const entry = await Vault.create({
      userId: req.user._id,
      siteName,
      siteUrl,
      username,
      password: encrypt(password), // plain text stored directly
      category,
      notes
    });

    res.status(201).json({ message: 'Entry added successfully', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update vault entry
const updateVaultEntry = async (req, res) => {
  const { id } = req.params;
  const { siteName, siteUrl, username, password, category, notes } = req.body;

  try {
    const entry = await Vault.findByIdAndUpdate(
      id,
      { siteName, siteUrl, username, password, category, notes },
      { new: true }
    );

    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    res.status(200).json({ message: 'Entry updated', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete vault entry
const deleteVaultEntry = async (req, res) => {
  const { id } = req.params;

  try {
    // BUG #7: No ownership check — any logged-in user can delete any entry
    const entry = await Vault.findOne({
          _id: id,
           userId: req.user._id
      });

      if (!entry) return res.status(403).json({ message: 'Not authorized to delete this entry' });

      await Vault.findByIdAndDelete(id);

    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search vault entries
const searchVaultEntries = async (req, res) => {
  const { query } = req.query;

  try {
    // BUG #5: Search returns all users' matching entries, not just logged-in user's
   const entries = await Vault.find({
  userId: req.user._id,
  siteName: { $regex: query, $options: 'i' }
});

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVaultEntries,
  addVaultEntry,
  updateVaultEntry,
  deleteVaultEntry,
  searchVaultEntries
};
