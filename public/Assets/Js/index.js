document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("index-content");
  if (!container) return;
  try {
    const res = await fetch("/api/content/index");
    const data = await res.json();
    container.textContent = data.content;
  } catch (err) {
    container.textContent = "Failed to load index content.";
  }
});
