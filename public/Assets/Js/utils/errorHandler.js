class ErrorHandler {
  static handleError(error) {
    if (error.response) {
      // Server responded with error
      return error.response.data.error.message;
    } else if (error.request) {
      // Network error
      return "Network error. Please check your connection.";
    } else {
      // Other errors
      return "An unexpected error occurred.";
    }
  }

  static displayError(element, message) {
    if (!element) return;

    element.textContent = message;
    element.style.display = "block";

    // Auto-hide after 5 seconds
    setTimeout(() => {
      element.style.display = "none";
    }, 5000);
  }

  static showNotification(message, type = "error") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  static validateForm(form) {
    const inputs = form.querySelectorAll("input[required]");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add("error");

        // Add error message
        const errorMessage = document.createElement("div");
        errorMessage.className = "error-message";
        errorMessage.textContent = "This field is required";

        const existingError =
          input.parentElement.querySelector(".error-message");
        if (!existingError) {
          input.parentElement.appendChild(errorMessage);
        }
      } else {
        input.classList.remove("error");
        const errorMessage =
          input.parentElement.querySelector(".error-message");
        if (errorMessage) {
          errorMessage.remove();
        }
      }
    });

    return isValid;
  }
}

// Add notification styles
const style = document.createElement("style");
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.5s ease-out;
  }
  
  .notification.error {
    background-color: #dc3545;
  }
  
  .notification.success {
    background-color: #28a745;
  }
  
  .notification.warning {
    background-color: #ffc107;
    color: #000;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  input.error {
    border-color: #dc3545;
  }
`;

document.head.appendChild(style);

export default ErrorHandler;
