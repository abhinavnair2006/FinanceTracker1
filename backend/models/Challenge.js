const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  target: { type: Number, required: true, min: 0.01 },
  saved: { type: Number, default: 0, min: 0 },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
