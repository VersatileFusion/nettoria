document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('support-content');
  if (!container) return;
  try {
    const res = await fetch('/api/content/support');
    const data = await res.json();
    container.textContent = data.content;
  } catch (err) {
    container.textContent = 'Failed to load support info.';
  }
}); 