
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
];

console.log('Checking Environment Variables...');
const missing = [];
const present = [];

requiredVars.forEach(v => {
    if (process.env[v]) {
        present.push(v);
    } else {
        missing.push(v);
    }
});

console.log('Present:', present.join(', '));
if (missing.length > 0) {
    console.log('MISSING:', missing.join(', '));
} else {
    console.log('All required variables are set.');
}
