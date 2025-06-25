const apiClient = new ApiClient();
async function loadRecommendations(vmId) {
  try {
    const res = await apiClient.get(`/vcenter/vms/${vmId}/recommendations`);
    const container = document.getElementById('vm-recommendations');
    if (!container) return;
    container.innerHTML = res.recommendations.map(r => `
      <div class="recommendation">
        <strong>${r.type}</strong>: ${r.reason} (Current: ${r.current}, Recommended: ${r.recommended})
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load recommendations', e);
  }
}
// Example usage: loadRecommendations('vm-1234'); 