document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const categoryItems = document.querySelectorAll(".category-item");
  const chatInput = document.querySelector(".chat-input input");
  const sendButton = document.querySelector(".send-message");
  const attachButton = document.querySelector(".attach-file");
  const chatMessages = document.querySelector(".chat-messages");
  const backButton = document.querySelector(".back-button");
  const headerActions = document.querySelector(".header-actions");
  const userMenu = document.querySelector(".user-menu");

  // User account menu functionality
  if (userMenu) {
    userMenu.addEventListener("click", function (e) {
      e.stopPropagation();

      // Check if menu already exists
      let menu = document.querySelector(".user-dropdown");

      if (menu) {
        // If menu exists, toggle visibility
        menu.remove();
      } else {
        // Create dropdown menu
        menu = document.createElement("div");
        menu.classList.add("user-dropdown");

        menu.innerHTML = `
                    <ul>
                        <li><i class="fas fa-user"></i> مشاهده پروفایل</li>
                        <li><i class="fas fa-cog"></i> تنظیمات</li>
                        <li><i class="fas fa-bell"></i> اعلان‌ها</li>
                        <li class="separator"></li>
                        <li class="logout"><i class="fas fa-sign-out-alt"></i> خروج</li>
                    </ul>
                `;

        // Position the menu
        const rect = userMenu.getBoundingClientRect();
        menu.style.top = rect.bottom + 5 + "px";
        menu.style.left = rect.left - 120 + "px";

        // Add to body
        document.body.appendChild(menu);

        // Add click events to menu items
        const menuItems = menu.querySelectorAll("li");
        menuItems.forEach((item) => {
          item.addEventListener("click", function () {
            if (item.classList.contains("logout")) {
              alert("از سیستم خارج شدید.");
            } else {
              alert(
                this.textContent.trim() +
                  " - این عملکرد در نسخه نمایشی در دسترس نیست."
              );
            }
            menu.remove();
          });
        });

        // Close when clicking outside
        document.addEventListener("click", function closeMenu() {
          menu.remove();
          document.removeEventListener("click", closeMenu);
        });
      }
    });
  }

  // Set active category
  categoryItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all categories
      categoryItems.forEach((cat) => cat.classList.remove("active"));
      // Add active class to clicked category
      this.classList.add("active");

      // In a real app, this would load the relevant tickets for this category
      // For demo purposes, we'll just add a message indicating the category change
      const categoryName = this.querySelector(".category-text").textContent;
      addSystemMessage(`دسته‌بندی به "${categoryName}" تغییر کرد.`);
    });
  });

  // Send message functionality
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText) {
      // Add user message
      addUserMessage(messageText);

      // Clear input
      chatInput.value = "";

      // In a real app, this would send the message to a server
      // For demo purposes, we'll simulate a response after a delay

      // Show loading message
      const loadingMessage = document.createElement("div");
      loadingMessage.classList.add("message", "admin-message", "loading");
      loadingMessage.innerHTML = `
                <div class="message-sender">
                    <span class="sender-name">حسن آریان</span>
                    <span class="sender-category">پشتیبانی فنی</span>
                </div>
                <div class="message-content">
                    <div class="loading-circle"></div>
                </div>
            `;
      chatMessages.appendChild(loadingMessage);
      scrollToBottom();

      // Simulate response after 1.5 seconds
      setTimeout(() => {
        // Remove loading message
        loadingMessage.remove();

        // Add admin response
        const responseText = getAutoResponse(messageText);
        addAdminMessage(responseText);
      }, 1500);
    }
  }

  // Attach file functionality
  attachButton.addEventListener("click", function () {
    // In a real app, this would open a file picker
    alert("این قابلیت در نسخه نمایشی فعال نیست.");
  });

  // Back button functionality
  backButton.addEventListener("click", function () {
    // In a real app, this would navigate back to the tickets list
    alert("بازگشت به لیست تیکت‌ها");
  });

  // Header actions functionality
  headerActions.addEventListener("click", function () {
    // In a real app, this would show a dropdown menu
    alert("منوی اقدامات تیکت");
  });

  // Helper Functions
  function addUserMessage(text) {
    const message = document.createElement("div");
    message.classList.add("message", "user-message");

    const currentTime = getCurrentTime();

    message.innerHTML = `
            <div class="message-sender">
                <span class="sender-name">کاربر نتوریا</span>
                <span class="sender-category">متقاضی</span>
            </div>
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;

    chatMessages.appendChild(message);
    scrollToBottom();
  }

  function addAdminMessage(text) {
    const message = document.createElement("div");
    message.classList.add("message", "admin-message");

    const currentTime = getCurrentTime();

    message.innerHTML = `
            <div class="message-sender">
                <span class="sender-name">حسن آریان</span>
                <span class="sender-category">پشتیبانی فنی</span>
            </div>
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;

    chatMessages.appendChild(message);
    scrollToBottom();
  }

  function addSystemMessage(text) {
    const message = document.createElement("div");
    message.classList.add("message", "system-message");

    message.innerHTML = `
            <div class="message-content system">
                <p>${text}</p>
            </div>
        `;

    chatMessages.appendChild(message);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  function getAutoResponse(message) {
    // Simple auto-responses based on keywords
    // In a real app, this would be handled by a server

    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("استخدام") ||
      lowerMessage.includes("کار") ||
      lowerMessage.includes("شغل")
    ) {
      return "برای درخواست استخدام، لطفاً رزومه خود را از طریق دکمه پیوست ارسال کنید. تیم منابع انسانی ما در اسرع وقت با شما تماس خواهد گرفت.";
    }

    if (
      lowerMessage.includes("فضای ابری") ||
      lowerMessage.includes("cloud") ||
      lowerMessage.includes("ذخیره")
    ) {
      return "خدمات فضای ابری ما با ظرفیت‌های مختلف و قیمت‌های مناسب ارائه می‌شود. برای اطلاعات بیشتر، لطفاً به بخش خدمات در وبسایت مراجعه کنید.";
    }

    if (
      lowerMessage.includes("سرور") ||
      lowerMessage.includes("server") ||
      lowerMessage.includes("هاست")
    ) {
      return "سرورهای ما با بالاترین کیفیت و پشتیبانی ۲۴/۷ ارائه می‌شوند. برای مشاوره و انتخاب بهترین سرور متناسب با نیاز شما، کارشناسان ما آماده پاسخگویی هستند.";
    }

    if (
      lowerMessage.includes("دامنه") ||
      lowerMessage.includes("domain") ||
      lowerMessage.includes("دامین")
    ) {
      return "خدمات ثبت و تمدید دامنه با پسوندهای مختلف را ارائه می‌دهیم. برای استعلام قیمت و موجودی دامنه مورد نظر خود، لطفاً نام دقیق آن را ارسال کنید.";
    }

    // Default response
    return "ممنون از پیام شما. کارشناسان پشتیبانی ما در اولین فرصت پاسخگوی شما خواهند بود.";
  }

  // Add custom styles for system messages
  const style = document.createElement("style");
  style.textContent = `
        .system-message .message-content {
            background-color: #f0f0f0;
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 8px 12px;
            max-width: 90%;
            margin: 0 auto;
            border-radius: 10px;
        }
        
        .user-dropdown {
            position: absolute;
            width: 150px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        
        .user-dropdown ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .user-dropdown li {
            padding: 10px 15px;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.2s;
        }
        
        .user-dropdown li:hover {
            background-color: var(--secondary-color);
        }
        
        .user-dropdown li i {
            margin-left: 8px;
            width: 15px;
            text-align: center;
        }
        
        .user-dropdown .separator {
            height: 1px;
            background-color: var(--border-color);
            padding: 0;
            margin: 5px 0;
        }
        
        .user-dropdown .logout {
            color: #e74c3c;
        }
    `;
  document.head.appendChild(style);
});

