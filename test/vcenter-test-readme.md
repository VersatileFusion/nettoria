# vCenter Connection Test Script

This script tests the connection to vCenter and verifies if essential components like datacenters, hosts, datastores, networks, and VMs can be retrieved.

## Prerequisites

- Node.js 12.x or higher
- Access to a vCenter server

## Installation

1. Install the required dependencies:
   ```
   npm install dotenv node-vsphere-soap
   ```

2. Configure the connection parameters in `vcenter-test.env`:
   ```
   VCENTER_HOST=https://your-vcenter-server
   VCENTER_USER=your-username
   VCENTER_PASS=your-password
   ```

## Usage

Run the script with Node.js:

```
node vcenter-connection-test.js
```

If you haven't set the connection parameters in the environment file, you'll be prompted to enter them.

## Test Results

The script will:
1. Test the connection to vCenter
2. Retrieve service content (version, build, etc.)
3. List datacenters
4. List hosts
5. List datastores
6. List networks
7. List VMs

Results will be saved to a JSON file in the same directory as the script, with a filename like `vcenter-test-results-YYYY-MM-DDTHH-MM-SS-SSSZ.json`.

## Troubleshooting

If the connection fails, check:
1. The vCenter URL format (should be like `https://vcenter.example.com`)
2. Username and password correctness
3. Network connectivity to the vCenter server
4. SSL certificate validation 