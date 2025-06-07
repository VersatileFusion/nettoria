// Global variables
let osSelect;

// Global functions
function calculateExtraPrice() {
  let totalExtra = 0;

  // محاسبه قیمت IP های اضافه
  const ipInput = document.getElementById("ip-count");
  if (ipInput) {
    const ipCount = parseInt(ipInput.value) || 1;
    if (ipCount > 1) {
      const pricePerIp = parseInt(ipInput.dataset.price) || 50000;
      totalExtra += (ipCount - 1) * pricePerIp; // فقط برای IP های اضافی محاسبه می‌شود
    }
  }

  // محاسبه سایر آپشن‌های اضافه
  document
    .querySelectorAll(".price-selector:not(#ip-count)")
    .forEach((select) => {
      const value = parseInt(select.value) || 0;
      totalExtra += value;
    });

  return totalExtra;
}

function updateCartButton(price, originalPrice) {
  const cartBtn = document.querySelector(".cart-btn");
  const priceSection =
    document.querySelector(".price-section") || document.createElement("div");
  priceSection.className = "price-section";

  if (originalPrice && originalPrice > price) {
    priceSection.innerHTML = `
      <div class="price-label">جمع سفارش</div>
      <div class="original-price">${originalPrice.toLocaleString()} تومان</div>
      <div class="final-price">${price.toLocaleString()} تومان</div>
    `;
  } else {
    priceSection.innerHTML = `
      <div class="price-label">جمع سفارش</div>
      <div class="final-price">${price.toLocaleString()} تومان</div>
    `;
  }

  if (cartBtn) {
    cartBtn.innerHTML = `<i class='bx bx-cart-alt'></i>افزودن به سبد خرید`;
    // اگر price-section قبلاً وجود نداشته، آن را بعد از cartBtn اضافه کن
    if (!document.querySelector(".price-section")) {
      cartBtn.parentNode.insertBefore(priceSection, cartBtn);
    }
  }
}

