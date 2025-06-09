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

  // Handle location switch clicks
  const locationBtns = document.querySelectorAll(".switch-btn");
  locationBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Location button clicked - no restrictions
    });
  });

  // Handle upgrade button clicks
  const upgradeButtons = document.querySelectorAll(".upgrade-btn");
  upgradeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      let title, message;

      switch (type) {
        case "ram":
          title = "ارتقا حافظه";
          message = "در حال حاضر امکان ارتقا حافظه وجود ندارد";
          break;
        case "disk":
          title = "ارتقا دیسک";
          message = "در حال حاضر امکان ارتقا فضای دیسک وجود ندارد";
          break;
        case "cpu":
          title = "ارتقا پردازنده";
          message = "در حال حاضر امکان ارتقا پردازنده وجود ندارد";
          break;
      }

      Alert(title, message, 3000, "info");
    });
  });

  // Initialize sliders
  initSlider("ram", [16384, 8192, 4096, 2048, 1024], "MB");
  initSlider("disk", [200, 100, 50, 25, 15], "GB");
  initSlider("cpu", [8, 6, 4, 2, 1], "Core");

  // Initialize location and OS tabs
  initTabs();

  // Update price initially
  updateTotalPrice();

  // Handle order button click
  const orderBtn = document.querySelector(".order-btn");
  if (orderBtn) {
    orderBtn.addEventListener("click", function () {
      const ramValue = sliderConfig.ram.values[currentValues.ram];
      const diskValue = sliderConfig.disk.values[currentValues.disk];
      const cpuValue = sliderConfig.cpu.values[currentValues.cpu];

      // Get the price and convert it to a number
      const priceText = document.getElementById("total-price").textContent;
      const price = parseInt(priceText.replace(/[^0-9]/g, ""));

      // Create service summary with all details
      const serviceSummary = {
        name: `سرور ابری ${currentValues.location} - ${currentValues.os}`,
        specs: {
          ram: `${ramValue} ${sliderConfig.ram.unit}`,
          disk: `${diskValue} ${sliderConfig.disk.unit}`,
          cpu: `${cpuValue} ${sliderConfig.cpu.unit}`,
        },
        price: price,
        extras: {
          datacenter: currentValues.location,
          os: currentValues.os,
          ram: ramValue,
          disk: diskValue,
          cpu: cpuValue,
        },
      };

      // Add to cart using the cart module
      if (typeof cart !== "undefined") {
        const serviceCode = `CLOUD-${Date.now()}`;
        cart.addItem(
          serviceSummary.name,
          serviceCode,
          1,
          price,
          "cloud-server",
          serviceSummary.extras
        );

        // Redirect directly to cart page
        window.location.href = "cart.html";
      } else {
        // Fallback if cart is not available
        alert("سرویس با موفقیت به سبد خرید اضافه شد.");
      }
    });
  }

  // Handle options button click
  const optionsBtn = document.querySelector(".options-btn");
  if (optionsBtn) {
    optionsBtn.addEventListener("click", function () {
      // Redirect to the main services page
      window.location.href = "index.html#services";
    });
  }
});