// Chat List Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const searchInput = document.querySelector(".search-bar input");
  const actionButtons = document.querySelectorAll(".action-btn");
  const chatItems = document.querySelectorAll(".chat-item");

  // Search functionality
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();

    chatItems.forEach((item) => {
      const name = item.querySelector(".chat-name").textContent.toLowerCase();
      const message = item
        .querySelector(".chat-last-message")
        .textContent.toLowerCase();

      // Check if chat contains search term in name or message
      if (name.includes(searchTerm) || message.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });

  // Action buttons
  actionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      actionButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // If it's the filter button, don't add active class
      if (this.classList.contains("filter")) {
        this.classList.remove("active");
        alert("فیلترهای موجود: همه، خوانده نشده، مهم، اخیر");
      }
    });
  });

  // Chat item click
  chatItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      chatItems.forEach((chat) => chat.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Get chat name
      const chatName = this.querySelector(".chat-name").textContent;

      // In a real app, this would load the chat conversation
      // For demo purposes, we'll just show an alert
      alert(`گفتگو با ${chatName} انتخاب شد.`);

      // Remove badge if exists
      const badge = this.querySelector(".chat-badge");
      if (badge) {
        badge.style.display = "none";
      }
    });
  });
});

// Responsive Chat Interface Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const searchInput = document.querySelector(".search-bar input");
  const actionButtons = document.querySelectorAll(".action-btn");
  const chatItems = document.querySelectorAll(".chat-item");
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const chatDetail = document.querySelector(".chat-detail");
  const backButton = document.querySelector(".back-button");
  const sendBtn = document.querySelector(".send-btn");
  const msgInput = document.querySelector(".chat-input-area input");

  // Create overlay element for mobile
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  // Toggle sidebar on mobile
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
      document.body.style.overflow = sidebar.classList.contains("open")
        ? "hidden"
        : "";
    });
  }

  // Close sidebar when clicking on overlay
  overlay.addEventListener("click", function () {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  });

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase().trim();

      chatItems.forEach((item) => {
        const name = item.querySelector(".chat-name").textContent.toLowerCase();
        const message = item
          .querySelector(".chat-last-message")
          .textContent.toLowerCase();

        // Check if chat contains search term in name or message
        if (name.includes(searchTerm) || message.includes(searchTerm)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  }

  // Action buttons
  actionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      actionButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // If it's the filter button, don't add active class
      if (this.classList.contains("filter")) {
        this.classList.remove("active");
        alert("فیلترهای موجود: همه، خوانده نشده، مهم، اخیر");
      }
    });
  });

  // Chat item click
  chatItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      chatItems.forEach((chat) => chat.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Get chat name
      const chatName = this.querySelector(".chat-name").textContent;

      // On mobile, show the chat detail view
      if (window.innerWidth <= 768 && chatDetail) {
        chatDetail.classList.add("open");

        // Update chat detail header with selected user info
        const chatDetailName = document.querySelector(
          ".chat-detail-info .chat-name"
        );
        if (chatDetailName) {
          chatDetailName.textContent = chatName;
        }

        // Copy avatar color and text/image
        const selectedAvatar = this.querySelector(".chat-avatar");
        const detailAvatar = document.querySelector(
          ".chat-detail-user .chat-avatar"
        );

        if (selectedAvatar && detailAvatar) {
          detailAvatar.style.backgroundColor =
            selectedAvatar.style.backgroundColor;

          const avatarText = selectedAvatar.querySelector(".avatar-text");
          const detailAvatarText = detailAvatar.querySelector(".avatar-text");

          if (avatarText && detailAvatarText) {
            detailAvatarText.textContent = avatarText.textContent;
          }
        }
      }

      // Remove badge if exists
      const badge = this.querySelector(".chat-badge");
      if (badge) {
        badge.style.display = "none";
      }
    });
  });

  // Back button on mobile
  if (backButton) {
    backButton.addEventListener("click", function () {
      if (chatDetail) {
        chatDetail.classList.remove("open");
      }
    });
  }

  // Send message functionality
  if (sendBtn && msgInput) {
    sendBtn.addEventListener("click", sendMessage);
    msgInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  function sendMessage() {
    const messageText = msgInput.value.trim();
    if (messageText) {
      // Create new message element
      const message = document.createElement("div");
      message.classList.add("message", "user-message");

      const currentTime = getCurrentTime();

      message.innerHTML = `
                <div class="message-content">
                    <p>${messageText}</p>
                    <span class="message-time">${currentTime}</span>
                </div>
            `;

      // Add to chat messages
      const chatMessages = document.querySelector(".chat-messages");
      if (chatMessages) {
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Clear input
      msgInput.value = "";

      // Simulate response (for demo)
      setTimeout(() => {
        const response = document.createElement("div");
        response.classList.add("message", "admin-message");

        response.innerHTML = `
                    <div class="message-content">
                        <p>پیام شما دریافت شد. کارشناسان ما در اسرع وقت پاسخگو خواهند بود.</p>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                `;

        chatMessages.appendChild(response);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }
  }

  function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  // Handle resize events to update UI based on screen size
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      // On desktop
      if (sidebar) sidebar.classList.remove("open");
      if (overlay) overlay.classList.remove("show");
      document.body.style.overflow = "";

      // If a chat is selected, make sure detail view is visible
      if (document.querySelector(".chat-item.active") && chatDetail) {
        chatDetail.classList.remove("open"); // Reset the mobile class
        chatDetail.style.display = "flex";
      }
    } else {
      // On mobile
      if (chatDetail) {
        if (chatDetail.classList.contains("open")) {
          chatDetail.style.display = "flex";
        } else {
          chatDetail.style.display = "none";
        }
      }
    }
  });

  // Initial call to set correct layout
  if (window.innerWidth > 768 && chatDetail) {
    chatDetail.style.display = "flex";
  }
});

