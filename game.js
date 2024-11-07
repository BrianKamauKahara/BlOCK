const player = document.getElementById('player'),
    body = document.querySelector('body'),
    computedBody = window.getComputedStyle(body),
    gameBoard = document.getElementById('hazard-area'),
    scoreDisplay = document.querySelector('.score-display'),
    playerInparea = document.getElementById('inparea')
    


// Giving the player height and width
player.style.height = player.style.width = '24px'

const bodyHeight = Number(computedBody.height.split('p')[0]) - Number(computedBody.border.split(' ')[0].split('p')[0]),
    bodyWidth = Number(computedBody.width.split('p')[0]) - Number(computedBody.border.split(' ')[0].split('p')[0]),
    playerHeight = Number(player.style.height.split('p')[0]),
    playerWidth = Number(player.style.width.split('p')[0])


let playing = false


/* ---------SECTION 1: PLAYER MOVEMENT FUNCTIONALITY  */
{
// DEFINITION OF GLOBAL STATE VARIABLES
const keyStates = {
    'w':false,
    'd':false,
    'a':false,
    's':false
}

let speed = 10,
    buffer = 20,
    maxSpeed = 10,
    moveMethod = 'keys'

const playerCoordinates = {
    'Y':[0,-playerHeight/maxSpeed],
    'X':[0,playerWidth/maxSpeed]
}


// W A S D MOVEMENT EVENT LISTENER
player.addEventListener('keydown', (e) => {
    
    if (!playing) {return}
    
    if (moveMethod !== 'keys') {return}
    
    key = e.key.toLowerCase()
    
    
    if (key === 'arrowup') { key = 'w'} else
    if (key === 'arrowdown') { key = 's'} else
    if (key === 'arrowleft') { key = 'a'} else
    if (key === 'arrowright') { key = 'd'}

    // Returns for any other key
    if (key !=='w'&& key !=='a' && key !=='s' && key!=='d') {return}

    /* 
    Upon testing, this is the best method I have come up with. So bear with
    It may be inefficient, but it works best and allows smoothest updatement

    When you press and hold w, a, s and d, the keyStates dictionary is changed 
    to read true for the respective value. This is crucial as it now allows
    the player to update in the direction of the key pressed.

    This happens because every 10 milliseconds, the player's position is always being
    updated, and it is being updated based on the keyStates dictionary. Therefore,
    when you effectively tell the program to 'keep on increasing the user's y coordinate
    by 1' by pressing 'w', it will do so every ten milliseconds, and will only 
    stop when you release it.
    */
    keyStates[key] = true
})

{
    /* document.addEventListener("mousemove", (event) => {
    if (moveMethod !== 'cursor') {return}
    const x = event.clientX
    const y = event.clientY
    player.style.left = x + 'px'
    player.style.top = y + 'px'
    playerCoordinates['X'] = [x/maxSpeed, (x + playerWidth)/maxSpeed ]
    playerCoordinates['Y'] = [y/maxSpeed, -(y + playerHeight)/maxSpeed]
    console.log(playerCoordinates['X'], playerCoordinates['Y'])
    checkPlayerAlive()
    checkPlayerGotCoin('one-chase')
}); */
}

// W A S D STOPPING MOVEMENT EVENT LISTENER
player.addEventListener('keyup', (e) => {
    if (!playing) {return}
    key = e.key.toLowerCase()
    
    if (key === 'arrowup') { key = 'w'} else
    if (key === 'arrowdown') { key = 's'} else
    if (key === 'arrowleft') { key = 'a'} else
    if (key === 'arrowright') { key = 'd'}
    
    // Stop slowing down the player
    if (key === 'shift'){
        speed = maxSpeed
        // You have to reset player movement for it to work, but this is seamless
        stationPlayer()
        enablePlayerMovement()
    }
    // Returns for any other key
    if (key !=='w' && key !=='a' && key !=='s' && key!=='d') {return}


    // Stops the program from moving in a certain direction any more
    keyStates[key] = false
})

// PRESS AND HOLD SHIFT TO SLOW DOWN
player.addEventListener('keydown', (e)=> {
    if (e.key === 'Shift'){
        speed = maxSpeed / 2
        // You have to reset player movement for it to work, but this is seamless
        stationPlayer()
        enablePlayerMovement()
    }
    
})

// ACTUAL MOVEMENT FUNTIONALITY
let movementInterval;
function update(direction) {
    /* If you are not to update in a certain direction, as indicated by the 
    keyStates dictionary, then do not*/
    if (!keyStates[direction]) {return}
    

    // Determine the translation based on the direction of motion

    /*
    This is how it works. It is based on a co-ordinate system, where the initial position
    Of the player is (0,0). When the user presses and holds a key to update the user
    in a certain direction, the player is updated to the new co-ordinates, and these 
    coordinates are kept track of. Therefore, every updatement is simply a re-positioning 
    to the correctly calculated co-ordinates

    Note that, the player's co-ordinates work like a graph
    Thus, the player would normally have a positive x-ordinate, and a negative y-ordinate
    (since the start point is the top corner)
    

                   (+1)
                    /\ 
             (-1)<--OO-->(+1)
                    \/
                   (-1)

            (OO - origin)

    */
    switch (direction){
        case 'w':
            // Positions the player ten pixels up
            /* if(playerCoordinates['Y'][0] >= 0 ) {return} */
            updateDS('Y','+',playerCoordinates['Y'][0],0)
            player.style.top = -maxSpeed*playerCoordinates['Y'][0] + 'px'
            
            break
        case 's':
            // Positions the player ten pixels down
            /* if(playerCoordinates['Y'][1] <= -bodyHeight/maxSpeed) {
                console.log(bodyHeight)
                
                return} */
            updateDS('Y','-',-playerCoordinates['Y'][1],bodyHeight/maxSpeed)
            player.style.top = -maxSpeed*playerCoordinates['Y'][0] + 'px'
            
            break
        case 'd':
            // Positions the player ten pixels right
            /* if(playerCoordinates['X'][1] >= bodyWidth/maxSpeed) {return} */
            updateDS('X','+',playerCoordinates['X'][1], bodyWidth/maxSpeed)
            player.style.left = maxSpeed*playerCoordinates['X'][0] + 'px'
            
            break
        case 'a':
            // Positions the player ten pixels left
            /* if(playerCoordinates['X'][0] <= 0) {return} */
            updateDS('X','-',-playerCoordinates['X'][0],0)
            player.style.left = maxSpeed*playerCoordinates['X'][0] + 'px'
            
            break
    }
    // After the movement, check whether the player is alive, and whether they got the coin
    checkPlayerAlive()
    checkPlayerGotCoin('one-chase')
}
function updateDS(direction, sign, checkWith, max) {
    console.log(checkWith)
    if (checkWith >= max) {return}
    if (sign === '+') {
        playerCoordinates[direction][0] = playerCoordinates[direction][0] + speed/maxSpeed
        playerCoordinates[direction][1] = playerCoordinates[direction][1] + speed/maxSpeed
    }
    else {
        playerCoordinates[direction][0] = playerCoordinates[direction][0] - speed/maxSpeed
        playerCoordinates[direction][1] = playerCoordinates[direction][1] - speed/maxSpeed
    }
    /* console.log(playerCoordinates['X'], playerCoordinates['Y']) */

}
// stops the player from moving
function stationPlayer () {
    // This function stops the program from updating the player's position
    clearInterval(movementInterval)
}

// enables all movement functionality to start
function enablePlayerMovement() {
    // This function keeps the program updating the player
    playing = true
    movementInterval = setInterval(() => {
        update('w')
        update('s')
        update('a')
        update('d')
    },buffer)
}

// THIS FUNCTION RETURNS THE PLAYER'S CURRENT POSITION --- FOR CONVENIENT USE
function playerCurrentXY () {
    return [playerCoordinates['X'],playerCoordinates['Y']]
}

// THIS FUNCTION DISPLAYS THE PLAYER'S POSITION EVERY SECOND --- FOR CONVENIENCE
function displayPlayerPosition(){
    setInterval(function () {
        console.log(...playerCurrentXY())
        getPlayerRegions()
    }, 1000)
}
}

