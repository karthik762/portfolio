const fs = require('fs');

async function test() {
    console.log('--- Testing Login ---');
    const loginParams = new URLSearchParams();
    loginParams.append('action', 'login');
    loginParams.append('email', 'admin@portfolio.com');
    loginParams.append('password', 'admin123');

    const loginResp = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        body: loginParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const cookie = loginResp.headers.get('set-cookie');
    console.log('Login Status:', loginResp.status);
    console.log('Cookie obtained:', cookie ? 'Yes' : 'No');

    if (!cookie) {
        console.error('Failed to get session cookie');
        process.exit(1);
    }

    console.log('\n--- Accessing Dashboard (Should be 200) ---');
    const dashResp = await fetch('http://localhost:8080/dashboard', {
        headers: { 'Cookie': cookie }
    });
    console.log('Dashboard Status:', dashResp.status);

    console.log('\n--- Testing Logout ---');
    const logoutParams = new URLSearchParams();
    logoutParams.append('action', 'logout');
    const logoutResp = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        body: logoutParams,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
        }
    });
    console.log('Logout Status:', logoutResp.status);

    console.log('\n--- Accessing Dashboard After Logout (Should be 401) ---');
    const dashAfterResp = await fetch('http://localhost:8080/dashboard', {
        headers: { 'Cookie': cookie }
    });
    console.log('Dashboard Status After Logout:', dashAfterResp.status);

    if (dashResp.status === 200 && dashAfterResp.status === 401) {
        console.log('\n✅ Verification Successful: Session destroyed correctly.');
    } else {
        console.log('\n❌ Verification Failed.');
        process.exit(1);
    }
}

test().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
