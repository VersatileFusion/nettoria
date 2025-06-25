const apiClient = new ApiClient();
async function loadAlerts() {
  try {
    const alerts = await apiClient.get('/vcenter/alerts');
    const container = document.getElementById('vcenter-alerts');
    if (!container) return;
    container.innerHTML = alerts.map(alert => `
      <div class="alert">
        <strong>${alert.type}</strong> [${alert.severity}]: ${alert.message}
        <br><small>${new Date(alert.createdAt).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load alerts', e);
  }
}
document.addEventListener('DOMContentLoaded', loadAlerts); 