/* ---------SECTION 2: PLACEMENT OF HAZARDS AND COINS ON THE GAME BOARD  */
{
// DEFINITION OF GLOBAL STATE VARIABLES
let widthDivisions = 16, 
    heightDivisions = 12,
    ratioHazards = 0.35,
    numGrids = widthDivisions * heightDivisions


let board, numHazards, gridWidth, gridHeight

gridWidth = bodyWidth/widthDivisions
gridHeight = bodyHeight/heightDivisions

let Hazards = [],
    hazardData = {},
    loadedHazards = [],
    coinRegions = [],
    coinsPlaced = false,
    gotCoin = false,
    hazardDivs,
    coinDivs,
    loadBoardInterval,
    deathTimeout


// THIS FUNCTION CALCULATES AND STORES DATA ON THE AREAS WHERE HAZARDS WILL BE
function generateHazardAreas(mode){
    /* 
    This function determines where the hazards are to be placed within the game board
    This function is called :
    1. Every 3 seconds, or
    2. When the player gets to a coin 
    */

    // The Hazards' data is reset
    Hazards = []
    hazardData = {}

    switch (mode) {
        case 'one-chase':
            // This is the number of hazards to generate, given by the ratio provided
            numHazards = Math.floor(numGrids * ratioHazards) + 1

            // Generate the hazards at random places (for one - chase game mode)
            for (let i = 0; i < numHazards; i++){
                Hazards.push(...board.splice(Math.floor(Math.random() * board.length),1))
            }
            
            // Going through each hazard
            Hazards.forEach((hazard) => {

                // Position the hazard (in terms of pixels)
                const [gridX, gridY] = determinePosition(hazard)

                // Store this data
                hazardData[hazard] = {
                    "placement": {
                        'X':gridX,
                        'Y':gridY
                    }
                }
            })
    }
}

// THIS FUNCTION PLACES THE HAZARDS ON THE GAME BOARD
function placeHazards(){
    /* This function places the hazards within the game board */
    
    //Reset the string representing the already placed hazards
    hazardDivs = ''

    /* The array below this comment represents the fully - loaded hazards
    Yes, though the hazards are placed immediately as this function  proceeds, 
    they first go through an animation as if they are 'load-ing' to give 
    the player time to escape. 
    Once that time period passes, the loadedHazards array is set equal to the hazards array,
    so that the checkPlayerAlive function 
    (which checks whether the player has strayed into one of the hazards)
    which uses the loadedHazards list, will function well now
    */
    loadedHazards = []

    // This function places the hazards in the game area
    Hazards.forEach((hazard) => {
        let { X: haz_X, Y :haz_Y } = hazardData[hazard]["placement"]
        
        // Each hazard's start location (X and Y) is given as already calculated
        hazardDivs += `
        <div class="hazard tile animate" id="haz_${hazard}" style = "width:${gridWidth}px; height:${gridHeight}px; position: fixed; top:${haz_Y}px; left:${haz_X}px; animation: loading-hazard 1s ease 0s 1 forwards;"></div>
        `
    })

    // The hazards are actually placed within the game board
    gameBoard.innerHTML += hazardDivs 
}

// THIS FUNCTION CALCULATES AND STORES DATA ON THE AREAS WHERE THE COINS WILL BE
function generateCoinAreas(mode) {
    /*
    This function determines where the coin will be placed on the board
    It is called 
    1. When the board is loaded (this happens every:
        - 3 seconds (in this case, coinsPlaced = true)
        - time when the player gets to a coin (in this case, coinsPlaced = false)
    */ 
    /* 
    If the coin has already been placed, the program updates the board, so that 
    when generating the hazards, a hazard does not get placed where a coin is placed
    */

    // If the coin(s) have not already been placed, generate where they will be placed
    if (!coinsPlaced) {
        // Depending on the mode, coins are generated differently
        switch (mode){
            // one-chase mode
            case 'one-chase':
                /* 
                For one-chase mode, the coin placement is chosen randomly
                Also note that this chosen slot is removed from board
                */
                let index = Math.floor(Math.random() *board.length)
                board.splice(index,1)
                
                // Reset the data concerning where the coins are
                coinRegions = []

                // Add the position chosen to the coinRegions list
                coinRegions.push(index)
                
                // Reset the coinDivs string
                coinDivs = ''

                break
                
        }
    } else {
        /*
        In the case where the coins have already been placed, then iterate through the 
        list containing the coin regions, and remove them from the board
        */
        coinRegions.forEach((index) => {
            board.splice(index, 1)
        })
        
    }
}

// THIS FUNCTION PLACES THE COINS ON THE GAMEBOARD
function placeCoins(mode) {
    // If the coins have already been placed, return
    /* if (coinsPlaced) {return} */

    /*
    Place the coins on the game board.
    This is done by calculating their position based on the regions they have been assigned
    and assigning their top and left values accordingly
    */
    
    switch (mode) {
        case 'one-chase':
            // Determine the X and Y pixel placement based on the coin's region
            
            const [gridX, gridY] = determinePosition(coinRegions[0] + 2) // Plus 2, because the index of a hazard is equal to its value - 2

            //Give the coin its right placement
            coinDivs = `<div class="coin tile" id="coin_1" style="width: ${gridWidth}px; height: ${gridHeight}px; position: fixed; top: ${gridY}px; left: ${gridX}px;"></div>`

            break
    }

    // Add the coinDivs string to the 
    gameBoard.innerHTML += coinDivs

    // Set the global coinsPlaced variable to true
    coinsPlaced = true
}

// THIS FUNCTION REPEATEDLY GENERATES THE HAZARDS AND COINS
function generateBoard(mode) {
        switch (mode){
            case 'one-chase':
                loadBoard()

                generateCoinAreas(mode)
                placeCoins(mode)

                generateHazardAreas(mode)
                placeHazards()
                
                

                // Time period to allow player to move away from newly loading hazards
                deathTimeout = setTimeout(() => {
                    loadedHazards = Hazards
                    checkPlayerAlive()
                }, 1000)
                break
        }

        loadBoardInterval = setInterval(() => {
            console.log('ROUND')
            switch (mode){
                case 'one-chase':
                    loadBoard()

                    generateCoinAreas(mode)
                    placeCoins(mode)
                    
                    generateHazardAreas(mode)
                    placeHazards()

                    // Time period to allow player to move away from newly loading hazards
                    deathTimeout = setTimeout(() => {
                        loadedHazards = Hazards
                        checkPlayerAlive()
                    }, 1000)
                    break
            }     
        }, 3000);
}

// THIS FUNCTION RESETS THE GAME BOARD'S INNER HTML AND BOARD GLOBAL VARIABLE DATA
function loadBoard() {
    /*
    Generates the data for the grid. This generates from 2 - 192, so that
    1 is excluded (so that a hazard is not placed on the starting square)
    */
    board = Array.from({ length: numGrids - 1 }, (_, index) => index + 2)
    
    // Resets the inner HTML of the game Board
    gameBoard.innerHTML = ''
}

// THIS FUNCTION CONVERTS GRID NUMBER (REGIONAL CO-ORDS) TO PIXEL POSITION
function determinePosition (gridNo) {
    // Determine the row AND column
    let row = Math.floor((gridNo - 1) / widthDivisions) + 1
    let column = ((gridNo - 1) % widthDivisions) + 1

    let gridX = (column - 1) * gridWidth
    let gridY = (row - 1) * gridHeight
    return [Number(gridX), Number(gridY)]
}

// THIS FUNCTION GETS THE REGIONAL CO-ORDS WHICH THE PLAYER IS IN -- FOR UTMOST CONVENIENCE
function getPlayerRegions (){
    let playerCoords = playerCurrentXY()

    /* 
    This function is necessary to check whether the player has entered 
    a region where there is a hazard. 
    This is done by getting the regions the player is in (because the player
    is a board, it is sufficient to check only the player's corners) 
    
    This is the purpose of the function:
    To convert the player's co-ordinates to regional co-ordinates 

    (The player's co-ordinates are not the same as the regional co-ordinates,
    because the basis of the player's co- ordinates is the speed global
    variable defined at the beginning of the program, while the basis of 
    the regional co-ordinates is the number of divisions within the game 
    board (e.g, 16 by 12, 9 by 9, 16 by 16))
    */

    /* 1. Get the four corners */
    let playerCorners = [
        [playerCoords[0][0], playerCoords[1][0]],
        [playerCoords[0][1], playerCoords[1][0]],
        [playerCoords[0][0], playerCoords[1][1]],
        [playerCoords[0][1], playerCoords[1][1]]
    ]


    /* 2. Convert the co-ordinates of the corners to regions */

    // This is where the program will store the regions the player is in
    let regions = []

    /* These are the maximum values of the regional co - ordinates, useful  in 
    converting user co-ordinates to region co-ordinates
    */
    let maxX = bodyWidth/maxSpeed,
        maxY = bodyHeight/maxSpeed

    // Iterating through each corner:...
    playerCorners.forEach((corner) => {
        // Get the player-respective x and y co-ordinate of that corner
        let [ X, Y ] = corner
        
        // Converts the player respective co-ords to the regional co-ords
        let xReg = Math.floor(X / maxX * (widthDivisions)) + 1,
            yReg = Math.floor(-Y / maxY * (heightDivisions)) + 1

        // Corner case handling 
        if (xReg === widthDivisions + 1)  { xReg = widthDivisions}
        if (yReg === heightDivisions + 1)  { yReg = heightDivisions}

        // Store this in the regions list
        regions.push((yReg-1) * widthDivisions + xReg)
    })

    return regions
}

// THIS FUNCTION CHECKS WHETHER THE PLAYER HAS STRAYED INTO A HAZARD
function checkPlayerAlive () {
    /* 
    This function checks whether the player is alive, by checking whether
    the player has strayed into a hazard. If they have, then the function
    returns false, else, it returns true
    */
    const playerRegions = getPlayerRegions()
    let alive = true

    playerRegions.forEach((region) => {
        if (loadedHazards.includes(region)) {
            alive =  false
        }
    })
    if (!alive) {
        endGame()
    }
    return alive
}

// THIS FUNCTION CHECKS WHETHER THE PLAYER HAS GOTTEN TO A COIN
function checkPlayerGotCoin (mode) {
    /* Prevent checking whether the player has gotten the coin multiple times if 
    they already have gotten it */
    if (gotCoin) {return}

    // Get the regional co-ordinates of the player
    const playerRegions = getPlayerRegions()
    

    switch (mode) {
        case 'one-chase':
            // For each of the player's co-ordinate, check whether one of them is the coin's
            playerRegions.forEach((region) => {
                if (coinRegions.includes(region - 2)) {
                    /* 
                    Why region - 2 ?
                    This is because the coinRegions array contains the index of the region
                    which was removed
                    to place the coin, not the region itself
                    The region 2 has index 0, and 192 has index 190
                      */
                    gotCoin = true
                }
            })

            // If you have gotten the coin
            if (gotCoin) {
                /* Upon the next board placement, the program will run as if there was no 
                coin initially */
                coinsPlaced = false
                scoreDisplay.textContent++
                // Actually remove the coin
                document.querySelector('.coin').remove()
                
                // Stops the function responsible for loading the board periodically
                clearInterval(loadBoardInterval)

                /*
                Stops the function responsible for waiting for the board to load fully 
                before checking whether the player died
                */
                clearTimeout(deathTimeout)

                // Set the global gotCoin variable to false
                gotCoin = false

                // Generate the board again, now that everything has been reset
                generateBoard('one-chase')
            }
            break
    }
    
    

    
}

// THIS FUNCTION ENDS THE GAME
function endGame() {
    playing = false

    // Stop the player from moving
    stationPlayer()

    // Stop loading hazards
    clearInterval(loadBoardInterval)

    console.log('PLAYER DIED')
    player.classList.add('dead-player')

    displayEndScreen()

}



//enablePlayerMovement()
//displayPlayerPosition()
//generateBoard('one-chase')
/* setInterval (() => {
    playerInparea.focus()
    playerInparea.setSelectionRange(4, 5)
},1000) */
/* GAME OVER END SCREEN! */
function displayEndScreen() {

}

/* BEFORE GAME STARTS START SCREEN */
const gameContainer = `
    <div class="user-square" id="player">
        <div class="score-display">0</div>
        <input class="helper" type="text" autocomplete="off" autofocus="true"/>
    </div>
    <div class="hazards-container" id="hazard-area">
    </div>
    `

}

