document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('privacy-content');
  if (!container) return;
  try {
    const res = await fetch('/api/content/privacy');
    const data = await res.json();
    container.textContent = data.content;
  } catch (err) {
    container.textContent = 'Failed to load privacy policy content.';
  }
}); 