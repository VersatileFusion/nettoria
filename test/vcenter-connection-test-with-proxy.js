/**
 * vCenter Connection Test Script with Proxy Support
 * This script tests the connection to vCenter using proxies to bypass restrictions
 */

require("dotenv").config({ path: "./vcenter-test.env" });
const vsphereSoap = require("node-vsphere-soap");
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { URL } = require("url");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for user input
function promptUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to write test results to file
function writeResultsToFile(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(
    __dirname,
    `vcenter-test-results-${timestamp}.json`
  );

  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`\nTest results written to: ${filePath}`);
}

// Setup global proxy if provided
function setupGlobalProxy(proxyUrl) {
  if (!proxyUrl) return null;

  console.log(`Setting up proxy: ${proxyUrl}`);

  try {
    // Determine proxy type and create appropriate agent
    if (proxyUrl.startsWith("socks")) {
      return new SocksProxyAgent(proxyUrl);
    } else {
      return new HttpsProxyAgent(proxyUrl);
    }
  } catch (error) {
    console.error("Error setting up proxy:", error.message);
    return null;
  }
}

// vCenter Connection Test class
class VCenterConnectionTester {
  constructor(host, username, password, proxyUrl) {
    this.host = host;
    this.username = username;
    this.password = password;
    this.proxyUrl = proxyUrl;
    this.client = null;
    this.isConnected = false;
    this.proxyAgent = setupGlobalProxy(proxyUrl);

    this.testResults = {
      connection: {
        success: false,
        error: null,
        timestamp: new Date().toISOString(),
        proxyUsed: !!proxyUrl,
        proxyType: proxyUrl
          ? proxyUrl.startsWith("socks")
            ? "SOCKS"
            : "HTTP/HTTPS"
          : null,
      },
      serviceContent: null,
      datacenterInfo: {
        success: false,
        error: null,
        datacenters: [],
      },
      hostInfo: {
        success: false,
        error: null,
        hosts: [],
      },
      datastoreInfo: {
        success: false,
        error: null,
        datastores: [],
      },
      networkInfo: {
        success: false,
        error: null,
        networks: [],
      },
      vmInfo: {
        success: false,
        error: null,
        vms: [],
      },
    };
  }

  /**
   * Connect to vCenter
   */
  async connect() {
    try {
      console.log(`\nAttempting to connect to vCenter at ${this.host}...`);
      if (this.proxyUrl) {
        console.log(`Using proxy: ${this.proxyUrl}`);

        // When using proxy, we need to modify Node.js global settings
        // for the node-vsphere-soap library to use the proxy
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Only for testing, disables SSL verification

        if (this.proxyUrl.startsWith("http")) {
          process.env.HTTP_PROXY = this.proxyUrl;
          process.env.HTTPS_PROXY = this.proxyUrl;
        }
      }

      // Create client instance
      const Client = vsphereSoap.Client;

      // Create client with custom options for proxy if available
      const clientOptions = {
        ignoreCert: true,
      };

      // In node-vsphere-soap, we need to use the appropriate constructor format
      this.client = new Client(
        this.host,
        this.username,
        this.password,
        clientOptions.ignoreCert
      );

      // If using SOCKS proxy, we may need to handle it differently as node-vsphere-soap
      // may not directly support SOCKS proxies through its API
      if (this.proxyUrl && this.proxyUrl.startsWith("socks")) {
        console.log(
          "Using SOCKS proxy - this may require additional configuration"
        );
      }

      // Connect to vCenter
      await new Promise((resolve, reject) => {
        this.client.once("ready", () => {
          console.log("✅ Successfully connected to vCenter!");
          this.isConnected = true;
          this.testResults.connection.success = true;
          resolve();
        });

        this.client.once("error", (err) => {
          console.error("❌ Connection error:", err.message);
          this.testResults.connection.error = err.message;
          reject(err);
        });

        this.client.connect();
      });

      return true;
    } catch (error) {
      console.error("Error connecting to vCenter:", error.message);
      this.testResults.connection.error = error.message;
      return false;
    }
  }

  /**
   * Get service content
   */
  async getServiceContent() {
    try {
      console.log("\nRetrieving vCenter service content...");

      const serviceContent = await this.client.getServiceContent();
      this.testResults.serviceContent = {
        about: {
          fullName: serviceContent.about.fullName,
          version: serviceContent.about.version,
          build: serviceContent.about.build,
          apiVersion: serviceContent.about.apiVersion,
        },
        serverTime: new Date(
          serviceContent.serverClock.serverTime
        ).toISOString(),
      };

      console.log(
        `✅ Retrieved service content: vCenter ${serviceContent.about.version} (build ${serviceContent.about.build})`
      );
      return true;
    } catch (error) {
      console.error("❌ Error retrieving service content:", error.message);
      return false;
    }
  }

