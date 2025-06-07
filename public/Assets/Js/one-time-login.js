const togglePassword = document.querySelector("#toggle");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function () {
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);

  const icon = this.querySelector("i");
  if (type === "password") {
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");

menuIcon.onclick = () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("bx-x");
};

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
    navbar.classList.remove("active");
    menuIcon.classList.remove("bx-x");
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form');
  const phoneInput = document.querySelector('#phone');
  
  // Handle phone input
  phoneInput.addEventListener('input', function(e) {
    // Remove any non-numeric characters and limit to 10 digits
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
  });
  
  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phoneNumber = phoneInput.value;
    
    // Validate phone number
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return; // Don't submit if invalid
    }
    
    // Save phone number in localStorage for verification page
    localStorage.setItem('otp_phone', phoneNumber);
    
    // Generate and save OTP
    const otp = generateOTP();
    localStorage.setItem('otp_code', otp);
    
    // Redirect to verification page
    window.location.href = './otp-verification.html';
  });
});

// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
} 