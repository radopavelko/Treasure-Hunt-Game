class TreasureHuntGame {
    constructor() {
        this.players = {
            1: { character: null, name: '', position: 0, points: 0, hasKey: false },
            2: { character: null, name: '', position: 0, points: 0, hasKey: false }
        };
        this.currentPlayer = 1;
        this.gameStarted = false;
        this.gameBoard = [];
        this.totalPoints = 90;
        this.pointsDistributed = 0;
        
        this.characterEmojis = {
            explorer: '🧭',
            pirate: '🏴‍☠️',
            archaeologist: '🏛️'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateGameBoard();
    }
    
    setupEventListeners() {
        document.querySelectorAll('.character').forEach(char => {
            char.addEventListener('click', (e) => this.selectCharacter(e));
        });
        
        document.getElementById('player1-name').addEventListener('input', () => this.updatePlayerName(1));
        document.getElementById('player2-name').addEventListener('input', () => this.updatePlayerName(2));
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('roll-dice').addEventListener('click', () => this.rollDice());
        document.getElementById('play-again').addEventListener('click', () => this.resetGame());
    }
    
    selectCharacter(event) {
        const character = event.currentTarget.dataset.character;
        const player = event.currentTarget.dataset.player;
        
        document.querySelectorAll(`.character[data-player="${player}"]`).forEach(c => {
            c.classList.remove('selected');
        });
        
        event.currentTarget.classList.add('selected');
        this.players[player].character = character;
        this.checkReadyToStart();
    }
    
    updatePlayerName(playerId) {
        const nameInput = document.getElementById(`player${playerId}-name`);
        this.players[playerId].name = nameInput.value.trim();
        this.checkReadyToStart();
    }
    
    checkReadyToStart() {
        const bothSelected = this.players[1].character && this.players[2].character;
        const bothNamed = this.players[1].name && this.players[2].name;
        document.getElementById('start-game').disabled = !(bothSelected && bothNamed);
    }
    
    generateGameBoard() {
        const boardSize = 50;
        this.gameBoard = new Array(boardSize).fill(null).map((_, index) => {
            if (index === 0) return { type: 'start', content: 'START' };
            if (index === boardSize - 1) return { type: 'finish', content: '🧳 FINISH' };
            return this.generateRandomCell();
        });
        
        this.placeKey();
        this.distributePoints();
    }
    
    generateRandomCell() {
        const cellTypes = ['empty', 'points', 'treasure'];
        const weights = [0.6, 0.3, 0.1];
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < cellTypes.length; i++) {
            cumulativeWeight += weights[i];
            if (random < cumulativeWeight) {
                if (cellTypes[i] === 'points') {
                    const points = Math.floor(Math.random() * 10) + 1;
                    return { type: 'points', content: `🪙 +${points}`, points: points };
                } else if (cellTypes[i] === 'treasure') {
                    const points = Math.floor(Math.random() * 15) + 5;
                    return { type: 'treasure', content: `💎 +${points}`, points: points };
                }
                return { type: 'empty', content: '' };
            }
        }
        
        return { type: 'empty', content: '' };
    }
    
    placeKey() {
        const availablePositions = [];
        for (let i = 1; i < this.gameBoard.length - 1; i++) {
            availablePositions.push(i);
        }
        
        const keyPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        this.gameBoard[keyPosition] = { type: 'key', content: '🔑 KEY' };
    }
    
    distributePoints() {
        let existingPoints = 0;
        this.gameBoard.forEach(cell => {
            if (cell.points) existingPoints += cell.points;
        });
        
        let remainingPoints = this.totalPoints - existingPoints;
        
        while (remainingPoints > 0) {
            const emptyPositions = [];
            for (let i = 1; i < this.gameBoard.length - 1; i++) {
                if (this.gameBoard[i].type === 'empty') {
                    emptyPositions.push(i);
                }
            }
            
            if (emptyPositions.length === 0) break;
            
            const position = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
            const points = Math.min(remainingPoints, Math.floor(Math.random() * 5) + 1);
            
            this.gameBoard[position] = { type: 'points', content: `🪙 +${points}`, points: points };
            remainingPoints -= points;
        }
    }
    
    startGame() {
        this.gameStarted = true;
        document.getElementById('game-setup').classList.add('hidden');
        document.getElementById('game-board').classList.remove('hidden');
        
        document.getElementById('player1-character').textContent = this.characterEmojis[this.players[1].character];
        document.getElementById('player2-character').textContent = this.characterEmojis[this.players[2].character];
        
        document.querySelector('#player1-info .player-name').textContent = this.players[1].name;
        document.querySelector('#player2-info .player-name').textContent = this.players[2].name;
        
        this.renderGameBoard();
        this.updatePlayerDisplay();
    }
    
    renderGameBoard() {
        const gameGrid = document.getElementById('game-grid');
        gameGrid.innerHTML = '';
        
        this.gameBoard.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = `grid-cell ${cell.type}`;
            cellElement.innerHTML = `
                <div class="cell-content">${cell.content}</div>
                <div class="cell-players" id="cell-players-${index}"></div>
            `;
            gameGrid.appendChild(cellElement);
        });
        
        this.updatePlayerPositions();
    }
    
    updatePlayerPositions() {
        document.querySelectorAll('.cell-players').forEach(el => {
            el.innerHTML = '';
            el.classList.remove('multiple-players');
        });
        
        const playersByPosition = {};
        Object.keys(this.players).forEach(playerId => {
            const position = this.players[playerId].position;
            if (!playersByPosition[position]) {
                playersByPosition[position] = [];
            }
            playersByPosition[position].push(playerId);
        });
        
        Object.keys(playersByPosition).forEach(position => {
            const playersContainer = document.getElementById(`cell-players-${position}`);
            if (playersContainer) {
                const playersAtPosition = playersByPosition[position];
                
                if (playersAtPosition.length > 1) {
                    playersContainer.classList.add('multiple-players');
                }
                
                playersAtPosition.forEach(playerId => {
                    const marker = document.createElement('div');
                    marker.className = `player-marker player${playerId}`;
                    marker.setAttribute('data-character', this.characterEmojis[this.players[playerId].character]);
                    
                    const characterIcon = document.createElement('div');
                    characterIcon.className = 'player-character-icon';
                    characterIcon.textContent = this.characterEmojis[this.players[playerId].character];
                    
                    const nameDisplay = document.createElement('div');
                    nameDisplay.className = 'player-name-display';
                    nameDisplay.textContent = this.players[playerId].name;
                    
                    marker.textContent = playerId;
                    marker.appendChild(characterIcon);
                    marker.appendChild(nameDisplay);
                    playersContainer.appendChild(marker);
                });
            }
        });
    }
    
    updatePlayerDisplay() {
        Object.keys(this.players).forEach(playerId => {
            document.getElementById(`player${playerId}-points`).textContent = this.players[playerId].points;
            document.getElementById(`player${playerId}-key`).textContent = this.players[playerId].hasKey ? '✅' : '❌';
        });
        
        const currentPlayerName = this.players[this.currentPlayer].name;
        document.getElementById('current-turn').textContent = `${currentPlayerName}'s Turn`;
    }
    
    rollDice() {
        const rollButton = document.getElementById('roll-dice');
        const diceVisual = document.getElementById('dice-visual');
        const diceResult = document.getElementById('dice-result');
        
        // Generate the actual dice roll first
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        const diceNumbers = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const finalDiceFace = diceNumbers[finalRoll - 1];
        
        // Disable roll button during animation
        rollButton.disabled = true;
        rollButton.textContent = 'Rolling...';
        
        // Hide previous result
        diceResult.classList.remove('show');
        diceResult.textContent = '';
        
        // Start dice animation
        diceVisual.classList.add('rolling');
        
        // Show random dice faces during animation
        let animationCount = 0;
        const animationInterval = setInterval(() => {
            const randomFace = diceNumbers[Math.floor(Math.random() * 6)];
            diceVisual.textContent = randomFace;
            animationCount++;
            
            if (animationCount >= 10) {
                clearInterval(animationInterval);
            }
        }, 100);
        
        // After animation completes, show final result
        setTimeout(() => {
            // Show final dice face that matches the actual roll
            diceVisual.textContent = finalDiceFace;
            diceVisual.classList.remove('rolling');
            
            // Show result text
            diceResult.textContent = `You rolled: ${finalRoll}`;
            diceResult.classList.add('show');
            
            // Re-enable button
            rollButton.disabled = false;
            rollButton.textContent = 'Roll Dice';
            
            // Move player after short delay using the same roll number
            setTimeout(() => {
                this.movePlayer(this.currentPlayer, finalRoll);
            }, 500);
            
        }, 1000);
    }
    
    movePlayer(playerId, steps) {
        const player = this.players[playerId];
        const newPosition = Math.min(player.position + steps, this.gameBoard.length - 1);
        
        player.position = newPosition;
        
        this.handleCellEffect(playerId, newPosition);
        
        this.updatePlayerPositions();
        this.updatePlayerDisplay();
        
        if (this.checkGameEnd()) {
            this.endGame();
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.updatePlayerDisplay();
        }
    }
    
    handleCellEffect(playerId, position) {
        const cell = this.gameBoard[position];
        const player = this.players[playerId];
        const playerName = player.name;
        
        switch (cell.type) {
            case 'points':
                player.points += cell.points;
                this.showMessage(`${playerName} gained ${cell.points} points!`);
                break;
            case 'treasure':
                player.points += cell.points;
                this.showMessage(`${playerName} found treasure worth ${cell.points} points!`);
                break;
            case 'key':
                player.hasKey = true;
                this.showMessage(`${playerName} found the key!`);
                break;
            case 'finish':
                this.showMessage(`${playerName} reached the finish!`);
                break;
        }
    }
    
    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4299e1;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
    
    checkGameEnd() {
        return this.players[1].position === this.gameBoard.length - 1 && 
               this.players[2].position === this.gameBoard.length - 1;
    }
    
    endGame() {
        document.getElementById('game-board').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        
        const player1FinalScore = this.calculateFinalScore(1);
        const player2FinalScore = this.calculateFinalScore(2);
        
        let winner;
        if (player1FinalScore > player2FinalScore) {
            winner = `${this.players[1].name} Wins! 🎉`;
        } else if (player2FinalScore > player1FinalScore) {
            winner = `${this.players[2].name} Wins! 🎉`;
        } else {
            winner = "It's a Tie! 🤝";
        }
        
        document.getElementById('winner-announcement').textContent = winner;
        document.getElementById('final-scores').innerHTML = `
            <div class="score-line">
                <span>${this.players[1].name} (${this.characterEmojis[this.players[1].character]}):</span>
                <span>${player1FinalScore} points</span>
            </div>
            <div class="score-line">
                <span>${this.players[2].name} (${this.characterEmojis[this.players[2].character]}):</span>
                <span>${player2FinalScore} points</span>
            </div>
        `;
    }
    
    calculateFinalScore(playerId) {
        const player = this.players[playerId];
        let finalScore = player.points;
        
        if (player.hasKey && player.position === this.gameBoard.length - 1) {
            finalScore += 25;
        }
        
        return finalScore;
    }
    
    resetGame() {
        this.players = {
            1: { character: null, name: '', position: 0, points: 0, hasKey: false },
            2: { character: null, name: '', position: 0, points: 0, hasKey: false }
        };
        this.currentPlayer = 1;
        this.gameStarted = false;
        
        document.querySelectorAll('.character').forEach(c => c.classList.remove('selected'));
        document.getElementById('player1-name').value = '';
        document.getElementById('player2-name').value = '';
        document.getElementById('start-game').disabled = true;
        document.getElementById('dice-result').textContent = '';
        document.getElementById('dice-result').classList.remove('show');
        document.getElementById('dice-visual').textContent = '🎲';
        document.getElementById('dice-visual').classList.remove('rolling');
        
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-setup').classList.remove('hidden');
        
        this.generateGameBoard();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TreasureHuntGame();
});