  /**
   * List datacenters
   */
  async listDatacenters() {
    try {
      console.log("\n--- Retrieving Datacenter Information ---");

      const rootFolder = await this.getRootFolder();
      const datacenters = await this.searchManagedEntities(
        "Datacenter",
        rootFolder
      );

      if (datacenters && datacenters.length > 0) {
        console.log(`✅ Found ${datacenters.length} datacenter(s):`);

        for (const dc of datacenters) {
          console.log(`- ${dc.name}`);
          this.testResults.datacenterInfo.datacenters.push({
            name: dc.name,
            ref: dc._ref,
          });
        }

        this.testResults.datacenterInfo.success = true;
        return datacenters;
      } else {
        console.log("⚠️ No datacenters found.");
        return [];
      }
    } catch (error) {
      console.error("❌ Error retrieving datacenters:", error.message);
      this.testResults.datacenterInfo.error = error.message;
      return [];
    }
  }

  /**
   * List hosts
   */
  async listHosts(datacenterRef = null) {
    try {
      console.log("\n--- Retrieving Host Information ---");

      const context = datacenterRef || (await this.getRootFolder());
      const hosts = await this.searchManagedEntities("HostSystem", context);

      if (hosts && hosts.length > 0) {
        console.log(`✅ Found ${hosts.length} host(s):`);

        for (const host of hosts) {
          console.log(`- ${host.name}`);
          this.testResults.hostInfo.hosts.push({
            name: host.name,
            ref: host._ref,
          });
        }

        this.testResults.hostInfo.success = true;
        return hosts;
      } else {
        console.log("⚠️ No hosts found.");
        return [];
      }
    } catch (error) {
      console.error("❌ Error retrieving hosts:", error.message);
      this.testResults.hostInfo.error = error.message;
      return [];
    }
  }

  /**
   * List datastores
   */
  async listDatastores(datacenterRef = null) {
    try {
      console.log("\n--- Retrieving Datastore Information ---");

      const context = datacenterRef || (await this.getRootFolder());
      const datastores = await this.searchManagedEntities("Datastore", context);

      if (datastores && datastores.length > 0) {
        console.log(`✅ Found ${datastores.length} datastore(s):`);

        for (const datastore of datastores) {
          console.log(`- ${datastore.name}`);
          this.testResults.datastoreInfo.datastores.push({
            name: datastore.name,
            ref: datastore._ref,
          });
        }

        this.testResults.datastoreInfo.success = true;
        return datastores;
      } else {
        console.log("⚠️ No datastores found.");
        return [];
      }
    } catch (error) {
      console.error("❌ Error retrieving datastores:", error.message);
      this.testResults.datastoreInfo.error = error.message;
      return [];
    }
  }

  /**
   * List networks
   */
  async listNetworks(datacenterRef = null) {
    try {
      console.log("\n--- Retrieving Network Information ---");

      const context = datacenterRef || (await this.getRootFolder());
      const networks = await this.searchManagedEntities("Network", context);

      if (networks && networks.length > 0) {
        console.log(`✅ Found ${networks.length} network(s):`);

        for (const network of networks) {
          console.log(`- ${network.name}`);
          this.testResults.networkInfo.networks.push({
            name: network.name,
            ref: network._ref,
          });
        }

        this.testResults.networkInfo.success = true;
        return networks;
      } else {
        console.log("⚠️ No networks found.");
        return [];
      }
    } catch (error) {
      console.error("❌ Error retrieving networks:", error.message);
      this.testResults.networkInfo.error = error.message;
      return [];
    }
  }

  /**
   * List virtual machines
   */
  async listVMs(datacenterRef = null) {
    try {
      console.log("\n--- Retrieving Virtual Machine Information ---");

      const context = datacenterRef || (await this.getRootFolder());
      const vms = await this.searchManagedEntities("VirtualMachine", context);

      if (vms && vms.length > 0) {
        console.log(`✅ Found ${vms.length} virtual machine(s):`);

        // Limit to 10 VMs to avoid overwhelming output
        const displayVms = vms.slice(0, 10);
        for (const vm of displayVms) {
          console.log(`- ${vm.name}`);

          // Get power state for each VM
          try {
            const powerState = await this.getVMPowerState(vm);
            this.testResults.vmInfo.vms.push({
              name: vm.name,
              ref: vm._ref,
              powerState: powerState,
            });
          } catch (err) {
            this.testResults.vmInfo.vms.push({
              name: vm.name,
              ref: vm._ref,
              powerState: "unknown",
              error: err.message,
            });
          }
        }

        if (vms.length > 10) {
          console.log(`  (and ${vms.length - 10} more...)`);
        }

        this.testResults.vmInfo.success = true;
        return vms;
      } else {
        console.log("⚠️ No virtual machines found.");
        return [];
      }
    } catch (error) {
      console.error("❌ Error retrieving virtual machines:", error.message);
      this.testResults.vmInfo.error = error.message;
      return [];
    }
  }

