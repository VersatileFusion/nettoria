const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/error');
const mongoose = require('mongoose');

/**
 * Get all tickets with pagination and filtering
 */
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    const query = { createdBy: userId };
    if (status) query.status = status;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: {
        path: 'assignedTo',
        select: 'firstName lastName email profilePicture'
      }
    };
    
    const tickets = await Ticket.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    logger.error('Error in getAllTickets:', error);
    next(error);
  }
};

/**
 * Get ticket by ID
 */
exports.getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError('Invalid ticket ID', 400));
    }
    
    const ticket = await Ticket.findById(id)
      .populate('createdBy', 'firstName lastName email profilePicture')
      .populate('assignedTo', 'firstName lastName email profilePicture');
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has access to the ticket
    if (ticket.createdBy._id.toString() !== userId && 
        (ticket.assignedTo && ticket.assignedTo._id.toString() !== userId)) {
      return next(new ApiError('Unauthorized to access this ticket', 403));
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Error in getTicketById:', error);
    next(error);
  }
};

/**
 * Create a new ticket
 */
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority, attachments } = req.body;
    const userId = req.user.id;
    
    const newTicket = new Ticket({
      subject,
      description,
      priority,
      status: 'open',
      createdBy: userId,
      attachments: attachments || []
    });
    
    const savedTicket = await newTicket.save();
    
    // Populate user data for response
    const populatedTicket = await Ticket.findById(savedTicket._id)
      .populate('createdBy', 'firstName lastName email profilePicture');
    
    res.status(201).json({
      success: true,
      data: populatedTicket
    });
  } catch (error) {
    logger.error('Error in createTicket:', error);
    next(error);
  }
};

/**
 * Update a ticket
 */
exports.updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, description, priority, status, assignedTo } = req.body;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError('Invalid ticket ID', 400));
    }
    
    // Find the ticket
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has permission to update the ticket
    if (ticket.createdBy.toString() !== userId) {
      return next(new ApiError('Unauthorized to update this ticket', 403));
    }
    
    // Update ticket fields if provided
    if (subject) ticket.subject = subject;
    if (description) ticket.description = description;
    if (priority) ticket.priority = priority;
    if (status) ticket.status = status;
    if (assignedTo) {
      // Validate if assignedTo is a valid user
      if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        const userExists = await User.exists({ _id: assignedTo });
        if (userExists) {
          ticket.assignedTo = assignedTo;
        } else {
          return next(new ApiError('Assigned user not found', 400));
        }
      } else {
        return next(new ApiError('Invalid user ID for assignment', 400));
      }
    }
    
    // Add update timestamp
    ticket.updatedAt = Date.now();
    
    // Save the updated ticket
    const updatedTicket = await ticket.save();
    
    // Populate user data for response
    const populatedTicket = await Ticket.findById(updatedTicket._id)
      .populate('createdBy', 'firstName lastName email profilePicture')
      .populate('assignedTo', 'firstName lastName email profilePicture');
    
    res.status(200).json({
      success: true,
      data: populatedTicket
    });
  } catch (error) {
    logger.error('Error in updateTicket:', error);
    next(error);
  }
};

/**
 * Delete a ticket
 */
exports.deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError('Invalid ticket ID', 400));
    }
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has permission to delete the ticket
    if (ticket.createdBy.toString() !== userId) {
      return next(new ApiError('Unauthorized to delete this ticket', 403));
    }
    
    // Delete associated comments
    await Comment.deleteMany({ ticket: id });
    
    // Delete the ticket
    await Ticket.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteTicket:', error);
    next(error);
  }
};

/**
 * Add a comment to a ticket
 */
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError('Invalid ticket ID', 400));
    }
    
    // Check if ticket exists
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Create a new comment
    const newComment = new Comment({
      content,
      user: userId,
      ticket: id,
      attachments: attachments || []
    });
    
    const savedComment = await newComment.save();
    
    // Update ticket's lastActivity
    ticket.lastActivity = Date.now();
    await ticket.save();
    
    // Populate user data for response
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('user', 'firstName lastName email profilePicture');
    
    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    logger.error('Error in addComment:', error);
    next(error);
  }
};

/**
 * Get all comments for a ticket
 */
exports.getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError('Invalid ticket ID', 400));
    }
    
    // Check if ticket exists and user has access
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has access to the ticket
    if (ticket.createdBy.toString() !== userId && 
        (ticket.assignedTo && ticket.assignedTo.toString() !== userId)) {
      return next(new ApiError('Unauthorized to access this ticket', 403));
    }
    
    // Get comments
    const comments = await Comment.find({ ticket: id })
      .sort({ createdAt: 1 })
      .populate('user', 'firstName lastName email profilePicture');
    
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    logger.error('Error in getComments:', error);
    next(error);
  }
}; 