// Responsive Ticket Interface Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const searchInput = document.querySelector(".search-bar input");
  const actionButtons = document.querySelectorAll(".action-btn");
  const chatItems = document.querySelectorAll(".chat-item");
  const chatDetail = document.querySelector(".chat-detail");
  const backButton = document.querySelector(".back-button");
  const sendBtn = document.querySelector(".send-btn");
  const msgInput = document.querySelector(".chat-input-area input");

  // Create toast notification container
  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);

  // Function to show toast notification
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${
                  type === "info" ? "fa-info-circle" : "fa-check-circle"
                }"></i>
                <span>${message}</span>
            </div>
        `;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Add CSS for toast notifications
  const style = document.createElement("style");
  style.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1500;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .toast {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 12px 15px;
            min-width: 250px;
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        
        .toast.fade-out {
            opacity: 0;
        }
        
        .toast.info {
            border-right: 3px solid var(--primary-color);
        }
        
        .toast.success {
            border-right: 3px solid var(--green-badge);
        }
        
        .toast-content {
            display: flex;
            align-items: center;
        }
        
        .toast-content i {
            margin-left: 10px;
            font-size: 18px;
        }
        
        .toast.info i {
            color: var(--primary-color);
        }
        
        .toast.success i {
            color: var(--green-badge);
        }
    `;
  document.head.appendChild(style);

  // Create custom alert dialog
  const customAlertContainer = document.createElement("div");
  customAlertContainer.className = "custom-alert-container";
  document.body.appendChild(customAlertContainer);

  // Function to show custom alert
  function showCustomAlert(message) {
    // Clear any existing alerts
    customAlertContainer.innerHTML = "";

    const alert = document.createElement("div");
    alert.className = "custom-alert";
    alert.innerHTML = `
          <div class="custom-alert-header">
              <p class="alert-title">127.0.0.1:5501 says</p>
          </div>
          <div class="custom-alert-body">
              <p class="alert-message">${message}</p>
          </div>
          <div class="custom-alert-footer">
              <button class="alert-button">OK</button>
          </div>
      `;

    customAlertContainer.appendChild(alert);
    customAlertContainer.style.display = "flex";

    // Add click event to OK button
    const okButton = alert.querySelector(".alert-button");
    okButton.addEventListener("click", function () {
      customAlertContainer.style.display = "none";
    });

    // Close when clicking outside (optional)
    customAlertContainer.addEventListener("click", function (e) {
      if (e.target === customAlertContainer) {
        customAlertContainer.style.display = "none";
      }
    });
  }

  // New Ticket Elements
  const newTicketBtn = document.querySelector(".new-ticket-btn");
  const newTicketModal = document.getElementById("newTicketModal");
  const closeModalBtn = document.querySelector(".close-modal");
  const cancelBtn = document.querySelector(".cancel-btn");
  const submitBtn = document.querySelector(".submit-btn");
  const fileInput = document.getElementById("ticket-attachment");
  const fileSelectBtn = document.querySelector(".file-select-btn");
  const fileName = document.querySelector(".file-name");

  // New Ticket Modal Functions
  if (newTicketBtn && newTicketModal) {
    // Open modal
    newTicketBtn.addEventListener("click", function () {
      newTicketModal.classList.add("show");
    });

    // Close modal with X button
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", function () {
        newTicketModal.classList.remove("show");
      });
    }

    // Close modal with Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        newTicketModal.classList.remove("show");
      });
    }

    // Submit new ticket
    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        const subject = document.getElementById("ticket-subject").value;
        const category = document.getElementById("ticket-category").value;
        const message = document.getElementById("ticket-message").value;

        if (!subject || !message) {
          showCustomAlert("لطفاً موضوع و متن پیام را وارد کنید.");
          return;
        }

        // In a real app, this would submit the form to a server
        showCustomAlert("تیکت جدید با موفقیت ایجاد شد.");

        // Reset form
        document.getElementById("ticket-subject").value = "";
        document.getElementById("ticket-category").selectedIndex = 0;
        document.getElementById("ticket-message").value = "";
        fileName.textContent = "فایلی انتخاب نشده";

        // Close modal
        newTicketModal.classList.remove("show");
      });
    }

    // File input handling
    if (fileSelectBtn && fileInput) {
      fileSelectBtn.addEventListener("click", function () {
        fileInput.click();
      });

      fileInput.addEventListener("change", function () {
        if (this.files.length > 0) {
          fileName.textContent = this.files[0].name;
        } else {
          fileName.textContent = "فایلی انتخاب نشده";
        }
      });
    }

    // Close modal when clicking outside
    window.addEventListener("click", function (e) {
      if (e.target === newTicketModal) {
        newTicketModal.classList.remove("show");
      }
    });
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase().trim();

      chatItems.forEach((item) => {
        const name = item.querySelector(".chat-name").textContent.toLowerCase();
        const message = item
          .querySelector(".chat-last-message")
          .textContent.toLowerCase();

        // Check if chat contains search term in name or message
        if (name.includes(searchTerm) || message.includes(searchTerm)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  }

  // Action buttons (tabs)
  actionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // If it's the filter button, don't treat as tab
      if (this.classList.contains("filter")) {
        showCustomAlert("فیلترهای موجود: همه، خوانده نشده، مهم، اخیر");
        return;
      }

      // Remove active class from all buttons
      actionButtons.forEach((btn) => {
        if (!btn.classList.contains("filter")) {
          btn.classList.remove("active");
        }
      });

      // Add active class to clicked button
      this.classList.add("active");

      // Get the status type from the button text
      const statusType = this.querySelector("span").textContent.trim();

      // In a real app, this would filter tickets by status
      // For demo purposes, we'll just show which filter was selected
      console.log(`فیلتر انتخاب شده: ${statusType}`);
    });
  });

  // Chat item click - Fixed to ensure chat switching works
  chatItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Get current active item
      const currentActive = document.querySelector(".chat-item.active");

      // If clicking on already active item, do nothing
      if (currentActive === this) {
        return;
      }

      // Remove active class from all items
      chatItems.forEach((chat) => chat.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Get chat name and other details
      const chatName = this.querySelector(".chat-name").textContent;
      const chatMessage = this.querySelector(".chat-last-message").textContent;

      // Show custom alert for chat switch
      showCustomAlert(`گفتگو با ${chatName} انتخاب شد.`);

      // Update the chat detail view with the selected chat info
      const chatDetailName = document.querySelector(
        ".chat-detail-info .chat-name"
      );
      if (chatDetailName) {
        chatDetailName.textContent = chatName;
      }

      // Copy avatar color and text/image to chat detail header
      const selectedAvatar = this.querySelector(".chat-avatar");
      const detailAvatar = document.querySelector(
        ".chat-detail-user .chat-avatar"
      );

      if (selectedAvatar && detailAvatar) {
        detailAvatar.style.backgroundColor =
          selectedAvatar.style.backgroundColor;

        const avatarText = selectedAvatar.querySelector(".avatar-text");
        const detailAvatarText = detailAvatar.querySelector(".avatar-text");

        if (avatarText && detailAvatarText) {
          detailAvatarText.textContent = avatarText.textContent;
        }

        // Check if there's an image
        const avatarImg = selectedAvatar.querySelector("img");
        const detailAvatarImg = detailAvatar.querySelector("img");

        if (avatarImg && detailAvatarImg) {
          if (avatarImg.style.display !== "none") {
            detailAvatarImg.src = avatarImg.src;
            detailAvatarImg.style.display = "block";
            detailAvatarText.style.display = "none";
          } else {
            detailAvatarImg.style.display = "none";
            detailAvatarText.style.display = "block";
          }
        }
      }

      // On mobile, show the chat detail view
      if (window.innerWidth <= 768) {
        if (chatDetail) {
          chatDetail.classList.add("open");
          chatDetail.style.display = "flex";
        }
      } else {
        // On desktop, just ensure the detail view is visible
        if (chatDetail) {
          chatDetail.style.display = "flex";
        }
      }

      // Remove badge if exists
      const badge = this.querySelector(".chat-badge");
      if (badge) {
        badge.style.display = "none";
      }

      // For a real application, this would load the chat history from the server
      // For demo, we can simulate different messages for different chats
      simulateChatHistory(chatName);
    });
  });

  // Function to simulate different chat histories based on the selected chat
  function simulateChatHistory(chatName) {
    const chatMessages = document.querySelector(".chat-messages");

    // Clear existing messages
    if (chatMessages) {
      chatMessages.innerHTML = "";

      // Add messages based on the selected chat
      if (chatName === "کاربر الیمنتور") {
        // First chat
        appendMessage("admin", "سلام، چطور می‌توانم به شما کمک کنم؟", "12:25");
        appendMessage("user", "سلام، من درخواست پشتیبانی دارم", "12:28");
        appendMessage("admin", "چه نوع پشتیبانی نیاز دارید؟", "12:30");
      } else if (chatName === "سارا احمدی") {
        // Second chat
        appendMessage("admin", "سلام سارا، چطور می‌توانم کمک کنم؟", "10:15");
        appendMessage("user", "سلام، وضعیت درخواست من چطور است؟", "10:40");
        appendMessage(
          "admin",
          "درخواست شما در حال بررسی است و بزودی پاسخ داده خواهد شد",
          "10:45"
        );
      } else if (chatName === "حمید محمدی") {
        // Third chat
        appendMessage("admin", "مشکل سرور شما برطرف شد", "9:15 (دیروز)");
        appendMessage("user", "با تشکر از پاسخگویی شما", "9:30 (دیروز)");
      } else if (chatName === "رضا کریمی") {
        // Fourth chat
        appendMessage("user", "درخواست فضای ابری دارم", "15:20 (دیروز)");
        appendMessage(
          "admin",
          "لطفا مشخصات فضای مورد نیاز خود را اعلام کنید",
          "15:25 (دیروز)"
        );
        appendMessage(
          "admin",
          "آیا به راهنمایی بیشتری نیاز دارید؟",
          "9:10 (امروز)"
        );
      } else if (chatName === "زهرا رضایی") {
        // Fifth chat
        appendMessage(
          "admin",
          "دامنه شما با موفقیت تمدید شد",
          "11:45 (2 روز پیش)"
        );
        appendMessage("user", "باتشکر از همکاری شما", "12:30 (2 روز پیش)");
      } else {
        // Default for any other chat
        appendMessage("admin", "سلام، چطور می‌توانم به شما کمک کنم؟", "12:00");
      }

      // Scroll to bottom after adding messages
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // Helper function to append a message to the chat
  function appendMessage(type, text, time) {
    const chatMessages = document.querySelector(".chat-messages");
    if (!chatMessages) return;

    const message = document.createElement("div");
    message.classList.add(
      "message",
      type === "admin" ? "admin-message" : "user-message"
    );

    message.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

    chatMessages.appendChild(message);
  }

  // Back button on mobile
  if (backButton) {
    backButton.addEventListener("click", function () {
      if (chatDetail) {
        chatDetail.classList.remove("open");
        chatDetail.style.display = "none";
      }
    });
  }

  // Send message functionality
  if (sendBtn && msgInput) {
    sendBtn.addEventListener("click", sendMessage);
    msgInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  function sendMessage() {
    const messageText = msgInput.value.trim();
    if (messageText) {
      // Create new message element
      const message = document.createElement("div");
      message.classList.add("message", "user-message");

      const currentTime = getCurrentTime();

      message.innerHTML = `
                <div class="message-content">
                    <p>${messageText}</p>
                    <span class="message-time">${currentTime}</span>
                </div>
            `;

      // Add to chat messages
      const chatMessages = document.querySelector(".chat-messages");
      if (chatMessages) {
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Clear input
      msgInput.value = "";

      // Simulate response (for demo)
      setTimeout(() => {
        const response = document.createElement("div");
        response.classList.add("message", "admin-message");

        response.innerHTML = `
                    <div class="message-content">
                        <p>پیام شما دریافت شد. کارشناسان ما در اسرع وقت پاسخگو خواهند بود.</p>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                `;

        chatMessages.appendChild(response);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }
  }

  function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  // Handle resize events to update UI based on screen size
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      // On desktop
      document.body.style.overflow = "";

      // If a chat is selected, make sure detail view is visible
      if (document.querySelector(".chat-item.active") && chatDetail) {
        chatDetail.classList.remove("open"); // Reset the mobile class
        chatDetail.style.display = "flex";
      }
    } else {
      // On mobile
      if (chatDetail) {
        if (chatDetail.classList.contains("open")) {
          chatDetail.style.display = "flex";
        } else {
          chatDetail.style.display = "none";
        }
      }
    }
  });

  // Initial call to set correct layout and select first chat
  if (window.innerWidth > 768 && chatDetail) {
    chatDetail.style.display = "flex";
  }

  // Select the first chat by default
  if (chatItems.length > 0) {
    chatItems[0].click();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  if (!utils.isAuthenticated()) {
    utils.redirectTo("/login.html");
    return;
  }

  const ticketForm = document.getElementById("ticketForm");
  const ticketsList = document.getElementById("ticketsList");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  // Load tickets
  async function loadTickets() {
    try {
      utils.showLoading("errorMessage");
      const response = await apiClient.getTickets();

      if (response.success) {
        displayTickets(response.data);
      } else {
        utils.showError(
          "errorMessage",
          response.message || "خطا در دریافت تیکت‌ها"
        );
      }
    } catch (error) {
      utils.showError("errorMessage", "خطا در دریافت تیکت‌ها");
      console.error("Load tickets error:", error);
    }
  }

  // Display tickets in the list
  function displayTickets(tickets) {
    if (!ticketsList) return;

    ticketsList.innerHTML = tickets
      .map(
        (ticket) => `
            <div class="ticket-item ${ticket.status.toLowerCase()}">
                <div class="ticket-header">
                    <h3>${ticket.title}</h3>
                    <span class="ticket-status">${ticket.status}</span>
                </div>
                <div class="ticket-content">
                    <p>${ticket.description}</p>
                </div>
                <div class="ticket-footer">
                    <span class="ticket-date">${new Date(
                      ticket.createdAt
                    ).toLocaleDateString("fa-IR")}</span>
                    <button onclick="viewTicket('${
                      ticket.id
                    }')" class="view-ticket-btn">مشاهده</button>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Handle new ticket submission
  if (ticketForm) {
    ticketForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = utils.getFormData("ticketForm");

      if (!formData.title || !formData.description) {
        utils.showError("errorMessage", "لطفا عنوان و توضیحات را وارد کنید");
        return;
      }

      try {
        utils.showLoading("errorMessage");
        const response = await apiClient.createTicket(formData);

        if (response.success) {
          utils.showSuccess("successMessage", "تیکت با موفقیت ایجاد شد");
          ticketForm.reset();
          loadTickets(); // Reload tickets list
        } else {
          utils.showError(
            "errorMessage",
            response.message || "خطا در ایجاد تیکت"
          );
        }
      } catch (error) {
        utils.showError("errorMessage", "خطا در ایجاد تیکت");
        console.error("Create ticket error:", error);
      }
    });
  }

  // View ticket details
  window.viewTicket = async function (ticketId) {
    try {
      const response = await apiClient.getTicketDetails(ticketId);
      if (response.success) {
        // Implement ticket details view logic here
        console.log("Ticket details:", response.data);
      }
    } catch (error) {
      console.error("View ticket error:", error);
    }
  };

  // Load tickets on page load
  loadTickets();
});

// Ticket system functionality
class TicketSystem {
  constructor() {
    this.tickets = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.container = document.querySelector(".tickets-container");
    this.ticketsList = document.querySelector(".tickets-list");
    this.paginationContainer = document.querySelector(".pagination");
  }

  async init() {
    try {
      Utils.showLoading(this.container);
      await this.loadTickets();
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.container);
    }
  }

  async loadTickets(page = 1) {
    try {
      Utils.showLoading(this.ticketsList);
      const response = await apiService.getTickets(page, this.itemsPerPage);
      this.tickets = response.tickets;
      this.totalPages = response.pagination.pages;
      this.currentPage = page;
      this.renderTickets();
      this.renderPagination();
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.ticketsList);
    }
  }

  renderTickets() {
    if (!this.ticketsList) return;

    // Clear container
    this.ticketsList.innerHTML = "";

    if (this.tickets.length === 0) {
      this.ticketsList.innerHTML = `
                <div class="empty-tickets">
                    <i class="bx bx-message-square-detail"></i>
                    <p>هیچ تیکتی یافت نشد</p>
                    <button class="btn btn-primary" onclick="ticketSystem.showNewTicketForm()">
                        ایجاد تیکت جدید
                    </button>
                </div>
            `;
      return;
    }

    // Create table
    const table = document.createElement("table");
    table.className = "table";
    table.innerHTML = `
            <thead>
                <tr>
                    <th>شماره تیکت</th>
                    <th>موضوع</th>
                    <th>وضعیت</th>
                    <th>آخرین بروزرسانی</th>
                    <th>عملیات</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

    // Add tickets
    const tbody = table.querySelector("tbody");
    this.tickets.forEach((ticket) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>#${ticket.id}</td>
                <td>${ticket.subject}</td>
                <td>
                    <span class="status-badge ${ticket.status}">
                        ${this.getStatusText(ticket.status)}
                    </span>
                </td>
                <td>${Utils.formatDate(ticket.lastUpdate)}</td>
                <td>
                    <button class="btn btn-primary view-ticket" data-id="${
                      ticket.id
                    }">
                        مشاهده
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });

    this.ticketsList.appendChild(table);
    this.addTicketEventListeners();
  }

  renderPagination() {
    if (!this.paginationContainer) return;

    // Clear container
    this.paginationContainer.innerHTML = "";

    // Create pagination
    const pagination = Utils.createPagination(
      this.currentPage,
      this.totalPages,
      (page) => this.loadTickets(page)
    );

    this.paginationContainer.appendChild(pagination);
  }

  getStatusText(status) {
    const statuses = {
      open: "باز",
      pending: "در انتظار پاسخ",
      closed: "بسته",
      resolved: "حل شده",
    };
    return statuses[status] || status;
  }

  addTicketEventListeners() {
    // View ticket buttons
    this.ticketsList.querySelectorAll(".view-ticket").forEach((button) => {
      button.addEventListener("click", (e) => {
        const ticketId = e.target.dataset.id;
        this.viewTicket(ticketId);
      });
    });
  }

  async viewTicket(ticketId) {
    try {
      Utils.showLoading(this.container);
      const response = await apiService.getTicketDetails(ticketId);
      this.showTicketDetails(response);
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.container);
    }
  }

  showTicketDetails(ticket) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>تیکت #${ticket.id} - ${ticket.subject}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="ticket-info">
                        <p><strong>وضعیت:</strong> ${this.getStatusText(
                          ticket.status
                        )}</p>
                        <p><strong>تاریخ ایجاد:</strong> ${Utils.formatDate(
                          ticket.createdAt
                        )}</p>
                        <p><strong>آخرین بروزرسانی:</strong> ${Utils.formatDate(
                          ticket.lastUpdate
                        )}</p>
                    </div>
                    <div class="ticket-messages">
                        ${ticket.messages
                          .map(
                            (message) => `
                            <div class="message ${
                              message.isAdmin ? "admin" : "user"
                            }">
                                <div class="message-header">
                                    <span class="sender">${
                                      message.sender
                                    }</span>
                                    <span class="date">${Utils.formatDate(
                                      message.date
                                    )}</span>
                                </div>
                                <div class="message-content">
                                    ${message.content}
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    ${
                      ticket.status !== "closed"
                        ? `
                        <form id="replyForm" class="reply-form">
                            <textarea name="message" placeholder="پیام خود را وارد کنید..." required></textarea>
                            <button type="submit" class="btn btn-primary">ارسال پاسخ</button>
                        </form>
                    `
                        : ""
                    }
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Close modal
    modal.querySelector(".close-modal").addEventListener("click", () => {
      modal.remove();
    });

    // Handle reply form
    const replyForm = modal.querySelector("#replyForm");
    if (replyForm) {
      Utils.handleFormSubmit(replyForm, async (form) => {
        const formData = new FormData(form);
        const message = formData.get("message");

        try {
          await apiService.replyToTicket(ticket.id, message);
          Utils.showNotification("پاسخ شما با موفقیت ارسال شد", "success");
          this.viewTicket(ticket.id); // Refresh ticket view
        } catch (error) {
          Utils.handleApiError(error);
        }
      });
    }
  }

  showNewTicketForm() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>ایجاد تیکت جدید</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="newTicketForm">
                        <div class="form-group">
                            <label for="subject">موضوع</label>
                            <input type="text" id="subject" name="subject" required>
                        </div>
                        <div class="form-group">
                            <label for="priority">اولویت</label>
                            <select id="priority" name="priority" required>
                                <option value="low">کم</option>
                                <option value="medium">متوسط</option>
                                <option value="high">زیاد</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="message">پیام</label>
                            <textarea id="message" name="message" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">ارسال تیکت</button>
                    </form>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Close modal
    modal.querySelector(".close-modal").addEventListener("click", () => {
      modal.remove();
    });

    // Handle form submission
    const form = modal.querySelector("#newTicketForm");
    Utils.handleFormSubmit(form, async (form) => {
      const formData = new FormData(form);
      const data = {
        subject: formData.get("subject"),
        priority: formData.get("priority"),
        message: formData.get("message"),
      };

      try {
        await apiService.createTicket(
          data.subject,
          data.message,
          data.priority
        );
        Utils.showNotification("تیکت با موفقیت ایجاد شد", "success");
        modal.remove();
        this.loadTickets(); // Refresh tickets list
      } catch (error) {
        Utils.handleApiError(error);
      }
    });
  }
}

// Initialize ticket system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.ticketSystem = new TicketSystem();
  ticketSystem.init();

  // New ticket button
  const newTicketButton = document.querySelector(".new-ticket-button");
  if (newTicketButton) {
    newTicketButton.addEventListener("click", () => {
      ticketSystem.showNewTicketForm();
    });
  }
});
