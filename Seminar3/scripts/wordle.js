window.onload= function(){
    const board = document.getElementById('board');
    const guessInput= document.getElementById('guessInput');
    const guessButton= document.getElementById('guessButton');
    const newGameButton= document.getElementById('newGameButton');

    const words = ["table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit"];

    const gamesEl= document.getElementById('games');
    const winPercentEl= document.getElementById('winPercent');
    const streakEl= document.getElementById('streak');

    let word, tries, gameOver;
    let games=0, wins=0, streak=0;

    function createBoard(){
        board.innerHTML="";
        for (let i=0; i<6; i++){
            const row= document.createElement('div');
            row.classList.add('row');

            for(let j=0; j<5; j++){
                const cell= document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row=i;
                cell.dataset.column=j;
                row.appendChild(cell);
            }
            board.appendChild(row);
        }
    }

    function startGame(){
        word= words[Math.floor(Math.random()*words.length)];
        tries=0;
        gameOver=false;
        guessInput.value="";
        newGameButton.style.display="none";
        createBoard();
        console.log("Word:", word);
    }

    function updateStatus(){
        gamesEl.textContent=games;
        winPercentEl.textContent= games?Math.round((wins/games)*100):0;
        streakEl.textContent=streak;
    }

    function handleGuess(){
        if(gameOver) return;

        let guess= guessInput.value.toLowerCase();
        if(guess.length!=5){
            alert('Guess must be 5 letters');
            return;
        }

        let wordLetters= word.split('');
        let guessLetters= guess.split('');
        let colors = Array(5).fill('red');

        for(let i=0; i<5; i++){
            if(guessLetters[i]===wordLetters[i]){
                colors[i]='green';
                wordLetters[i]= null;
                guessLetters[i]= null;
            }
        }

         for (let i = 0; i < 5; i++) {
            if (guessLetters[i] && wordLetters.includes(guessLetters[i])) {
                colors[i] = "yellow";
                wordLetters[wordLetters.indexOf(guessLetters[i])] = null;
            }
        }

        for (let i = 0; i < 5; i++) {
            const cell = document.querySelector(
                `[data-row="${tries}"][data-column="${i}"]`
            );
            cell.textContent = guess[i];
            cell.classList.add(colors[i], "reveal");
        }

        if (guess === word) {
            alert("You won!");
            games++; wins++; streak++;
            gameOver = true;
            newGameButton.style.display = "block";
            updateStatus();
            return;
        }

        if (tries === 5) {
            alert("You lost! The word was: " + word.toUpperCase());
            games++; streak = 0;
            gameOver = true;
            newGameButton.style.display = "block";
            updateStatus();
            return;
        }

        tries++;
        guessInput.value = "";
    }

    guessButton.addEventListener("click", handleGuess);

    guessInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            handleGuess();
        }
    });

    newGameButton.addEventListener("click", startGame);

    startGame();
};