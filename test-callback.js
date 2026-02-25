const fetch = require('node-fetch');
async function run() {
  const url = 'http://localhost:3000/api/auth/customer/authorize?returnTo=/account'\;
  console.log('Fetching:', url);
  const res = await fetch(url, { redirect: 'manual' });
  console.log('Status:', res.status);
  console.log('Location:', res.headers.get('location'));
  console.log('Set-Cookie:', res.headers.raw()['set-cookie']);
}
run();
