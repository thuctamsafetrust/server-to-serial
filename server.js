const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// --- MOCK DATABASE ---
const users = { "admin": { password: "password", badges: ["98765", "12345"] } };

app.use(session({
    secret: 'cloud-secure-secret',
    resave: false,
    saveUninitialized: true
}));

// --- ROUTES ---

// 1. Login Page
app.get('/', (req, res) => res.render('login', { error: null }));

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        req.session.user = username;
        return res.redirect('/dashboard');
    }
    res.render('login', { error: "Invalid Credentials" });
});

// 2. Dashboard (View Badges)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('dashboard', { 
        username: req.session.user, 
        badges: users[req.session.user].badges 
    });
});

// 3. Save Logic (Browser sends serial data here)
app.post('/api/save-badge', (req, res) => {
    const { badgeNumber } = req.body;
    if (badgeNumber && req.session.user) {
        users[req.session.user].badges.push(badgeNumber);
        return res.json({ success: true });
    }
    res.status(400).json({ success: false });
});

const PORT = process.env.PORT || 4322;
app.listen(PORT, () => console.log(`Cloud Server running on port ${PORT}`));

// 4. --- DELETE LOGIC ---
app.post('/api/delete-badge', (req, res) => {
    const { badgeNumber } = req.body;
    
    // Check if the user is logged in and the badge exists
    if (badgeNumber && req.session.user) {
        let userBadges = users[req.session.user].badges;
        
        // Filter out the badge we want to delete
        users[req.session.user].badges = userBadges.filter(b => b !== badgeNumber);
        
        return res.json({ success: true });
    }
    res.status(400).json({ success: false });
});