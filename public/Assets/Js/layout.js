document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("layout-content");
  if (!container) return;
  try {
    const res = await fetch("/api/content/layout");
    const data = await res.json();
    container.textContent = data.content;
  } catch (err) {
    container.textContent = "Failed to load layout content.";
  }
});
