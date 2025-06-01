// Protected Route Handler
const protectedRoute = {
    // Check if user is authenticated
    checkAuth() {
        const token = auth.getToken();
        if (!token) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Add auth header to fetch requests
    getAuthHeader() {
        const token = auth.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // Handle API requests with authentication
    async fetchWithAuth(url, options = {}) {
        if (!this.checkAuth()) {
            throw new Error('Not authenticated');
        }

        const headers = {
            ...this.getAuthHeader(),
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Token expired or invalid
                auth.removeToken();
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }
};

// Export the protected route handler
window.protectedRoute = protectedRoute; 