// Email validation start
const emailInput = document.querySelector('input[type="email"]');

emailInput.addEventListener("input", function () {
  const email = this.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    this.style.border = "2px solid rgba(255, 255, 255, 0.2)";
  } else if (emailRegex.test(email)) {
    this.style.border = "2px solid rgba(255, 255, 255, 0.2)";
  } else {
    this.style.border = "2px solid #ff2c1c";
  }
});

emailInput.addEventListener("blur", function () {
  const email = this.value;
  if (email && !/@.*\./.test(email)) {
  }
});

const form = document.querySelector(".form");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const email = emailInput.value;

  if (!email) {
    emailInput.style.border = "2px solid #ff2c1c";
  } else {
    Alert("موفقیت", "کد ارسال شد", 5000, "success");
    window.location.href = "./login.html";
  }
});

// Emali Validation end

// Notification Start
function Alert(title, message, time, type) {
  const existingNotifications = document.querySelectorAll(".wrapper");
  existingNotifications.forEach((notification, index) => {
    notification.style.transform = `translateY(${index * 85}px)`;
  });

  const number = Math.random().toString(36).substr(2, 9);
  const toastContainer = document.querySelector(".toast");

  const wrapper = document.createElement("div");
  wrapper.className = `wrapper ${type}`;
  wrapper.id = `wrapper-${number}`;

  wrapper.style.transform = `translateY(${
    existingNotifications.length * 85
  }px)`;

  const main = document.createElement("div");
  main.className = `main ${type}-icon`;

  const titleElement = document.createElement("div");
  titleElement.innerText = title;
  titleElement.style.fontSize = "16px";
  titleElement.style.fontWeight = "600";

  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.style.fontSize = "14px";

  main.appendChild(titleElement);
  main.appendChild(messageElement);
  wrapper.appendChild(main);
  toastContainer.appendChild(wrapper);

  anime({
    targets: `#wrapper-${number}`,
    translateX: [-300, 0],
    duration: 750,
    easing: "spring(1, 70, 100, 10)",
  });

  if (time) {
    setTimeout(() => removeNotification(wrapper), time);
  }
}

function removeNotification(wrapper) {
  anime({
    targets: wrapper,
    translateX: [0, 300],
    duration: 750,
    easing: "spring(1, 80, 100, 0)",
    complete: () => {
      wrapper.remove();

      const notifications = document.querySelectorAll(".wrapper");
      notifications.forEach((notification, index) => {
        anime({
          targets: notification,
          translateY: index * 85,
          duration: 300,
          easing: "easeOutQuad",
        });
      });
    },
  });
}

// Notification End

const menuIcon = document.querySelector(".bx-menu");
const navbar = document.querySelector(".navbar");

// Open menu
menuIcon.addEventListener("click", () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("menu-fixed");
  // Hide menu icon when menu is open
  menuIcon.style.visibility = menuIcon.classList.contains("bx-menu")
    ? "hidden"
    : "visible";
});

// Close menu when clicking anywhere outside
document.addEventListener("click", (e) => {
  // Check if click is outside both navbar and menu icon
  if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  }
});

// Close menu when clicking on links
document.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  });
});
