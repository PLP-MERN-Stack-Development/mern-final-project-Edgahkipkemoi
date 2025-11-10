// Simple Node.js script to test registration endpoint
const http = require('http');

const data = JSON.stringify({
    username: 'testuser' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123',
    firstName: 'Test',
    lastName: 'User'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧪 Testing registration endpoint...');
console.log('📤 Sending request to: http://localhost:5000/api/auth/register');
console.log('📦 Data:', JSON.parse(data));

const req = http.request(options, (res) => {
    console.log(`\n✅ Status Code: ${res.statusCode}`);
    console.log('📋 Headers:', res.headers);

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('\n📥 Response:');
        try {
            const parsed = JSON.parse(responseData);
            console.log(JSON.stringify(parsed, null, 2));

            if (parsed.success) {
                console.log('\n🎉 SUCCESS! User registered successfully!');
                console.log('✅ User data saved to MongoDB');
                console.log('✅ Access token generated');
            } else {
                console.log('\n❌ FAILED! Registration unsuccessful');
                console.log('Error:', parsed.message);
            }
        } catch (e) {
            console.log(responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Is the backend server running? Run: cd backend && npm run dev');
    console.log('2. Is it running on port 5000?');
    console.log('3. Check backend terminal for errors');
});

req.write(data);
req.end();
