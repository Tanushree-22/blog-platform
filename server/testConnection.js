/**
 * Run this to test your MongoDB connection independently:
 * cd server
 * node testConnection.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

console.log('\n🔍 Testing MongoDB Connection...\n');
console.log('MONGO_URI found:', process.env.MONGO_URI ? '✅ Yes' : '❌ No - check your .env file!');

if (!process.env.MONGO_URI) {
  console.log('\n❌ MONGO_URI is missing from server/.env');
  console.log('Make sure you have a file called .env (not .env.example) in the server/ folder');
  process.exit(1);
}

// Extract hostname from URI for DNS test
let hostname = '';
try {
  const uriMatch = process.env.MONGO_URI.match(/@([^/]+)\//);
  if (uriMatch) hostname = uriMatch[1];
} catch(e) {}

console.log('Cluster hostname:', hostname || '(could not parse)');

// Test DNS first
if (hostname) {
  console.log('\n📡 Testing DNS lookup...');
  dns.lookup(hostname, (err, address) => {
    if (err) {
      console.log('⚠️  Direct DNS lookup failed (this is normal for SRV):', err.code);
    } else {
      console.log('✅ DNS resolved to:', address);
    }
  });
}

// Try connecting
console.log('\n🔌 Attempting mongoose connection with IPv4 forced...\n');
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB connected:', mongoose.connection.host);
  console.log('\n🎉 Your connection string is working! Restart npm run dev\n');
  process.exit(0);
})
.catch((err) => {
  console.log('❌ FAILED:', err.message);
  console.log('\n📋 Troubleshooting:');
  console.log('1. Is your IP whitelisted in Atlas → Network Access? (add 0.0.0.0/0)');
  console.log('2. Is the password correct? (no special chars like @, #, /)');
  console.log('3. Try using a mobile hotspot — your WiFi/ISP may block Atlas DNS');
  console.log('4. Try changing Windows DNS: Settings → Network → DNS → 8.8.8.8\n');
  process.exit(1);
});