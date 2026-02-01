
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'http://localhost:5003/api'; // Targeting port 5003

// Polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    try {
        const email = `test_${Date.now()}@example.com`;
        console.log(`User: ${email}`);

        // 1. Register
        await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User", email, password: "password123", role: "user" })
        });

        // 2. Login
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: "password123" })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
        const { token } = await loginRes.json();
        console.log("Token obtained.");

        // 3. Create dummy file
        const dummyPath = path.join(__dirname, 'dummy.png');
        // Valid 1x1 PNG
        const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        fs.writeFileSync(dummyPath, pngBuffer);

        // 4. Upload using Native FormData
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(dummyPath);
        const file = new File([fileBuffer], 'dummy.png', { type: 'image/png' });
        formData.append('images', file);

        console.log("Uploading...");
        const uploadRes = await fetch(`${BASE_URL}/users/portfolio`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Note: Do NOT set Content-Type manually when using FormData with fetch, 
                // the browser/node will set it with boundary.
            },
            body: formData
        });

        console.log("Status:", uploadRes.status);
        const text = await uploadRes.text();
        console.log("Body:", text);

        fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error("Test Failed:", err);
    }
}

run();
