const User = require("./user.model");
const Service = require("./service.model");
const Order = require("./order.model");
const VirtualMachine = require("./vm.model");
const { Wallet, WalletTransaction } = require("./wallet.model");
const Ticket = require("./ticket.model");
const Comment = require("./comment.model");

console.log("Initializing model relationships...");

// Define Ticket associations
User.hasMany(Ticket, { foreignKey: "createdBy", as: "CreatedTickets" });
User.hasMany(Ticket, { foreignKey: "assignedTo", as: "AssignedTickets" });
Ticket.belongsTo(User, { foreignKey: "createdBy", as: "Creator" });
Ticket.belongsTo(User, { foreignKey: "assignedTo", as: "Assignee" });

// Define Comment associations
User.hasMany(Comment, { foreignKey: "userId" });
Ticket.hasMany(Comment, { foreignKey: "ticketId" });
Comment.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(Ticket, { foreignKey: "ticketId" });

// Export all models
module.exports = {
  User,
  Service,
  Order,
  VirtualMachine,
  Wallet,
  WalletTransaction,
  Ticket,
  Comment,
};
