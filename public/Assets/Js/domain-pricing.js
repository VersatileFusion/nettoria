const apiClient = new ApiClient();
async function getDomainPricing() {
  const tld = document.getElementById("tldInput").value;
  if (!tld) return alert("Enter a TLD");
  try {
    const res = await apiClient.get(`/domains/pricing/${tld}`);
    const container = document.getElementById("domain-pricing");
    container.innerText = JSON.stringify(res, null, 2);
  } catch (e) {
    alert("Failed to fetch pricing");
    console.error(e);
  }
}
