// Contact form and ticket management functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeContactForm();
  initializeTickets();
});

// Initialize contact form
function initializeContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
  }
}

// Handle contact form submission
async function handleContactSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const contactData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  try {
    showLoading();
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    const data = await response.json();

    if (response.ok) {
      showToast(
        "Message sent successfully! We will get back to you soon.",
        "success"
      );
      event.target.reset();
    } else {
      throw new Error(data.message || "Failed to send message");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Initialize tickets section
function initializeTickets() {
  const ticketsContainer = document.getElementById("ticketsContainer");
  if (ticketsContainer) {
    loadTickets();
  }
}

// Load user tickets
async function loadTickets() {
  try {
    showLoading();
    const response = await fetch("/api/tickets");
    const data = await response.json();

    if (response.ok) {
      renderTickets(data.tickets);
    } else {
      throw new Error(data.message || "Failed to load tickets");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render tickets in the UI
function renderTickets(tickets) {
  const ticketsContainer = document.getElementById("ticketsContainer");
  if (!ticketsContainer) return;

  if (tickets.length === 0) {
    ticketsContainer.innerHTML = `
            <div class="empty-tickets">
                <i class="fas fa-ticket-alt"></i>
                <p>No tickets found</p>
                <button onclick="createNewTicket()" class="btn btn-primary">Create New Ticket</button>
            </div>
        `;
    return;
  }

  ticketsContainer.innerHTML = tickets
    .map(
      (ticket) => `
        <div class="ticket-card ${ticket.status.toLowerCase()}">
            <div class="ticket-header">
                <h3>${ticket.subject}</h3>
                <span class="ticket-status">${ticket.status}</span>
            </div>
            <div class="ticket-body">
                <p>${ticket.message}</p>
                <div class="ticket-meta">
                    <span><i class="fas fa-clock"></i> ${new Date(
                      ticket.createdAt
                    ).toLocaleDateString()}</span>
                    <span><i class="fas fa-comments"></i> ${
                      ticket.replies?.length || 0
                    } replies</span>
                </div>
            </div>
            <div class="ticket-actions">
                <button onclick="viewTicket('${
                  ticket._id
                }')" class="btn btn-secondary">View Details</button>
                ${
                  ticket.status === "OPEN"
                    ? `
                    <button onclick="closeTicket('${ticket._id}')" class="btn btn-danger">Close Ticket</button>
                `
                    : ""
                }
            </div>
        </div>
    `
    )
    .join("");
}

// Create new ticket
async function createNewTicket() {
  const subject = prompt("Enter ticket subject:");
  if (!subject) return;

  const message = prompt("Enter your message:");
  if (!message) return;

  try {
    showLoading();
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, message }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Ticket created successfully!", "success");
      loadTickets();
    } else {
      throw new Error(data.message || "Failed to create ticket");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// View ticket details
async function viewTicket(ticketId) {
  try {
    showLoading();
    const response = await fetch(`/api/tickets/${ticketId}`);
    const data = await response.json();

    if (response.ok) {
      showTicketDetails(data.ticket);
    } else {
      throw new Error(data.message || "Failed to load ticket details");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Show ticket details in modal
function showTicketDetails(ticket) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${ticket.subject}</h2>
                <button onclick="this.closest('.modal').remove()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ticket-details">
                    <p class="ticket-message">${ticket.message}</p>
                    <div class="ticket-replies">
                        ${(ticket.replies || [])
                          .map(
                            (reply) => `
                            <div class="reply ${
                              reply.isStaff ? "staff-reply" : "user-reply"
                            }">
                                <div class="reply-header">
                                    <span class="reply-author">${
                                      reply.isStaff ? "Support Team" : "You"
                                    }</span>
                                    <span class="reply-date">${new Date(
                                      reply.createdAt
                                    ).toLocaleString()}</span>
                                </div>
                                <p>${reply.message}</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
                <div class="reply-form">
                    <textarea id="replyMessage" placeholder="Type your reply..."></textarea>
                    <button onclick="submitReply('${
                      ticket._id
                    }')" class="btn btn-primary">Send Reply</button>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
}

// Submit reply to ticket
async function submitReply(ticketId) {
  const messageInput = document.getElementById("replyMessage");
  const message = messageInput.value.trim();

  if (!message) {
    showToast("Please enter a message", "error");
    return;
  }

  try {
    showLoading();
    const response = await fetch(`/api/tickets/${ticketId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Reply sent successfully!", "success");
      messageInput.value = "";
      viewTicket(ticketId);
    } else {
      throw new Error(data.message || "Failed to send reply");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Close ticket
async function closeTicket(ticketId) {
  if (!confirm("Are you sure you want to close this ticket?")) return;

  try {
    showLoading();
    const response = await fetch(`/api/tickets/${ticketId}/close`, {
      method: "POST",
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Ticket closed successfully!", "success");
      loadTickets();
    } else {
      throw new Error(data.message || "Failed to close ticket");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Utility functions
function showLoading() {
  const loading = document.createElement("div");
  loading.className = "loading-spinner";
  loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.querySelector(".loading-spinner");
  if (loading) {
    loading.remove();
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
