document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const cards = Array.from(document.querySelectorAll('.card'));
    const instruction = document.getElementById('instruction');
    const result = document.getElementById('result');
    const revealButton = document.getElementById('reveal-button');
    const shuffleButton = document.getElementById('shuffle-button');
    
    let greenCardIndex = Math.floor(Math.random() * 3);  // Track which card is green initially
    let gamePhase = 'reveal'; // 'reveal', 'shuffle', 'guess'
    let isShuffling = false;
    let roundCounter = 0; // Track the number of rounds
    let isStackRound = false; // Flag to indicate if it's a stack/unstack round

    // Define target positions for transform-based alignment
    const positions = ['-150px', '0px', '150px'];

    // Function to reset the game
    function resetGame() {
        isStackRound = roundCounter > 0 && roundCounter % 5 === 0; // Every 5th round is a stack round
        cards.forEach((card, index) => {
            card.style.backgroundColor = 'black'; // Hide all cards initially
            card.style.transform = `translateX(${positions[index]})`; // Align cards with placeholders
            card.dataset.color = (index === greenCardIndex) ? 'green' : 'red'; // Assign initial colors
        });
        result.textContent = '';
        gamePhase = 'reveal';
        instruction.textContent = 'Click "Reveal" to start!';
        revealButton.disabled = false;
        shuffleButton.disabled = true;
    }

    // Function to reveal the cards briefly
    function revealCards() {
        cards.forEach(card => {
            card.style.backgroundColor = card.dataset.color;
        });
        setTimeout(() => {
            hideCards();
            gamePhase = 'shuffle';
            instruction.textContent = 'Click "Shuffle" to shuffle the cards!';
            shuffleButton.disabled = false;
        }, 2000);
    }

    // Function to hide the cards
    function hideCards() {
        cards.forEach(card => {
            card.style.backgroundColor = 'black';
        });
    }

    // Function to animate shuffling of the cards
    function shuffleCards() {
        instruction.textContent = 'Shuffling...';
        isShuffling = true;
        let shuffleTimes = isStackRound ? 9 : 10; // Regular rounds have 5 shuffles; stack round has 4
        let count = 0;

        function performShuffle() {
            if (count >= shuffleTimes) {
                if (isStackRound) {
                    stackAndUnstack();
                } else {
                    finishShuffle();
                }
                return;
            }

            // Choose two random indices to swap
            const index1 = Math.floor(Math.random() * 3);
            let index2;
            do {
                index2 = Math.floor(Math.random() * 3);
            } while (index1 === index2);

            // Swap visual position
            const card1 = cards[index1];
            const card2 = cards[index2];
            const tempTransform = card1.style.transform;

            card1.style.transform = card2.style.transform;
            card2.style.transform = tempTransform;

            [cards[index1], cards[index2]] = [cards[index2], cards[index1]];

            count++;
            setTimeout(performShuffle, 300); // Delay for the shuffle animation
        }

        performShuffle();
    }

    // Function to handle the final stack/unstack on stack round
    function stackAndUnstack() {
        // Stack all cards on the center position
        cards.forEach(card => card.style.transform = `translateX(0px)`);
        
        setTimeout(() => {
            // Unstack cards back to their original positions
            cards.forEach((card, index) => card.style.transform = `translateX(${positions[index]})`);
            setTimeout(finishShuffle, 1000); // Wait briefly before allowing choice
        }, 1000);
    }

    // Function to finish shuffling and proceed to the guessing phase
    function finishShuffle() {
        isShuffling = false;
        instruction.textContent = 'Pick a card!';
        gamePhase = 'guess';
    }

    // Function to handle the player's choice of card
    function revealCard(card) {
        if (gamePhase !== 'guess') return;

        // In a stack round, determine win/loss randomly with a 33% chance of winning
        if (isStackRound) {
            const playerWins = Math.random() < 0.33;

            if (playerWins) {
                // Player wins: Make chosen card green, others red
                card.dataset.color = 'green';
                cards.forEach(c => {
                    if (c !== card) c.dataset.color = 'red';
                });
            } else {
                // Player loses: Make chosen card red, one other green
                card.dataset.color = 'red';
                const otherGreenIndex = cards.indexOf(card) === 0 ? 1 : 0;
                cards.forEach((c, i) => c.dataset.color = (i === otherGreenIndex) ? 'green' : 'red');
            }
        }

        // Reveal all cards
        cards.forEach(c => c.style.backgroundColor = c.dataset.color);

        // Display win/loss message based on the chosen card's color
        result.textContent = (card.dataset.color === 'green') ? 'You win! 🎉' : 'Wrong choice! Try again.';

        // Increment round counter and prepare for next round
        roundCounter++;
        setTimeout(() => {
            greenCardIndex = Math.floor(Math.random() * 3); // Set new green card position
            resetGame();
        }, 3000); // Wait before starting the next round
    }

    // Event Listeners
    revealButton.addEventListener('click', () => {
        if (gamePhase === 'reveal') {
            revealCards();
        }
    });

    shuffleButton.addEventListener('click', () => {
        if (gamePhase === 'shuffle' && !isShuffling) {
            shuffleCards();
        }
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            revealCard(card);
        });
    });

    // Initial setup
    resetGame();
});