/* ---------SECTION 3: GAME SCREEN FUNCTIONALITY, ACTUAL GAMEPLAY  */
const startScreen = document.getElementById('start'),
    changeDiffBtn = document.getElementById('change-diff'),
    changeModeBtn = document.getElementById('change-mode'),
    diffDisplay = document.getElementById('diff-disp'),
    modeDisplay = document.getElementById('mode-disp'),
    optionsMenu = document.getElementById('options-menu'),
    difficulties = {
        "Easy" : {
            "ratioHazards":[0.1,0.3],
            "emojis":["🙂", "😊", "😃", "😄", "😁", "😍", "🤩"]
        },
        "Normal" : {
            "ratioHazards":[0.3,0.5],
            "emojis":["😐","🙂","😌","😊", "😄","😀","😁"]
        },
        "Hard" : {
            "ratioHazards":[0.5,0.7],
            "emojis":["😑", "😬", "😔", "😕", "😟", "😞", "😢"]
        },
        "Extreme" : {
            "ratioHazards":[0.7,0.9],
            "emojis":["😕","😟","😔", "😞","😢","😭","😶"]
        }
    },
    modes = ["one-chase", "x-chase", "timer"]

let difficultyChosen, modeChosen
/* const startScreen = require('./elements') */
function displayStartScreen() {
    // Hide the player square and the game Board
    if (!player.classList.contains('hidden')) {
        player.classList.toggle('hidden')
    }
    if (!gameBoard.classList.contains('hidden')) {
        gameBoard.classList.toggle('hidden')
    }

    // Display the Game Screen
    startScreen.classList.toggle('hidden')
}

