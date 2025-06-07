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
  const usernameInput = form.querySelector('input[type="text"]');
  const rememberCheckbox = form.querySelector('.ui-checkbox');
  
  // Load saved username if exists
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberCheckbox.checked = true;
  }
  
  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value;
    
    // Save username if remember me is checked
    if (rememberCheckbox.checked) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
    
    // Handle login logic here
    // ...
  });
});
