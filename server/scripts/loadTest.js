const axios = require('axios');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:5000/api';
const CONCURRENT_USERS = 500; 
const REQUESTS_PER_USER = 10;

// This script simulates a heavy traffic spike (e.g., during exam week)
async function simulateUserTraffic(userId) {
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    try {
      // Simulate typical student flow: hit trending, search a keyword, fetch a document
      await axios.get(`${TARGET_URL}/resources/trending`);
      await axios.get(`${TARGET_URL}/resources?search=math&page=1`);
      
      successCount++;
    } catch (err) {
      failCount++;
    }
  }
  
  return { successCount, failCount };
}

async function runStressTest() {
  console.log(`🚀 Starting Load Test: ${CONCURRENT_USERS} Concurrent Users, ${REQUESTS_PER_USER} actions each...`);
  const startTime = Date.now();
  
  const userPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(simulateUserTraffic(i));
  }

  const results = await Promise.all(userPromises);
  
  const totalTime = (Date.now() - startTime) / 1000;
  let totalSuccess = 0;
  let totalFails = 0;

  results.forEach(r => {
    totalSuccess += r.successCount;
    totalFails += r.failCount;
  });

  const totalRequests = totalSuccess + totalFails;
  const reqPerSec = (totalRequests / totalTime).toFixed(2);

  console.log('\n=======================================');
  console.log('📈 STRESS TEST RESULTS');
  console.log('=======================================');
  console.log(`Total Time: ${totalTime} seconds`);
  console.log(`Total Requests Sent: ${totalRequests}`);
  console.log(`Successful Requests: ${totalSuccess}`);
  console.log(`Failed Requests: ${totalFails} (Check rate limits or DB bottleneck)`);
  console.log(`Requests Per Second (RPS): ${reqPerSec}`);
  console.log('=======================================');
  
  if (totalFails > 0) {
    console.log('⚠️ Note: Failures are likely due to express-rate-limit kicking in. Adjust limits for production scaling.');
  }
}

runStressTest();
