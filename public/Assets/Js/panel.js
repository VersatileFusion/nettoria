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

// User dropdown functionality
const userButton = document.querySelector(".user-button");
const userDropdown = document.querySelector(".user-dropdown");

userButton.addEventListener("click", () => {
  userDropdown.classList.toggle("active");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!userDropdown.contains(e.target)) {
    userDropdown.classList.remove("active");
  }
});

let currentFilter = null;

// Add click handlers for service boxes
document.querySelectorAll(".service-box").forEach((box) => {
  box.addEventListener("click", () => {
    const serviceType = box.querySelector(".service-title").textContent;
    const serviceDomain = box.querySelector(".service-domain")?.textContent;

    console.log("Clicked Service Type:", serviceType);

    // If clicking the same service type, reset the filter
    if (currentFilter === serviceType) {
      resetFilter();
      return;
    }

    // Handle domain and host filtering
    if (serviceType === "دامنه") {
      filterServices("دامنه");
      currentFilter = "دامنه";
    } else if (serviceType === "هاست") {
      filterServices("هاست");
      currentFilter = "هاست";
    } else {
      filterServices(serviceType);
      currentFilter = serviceType;
    }

    // If it's a VPN service, redirect to VPN panel
    if (serviceType.includes("پنل") || serviceType.includes("VPN") || serviceType.includes("وی پی ان")) {
      window.location.href = "./vpn-panel.html";
    }

    // Update counts after filtering
    updateServiceCounts();
  });
});

function filterServices(selectedService) {
  const sections = document.querySelectorAll('.services-section');
  let relevantCategory = "";

  // Determine the relevant category based on selected service
  if (selectedService === "دامنه") {
    relevantCategory = "domain";
  } else if (selectedService === "هاست") {
    relevantCategory = "host";
  } else if (selectedService.includes("سرور مجازی")) {
    relevantCategory = "vps";
  } else if (selectedService.includes("سرور ابری")) {
    relevantCategory = "cloud";
  } else if (selectedService.includes("وی پی ان") || selectedService.includes("پنل")) {
    relevantCategory = "vpn";
  }

  console.log("Selected Service:", selectedService);
  console.log("Relevant Category:", relevantCategory);

  sections.forEach(section => {
    if (section === sections[0]) return; // Skip summary section
    
    const sectionCategory = section.dataset.category;
    console.log("Section Category:", sectionCategory);
    
    if (sectionCategory === relevantCategory) {
      section.classList.remove('hidden');
      section.style.display = 'block';
      setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, 50);
    } else {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      setTimeout(() => {
        section.classList.add('hidden');
        section.style.display = 'none';
      }, 300);
    }
  });
}

function resetFilter() {
  const sections = document.querySelectorAll('.services-section');
  
  sections.forEach(section => {
    if (section === sections[0]) return; // Skip summary section
    
    section.classList.remove('hidden');
    section.style.display = 'block';
    section.style.opacity = '1';
    section.style.transform = 'translateY(0)';
  });

  // Reset current filter
  currentFilter = null;

  // Update service counts
  updateServiceCounts();
}

// Function to update service counts
function updateServiceCounts() {
  const sections = document.querySelectorAll(".services-section");
  const counts = {
    "دامنه": 0,
    "هاست": 0,
    "سرور مجازی": 0,
    "سرور ابری": 0,
    "وی پی ان": 0,
  };

  // Count services in each section
  sections.forEach((section) => {
    const sectionTitle = section.querySelector(".services-section-title")?.textContent || "";
    const serviceBoxes = section.querySelectorAll(".service-box");

    if (sectionTitle.includes("دامنه")) {
      counts["دامنه"] += serviceBoxes.length;
    } else if (sectionTitle.includes("هاست")) {
      counts["هاست"] += serviceBoxes.length;
    } else if (sectionTitle.includes("سرور مجازی")) {
      counts["سرور مجازی"] += serviceBoxes.length;
    } else if (sectionTitle.includes("سرور ابری")) {
      counts["سرور ابری"] += serviceBoxes.length;
    } else if (sectionTitle.includes("VPN")) {
      counts["وی پی ان"] += serviceBoxes.length;
    }
  });

  // Update summary section counts
  const summarySection = document.querySelector(".services-section:first-child");
  summarySection.querySelectorAll(".service-box").forEach((box) => {
    const title = box.querySelector(".service-title").textContent;
    const countElement = box.querySelector(".service-count");

    for (const [category, count] of Object.entries(counts)) {
      if (title.includes(category)) {
        countElement.textContent = count + " عدد";
        break;
      }
    }
  });
}

