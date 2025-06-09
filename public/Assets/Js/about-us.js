// About Us Page Management
document.addEventListener('DOMContentLoaded', () => {
    // Load about us content
    loadAboutContent();
});

// Load about us content from the backend
async function loadAboutContent() {
    try {
        showLoading();
        
        const response = await fetch('/api/content/about-us', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load content');
        
        const data = await response.json();
        if (data.success) {
            renderContent(data.data);
        } else {
            showError(data.error.message);
        }
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load content');
    }
}

// Render content in the page
function renderContent(content) {
    const aboutContent = document.getElementById('aboutContent');
    
    aboutContent.innerHTML = `
        <div class="about-header">
            <h1>${content.title}</h1>
            ${content.metaDescription ? `<p class="meta-description">${content.metaDescription}</p>` : ''}
        </div>
        
        <div class="about-content">
            ${content.content}
        </div>
        
        <div class="about-features">
            <div class="feature">
                <i class="fas fa-server"></i>
                <h3>Reliable Infrastructure</h3>
                <p>State-of-the-art data centers with 99.9% uptime guarantee</p>
            </div>
            <div class="feature">
                <i class="fas fa-shield-alt"></i>
                <h3>Advanced Security</h3>
                <p>Enterprise-grade security measures to protect your data</p>
            </div>
            <div class="feature">
                <i class="fas fa-headset"></i>
                <h3>24/7 Support</h3>
                <p>Round-the-clock technical support from our expert team</p>
            </div>
            <div class="feature">
                <i class="fas fa-chart-line"></i>
                <h3>Scalable Solutions</h3>
                <p>Flexible and scalable infrastructure to grow with your business</p>
            </div>
        </div>
        
        <div class="about-stats">
            <div class="stat-item">
                <div class="stat-number">99.9%</div>
                <div class="stat-label">Uptime</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Support</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">1000+</div>
                <div class="stat-label">Clients</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">10+</div>
                <div class="stat-label">Years Experience</div>
            </div>
        </div>
        
        <div class="about-team">
            <h2>Our Team</h2>
            <div class="team-grid">
                <div class="team-member">
                    <img src="/Assets/images/team/ceo.jpg" alt="CEO">
                    <h3>John Doe</h3>
                    <p>CEO & Founder</p>
                </div>
                <div class="team-member">
                    <img src="/Assets/images/team/cto.jpg" alt="CTO">
                    <h3>Jane Smith</h3>
                    <p>CTO</p>
                </div>
                <div class="team-member">
                    <img src="/Assets/images/team/operations.jpg" alt="Operations">
                    <h3>Mike Johnson</h3>
                    <p>Operations Director</p>
                </div>
                <div class="team-member">
                    <img src="/Assets/images/team/support.jpg" alt="Support">
                    <h3>Sarah Williams</h3>
                    <p>Support Manager</p>
                </div>
            </div>
        </div>
    `;
}

// Show loading spinner
function showLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

// Hide loading spinner
function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const aboutContent = document.getElementById('aboutContent');
    aboutContent.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="loadAboutContent()" class="btn btn-primary">
                <i class="fas fa-sync-alt"></i>
                Try Again
            </button>
        </div>
    `;
}
