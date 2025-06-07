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
  // Display phone number
  const phoneNumber = localStorage.getItem('otp_phone');
  document.getElementById('display-phone').textContent = phoneNumber;

  // OTP input handling
  const otpInputs = document.querySelectorAll('.otp-input');
  const verifyBtn = document.querySelector('.verify-btn');
  const resendBtn = document.getElementById('resend-btn');
  const countdown = document.getElementById('countdown');

  // Auto-focus next input
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', function() {
      if (this.value.length === 1) {
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      }
    });

    // Handle backspace
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // Countdown timer
  let timeLeft = 120; // 2 minutes in seconds
  const timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    countdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      resendBtn.style.opacity = '1';
    }
    timeLeft--;
  }, 1000);

  // Resend OTP
  resendBtn.addEventListener('click', function() {
    if (!this.disabled) {
      // Generate new OTP
      const newOtp = generateOTP();
      localStorage.setItem('otp_code', newOtp);
      
      // Reset timer
      timeLeft = 120;
      this.disabled = true;
      this.style.opacity = '0.5';
      
      // Clear inputs
      otpInputs.forEach(input => input.value = '');
      otpInputs[0].focus();
    }
  });

  // Verify OTP
  verifyBtn.addEventListener('click', function() {
    const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
    const correctOtp = localStorage.getItem('otp_code');
    
    if (enteredOtp === correctOtp) {
      // Clear OTP data
      localStorage.removeItem('otp_code');
      localStorage.removeItem('otp_phone');
      
      // Redirect to success page
      window.location.href = './success-pass.html';
    } else {
      alert('کد تایید اشتباه است');
    }
  });
});

// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
} 