// Alert function
function Alert(title, message, time, type) {
  const number = Math.random().toString(36).substr(2, 9);
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

// Slider configuration
const sliderConfig = {
  ram: {
    values: [16384, 8192, 4096, 2048, 1024],
    unit: "MB",
    prices: [32000, 17000, 9000, 5500, 3000],
    initialIndex: 2, // 4096 MB
  },
  disk: {
    values: [200, 100, 50, 25, 15],
    unit: "GB",
    prices: [20000, 11000, 6000, 3500, 2000],
    initialIndex: 3, // 25 GB
  },
  cpu: {
    values: [8, 6, 4, 2, 1],
    unit: "Core",
    prices: [30000, 22000, 15000, 8000, 4500],
    initialIndex: 3, // 2 Core
  },
};

// Current values
let currentValues = {
  ram: sliderConfig.ram.initialIndex,
  disk: sliderConfig.disk.initialIndex,
  cpu: sliderConfig.cpu.initialIndex,
  location: "ایران",
  os: "لینوکس",
};

// Initialize slider functionality
function initSlider(type, values, unit) {
  const slider = document.getElementById(`${type}-handle`);
  const fill = document.getElementById(`${type}-fill`);
  const valueDisplay = document.getElementById(`${type}-value`);
  const track = slider.parentElement.querySelector(".slider-track");

  let isDragging = false;
  let currentStep = sliderConfig[type].initialIndex;

  // Set initial position
  updateSliderPosition(type, currentStep);

  // Helper function to get position from event
  function getPosition(e) {
    const rect = track.getBoundingClientRect();
    const x = rect.right - e.clientX; // RTL adjustment - measure from right side
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return percent;
  }

  // Helper function to get step from position
  function getStepFromPosition(percent) {
    const numSteps = values.length - 1;
    const rawStep = Math.round((percent / 100) * numSteps);
    return Math.max(0, Math.min(numSteps, rawStep));
  }

  // Mouse events for desktop
  slider.addEventListener("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    const percent = getPosition(e);
    const step = getStepFromPosition(percent);

    if (step !== currentStep) {
      currentStep = step;
      currentValues[type] = currentStep;
      updateSliderPosition(type, currentStep);
      updateTotalPrice();
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  // Touch events for mobile
  slider.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isDragging = true;
  });

  document.addEventListener("touchmove", function (e) {
    if (!isDragging) return;

    const touch = e.touches[0];
    const percent = getPosition(touch);
    const step = getStepFromPosition(percent);

    if (step !== currentStep) {
      currentStep = step;
      currentValues[type] = currentStep;
      updateSliderPosition(type, currentStep);
      updateTotalPrice();
    }
  });

  document.addEventListener("touchend", function () {
    isDragging = false;
  });

  // Click on track to set position
  track.addEventListener("click", function (e) {
    const percent = getPosition(e);
    const step = getStepFromPosition(percent);

    currentStep = step;
    currentValues[type] = currentStep;
    updateSliderPosition(type, currentStep);
    updateTotalPrice();
  });
}

// Update slider position and value display
function updateSliderPosition(type, step) {
  const values = sliderConfig[type].values;
  const unit = sliderConfig[type].unit;

  const percent = (step / (values.length - 1)) * 100;

  const slider = document.getElementById(`${type}-handle`);
  const fill = document.getElementById(`${type}-fill`);
  const valueDisplay = document.getElementById(`${type}-value`);

  slider.style.right = `${percent}%`;
  fill.style.width = `${100 - percent}%`;
  fill.style.right = `${percent}%`;
  valueDisplay.textContent = `${values[step]} ${unit}`;
}

// Initialize location and OS tabs
function initTabs() {
  const tabs = document.querySelectorAll(".selection-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Check if it's the Europe tab
      if (this.textContent.trim() === "اروپا") {
        Alert(
          "سرور اروپا",
          "در حال حاضر سرورهای اروپا در دسترس نیستند",
          3000,
          "warning"
        );
        return;
      }

      // Get the tab group
      const tabGroup = this.parentElement;

      // Remove active class from all tabs in this group
      tabGroup.querySelectorAll(".selection-tab").forEach((t) => {
        t.classList.remove("active");
      });

      // Add active class to clicked tab
      this.classList.add("active");

      // Update current values based on tab type
      if (tabGroup === document.querySelectorAll(".tab-group")[0]) {
        // Location tabs
        currentValues.location = this.textContent.trim();
      } else {
        // OS tabs
        currentValues.os = this.textContent.trim();
      }

      // Update price
      updateTotalPrice();
    });
  });
}

// Calculate and update total price
function updateTotalPrice() {
  // Base prices from configuration
  const ramPrice = sliderConfig.ram.prices[currentValues.ram];
  const diskPrice = sliderConfig.disk.prices[currentValues.disk];
  const cpuPrice = sliderConfig.cpu.prices[currentValues.cpu];

  // OS multiplier (Windows costs more)
  const osMultiplier = currentValues.os === "ویندوز" ? 1.5 : 1;

  // Location multiplier (Europe costs more)
  const locationMultiplier = currentValues.location === "اروپا" ? 1.7 : 1;

  // Calculate total daily price
  let dailyPrice =
    (ramPrice + diskPrice + cpuPrice) * osMultiplier * locationMultiplier;

  // Format and display price
  const priceElement = document.getElementById("total-price");
  priceElement.textContent = Math.round(dailyPrice).toLocaleString("fa-IR");
}