  /**
   * Get VM power state
   */
  async getVMPowerState(vm) {
    try {
      const props = await this.client.getObjectProperties(vm, [
        "summary.runtime.powerState",
      ]);
      return props["summary.runtime.powerState"];
    } catch (error) {
      console.error(
        `Error retrieving power state for VM ${vm.name}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get root folder
   */
  async getRootFolder() {
    try {
      const serviceContent = await this.client.getServiceContent();
      return serviceContent.rootFolder;
    } catch (error) {
      console.error("Error retrieving root folder:", error.message);
      throw error;
    }
  }

  /**
   * Search managed entities
   */
  async searchManagedEntities(type, context = null) {
    try {
      return await new Promise((resolve, reject) => {
        this.client.runCommand(
          "FindAllByType",
          {
            type: type,
            begin: context,
          },
          (err, results) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(results);
          }
        );
      });
    } catch (error) {
      console.error(
        `Error searching managed entities of type ${type}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      console.log("=== vCenter Connection Test Suite ===\n");
      console.log(
        `Using${
          this.proxyUrl ? " proxy: " + this.proxyUrl : " direct connection"
        }`
      );

      // Connect to vCenter
      if (!(await this.connect())) {
        return this.testResults;
      }

      // Get service content
      await this.getServiceContent();

      // List datacenters
      const datacenters = await this.listDatacenters();

      // If at least one datacenter found, use it as context for other tests
      let context = null;
      if (datacenters && datacenters.length > 0) {
        context = datacenters[0];
        console.log(
          `\nUsing datacenter "${context.name}" as context for further tests`
        );
      }

      // List hosts, datastores, networks, and VMs
      await this.listHosts(context);
      await this.listDatastores(context);
      await this.listNetworks(context);
      await this.listVMs(context);

      console.log("\n=== Test Summary ===");
      console.log(
        `✅ Connection: ${
          this.testResults.connection.success ? "Successful" : "Failed"
        }`
      );
      console.log(
        `✅ Datacenters: ${this.testResults.datacenterInfo.datacenters.length} found`
      );
      console.log(`✅ Hosts: ${this.testResults.hostInfo.hosts.length} found`);
      console.log(
        `✅ Datastores: ${this.testResults.datastoreInfo.datastores.length} found`
      );
      console.log(
        `✅ Networks: ${this.testResults.networkInfo.networks.length} found`
      );
      console.log(`✅ VMs: ${this.testResults.vmInfo.vms.length} found`);

      return this.testResults;
    } catch (error) {
      console.error("\n❌ Error running tests:", error.message);
      return this.testResults;
    } finally {
      console.log("\n=== Test Completed ===");
    }
  }
}

// Main function
async function main() {
  try {
    // Load configuration from environment or prompt user
    let host = process.env.VCENTER_HOST;
    let username = process.env.VCENTER_USER;
    let password = process.env.VCENTER_PASS;
    let proxyUrl = process.env.PROXY_URL;

    // If any config is missing, prompt the user
    if (!host) {
      host = await promptUserInput(
        "Enter vCenter URL (e.g., vcenter.example.com): "
      );
    }

    if (!username) {
      username = await promptUserInput("Enter vCenter username: ");
    }

    if (!password) {
      password = await promptUserInput("Enter vCenter password: ");
    }

    if (!proxyUrl) {
      const useProxy = await promptUserInput(
        "Do you want to use a proxy? (y/n): "
      );

      if (useProxy.toLowerCase() === "y") {
        const proxyType = await promptUserInput(
          "Enter proxy type (1 for HTTP/HTTPS, 2 for SOCKS): "
        );

        const proxyHost = await promptUserInput("Enter proxy host: ");
        const proxyPort = await promptUserInput("Enter proxy port: ");

        const proxyUser = await promptUserInput(
          "Enter proxy username (leave empty if none): "
        );
        const proxyPass = proxyUser
          ? await promptUserInput("Enter proxy password: ")
          : "";

        if (proxyType === "1") {
          proxyUrl = `http://${
            proxyUser ? `${proxyUser}:${proxyPass}@` : ""
          }${proxyHost}:${proxyPort}`;
        } else {
          proxyUrl = `socks5://${
            proxyUser ? `${proxyUser}:${proxyPass}@` : ""
          }${proxyHost}:${proxyPort}`;
        }
      }
    }

    // Create tester instance
    const tester = new VCenterConnectionTester(
      host,
      username,
      password,
      proxyUrl
    );

    // Run all tests
    const results = await tester.runAllTests();

    // Write results to file
    writeResultsToFile(results);
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
