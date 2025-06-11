const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Generate OpenVPN configuration
async function generateOpenVPNConfig(server, userConfig) {
  try {
    // Generate client certificate and key
    const clientCert = await generateClientCertificate(userConfig.clientName);
    
    // Create OpenVPN configuration
    const config = {
      client: true,
      dev: 'tun',
      proto: userConfig.protocol || 'udp',
      remote: server.ipAddress,
      port: userConfig.port || 1194,
      resolvRetry: 'infinite',
      nobind: true,
      persistKey: true,
      persistTun: true,
      remoteCertTls: 'server',
      cipher: userConfig.cipher || 'AES-256-CBC',
      auth: userConfig.auth || 'SHA256',
      keyDirection: 1,
      verb: 3,
      cert: clientCert.cert,
      key: clientCert.key,
      ca: await getCACertificate(),
      tlsAuth: await getTLSKey(),
      tlsClient: true,
      tlsVersionMin: '1.2',
      tlsCipher: 'TLS-ECDHE-RSA-WITH-AES-256-GCM-SHA384'
    };

    // Add custom options if provided
    if (userConfig.customOptions) {
      Object.assign(config, userConfig.customOptions);
    }

    return config;
  } catch (error) {
    throw new Error(`Failed to generate OpenVPN configuration: ${error.message}`);
  }
}

// Generate Wireguard configuration
async function generateWireguardConfig(server, userConfig) {
  try {
    // Generate Wireguard keys
    const keys = await generateWireguardKeys();
    
    // Create Wireguard configuration
    const config = {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
      address: userConfig.address || '10.0.0.2/24',
      dns: userConfig.dns || ['1.1.1.1', '1.0.0.1'],
      endpoint: `${server.ipAddress}:${userConfig.port || 51820}`,
      allowedIPs: userConfig.allowedIPs || '0.0.0.0/0',
      persistentKeepalive: userConfig.persistentKeepalive || 25,
      mtu: userConfig.mtu || 1420
    };

    // Add custom options if provided
    if (userConfig.customOptions) {
      Object.assign(config, userConfig.customOptions);
    }

    return config;
  } catch (error) {
    throw new Error(`Failed to generate Wireguard configuration: ${error.message}`);
  }
}

// Generate client certificate for OpenVPN
async function generateClientCertificate(clientName) {
  try {
    // Generate private key
    const privateKey = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Generate certificate signing request (CSR)
    const csr = crypto.createCertificateSigningRequest({
      key: privateKey.privateKey,
      commonName: clientName,
      organizationName: 'VPN Client',
      countryName: 'US',
      stateOrProvinceName: 'State',
      localityName: 'City'
    });

    // Sign the CSR with CA
    const caKey = await getCAKey();
    const caCert = await getCACertificate();
    
    const cert = crypto.createCertificate({
      csr: csr,
      key: caKey,
      days: 365,
      serialNumber: crypto.randomBytes(16).toString('hex')
    });

    return {
      cert: cert.toString(),
      key: privateKey.privateKey
    };
  } catch (error) {
    throw new Error(`Failed to generate client certificate: ${error.message}`);
  }
}

// Generate Wireguard keys
async function generateWireguardKeys() {
  try {
    // Generate private key
    const privateKey = crypto.randomBytes(32);
    
    // Generate public key from private key
    const publicKey = crypto.createPublicKey({
      key: privateKey,
      format: 'raw',
      type: 'spki'
    });

    return {
      privateKey: privateKey.toString('base64'),
      publicKey: publicKey.export({ type: 'spki', format: 'pem' })
    };
  } catch (error) {
    throw new Error(`Failed to generate Wireguard keys: ${error.message}`);
  }
}

// Get CA certificate
async function getCACertificate() {
  try {
    const caPath = path.join(__dirname, '../../config/ca.crt');
    return await fs.readFile(caPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read CA certificate: ${error.message}`);
  }
}

// Get CA private key
async function getCAKey() {
  try {
    const keyPath = path.join(__dirname, '../../config/ca.key');
    return await fs.readFile(keyPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read CA key: ${error.message}`);
  }
}

// Get TLS auth key
async function getTLSKey() {
  try {
    const keyPath = path.join(__dirname, '../../config/tls-auth.key');
    return await fs.readFile(keyPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read TLS auth key: ${error.message}`);
  }
}

module.exports = {
  generateOpenVPNConfig,
  generateWireguardConfig
}; 