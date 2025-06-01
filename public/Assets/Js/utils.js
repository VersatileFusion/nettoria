// Shared Alert function
function Alert(title, message, time, type) {
  const toastContainer = document.querySelector(".toast");
  if (!toastContainer) {
    console.error("Toast container not found");
    return;
  }

  const number = Math.random().toString(36).substr(2, 9);
  const wrapper = document.createElement("div");
  wrapper.className = `wrapper ${type}`;
  wrapper.id = `wrapper-${number}`;

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

  setTimeout(() => {
    anime({
      targets: `#wrapper-${number}`,
      translateX: [0, 300],
      duration: 750,
      easing: "spring(1, 80, 100, 0)",
    });
    setTimeout(() => {
      wrapper.remove();
    }, 750);
  }, time);
}

// Menu functionality
function initializeMenu() {
  const menuIcon = document.querySelector(".bx-menu");
  const navbar = document.querySelector(".navbar");

  if (!menuIcon || !navbar) return;

  // ریست کردن وضعیت منو هنگام لود صفحه
  function resetMenu() {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    menuIcon.style.visibility = "visible";
    document.body.style.overflow = "auto";
  }

  resetMenu(); // اجرا هنگام لود شدن صفحه

  // باز کردن و بستن منو
  menuIcon.addEventListener("click", () => {
    const isActive = navbar.classList.toggle("active");
    menuIcon.classList.toggle("menu-fixed", isActive);

    // مدیریت visibility به درستی
    menuIcon.style.visibility = isActive ? "hidden" : "visible";

    // جلوگیری از اسکرول هنگام باز بودن منو
    document.body.style.overflow = isActive ? "hidden" : "auto";
  });

  // بستن منو با کلیک بیرون از آن
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
      resetMenu();
    }
  });

  // بستن منو هنگام کلیک روی لینک‌های داخل منو
  document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", () => {
      resetMenu();
    });
  });
}

// اجرای تابع هنگام لود صفحه
document.addEventListener("DOMContentLoaded", initializeMenu);

// Export functions to window object for global access
window.Alert = Alert;
window.initializeMenu = initializeMenu;
