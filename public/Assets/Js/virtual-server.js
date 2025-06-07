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

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Server location switch functionality
  const locationSwitch = document.getElementById("server-location");
  const serverTitle = document.querySelector(".server-title");
  const serverDescription = document.querySelector(".server-description");

  const descriptions = {
    iran: `سرعت و امنیت بی‌نظیر! به دنبال یک سرور مجازی پرقدرت با لوکیشن ایران هستید؟ سرورهای مجازی ما با پینگ پایین، هارد NVMe پرسرعت، منابع اختصاصی و پشتیبانی 24/7 بهترین انتخاب برای وب‌سایت‌ها، اپلیکیشن‌ها و حتی سرورهای گیمینگ هستند.`,
    europe: `قدرت و سرعت بی‌نظیر! به دنبال یک سرور مجازی با کیفیت بالا و موقعیت اروپا هستید؟ سرورهای ما با پینگ پایین، هارد NVMe و همچنین منابع اختصاصی بهترین گزینه برای کسب‌وکارهای بین‌المللی، وب‌سایت‌ها و اپلیکیشن‌های حرفه‌ای هستند. ✨ ویژگی‌ها: - اتصال پایدار و سرعت فوق‌العاده - سازگاری با انواع سیستم‌عامل‌ها و ... 🚀 همین امروز سرور خود را انتخاب کنید و تجربه‌ای متفاوت داشته باشید!`,
  };
  
  // Check URL parameters to see if we should show Europe servers by default
  const urlParams = new URLSearchParams(window.location.search);
  const showEurope = urlParams.get('location') === 'europe';
  
  // Set initial state based on URL parameter
  if (showEurope) {
    locationSwitch.checked = false;
    updateServerDisplay(false);
  } else {
    locationSwitch.checked = true;
    updateServerDisplay(true);
  }

  // Function to update the server display based on switch state
  function updateServerDisplay(isIran) {
    const location = isIran ? "ایران" : "اروپا";
    serverTitle.textContent = `سرور مجازی ${location}`;
    serverDescription.textContent = isIran ? descriptions.iran : descriptions.europe;

    // Toggle server cards visibility
    const iranServers = document.querySelector('.iran-servers');
    const europeServers = document.querySelector('.europe-servers');
    
    // Add fade out animation
    anime({
      targets: isIran ? '.europe-servers' : '.iran-servers',
      opacity: [1, 0],
      duration: 300,
      easing: 'easeOutQuad',
      complete: function() {
        iranServers.style.display = isIran ? 'grid' : 'none';
        europeServers.style.display = isIran ? 'none' : 'grid';
        
        // Add fade in animation
        anime({
          targets: isIran ? '.iran-servers' : '.europe-servers',
          opacity: [0, 1],
          duration: 300,
          easing: 'easeInQuad'
        });
      }
    });

    // Animate the title change
    anime({
      targets: ".server-title",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: "easeOutExpo",
    });

    // Animate the description change
    anime({
      targets: ".server-description",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: 200,
      easing: "easeOutExpo",
    });
  }

  locationSwitch.addEventListener("change", function () {
    if (!this.checked) {
      // If trying to switch to Europe servers
      this.checked = true; // Keep it on Iran
      Alert(
        "به زودی",
        "سرورهای اروپا به زودی در دسترس خواهند بود",
        3000,
        "info"
      );
    } else {
      updateServerDisplay(true);
    }
  });

  const serverCards = document.querySelectorAll(".server-card");

  // Add click handlers for more-info buttons
  document.querySelectorAll(".more-info").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const card = this.closest(".server-card");
      if (card) {
        // حذف کلاس active از همه کارت‌ها
        serverCards.forEach((c) => c.classList.remove("active"));
        // اضافه کردن کلاس active به کارت کلیک شده
        card.classList.add("active");
      }
    });
  });

  // Prevent details from closing when clicking inside
  document.querySelectorAll(".details").forEach((detail) => {
    detail.addEventListener("click", (e) => e.stopPropagation());
  });

  // Close details when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".server-card")) {
      serverCards.forEach((card) => card.classList.remove("active"));
    }
  });

  // Close details handlers
  document.querySelectorAll(".close-details").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const card = this.closest(".server-card");
      if (card) {
        card.classList.remove("active");
      }
    });
  });

  function Alert(title, message, time, type) {
    const number = Math.random().toString(36).substr(2, 9); // Unique ID
    const toastContainer = document.querySelector(".toast");

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

  // Initialize cart
  const cart = new Cart();

  // Order button handlers
  document.querySelectorAll(".details .order-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const card = this.closest(".server-card");
      if (!card) return;

      const name = card.querySelector("h3")?.textContent;
      const price = card.querySelector(".price")?.textContent;
      const code = "SRV-IR-" + Date.now();
      
      // Check if we're in Europe mode
      const locationSwitch = document.getElementById("server-location");
      const isEurope = locationSwitch && !locationSwitch.checked;

      localStorage.setItem(
        "selectedService",
        JSON.stringify({
          name: name,
          price: price,
          code: code,
          type: "server",
        })
      );

      window.location.href = `select-service.html${isEurope ? '?location=europe' : ''}`;
    });
  });
});