// Call updateServiceCounts initially
updateServiceCounts();

// Add mobile side menu functionality
const loginIcon = document.querySelector("#login-icon");
const sideMenu = document.querySelector(".side-menu");

loginIcon.addEventListener("click", () => {
  sideMenu.classList.toggle("active");
});

// Close side menu when clicking outside
document.addEventListener("click", (e) => {
  if (!sideMenu.contains(e.target) && !loginIcon.contains(e.target)) {
    sideMenu.classList.remove("active");
  }
});

// Close side menu when clicking menu items
document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 991) {
      sideMenu.classList.remove("active");
    }
  });
});

// اضافه کردن event handler برای دکمه‌های منوی کناری
document.querySelectorAll(".side-menu-items .menu-item").forEach((menuItem) => {
    menuItem.addEventListener("click", () => {
        const category = menuItem.dataset.category;
        const menuText = menuItem.querySelector("span").textContent;
        let serviceType = "";

        // تعیین نوع سرویس بر اساس متن منو
        if (category === "domain") {
            serviceType = "دامنه";
        } else if (category === "host") {
            serviceType = "هاست";
        } else if (category === "vps") {
            serviceType = "سرور مجازی";
        } else if (category === "vpn") {
            serviceType = "وی پی ان";
        }

        // اگر روی همان دکمه کلیک شده، فیلتر را ریست کن
        if (currentFilter === serviceType) {
            resetFilter();
            return;
        }

        filterServices(serviceType);
        currentFilter = serviceType;

        // آپدیت تعداد سرویس‌ها
        updateServiceCounts();
    });
});

// Mobile category navigation
document.querySelectorAll('.category-box').forEach(category => {
    category.addEventListener('click', () => {
        const categoryType = category.dataset.category;
        
        // Hide all sections first
        document.querySelectorAll('.services-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected section
        const targetSection = document.querySelector(`.services-section[data-category="${categoryType}"]`);
        if (targetSection) {
            document.querySelector('.services-grid').classList.add('active');
            targetSection.classList.add('active');
            
            // Scroll to the section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add back button functionality for mobile
const servicesTitle = document.querySelector('.services-title');
servicesTitle.addEventListener('click', () => {
    if (window.innerWidth <= 991) {
        document.querySelector('.services-grid').classList.remove('active');
        document.querySelectorAll('.services-section').forEach(section => {
            section.classList.remove('active');
        });
    }
});

// Update service selector functionality
const serviceSelector = document.getElementById('serviceSelector');
if (serviceSelector) {
  serviceSelector.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    console.log("Selected Category from dropdown:", selectedCategory);
    
    const sections = document.querySelectorAll('.services-section');
    
    sections.forEach(section => {
      if (section === sections[0]) return; // Skip summary section
      
      const sectionCategory = section.dataset.category;
      console.log("Section Category in dropdown:", sectionCategory);
      
      if (selectedCategory === 'all') {
        section.style.display = 'block';
        section.style.opacity = '1';
        section.style.transform = 'none';
        section.classList.remove('hidden');
      } else if (sectionCategory === selectedCategory) {
        section.style.display = 'block';
        section.style.opacity = '1';
        section.style.transform = 'none';
        section.classList.remove('hidden');
      } else {
        section.style.display = 'none';
        section.classList.add('hidden');
      }
    });
  });
}

// User menu functionality
const userMenu = document.querySelector('.user-menu');
const userInfo = document.querySelector('.user-info');

if (userInfo) {
  userInfo.addEventListener('click', () => {
    userMenu.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('active');
    }
  });
}