function updateOrderSummary(basePrice) {
  const orderDetails = document.getElementById("order-details");
  if (!orderDetails) return;

  const selectedDuration = document.querySelector(".duration-btn.selected");
  const duration = selectedDuration
    ? parseInt(selectedDuration.dataset.duration)
    : 1;

  let summaryItems = [];

  // محاسبه قیمت نهایی برای نمایش در بخش قیمت
  const extraPrice = calculateExtraPrice();
  const totalPrice = (basePrice + extraPrice) * duration;
  let finalPrice = totalPrice;

  if (duration === 3) finalPrice *= 0.95;
  else if (duration === 6) finalPrice *= 0.9;
  else if (duration === 12) finalPrice *= 0.8;

  // جمع‌آوری اطلاعات سفارش
  const servicePlan = document.querySelector("#service-plan");
  if (servicePlan) {
    summaryItems.push({
      label: "پلن انتخابی",
      value: servicePlan.textContent,
      priority: 1,
    });
  }

  // مدت زمان
  if (selectedDuration) {
    let durationText = `${duration} ماهه`;
    if (duration === 3) durationText += " (5% تخفیف)";
    else if (duration === 6) durationText += " (10% تخفیف)";
    else if (duration === 12) durationText += " (20% تخفیف)";

    summaryItems.push({
      label: "مدت زمان",
      value: durationText,
      priority: 2,
    });
  }

  // آپشن‌های اضافی
  const priceSelectors = document.querySelectorAll(".price-selector");
  priceSelectors.forEach((select) => {
    if (select.id === "ip-count") {
      const ipCount = parseInt(select.value) || 1;
      if (ipCount > 1) {
        const pricePerIp = parseInt(select.dataset.price) || 50000;
        summaryItems.push({
          label: "تعداد آی پی",
          value: `${ipCount} عدد (${(
            (ipCount - 1) *
            pricePerIp
          ).toLocaleString()} تومان)`,
          priority: 4,
        });
      }
    } else if (select.value !== "0") {
      const selectedOption = select.options[select.selectedIndex];
      const label = select.previousElementSibling.textContent
        .replace(":", "")
        .replace("(اختیاری)", "")
        .trim();
      summaryItems.push({
        label: label,
        value: selectedOption.text,
        priority: 4,
      });
    }
  });

  // مرتب‌سازی آیتم‌ها بر اساس اولویت
  summaryItems.sort((a, b) => a.priority - b.priority);

  // جدا کردن سه آیتم اصلی و بقیه
  const mainItems = summaryItems.slice(0, 3);
  const moreItems = summaryItems.slice(3);

  // ساخت HTML
  let summaryHTML = '<div class="summary-title">خلاصه سفارش</div>';
  summaryHTML += '<div class="summary-grid">';

  // نمایش سه آیتم اصلی
  mainItems.forEach((item, index) => {
    summaryHTML += `
      <div class="summary-box">
        <div class="summary-box-title">${item.label}</div>
        <div class="summary-box-value">${item.value}</div>
      </div>
    `;

    // اضافه کردن علامت + بین باکس‌ها
    if (index < mainItems.length - 1) {
      summaryHTML += '<div class="plus-sign">+</div>';
    }
  });

  // اگر آیتم‌های بیشتری وجود دارد
  if (moreItems.length > 0) {
    summaryHTML += '<div class="plus-sign">+</div>';
    summaryHTML += `
      <div class="summary-more">
        <div class="more-trigger">...</div>
        <div class="more-content">
    `;

    moreItems.forEach((item) => {
      summaryHTML += `
        <div class="summary-box">
          <div class="summary-box-title">${item.label}</div>
          <div class="summary-box-value">${item.value}</div>
        </div>
      `;
    });

    summaryHTML += "</div></div>";
  }

  summaryHTML += "</div>";

  orderDetails.innerHTML =
    summaryHTML || "لطفا موارد مورد نظر خود را انتخاب کنید";

  // آپدیت دکمه سبد خرید و قیمت‌ها
  updateCartButton(finalPrice, totalPrice);
}

