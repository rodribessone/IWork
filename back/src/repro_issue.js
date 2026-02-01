
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:5000/api';

// Polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    try {
        // 1. Register
        const email = `test_${Date.now()}@example.com`;
        console.log(`Registering user: ${email}`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test User",
                email,
                password: "password123",
                role: "user"
            })
        });

        if (!regRes.ok) {
            // If 400 user exists, just try login
            console.log("Registration status:", regRes.status);
        }

        // 2. Login
        console.log("Logging in...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password: "password123"
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${await loginRes.text()}`);
        }

        const { token } = await loginRes.json();
        console.log("Got token.");

        // 3. Upload File
        console.log("Uploading file...");
        const form = new FormData();
        // Create a dummy file
        const dummyPath = path.join(__dirname, 'dummy.png');
        fs.writeFileSync(dummyPath, 'fake-image-content'); // This might fail if cloudinary checks magic numbers

        // Better: use a real small image buffer if possible, or just text and hope it fails with "invalid file type" instead of 500
        // But to test 500, we want to see what happens.
        // If I use a text file named .png, cloudinary might reject it.
        // I'll create a minimal valid PNG signature content if I can, or just try.
        // Minimal PNG header: 89 50 4E 47 0D 0A 1A 0A
        const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        fs.writeFileSync(dummyPath, pngBuffer);

        form.append('images', fs.createReadStream(dummyPath));

        const uploadRes = await fetch(`${BASE_URL}/users/portfolio`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                ...form.getHeaders()
            },
            body: form
        });

        console.log("Upload Status:", uploadRes.status);
        const text = await uploadRes.text();
        console.log("Upload Response:", text);

        // Cleanup
        fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error("Script failed:", err);
    }
}

run();
