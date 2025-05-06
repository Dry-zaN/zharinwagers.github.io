// auth.js - Client-side authentication system
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuth();
    
    // Set up login/logout buttons
    setupAuthButtons();
    
    // If we're on the login page, set up the form
    if (document.getElementById('login-form')) {
        setupLoginForm();
    }
    
    // If we're on the register page, set up the form
    if (document.getElementById('register-form')) {
        setupRegisterForm();
    }
});

// Simulated database
const users = JSON.parse(localStorage.getItem('apexWagerUsers')) || [
    {
        id: 1,
        username: 'demo',
        email: 'demo@apexwager.com',
        password: hashPassword('demo123'), // Hashed password
        balance: 1000,
        createdAt: new Date().toISOString(),
        wagers: []
    }
];

// Password hashing function (simplified for client-side)
function hashPassword(password) {
    return btoa(password + 'apex-wager-salt'); // Base64 encoding with salt
}

// Check authentication status
function checkAuth() {
    const authToken = localStorage.getItem('apexWagerAuthToken');
    if (authToken) {
        try {
            const userData = JSON.parse(atob(authToken.split('.')[1]));
            const user = users.find(u => u.id === userData.userId);
            if (user) {
                window.currentUser = user;
                updateUIForAuth(true);
                return true;
            }
        } catch (e) {
            console.error('Invalid auth token', e);
        }
    }
    updateUIForAuth(false);
    return false;
}

// Generate auth token
function generateAuthToken(userId) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { userId, iat: Date.now() };
    return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.${btoa('simulated-signature')}`;
}

// Setup auth buttons
function setupAuthButtons() {
    // Login button (if exists)
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
    
    // Logout button (if exists)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Setup login form
function setupLoginForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = form.elements['username'].value;
        const password = form.elements['password'].value;
        
        login(username, password);
    });
}

// Setup register form
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = form.elements['username'].value;
        const email = form.elements['email'].value;
        const password = form.elements['password'].value;
        const confirmPassword = form.elements['confirmPassword'].value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        register(username, email, password);
    });
}

// Login function
function login(username, password) {
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user) {
        alert('User not found');
        return false;
    }
    
    if (user.password !== hashPassword(password)) {
        alert('Incorrect password');
        return false;
    }
    
    // Generate auth token
    const authToken = generateAuthToken(user.id);
    localStorage.setItem('apexWagerAuthToken', authToken);
    
    // Set current user
    window.currentUser = user;
    
    // Update UI
    updateUIForAuth(true);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
    
    return true;
}

// Register function
function register(username, email, password) {
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return false;
    }
    
    if (users.some(u => u.email === email)) {
        alert('Email already exists');
        return false;
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password: hashPassword(password),
        balance: 0,
        createdAt: new Date().toISOString(),
        wagers: []
    };
    
    users.push(newUser);
    localStorage.setItem('apexWagerUsers', JSON.stringify(users));
    
    // Automatically log in the new user
    login(username, password);
    
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('apexWagerAuthToken');
    window.currentUser = null;
    updateUIForAuth(false);
    window.location.href = 'index.html';
}

// Update UI based on auth status
function updateUIForAuth(isAuthenticated) {
    // Show/hide auth buttons
    const loginButtons = document.querySelectorAll('.login-btn');
    const logoutButtons = document.querySelectorAll('.logout-btn');
    const authOnlyElements = document.querySelectorAll('.auth-only');
    const unauthOnlyElements = document.querySelectorAll('.unauth-only');
    
    loginButtons.forEach(btn => btn.style.display = isAuthenticated ? 'none' : 'block');
    logoutButtons.forEach(btn => btn.style.display = isAuthenticated ? 'block' : 'none');
    
    authOnlyElements.forEach(el => el.style.display = isAuthenticated ? 'block' : 'none');
    unauthOnlyElements.forEach(el => el.style.display = isAuthenticated ? 'none' : 'block');
    
    // Update user info if logged in
    if (isAuthenticated && currentUser) {
        const userBalanceElements = document.querySelectorAll('.user-balance');
        const usernameElements = document.querySelectorAll('.username-display');
        
        userBalanceElements.forEach(el => {
            el.textContent = `$${currentUser.balance.toFixed(2)}`;
        });
        
        usernameElements.forEach(el => {
            el.textContent = currentUser.username;
        });
    }
}