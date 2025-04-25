require('dotenv').config();
console.log('Starting server...'); // Debug log

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files (front.html & others)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auth_system'
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
        process.exit(1); // Exit process if DB fails
    } else {
        console.log('✅ Connected to MySQL database');
    }
});

// ✅ Signup route
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: 'Server error', error: err });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

// ✅ Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

        // ✅ Redirect to front page after login
        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            redirect: '/front'  // Redirect to front.html served by Express
        });
    });
});

// ✅ Serve front.html
app.get('/front', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'front.html'));
});

// ✅ Start server with proper error handling
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Proper error handling for server startup
server.on("error", (err) => {
    console.error("❌ Server failed to start:", err);
});