function select(selection, selected) {
    if (selection === 'diff') {
        /* ---- Setting a difficulty */
        // Set the difficultyChosen global variable to selected difficulty
        difficultyChosen = selected

        // Hide the options menu
        optionsMenu.classList.toggle('hidden')

        // Re-display the change difficulty and change mode buttons (and the <hr> between them)
        changeDiffBtn.classList.toggle('hidden')
        changeModeBtn.classList.toggle('hidden')
        changeDiffBtn.nextSibling.classList.toggle('hidden')

        // Display this chosen difficulty
        diffDisplay.textContent = selected

    } else 
    if (selection === 'mode') {
        /* ---- Setting a mode */
        // Set the difficultyChosen global variable to selected difficulty
        modeChosen = selected

        // Hide the options menu
        optionsMenu.classList.toggle('hidden')

        // Re-display the change difficulty and change mode buttons (and the <hr> between them)
        changeDiffBtn.classList.toggle('hidden')
        changeModeBtn.classList.toggle('hidden')
        changeDiffBtn.nextSibling.classList.toggle('hidden')

        // Display this chosen difficulty
        modeDisplay.textContent = selected
    }
    
}

changeDiffBtn.addEventListener('click', () => {
    // Hide the two buttons, and the <hr> between them
    changeDiffBtn.classList.toggle('hidden')
    changeModeBtn.classList.toggle('hidden')
    changeDiffBtn.nextSibling.classList.toggle('hidden')
    

    // Add the difficulty options into the options menu
    let keyString = ''
    Object.keys(difficulties).forEach((difficulty) => {
        keyString += `
            <div class="option diff-option" id="${difficulty}" onclick = 'select("diff","${difficulty}")'>${difficulty}</div>
        `
    })

    // Display the options menu and add the difficulties
    optionsMenu.classList.toggle('hidden')
    optionsMenu.innerHTML = keyString
})

changeModeBtn.addEventListener('click', () => {
    // Hide the two buttons, and the <hr> between them
    changeDiffBtn.classList.toggle('hidden')
    changeModeBtn.classList.toggle('hidden')
    changeDiffBtn.nextSibling.classList.toggle('hidden')
    

    // Add the mode options into the options menu
    let keyString = ''
    modes.forEach((mode) => {
        keyString += `
            <div class="option mode-option" id="${mode}" onclick = 'select("mode","${mode}")'>${mode}</div>
        `
    })

    // Display the options menu and add the difficulties
    optionsMenu.classList.toggle('hidden')
    optionsMenu.innerHTML = keyString
})




displayStartScreen()