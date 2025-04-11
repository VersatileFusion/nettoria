const User = require('./user.model');
const Service = require('./service.model');
const Order = require('./order.model');
const VirtualMachine = require('./vm.model');
const { Wallet, WalletTransaction } = require('./wallet.model');
const { Ticket, TicketMessage, TicketAttachment } = require('./ticket.model');

console.log('Initializing model relationships...');

// Export all models
module.exports = {
  User,
  Service,
  Order,
  VirtualMachine,
  Wallet,
  WalletTransaction,
  Ticket,
  TicketMessage,
  TicketAttachment
}; 