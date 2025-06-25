document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("terms-content");
  if (!container) return;
  try {
    const res = await fetch("/api/content/terms");
    const data = await res.json();
    container.textContent = data.content;
  } catch (err) {
    container.textContent = "Failed to load terms content.";
  }
});
