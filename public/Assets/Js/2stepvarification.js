document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll(".verification-inputs input");

  inputs.forEach((input) => {
    input.setAttribute("dir", "ltr");
    input.style.textAlign = "center";
  });

  inputs.forEach((input, index) => {
    if (index === 0) {
      input.focus();
    }

    input.addEventListener("input", function (e) {
      this.value = this.value.replace(/[^0-9]/g, "");

      if (this.value.length === 1) {
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace") {
        if (this.value === "") {
          if (index > 0) {
            inputs[index - 1].focus();
          }
        } else {
          this.value = "";
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputs[index - 1].focus();
      } else if (e.key === "ArrowRight" && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("paste", function (e) {
      e.preventDefault();
      if (index === 0) {
        const pasteData = e.clipboardData
          .getData("text")
          .replace(/[^0-9]/g, "")
          .slice(0, inputs.length);
        [...pasteData].forEach((char, i) => {
          if (inputs[i]) {
            inputs[i].value = char;
            if (i < inputs.length - 1) {
              inputs[i + 1].focus();
            }
          }
        });
      }
    });
  });

  let timeLeft = 150;
  const timerDisplay = document.createElement("div");
  timerDisplay.classList.add("timer");
  const form = document.querySelector(".form");
  const backLink = document.querySelector(".back-link");

  form.insertBefore(timerDisplay, backLink);

  function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerHTML = `زمان باقی مانده: ${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      showResendLink();
    } else {
      timeLeft--;
    }
  }

  function showResendLink() {
    timerDisplay.innerHTML = `
            <a href="#" class="resend-link">ارسال مجدد کد</a>
        `;

    const resendLink = document.querySelector(".resend-link");
    resendLink.addEventListener("click", function (e) {
      e.preventDefault();
      timeLeft = 150;
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
    });
  }
  let timerInterval = setInterval(updateTimer, 1000);
  updateTimer();

  // Mobile menu toggle
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
});
