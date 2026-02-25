async function run() {
    const authUrl = 'http://localhost:3000/api/auth/customer/authorize?returnTo=/account';
    console.log('Fetching authorize:', authUrl);

    const res = await fetch(authUrl, { redirect: 'manual' });
    console.log('Authorize Status:', res.status);

    const locRaw = res.headers.get('location');
    console.log('Authorize Location:', locRaw);

    const setCookieHeaders = res.headers.getSetCookie();
    console.log('Authorize Cookies:', setCookieHeaders);

    // parse cookies
    let cookiesToPass = setCookieHeaders.map(c => c.split(';')[0]).join('; ');

    // get state from Location
    const loc = new URL(locRaw);
    const state = loc.searchParams.get('state');

    // mock the callback
    const mockCode = 'testcode_123';
    const callbackUrl = `http://localhost:3000/api/auth/customer/callback?code=${mockCode}&state=${state}`;

    console.log('\nFetching callback:', callbackUrl);
    const cbRes = await fetch(callbackUrl, {
        method: 'GET',
        headers: {
            'Cookie': cookiesToPass
        },
        redirect: 'manual'
    });

    console.log('Callback Status:', cbRes.status);
    console.log('Callback Location:', cbRes.headers.get('location'));
}

run().catch(console.error);
