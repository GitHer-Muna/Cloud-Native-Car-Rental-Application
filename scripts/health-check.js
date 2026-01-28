const { setTimeout: wait } = require('timers/promises');
const https = require('https');

function getJson(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, (res) => {
      const { statusCode } = res;
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        resolve({ statusCode, body });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });
  });
}

async function checkUrl(url, retries = 5, delayMs = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const { statusCode } = await getJson(url);
      if (statusCode >= 200 && statusCode < 400) return true;
      console.log(`Check ${url} returned status ${statusCode}`);
    } catch (err) {
      console.log(`Attempt ${i} failed for ${url}: ${err.message}`);
    }
    if (i < retries) await wait(delayMs);
  }
  return false;
}

(async () => {
  const frontendName = process.env.AZURE_WEBAPP_NAME_FRONTEND;
  const bffName = process.env.AZURE_WEBAPP_NAME_BFF;

  if (!frontendName || !bffName) {
    console.error('Missing AZURE_WEBAPP_NAME_FRONTEND or AZURE_WEBAPP_NAME_BFF environment variables');
    process.exit(2);
  }

  const frontendUrl = `https://${frontendName}.azurewebsites.net/`;
  const bffUrl = `https://${bffName}.azurewebsites.net/api/health`;

  console.log('Checking frontend:', frontendUrl);
  const frontendOk = await checkUrl(frontendUrl, 6, 5000);

  console.log('Checking BFF service:', bffUrl);
  const bffOk = await checkUrl(bffUrl, 6, 5000);

  if (frontendOk && bffOk) {
    console.log('\u2705 All services healthy');
    process.exit(0);
  }

  console.error('\u274C Health check failed');
  if (!frontendOk) console.error('Frontend failed');
  if (!bffOk) console.error('BFF failed');
  process.exit(1);
})();