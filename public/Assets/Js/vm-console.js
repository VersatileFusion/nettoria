const apiClient = new ApiClient();
async function openConsole(vmId) {
  try {
    const res = await apiClient.get(`/vcenter/vms/${vmId}/console`);
    if (res.data && res.data.consoleUrl) {
      window.open(res.data.consoleUrl, "_blank");
    } else {
      alert("Console URL not available");
    }
  } catch (e) {
    alert("Failed to open console");
    console.error(e);
  }
}
// Example usage: openConsole('vm-1234');
