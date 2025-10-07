import AuthService from '../services/auth.service.js';

class RouteGuard {
  static init() {
    this.protectRoutes();
    this.setupAuthStateListener();
  }

  // Protect routes that require authentication
  static protectRoutes() {
    const protectedPages = [
      '/panel.html',
      '/profile.html',
      '/wallet.html',
      '/tickets.html',
      '/virtual-server.html',
      '/vm-console.html',
      '/vm-recommendations.html',
      '/admin-panel.html',
      '/orders.html',
      '/withdrawal-history.html',
      '/sms-management.html',
      '/security-preferences.html',
      '/2fa-setup.html'
    ];

    const currentPath = window.location.pathname;
    
    if (protectedPages.includes(currentPath)) {
      if (!AuthService.isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = '/login.html?redirect=' + encodeURIComponent(currentPath);
        return;
      }

      // Check role-based access for admin pages
      if (currentPath === '/admin-panel.html' && !AuthService.isAdmin()) {
        window.location.href = '/panel.html';
        return;
      }

      // Load user data for authenticated pages
      this.loadUserData();
    }
  }

  // Setup authentication state listener
  static setupAuthStateListener() {
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token' || event.key === 'current_user') {
        if (!AuthService.isAuthenticated()) {
          // User logged out in another tab
          this.handleLogout();
        } else {
          // User logged in in another tab
          this.handleLogin();
        }
      }
    });

    // Check auth status every minute
    setInterval(() => {
      if (!AuthService.isAuthenticated() && this.isOnProtectedPage()) {
        this.handleLogout();
      }
    }, 60000);
  }

  // Check if current page is protected
  static isOnProtectedPage() {
    const protectedPages = [
      '/panel.html',
      '/profile.html',
      '/wallet.html',
      '/tickets.html',
      '/virtual-server.html',
      '/vm-console.html',
      '/vm-recommendations.html',
      '/admin-panel.html',
      '/orders.html',
      '/withdrawal-history.html',
      '/sms-management.html',
      '/security-preferences.html',
      '/2fa-setup.html'
    ];

    return protectedPages.includes(window.location.pathname);
  }

  // Handle user logout
  static handleLogout() {
    // Clear any sensitive data
    localStorage.removeItem('temp_data');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/login.html';
  }

  // Handle user login
  static handleLogin() {
    // Refresh the page to load user data
    window.location.reload();
  }

  // Load user data for authenticated pages
  static async loadUserData() {
    try {
      const user = await AuthService.getProfile();
      this.updateUIWithUserData(user);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // If profile loading fails, redirect to login
      AuthService.logout();
    }
  }

  // Update UI with user data
  static updateUIWithUserData(user) {
    // Update username displays
    const usernameElements = document.querySelectorAll('[data-username]');
    usernameElements.forEach(element => {
      element.textContent = user.firstName + ' ' + user.lastName;
    });

    // Update user info in side menu
    const sideMenuUsername = document.querySelector('.side-menu .user-button span');
    if (sideMenuUsername) {
      sideMenuUsername.textContent = user.firstName + ' ' + user.lastName;
    }

    // Update mobile menu username
    const mobileUsername = document.querySelector('.user-menu .user-name');
    if (mobileUsername) {
      mobileUsername.textContent = user.firstName + ' ' + user.lastName;
    }

    // Update user avatar if exists
    if (user.profilePicture) {
      const avatarElements = document.querySelectorAll('[data-avatar]');
      avatarElements.forEach(element => {
        element.src = user.profilePicture;
        element.alt = user.firstName + ' ' + user.lastName;
      });
    }

    // Show/hide admin elements based on role
    if (user.role === 'admin') {
      const adminElements = document.querySelectorAll('[data-admin-only]');
      adminElements.forEach(element => {
        element.style.display = 'block';
      });
    } else {
      const adminElements = document.querySelectorAll('[data-admin-only]');
      adminElements.forEach(element => {
        element.style.display = 'none';
      });
    }
  }

  // Check if user can access a specific feature
  static canAccess(feature) {
    if (!AuthService.isAuthenticated()) {
      return false;
    }

    const user = AuthService.getCurrentUser();
    
    switch (feature) {
      case 'admin':
        return user.role === 'admin';
      case 'vm_management':
        return true; // All authenticated users can manage VMs
      case 'billing':
        return true; // All authenticated users can access billing
      case 'support':
        return true; // All authenticated users can access support
      default:
        return false;
    }
  }

  // Redirect to intended page after login
  static redirectToIntended() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    if (redirect && redirect !== '/login.html') {
      window.location.href = redirect;
    } else {
      window.location.href = '/panel.html';
    }
  }
}

// Initialize route guard when module loads
RouteGuard.init();

export default RouteGuard; 