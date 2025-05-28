const { spawn } = require("child_process");

const scripts = [
  "./test-vpn-connection.js",
  "./test-internal-ip.js",
  "./test-vcenter-rest-auto.js",
  "./test-vcenter-auto.js",
];

function runScript(script) {
  return new Promise((resolve) => {
    const proc = spawn("node", [script], { cwd: __dirname });
    proc.stdout.on("data", (data) => {
      process.stdout.write(`[${script}] ${data}`);
    });
    proc.stderr.on("data", (data) => {
      process.stderr.write(`[${script} ERROR] ${data}`);
    });
    proc.on("close", (code) => {
      console.log(`[${script}] exited with code ${code}`);
      resolve();
    });
  });
}

async function runAll() {
  for (const script of scripts) {
    await runScript(script);
  }
}

runAll();
