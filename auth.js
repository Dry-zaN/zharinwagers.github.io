// auth.js - Client-side authentication system
document.addEventListener('DOMContentLoaded', function() {
    // Initialize demo user if none exists
    const users = JSON.parse(localStorage.getItem('apexWagerUsers')) || [];
    if (users.length === 0) {
        const demoUser = {
            id: 1,
            username: 'demo',
            email: 'demo@apexwager.com',
            password: hashPassword('demo123'),
            balance: 1000,
            createdAt: new Date().toISOString(),
            wagers: []
        };
        users.push(demoUser);
        localStorage.setItem('apexWagerUsers', JSON.stringify(users));
    }

    // Check auth status
    checkAuth();
    setupAuthButtons();
    
    // Setup login form if exists
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = loginForm.elements['username'].value;
            const password = loginForm.elements['password'].value;
            login(username, password);
        });
    }
    
    // Setup register form if exists
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = registerForm.elements['username'].value;
            const email = registerForm.elements['email'].value;
            const password = registerForm.elements['password'].value;
            const confirmPassword = registerForm.elements['confirmPassword'].value;
            
            if (password !== confirmPassword) {
                showAlert('error', 'Passwords do not match');
                return;
            }
            
            register(username, email, password);
        });
    }
});

// Password hashing
function hashPassword(password) {
    return btoa(password + 'apex-wager-salt');
}

// Check authentication status
function checkAuth() {
    const authToken = localStorage.getItem('apexWagerAuthToken');
    if (authToken) {
        try {
            const payload = JSON.parse(atob(authToken.split('.')[1]));
            const users = JSON.parse(localStorage.getItem('apexWagerUsers')) || [];
            const user = users.find(u => u.id === payload.userId);
            
            if (user) {
                window.currentUser = user;
                updateUIForAuth(true);
                return true;
            }
        } catch (e) {
            console.error('Invalid token', e);
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

// Login function
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('apexWagerUsers')) || [];
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user) {
        showAlert('error', 'User not found');
        return false;
    }
    
    if (user.password !== hashPassword(password)) {
        showAlert('error', 'Incorrect password');
        return false;
    }
    
    const authToken = generateAuthToken(user.id);
    localStorage.setItem('apexWagerAuthToken', authToken);
    window.currentUser = user;
    updateUIForAuth(true);
    window.location.href = 'dashboard.html';
    return true;
}

// Register function
function register(username, email, password) {
    const users = JSON.parse(localStorage.getItem('apexWagerUsers')) || [];
    
    if (users.some(u => u.username === username)) {
        showAlert('error', 'Username already exists');
        return false;
    }
    
    if (users.some(u => u.email === email)) {
        showAlert('error', 'Email already exists');
        return false;
    }
    
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
    document.body.classList.toggle('authenticated', isAuthenticated);
    
    if (isAuthenticated && currentUser) {
        document.querySelectorAll('.user-balance').forEach(el => {
            el.textContent = `$${currentUser.balance.toFixed(2)}`;
        });
    }
}

// Show alert message
function showAlert(type, message) {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}

// Setup auth buttons
function setupAuthButtons() {
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
}