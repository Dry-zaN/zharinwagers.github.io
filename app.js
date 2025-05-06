// Simulated match data
const matches = [
    {
        id: 1,
        name: "Ranked Battle Royale",
        type: "battle-royale",
        prizePool: 500,
        entryFee: 10,
        startTime: Date.now() + (3600000 * 2), // 2 hours from now
        players: 12,
        maxPlayers: 20,
        teams: [
            { id: 1, name: "Team Alpha" },
            { id: 2, name: "Team Bravo" },
            { id: 3, name: "Team Charlie" },
            { id: 4, name: "Team Delta" },
            { id: 5, name: "Team Echo" }
        ]
    },
    {
        id: 2,
        name: "Arena Tournament",
        type: "arena",
        prizePool: 250,
        entryFee: 5,
        startTime: Date.now() + (3600000 * 4), // 4 hours from now
        players: 8,
        maxPlayers: 16,
        teams: [
            { id: 1, name: "Team Foxtrot" },
            { id: 2, name: "Team Golf" },
            { id: 3, name: "Team Hotel" },
            { id: 4, name: "Team India" }
        ]
    }
];

// Simulated user wagers
let userWagers = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Dashboard page
    if (document.querySelector('.dashboard')) {
        initDashboard();
    }
    
    // Matches page
    if (document.querySelector('.matches')) {
        initMatches();
    }
});

// Dashboard functions
function initDashboard() {
    updateBalanceDisplay();
    loadActiveWagers();
    loadMatchHistory();
    
    // Deposit modal
    const depositModal = document.getElementById('deposit-modal');
    const depositBtn = document.getElementById('deposit-btn');
    const closeBtn = depositModal.querySelector('.close');
    
    depositBtn.addEventListener('click', function() {
        depositModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        depositModal.style.display = 'none';
    });
    
    // Deposit amount buttons
    const depositAmounts = document.querySelectorAll('.deposit-amount');
    depositAmounts.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = parseFloat(btn.dataset.amount);
            depositFunds(amount);
            depositModal.style.display = 'none';
        });
    });
    
    // Custom deposit
    const customDepositBtn = document.getElementById('custom-deposit');
    customDepositBtn.addEventListener('click', function() {
        const amount = parseFloat(document.getElementById('custom-amount').value);
        if (amount > 0) {
            depositFunds(amount);
            depositModal.style.display = 'none';
        }
    });
}

function updateBalanceDisplay() {
    if (currentUser) {
        const balanceElements = document.querySelectorAll('#user-balance, .user-balance');
        balanceElements.forEach(el => {
            el.textContent = `$${currentUser.balance.toFixed(2)}`;
        });
    }
}

function depositFunds(amount) {
    if (currentUser) {
        currentUser.balance += amount;
        localStorage.setItem('apexWagerUser', JSON.stringify(currentUser));
        updateBalanceDisplay();
    }
}

function loadActiveWagers() {
    const container = document.getElementById('active-wagers');
    if (userWagers.length === 0) {
        container.innerHTML = '<div class="empty-state">No active wagers</div>';
        return;
    }
    
    // In a real app, this would show actual active wagers
}

function loadMatchHistory() {
    const container = document.getElementById('match-history');
    container.innerHTML = '<div class="empty-state">No match history</div>';
}

// Matches page functions
function initMatches() {
    renderMatches();
    
    // Join modal
    const joinModal = document.getElementById('join-modal');
    const joinButtons = document.querySelectorAll('.join-match');
    const closeBtn = joinModal.querySelector('.close');
    
    joinButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const matchId = parseInt(btn.closest('.match-card').dataset.matchId);
            openJoinModal(matchId);
        });
    });
    
    closeBtn.addEventListener('click', function() {
        joinModal.style.display = 'none';
    });
    
    // Confirm join button
    const confirmJoinBtn = document.getElementById('confirm-join');
    if (confirmJoinBtn) {
        confirmJoinBtn.addEventListener('click', function() {
            placeWager();
        });
    }
    
    // Filter functionality
    const matchTypeFilter = document.getElementById('match-type');
    const entryFeeFilter = document.getElementById('entry-fee');
    
    if (matchTypeFilter && entryFeeFilter) {
        matchTypeFilter.addEventListener('change', renderMatches);
        entryFeeFilter.addEventListener('change', renderMatches);
    }
}

