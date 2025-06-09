import fetch from 'node-fetch';
import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    phoneNumber: '9123456789',
    password: 'Test@123456'
};

// Test authentication flow
async function testAuthFlow() {
    try {
        console.log('Starting authentication tests...');

        // 1. Test Registration
        console.log('\nTesting registration...');
        const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const registerData = await registerResponse.json();
        console.log('Registration response:', registerData);
        assert.strictEqual(registerResponse.ok, true, 'Registration should succeed');
        assert.ok(registerData.data.userId, 'Registration should return a user ID');
        console.log('Registration successful!');

        // 2. Test Phone Verification
        console.log('\nTesting phone verification...');
        const verifyResponse = await fetch(`${BASE_URL}/auth/verify-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: registerData.data.userId,
                phoneNumber: testUser.phoneNumber,
                verificationCode: '123456' // In test environment, this should be the test OTP
            })
        });
        const verifyData = await verifyResponse.json();
        console.log('Phone verification response:', verifyData);
        assert.strictEqual(verifyResponse.ok, true, 'Phone verification should succeed');
        console.log('Phone verification successful!');

        // 3. Test Login
        console.log('\nTesting login...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: testUser.email,
                password: testUser.password
            })
        });
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        assert.strictEqual(loginResponse.ok, true, 'Login should succeed');
        assert.ok(loginData.token, 'Login response should include token');
        console.log('Login successful!');

        // 4. Test One-time Login
        console.log('\nTesting one-time login...');
        const otpRequestResponse = await fetch(`${BASE_URL}/auth/request-login-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: `98${testUser.phoneNumber}`
            })
        });
        const otpRequestData = await otpRequestResponse.json();
        console.log('OTP request response:', otpRequestData);
        assert.strictEqual(otpRequestResponse.ok, true, 'OTP request should succeed');
        console.log('OTP request successful!');

        // 5. Test OTP Verification
        console.log('\nTesting OTP verification...');
        const otpVerifyResponse = await fetch(`${BASE_URL}/auth/verify-login-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: `98${testUser.phoneNumber}`,
                verificationCode: '123456' // In test environment, this should be the test OTP
            })
        });
        const otpVerifyData = await otpVerifyResponse.json();
        console.log('OTP verification response:', otpVerifyData);
        assert.strictEqual(otpVerifyResponse.ok, true, 'OTP verification should succeed');
        assert.ok(otpVerifyData.token, 'OTP verification should return a token');
        console.log('OTP verification successful!');

        // 6. Test Protected Route
        console.log('\nTesting protected route...');
        const protectedResponse = await fetch(`${BASE_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        const protectedData = await protectedResponse.json();
        console.log('Protected route response:', protectedData);
        assert.strictEqual(protectedResponse.ok, true, 'Protected route should be accessible with valid token');
        console.log('Protected route access successful!');

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', await error.response.json());
        }
        process.exit(1);
    }
}

// Run tests
testAuthFlow(); 