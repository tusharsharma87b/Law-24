const https = require('https');

const apiKey = 'lpgtfrgJwxYMOuarQD6Bnft7575EadYJzXdqcxra84OqOBVo';
const model = 'deepseek-v3.1';

const data = JSON.stringify({
  model: model,
  messages: [
    { role: 'user', content: 'Hello' }
  ],
  stream: false
});

const options = {
  hostname: 'api.deepseek.com',
  port: 443,
  path: '/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
};

console.log(`Testing DeepSeek API with model: ${model}`);
console.log(`API Key (first 10 chars): ${apiKey.substring(0, 10)}...`);

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(responseData);
      console.log('\nResponse Body:');
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ Test Result: SUCCESS');
        console.log('✅ Conclusion: This model IS allowed with your API key');
      } else if (res.statusCode === 403) {
        console.log('\n❌ Test Result: FAILED');
        console.log('❌ Conclusion: This model is NOT allowed with your API key (403 Forbidden)');
      } else {
        console.log('\n⚠️ Test Result: UNEXPECTED STATUS');
        console.log(`⚠️ Conclusion: Received status ${res.statusCode} - check API key permissions`);
      }
    } catch (e) {
      console.log('\n⚠️ Failed to parse response as JSON');
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error(`Request error: ${error.message}`);
  console.log('\n❌ Test Result: FAILED (Network/Connection Error)');
  console.log(`❌ Error: ${error.message}`);
});

req.write(data);
req.end();