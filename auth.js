// Simulated user data
let currentUser = null;
const users = [
    { id: 1, username: 'demo', password: 'demo', balance: 100 }
];

// Check if user is logged in
function checkAuth() {
    const userData = localStorage.getItem('apexWagerUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForUser();
        return true;
    }
    return false;
}

// Login function
function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = {...user};
        localStorage.setItem('apexWagerUser', JSON.stringify(currentUser));
        updateUIForUser();
        return true;
    }
    return false;
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('apexWagerUser');
    window.location.href = 'index.html';
}

// Update UI elements for logged in user
function updateUIForUser() {
    const balanceElements = document.querySelectorAll('.user-balance');
    balanceElements.forEach(el => {
        el.textContent = `$${currentUser.balance.toFixed(2)}`;
    });
    
    // Show/hide login/logout buttons
    const loginButtons = document.querySelectorAll('.login-btn');
    const logoutButtons = document.querySelectorAll('.logout-btn');
    
    loginButtons.forEach(btn => btn.style.display = currentUser ? 'none' : 'block');
    logoutButtons.forEach(btn => btn.style.display = currentUser ? 'block' : 'none');
}

// Event listeners for auth elements
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Login button (on index page)
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real app, this would show a login form
            // For demo, we'll just log in with demo credentials
            login('demo', 'demo');
            window.location.href = 'dashboard.html';
        });
    }
    
    // Logout buttons
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});