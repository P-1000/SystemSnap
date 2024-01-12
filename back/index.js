const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('/api/top', (req, res) => {
  exec('top -l 1', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Internal Server Error');
    }

    const cpuUsage = parseCpuUsage(stdout);
    const loadAverage = parseLoadAverage(stdout);
    const memoryUsage = parseMemoryUsage(stdout);
    const networkMetrics = parseNetworkMetrics(stdout);
    const diskMetrics = parseDiskMetrics(stdout);

    res.json({ cpuUsage, loadAverage, memoryUsage, networkMetrics, diskMetrics });
  });
});

function parseCpuUsage(topOutput) {
  const regex = /CPU usage:\s+([\d.]+)% user,\s+([\d.]+)% sys,\s+([\d.]+)% idle/i;
  const match = topOutput.match(regex);
  return match ? { user: parseFloat(match[1]), sys: parseFloat(match[2]), idle: parseFloat(match[3]) } : null;
}

function parseLoadAverage(topOutput) {
  const regex = /Load Avg:\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)/i;
  const match = topOutput.match(regex);
  return match ? { oneMin: parseFloat(match[1]), fiveMin: parseFloat(match[2]), fifteenMin: parseFloat(match[3]) } : null;
}

function parseMemoryUsage(topOutput) {
  const regex = /PhysMem:\s+([\d.]+) used \(([\d.]+) wired,\s+([\d.]+) compressor\),\s+([\d.]+) unused/i;
  const match = topOutput.match(regex);
  return match ? {
    used: parseFloat(match[1]),
    wired: parseFloat(match[2]),
    compressor: parseFloat(match[3]),
    unused: parseFloat(match[4])
  } : null;
}

function parseNetworkMetrics(topOutput) {
  const regex = /Networks:\s+packets:\s+([\d.]+\/[\d.]+) in,\s+([\d.]+\/[\d.]+) out\./i;
  const match = topOutput.match(regex);
  return match ? { packetsIn: match[1], packetsOut: match[2] } : null;
}

function parseDiskMetrics(topOutput) {
  const regex = /Disks:\s+([\d.]+\/[\d.]+) read,\s+([\d.]+\/[\d.]+) written\./i;
  const match = topOutput.match(regex);
  return match ? { diskRead: match[1], diskWritten: match[2] } : null;
}



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