function renderMatches() {
    const container = document.getElementById('match-list');
    const matchType = document.getElementById('match-type')?.value;
    const entryFee = document.getElementById('entry-fee')?.value;
    
    // Filter matches
    let filteredMatches = matches;
    
    if (matchType && matchType !== 'all') {
        filteredMatches = filteredMatches.filter(match => match.type === matchType);
    }
    
    if (entryFee && entryFee !== 'all') {
        const fee = parseFloat(entryFee);
        filteredMatches = filteredMatches.filter(match => match.entryFee === fee);
    }
    
    // Render matches
    if (filteredMatches.length === 0) {
        container.innerHTML = '<div class="empty-state">No matches found</div>';
        return;
    }
    
    container.innerHTML = '';
    
    filteredMatches.forEach(match => {
        const startTime = new Date(match.startTime);
        const hoursUntil = Math.floor((startTime - Date.now()) / 3600000);
        const minutesUntil = Math.floor(((startTime - Date.now()) % 3600000) / 60000);
        
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.dataset.matchId = match.id;
        
        matchCard.innerHTML = `
            <div class="match-header">
                <h3>${match.name}</h3>
                <div class="match-prize">Prize Pool: $${match.prizePool}</div>
            </div>
            <div class="match-details">
                <div class="match-time">Starts in: ${hoursUntil}h ${minutesUntil}m</div>
                <div class="match-entry">Entry: $${match.entryFee}</div>
                <div class="match-players">Players: ${match.players}/${match.maxPlayers}</div>
            </div>
            <button class="btn primary join-match">Join Match</button>
        `;
        
        container.appendChild(matchCard);
    });
    
    // Reattach event listeners to new buttons
    document.querySelectorAll('.join-match').forEach(btn => {
        btn.addEventListener('click', function() {
            const matchId = parseInt(btn.closest('.match-card').dataset.matchId);
            openJoinModal(matchId);
        });
    });
}

function openJoinModal(matchId) {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    const modal = document.getElementById('join-modal');
    const teamList = modal.querySelector('.team-list');
    
    // Populate teams
    teamList.innerHTML = '';
    match.teams.forEach(team => {
        const teamOption = document.createElement('div');
        teamOption.className = 'team-option';
        teamOption.dataset.team = team.id;
        
        teamOption.innerHTML = `
            <input type="checkbox" id="team${team.id}-1st">
            <label for="team${team.id}-1st">${team.name} (1st)</label>
        `;
        
        teamList.appendChild(teamOption);
    });
    
    modal.style.display = 'block';
}

function placeWager() {
    if (!currentUser) return;
    
    const modal = document.getElementById('join-modal');
    const matchId = parseInt(modal.dataset.currentMatch);
    const match = matches.find(m => m.id === matchId);
    
    if (!match || currentUser.balance < match.entryFee) {
        alert('Insufficient funds');
        return;
    }
    
    // Deduct entry fee
    currentUser.balance -= match.entryFee;
    localStorage.setItem('apexWagerUser', JSON.stringify(currentUser));
    updateBalanceDisplay();
    
    // Create wager (simplified)
    const selectedTeams = [];
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const teamId = parseInt(cb.id.split('-')[0].replace('team', ''));
        selectedTeams.push(teamId);
    });
    
    const wager = {
        matchId,
        entryFee: match.entryFee,
        selectedTeams,
        timestamp: Date.now(),
        status: 'active'
    };
    
    userWagers.push(wager);
    modal.style.display = 'none';
    
    // Update matches display
    renderMatches();
}