// Main event listener
document.addEventListener("DOMContentLoaded", function () {
  // Menu functionality
  const menuIcon = document.querySelector("#menu-icon");
  const navbar = document.querySelector(".navbar");

  menuIcon?.addEventListener("click", () => {
    menuIcon.classList.toggle("bx-x");
    navbar.classList.toggle("active");
  });

  // آپدیت قیمت با توجه به مدت زمان و آپشن‌های اضافی
  function updatePrice(basePrice, duration) {
    const extraPrice = calculateExtraPrice();
    let totalPrice = (basePrice + extraPrice) * duration;

    // اعمال تخفیف
    if (duration === 3) {
      totalPrice *= 0.95; // 5% تخفیف
    } else if (duration === 6) {
      totalPrice *= 0.9; // 10% تخفیف
    } else if (duration === 12) {
      totalPrice *= 0.8; // 20% تخفیف
    }

    updateCartButton(totalPrice, totalPrice);
    return totalPrice;
  }

  async function initializeService() {
    try {
      // خواندن اطلاعات سرویس از localStorage
      const editingServiceStr = localStorage.getItem("editingService");
      const selectedServiceStr = editingServiceStr || localStorage.getItem("selectedService");
      
      if (!selectedServiceStr) {
        console.error("No service selected");
        window.location.href = "./index.html";
        return;
      }

      let selectedService;
      try {
        selectedService = JSON.parse(selectedServiceStr);
      } catch (e) {
        console.error("Error parsing service data:", e);
        localStorage.removeItem("selectedService");
        localStorage.removeItem("editingService");
        window.location.href = "./index.html";
        return;
      }

      // Validate required service data
      if (!selectedService || !selectedService.name) {
        console.error("Invalid service data - missing name");
        localStorage.removeItem("selectedService");
        localStorage.removeItem("editingService");
        window.location.href = "./index.html";
        return;
      }

      // Parse and validate price
      let basePrice;
      if (typeof selectedService.price === 'number') {
        basePrice = selectedService.price;
      } else if (typeof selectedService.price === 'string') {
        // Remove non-numeric characters and parse
        basePrice = parseInt(selectedService.price.toString().replace(/[^0-9]/g, ""));
      }

      if (isNaN(basePrice) || basePrice <= 0) {
        console.error("Invalid price format or value");
        localStorage.removeItem("selectedService");
        localStorage.removeItem("editingService");
        window.location.href = "./index.html";
        return;
      }

      // Determine datacenter based on server type and location
      let datacenter = "تهران"; // Default for Iran servers
      
      // Check if it's a European server by checking the URL parameters and service type
      const urlParams = new URLSearchParams(window.location.search);
      const isEuropeanServer = urlParams.get('location') === 'europe' || 
                              (selectedService.type && selectedService.type.toLowerCase().includes("eu")) ||
                              (selectedService.name && (
                                selectedService.name.includes("اسکای") ||
                                selectedService.name.includes("وست") ||
                                selectedService.name.includes("نکس") ||
                                selectedService.name.includes("پرایم")
                              ));
      
      if (isEuropeanServer) {
        datacenter = "Hetzner";
      }

      // نمایش اطلاعات پلن
      const servicePlan = document.querySelector("#service-plan");
      const datacenterDisplay = document.getElementById("datacenter-display");
      osSelect = document.getElementById("os-select");
      
      if (datacenterDisplay) {
        datacenterDisplay.textContent = datacenter;
      }

      if (servicePlan) {
        servicePlan.textContent = `${selectedService.name} - ${basePrice.toLocaleString()} تومان`;
        servicePlan.dataset.basePrice = basePrice;
        servicePlan.dataset.datacenter = datacenter;
        
        // تنظیم گزینه‌های سیستم عامل بر اساس پلن انتخابی
        if (osSelect) {
          // پاک کردن گزینه‌های قبلی
          osSelect.innerHTML = '<option value="">انتخاب کنید</option>';
          
          // اگر پلن اطلس انتخاب شده باشد
          if (selectedService.name.includes("اطلس")) {
            // فقط سیستم عامل‌های لینوکس
            const linuxOptions = [
              { value: "ubuntu", text: "Ubuntu" },
              { value: "centos", text: "CentOS" },
              { value: "debian", text: "Debian" }
            ];
            
            linuxOptions.forEach(os => {
              const option = document.createElement("option");
              option.value = os.value;
              option.textContent = os.text;
              osSelect.appendChild(option);
            });
          } else {
            // همه سیستم عامل‌ها برای بقیه پلن‌ها
            const allOptions = [
              { value: "ubuntu", text: "Ubuntu" },
              { value: "centos", text: "CentOS" },
              { value: "debian", text: "Debian" },
              { value: "windows", text: "Windows Server" }
            ];
            
            allOptions.forEach(os => {
              const option = document.createElement("option");
              option.value = os.value;
              option.textContent = os.text;
              osSelect.appendChild(option);
            });
          }
        }
      }

      // تنظیم قیمت اولیه در دکمه سبد خرید
      updatePrice(basePrice, 1);

      // نمایش خلاصه سفارش اولیه
      updateOrderSummary(basePrice);

      // پر کردن فرم با مقادیر قبلی اگر در حال ویرایش هستیم
      if (editingServiceStr) {
        let editingService;
        try {
          editingService = JSON.parse(editingServiceStr);
        } catch (e) {
          console.error("Error parsing editing service data:", e);
          localStorage.removeItem("editingService");
          return;
        }
        
        // پر کردن نام سرویس
        const serviceNameInput = document.getElementById("service-name");
        if (serviceNameInput && editingService.serviceName) {
          serviceNameInput.value = editingService.serviceName;
        }

        // پر کردن سیستم عامل
        if (editingService.os && osSelect) {
          osSelect.value = editingService.os;
        }

        // انتخاب مدت زمان
        if (editingService.duration) {
          const durationBtn = document.querySelector(`[data-duration="${editingService.duration}"]`);
          if (durationBtn) {
            document.querySelectorAll(".duration-btn").forEach(btn => btn.classList.remove("selected"));
            durationBtn.classList.add("selected");
          }
        }

        // پر کردن آپشن‌های اضافی
        if (editingService.extras) {
          // تنظیم تعداد IP
          const ipInput = document.getElementById("ip-count");
          if (ipInput && editingService.extras.ip?.value) {
            ipInput.value = editingService.extras.ip.value;
          }

          // تنظیم ترافیک
          const trafficSelect = document.querySelector('[data-type="traffic"]');
          if (trafficSelect && editingService.extras.traffic?.price) {
            trafficSelect.value = editingService.extras.traffic.price;
          }

          // تنظیم رم
          const ramSelect = document.querySelector('[data-type="ram"]');
          if (ramSelect && editingService.extras.ram?.price) {
            ramSelect.value = editingService.extras.ram.price;
          }

          // تنظیم هسته پردازنده
          const coolerSelect = document.querySelector('[data-type="cooler"]');
          if (coolerSelect && editingService.extras.cooler?.price) {
            coolerSelect.value = editingService.extras.cooler.price;
          }

          // تنظیم هارد
          const hddSelect = document.querySelector('[data-type="hdd"]');
          if (hddSelect && editingService.extras.hdd?.price) {
            hddSelect.value = editingService.extras.hdd.price;
          }

          // آپدیت خلاصه سفارش و قیمت
          updatePrice(basePrice, editingService.duration || 1);
          updateOrderSummary(basePrice);
        }

        // پاک کردن اطلاعات ویرایش بعد از بازیابی
        localStorage.removeItem("editingService");
      }

      // تغییر عنوان صفحه بر اساس نوع سرویس
      const pageTitle = document.querySelector(".service-container h2");
      if (pageTitle) {
        let titleText = "سفارش ";

        // اول از URL نوع سرویس رو تشخیص میدیم
        const currentPath = window.location.pathname.toLowerCase();

        if (currentPath.includes("virtual-server.html")) {
          titleText += "سرور مجازی ایران";
        } else if (currentPath.includes("cloud-server.html")) {
          titleText += "سرور مجازی خارج";
        } else if (currentPath.includes("cloud-host.html")) {
          titleText += "هاست ابری";
        }
        // اگر از URL نتونستیم تشخیص بدیم، از نوع سرویس استفاده می‌کنیم
        else if (selectedService && selectedService.type) {
          switch (selectedService.type.toLowerCase()) {
            case "virtual-server":
              titleText += "سرور مجازی";
              break;
            case "eu-server":
              titleText += "سرور ابری";
              break;
            case "cloud-host":
              titleText += "هاست ابری";
              break;
            default:
              titleText += "سرور مجازی";
          }
        } else {
          titleText += "سرور مجازی";
        }

        pageTitle.textContent = titleText;

        // همچنین عنوان HTML صفحه رو هم آپدیت می‌کنیم
        document.title = titleText + " - نتوریا";
      }

      // گرفتن المان‌های مورد نیاز
      const durationButtons = document.querySelectorAll(".duration-btn");
      const cartBtn = document.querySelector(".cart-btn");
      const priceSelectors = document.querySelectorAll(".price-selector");

      if (!servicePlan || !cartBtn) {
        throw new Error("Required elements not found");
      }

      // انتخاب دکمه یک ماهه به صورت پیش‌فرض
      const oneMonthButton = document.querySelector(
        '.duration-btn[data-duration="1"]'
      );
      if (oneMonthButton) {
        oneMonthButton.classList.add("selected");
      }

      // اضافه کردن event listener برای دکمه‌های مدت زمان
      durationButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          durationButtons.forEach((btn) => btn.classList.remove("selected"));
          button.classList.add("selected");

          // محاسبه و نمایش قیمت جدید
          const duration = parseInt(button.dataset.duration) || 1;
          updatePrice(basePrice, duration);
          updateOrderSummary(basePrice);
        });
      });

      // اضافه کردن event listener برای select‌های قیمت
      priceSelectors.forEach((select) => {
        select.addEventListener("change", () => {
          const duration =
            parseInt(
              document.querySelector(".duration-btn.selected")?.dataset.duration
            ) || 1;
          updatePrice(basePrice, duration);
          updateOrderSummary(basePrice);
        });
      });

      // اضافه کردن event listener برای نام سرور
      const serviceNameInput = document.getElementById("service-name");
      if (serviceNameInput) {
        serviceNameInput.addEventListener("input", () => {
          // حذف کلاس‌های خطا در صورت پر شدن فیلد
          if (serviceNameInput.value.trim()) {
            serviceNameInput.classList.remove("error");
            serviceNameInput.parentElement.classList.remove("has-error");
          }
          updateOrderSummary(basePrice);
        });
      }

      // اضافه کردن event listener برای تعداد IP
      const ipInput = document.getElementById("ip-count");
      const minusBtn = document.querySelector(".minus-btn");
      const plusBtn = document.querySelector(".plus-btn");

      if (ipInput) {
        // تنظیم وضعیت اولیه دکمه‌ها
        function updateButtonStates() {
          const value = parseInt(ipInput.value);
          minusBtn.disabled = value <= 1;
          plusBtn.disabled = value >= 9;
        }

        // اضافه کردن event listener برای دکمه‌ها
        minusBtn?.addEventListener("click", () => {
          const currentValue = parseInt(ipInput.value);
          if (currentValue > 1) {
            ipInput.value = currentValue - 1;
            updateButtonStates();
            // Trigger input event to update price
            ipInput.dispatchEvent(new Event("input"));
          }
        });

        plusBtn?.addEventListener("click", () => {
          const currentValue = parseInt(ipInput.value);
          if (currentValue < 9) {
            ipInput.value = currentValue + 1;
            updateButtonStates();
            // Trigger input event to update price
            ipInput.dispatchEvent(new Event("input"));
          }
        });

        ipInput.addEventListener("input", () => {
          updateButtonStates();
          const duration =
            parseInt(
              document.querySelector(".duration-btn.selected")?.dataset.duration
            ) || 1;
          updatePrice(basePrice, duration);
          updateOrderSummary(basePrice);
        });

        // Set initial button states
        updateButtonStates();
      }

      // اضافه کردن event listener برای سیستم عامل
      if (osSelect) {
        osSelect.addEventListener("change", () => {
          // حذف کلاس‌های خطا در صورت انتخاب گزینه
          if (osSelect.value) {
            osSelect.classList.remove("error");
            osSelect.parentElement.classList.remove("has-error");
          }
          updateOrderSummary(basePrice);
        });
      }

      // اضافه کردن event listener برای دکمه سبد خرید
      cartBtn.addEventListener("click", function (e) {
        e.preventDefault();

        // پاک کردن خطاهای قبلی
        document.querySelectorAll(".form-group").forEach((group) => {
          group.classList.remove("has-error");
        });
        document.querySelectorAll(".form-control").forEach((control) => {
          control.classList.remove("error");
        });
        // حذف پیام خطای قبلی اگر وجود داشته باشد
        const existingError = document.querySelector(".error-message.visible");
        if (existingError) {
          existingError.remove();
        }

        // بررسی فیلدهای اجباری
        let hasError = false;

        // بررسی نام سرور
        const serviceName = document.getElementById("service-name");
        if (!serviceName.value.trim()) {
          serviceName.classList.add("error");
          serviceName.parentElement.classList.add("has-error");
          hasError = true;
        }

        // بررسی سیستم عامل
        if (!osSelect || !osSelect.value) {
          osSelect.classList.add("error");
          osSelect.parentElement.classList.add("has-error");
          hasError = true;
        }

        // اگر خطایی وجود دارد، پیام خطا نمایش داده شود
        if (hasError) {
          const errorDiv = document.createElement("div");
          errorDiv.className = "error-message visible";
          errorDiv.style.display = "block";
          errorDiv.style.marginTop = "10px";
          errorDiv.style.textAlign = "center";
          errorDiv.style.color = "#ff4444";
          errorDiv.style.fontSize = "14px";
          errorDiv.textContent = "لطفاً فیلدهای ضروری را تکمیل کنید";

          const totalSection = document.querySelector(".total-section");
          totalSection.insertBefore(errorDiv, totalSection.firstChild);
          return;
        }

        // اگر همه چیز درست است، ادامه پردازش
        try {
          const selectedDuration =
            document.querySelector(".duration-btn.selected")?.dataset
              .duration || "1";
          const duration = parseInt(selectedDuration);
          const finalPrice = updatePrice(basePrice, duration);

          // بررسی اطلاعات سرویس انتخاب شده
          const selectedService = JSON.parse(
            localStorage.getItem("selectedService")
          );
          if (!selectedService || !selectedService.name) {
            throw new Error("لطفاً ابتدا یک سرویس انتخاب کنید");
          }

          // جمع‌آوری اطلاعات آپشن‌های اضافی
          const extras = {
            datacenter: servicePlan.dataset.datacenter || "tehran", // Use the determined datacenter
            os: osSelect.value
          };

          // اضافه کردن تعداد IP
          const ipInput = document.getElementById("ip-count");
          if (ipInput && parseInt(ipInput.value) > 1) {
            const ipCount = parseInt(ipInput.value);
            extras.ip = {
              value: ipCount.toString(),
              price: (ipCount - 1) * (parseInt(ipInput.dataset.price) || 50000)
            };
          }

          // اضافه کردن سایر آپشن‌ها
          document.querySelectorAll(".price-selector:not(#ip-count)").forEach((select) => {
            if (select.value !== "0") {
              const type = select.dataset.type;
              extras[type] = {
                value: select.options[select.selectedIndex].text,
                price: parseInt(select.value)
              };
            }
          });

          // افزودن به سبد خرید
          const cart = window.getCart();
          if (!cart) {
            throw new Error("سبد خرید در دسترس نیست");
          }

          const cartItem = cart.addItem(
            selectedService.name,
            selectedService.code || `SRV-${Date.now()}`,
            1,
            basePrice,
            selectedService.type || "server",
            extras
          );

          if (!cartItem) {
            throw new Error("خطا در افزودن به سبد خرید");
          }

          // انتقال به صفحه سبد خرید
          window.location.href = "./cart.html";
        } catch (error) {
          console.error("Error:", error);
          const errorDiv = document.createElement("div");
          errorDiv.className = "error-message visible";
          errorDiv.style.display = "block";
          errorDiv.style.marginTop = "10px";
          errorDiv.style.textAlign = "center";
          errorDiv.style.color = "#ff4444";
          errorDiv.style.fontSize = "14px";
          errorDiv.textContent = error.message || "خطا در افزودن به سبد خرید";

          const totalSection = document.querySelector(".total-section");
          totalSection.insertBefore(errorDiv, totalSection.firstChild);
        }
      });
    } catch (error) {
      console.error("Error in service selection:", error);
      alert("خطا: " + error.message);
      window.location.href = "./index.html";
    }
  }

  // شروع فرآیند
  initializeService().catch((error) => {
    console.error("Fatal error:", error);
    alert("خطای سیستمی: " + error.message);
  });
});
