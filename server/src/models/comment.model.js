const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  attachments: [{
    type: String,
    trim: true
  }],
  isStaff: {
    type: Boolean,
    default: false
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
commentSchema.index({ ticket: 1, createdAt: 1 });
commentSchema.index({ user: 1 });

module.exports = mongoose.model('Comment', commentSchema); 