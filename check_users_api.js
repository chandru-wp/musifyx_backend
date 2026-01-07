import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// We need a token. I'll use the one from the admin user.
async function check() {
    try {
        console.log("Logging in as admin...");
        const loginRes = await api.post('/auth/login', {
            username: 'admin@gmail.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log("Token received.");

        console.log("Fetching users...");
        const usersRes = await api.get('/auth/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Users received:", JSON.stringify(usersRes.data, null, 2));
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}

check();
