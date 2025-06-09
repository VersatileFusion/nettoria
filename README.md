# vCenter API Test Suite

A collection of Node.js scripts for testing and troubleshooting connectivity to VMware vCenter Server through VPN.

## Overview

This test suite helps diagnose and resolve connectivity issues when accessing vCenter Server APIs through a VPN connection. It includes scripts for:

- Testing VPN connectivity
- Verifying basic network connectivity to the vCenter server
- Testing REST API connectivity
- Testing SOAP API connectivity

## Prerequisites

- Node.js 14+ installed
- Windows operating system (scripts use Windows-specific VPN commands)
- VPN access to the vCenter environment

## Installation

1. Clone this repository or download the scripts
2. Install dependencies:

```bash
npm install axios
```

## Available Scripts

### Main Runner

- `run-api-test.js` - Interactive menu to manage VPN connection and run tests

### Individual Test Scripts

- `test-vpn-connection.js` - Comprehensive VPN connectivity diagnostic
- `test-internal-ip.js` - Basic connectivity test to vCenter server IP
- `test-vcenter-rest-auto.js` - REST API connectivity test
- `test-vcenter-auto.js` - SOAP API connectivity test

## Configuration

Create a file named `vcenter-test.env` with your vCenter credentials:

```
VCENTER_USER=your_username
VCENTER_PASS=your_password
```

## Usage

### Running the Interactive Menu

```bash
node run-api-test.js
```

This will display a menu with options to:

1. Check VPN connection
2. Connect to VPN
3. Run Basic API test
4. Run REST API test
5. Run SOAP API test
6. Run Diagnostic test
7. Run all tests
8. Exit

### Running Individual Tests

You can also run each test script individually:

```bash
node test-vpn-connection.js
node test-internal-ip.js
node test-vcenter-rest-auto.js
node test-vcenter-auto.js
```

## Troubleshooting

If you encounter connectivity issues:

1. Ensure your VPN is properly connected
2. Verify you can ping the vCenter server IP (192.168.120.251)
3. Check if your credentials are correct in the vcenter-test.env file
4. Review firewall settings that might block connection

## Common Issues

- **SSL/TLS Certificate Errors**: The scripts disable certificate validation for testing purposes
- **Authentication Failures**: Verify your credentials in the vcenter-test.env file
- **Timeout Errors**: May indicate network connectivity or routing issues through VPN

## License

MIT
