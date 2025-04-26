const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/error');
const { Op } = require('sequelize');

/**
 * Get all tickets with pagination and filtering
 */
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    // Build query conditions
    const where = { createdBy: userId };
    if (status) where.status = status;
    
    // Calculate offset for pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    
    // Get tickets with pagination
    const tickets = await Ticket.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'Assignee',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
      }]
    });
    
    // Format response similar to mongoose-paginate
    const response = {
      docs: tickets.rows,
      totalDocs: tickets.count,
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      totalPages: Math.ceil(tickets.count / parseInt(limit, 10)),
      hasPrevPage: parseInt(page, 10) > 1,
      hasNextPage: parseInt(page, 10) < Math.ceil(tickets.count / parseInt(limit, 10)),
      prevPage: parseInt(page, 10) > 1 ? parseInt(page, 10) - 1 : null,
      nextPage: parseInt(page, 10) < Math.ceil(tickets.count / parseInt(limit, 10)) ? parseInt(page, 10) + 1 : null
    };
    
    res.status(200).json({
      success: true,
      data: response
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
    
    // Find ticket with user data
    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
        },
        {
          model: User,
          as: 'Assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
        }
      ]
    });
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has access to the ticket
    if (ticket.createdBy !== userId && 
        (ticket.assignedTo && ticket.assignedTo !== userId)) {
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
    
    const newTicket = await Ticket.create({
      subject,
      description,
      priority,
      status: 'open',
      createdBy: userId,
      attachments: attachments || []
    });
    
    // Get the populated ticket with user data
    const populatedTicket = await Ticket.findByPk(newTicket.id, {
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
      }]
    });
    
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
    
    // Find the ticket
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has permission to update the ticket
    if (ticket.createdBy !== userId) {
      return next(new ApiError('Unauthorized to update this ticket', 403));
    }
    
    // Update fields
    const updateData = {};
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (assignedTo) {
      // Validate if assignedTo is a valid user
      const userExists = await User.findByPk(assignedTo);
      if (userExists) {
        updateData.assignedTo = assignedTo;
      } else {
        return next(new ApiError('Assigned user not found', 400));
      }
    }
    
    // Update the ticket
    await ticket.update(updateData);
    
    // Get the updated ticket with user data
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
        },
        {
          model: User,
          as: 'Assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedTicket
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
    
    // Find the ticket
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has permission to delete the ticket
    if (ticket.createdBy !== userId) {
      return next(new ApiError('Unauthorized to delete this ticket', 403));
    }
    
    // Delete associated comments
    await Comment.destroy({ where: { ticketId: id } });
    
    // Delete the ticket
    await ticket.destroy();
    
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
    
    // Check if ticket exists
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Create a new comment
    const newComment = await Comment.create({
      content,
      userId,
      ticketId: id,
      attachments: attachments || []
    });
    
    // Update ticket's lastActivity
    await ticket.update({ lastActivity: new Date() });
    
    // Get the populated comment with user data
    const populatedComment = await Comment.findByPk(newComment.id, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
      }]
    });
    
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
    
    // Check if ticket exists and user has access
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return next(new ApiError('Ticket not found', 404));
    }
    
    // Check if user has access to the ticket
    if (ticket.createdBy !== userId && 
        (ticket.assignedTo && ticket.assignedTo !== userId)) {
      return next(new ApiError('Unauthorized to access this ticket', 403));
    }
    
    // Get comments
    const comments = await Comment.findAll({
      where: { ticketId: id },
      order: [['createdAt', 'ASC']],
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
      }]
    });
    
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    logger.error('Error in getComments:', error);
    next(error);
  }
}; 