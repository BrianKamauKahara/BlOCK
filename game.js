const player = document.getElementById('player'),
    body = document.querySelector('body'),
    computedBody = window.getComputedStyle(body),
    gameBoard = document.getElementById('hazard-area')
    


// Giving the player height and width
player.style.height = player.style.width = '30px'


const bodyHeight = Number(computedBody.height.split('p')[0]),
    bodyWidth = Number(computedBody.width.split('p')[0]),
    playerHeight = Number(player.style.height.split('p')[0]),
    playerWidth = Number(player.style.width.split('p')[0])


let playing = false


/* ---------SECTION 1: PLAYER MOVEMENT FUNCTIONALITY  */
// DEFINITION OF GLOBAL STATE VARIABLES
const keyStates = {
    'w':false,
    'd':false,
    'a':false,
    's':false
}

let distance = 10,
    speed = 20

const playerCoordinates = {
    'Y':[0,-playerHeight/distance],
    'X':[0,playerWidth/distance]
}

// W A S D MOVEMENT EVENT LISTENER
player.addEventListener('keypress', (e) => {
    if (!playing) {return}
    key = e.key.toLowerCase()
    
    // Returns for any other key
    if (key !=='w'&& key !=='a' && key !=='s' && key!=='d') {return}
    /* console.log("Moving",key) */
    
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

// W A S D STOPPING MOVEMENT EVENT LISTENER
player.addEventListener('keyup', (e) => {
    if (!playing) {return}
    key = e.key.toLowerCase()

    // Returns for any other key
    if (key !=='w' && key !=='a' && key !=='s' && key!=='d') {return}

    /* console.log("Stopping",key) */

    // Stops the program from moving in a certain direction any more
    keyStates[key] = false
})

// ACTUAL MOVEMENT FUNTIONALITY
let interval;
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
            if(playerCoordinates['Y'][0] >= 0 ) {return}
            playerCoordinates['Y'][0]++
            playerCoordinates['Y'][1]++
            player.style.top = -distance*playerCoordinates['Y'][0] + 'px'
            
            break
        case 's':
            // Positions the player ten pixels down
            if(playerCoordinates['Y'][0] <= -bodyHeight/distance + playerHeight/distance) {return}
            playerCoordinates['Y'][0]--
            playerCoordinates['Y'][1]--
            player.style.top = -distance*playerCoordinates['Y'][0] + 'px'
            
            break
        case 'd':
            // Positions the player ten pixels right
            if(playerCoordinates['X'][0] >= bodyWidth/distance - playerWidth/distance) {return}
            playerCoordinates['X'][0]++
            playerCoordinates['X'][1]++
            player.style.left = distance*playerCoordinates['X'][0] + 'px'
            
            break
        case 'a':
            // Positions the player ten pixels left
            if(playerCoordinates['X'][0] <= 0 ) {return}
            playerCoordinates['X'][0]--
            playerCoordinates['X'][1]--
            player.style.left = distance*playerCoordinates['X'][0] + 'px'
            
            break
    }
    // After the movement, check whether the player is alive, and whether they got the coin
    checkPlayerAlive()
    checkPlayerGotCoin('one-chase')
}

// stops the player from moving
function stationPlayer () {
    // This function stops the program from updating the player's position
    clearInterval(interval)
}

// enables all movement functionality to start
function enablePlayerMovement() {
    // This function keeps the program updating the player
    playing = true
    interval = setInterval(() => {
        update('w')
        update('s')
        update('a')
        update('d')
    },speed)
}


// THIS FUNCTION RETURNS THE PLAYER'S CURRENT POSITION --- FOR CONVENIENT USE
function playerCurrentXY () {
    return [playerCoordinates['X'],playerCoordinates['Y']]
}

// THIS FUNCTION DISPLAYS THE PLAYER'S POSITION EVERY SECOND --- FOR CONVENIENCE
function displayPlayerPosition(){
    setInterval(function () {
        /* console.log(...playerCurrentXY()) */
        /* getPlayerRegions() */
    }, 1000)
}

/* ---------SECTION 2: PLACEMENT OF HAZARDS AND COINS ON THE GAME BOARD  */
// DEFINITION OF GLOBAL STATE VARIABLES
let widthDivisions = 16, 
    heightDivisions = 12,
    ratioHazards = 0.4,
    numGrids = widthDivisions * heightDivisions


let board, numHazards, gridWidth, gridHeight

gridWidth = bodyWidth/widthDivisions
gridHeight = bodyHeight/heightDivisions

let Hazards = [],
    hazardData = {},
    loadedHazards = [],
    loadBoardInterval,
    coinRegions = [],
    coinsPlaced = false,
    coinString,
    hazardDivs,
    coinDivs
let gotCoin = false

// THIS FUNCTION CALCULATES AND STORES DATA ON THE AREAS WHERE HAZARDS WILL BE
function generateHazardAreas(){
    Hazards = []
    hazardData = {}

    // This is the number of hazards, given by the ratio provided
    numHazards = Math.floor(numGrids * ratioHazards) + 1

    // Generate the hazards at random places. For now, this process is random
    /* let fullBoard = [...board] */
    for (let i =0; i < numHazards; i++){
        // Get that random place
        Hazards.push(...board.splice(Math.floor(Math.random() * (numGrids)- i + 1),1))
    }
    /* board = fullBoard */
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

// THIS FUNCTION CONVERTS GRID NUMBER (REGIONAL CO-ORDS) TO PIXEL POSITION
function determinePosition (gridNo) {
    // Determine the row AND column
    let row = Math.floor((gridNo - 1) / widthDivisions) + 1
    let column = ((gridNo - 1) % widthDivisions) + 1

    let gridX = (column - 1) * gridWidth
    let gridY = (row - 1) * gridHeight
    return [Number(gridX), Number(gridY)]
}

// THIS FUNCTION PLACES THE HAZARDS ON THE GAME BOARD
function placeHazards(){
    /* These are the loaded hazards. 
    Yes, though the hazards are place immediately as this function  proceeds, 
    they first go through an animation as if they are 'loading-ing' to give 
    the player time to escape. Then, once that time period passes, the loadedHazards
    array is set equal to the hazards list, so that the checkPlayerAlive function
    (which checks whether the player's regions are in one of the hazard's regions),
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

    gameBoard.innerHTML += hazardDivs 
}

// THIS FUNCTION CALCULATES AND STORES DATA ON THE AREAS WHERE THE COINS WILL BE
function generateCoinAreas(mode) {
    /* 
    If the coin has already been placed, the program updates the board, so that 
    when generating the hazards, a hazard does not get placed where a coin is placed
    */
   console.log(coinsPlaced)
    if (coinsPlaced) {
        coinRegions.forEach((coin) => {
            board.splice(coin-1, 1)
        })
        coinDivs = ''
        return
    }
    switch (mode){
        case 'one-chase':
            // Place the coin on one random tile
            
            coinDivs = ''
            let num = Math.floor(Math.random() *board.length + 1)
            let pick = board.splice(num - 1,1)
            
            /* checkIfInBoard(pick) */
            coinRegions = []
            coinRegions.push(...pick)
            coinsPlaced = true
            console.log(num,pick,coinRegions)
    }
}

// THIS FUNCTION PLACES THE COINS ON THE GAMEBOARD
function placeCoins(mode) {
    /* Then, the global state coinsPlaced is set to true, so that coins are not generated
    again in the generated  */
    
    switch (mode) {
        case 'one-chase':
            const [gridX, gridY] = determinePosition(coinRegions[0])
            coinDivs = `<div class="coin tile" id="coin_1" style="width: ${gridWidth}px; height: ${gridHeight}px; position: fixed; top: ${gridY}px; left: ${gridX}px;"></div>`
    }
    gameBoard.innerHTML += coinDivs
}

// THIS FUNCTION REPEATEDLY GENERATES THE HAZARDS AND COINS
function generateBoard(mode) {
        switch (mode){
            case 'one-chase':
                loadBoard()

                generateCoinAreas(mode)
                generateHazardAreas()

                
                placeCoins(mode)

                hazardDivs = ''
                placeHazards()

                setTimeout(() => {
                    loadedHazards = Hazards
                    checkPlayerAlive()
                }, 1210)
                break
        }

    loadBoardInterval = setInterval(() => {
        console.log('ROUND')
        switch (mode){
            case 'one-chase':
                loadBoard()

                generateCoinAreas(mode)
                generateHazardAreas()

                
                placeCoins(mode)

                hazardDivs = ''
                placeHazards()

                setTimeout(() => {
                    loadedHazards = Hazards
                    checkPlayerAlive()
                }, 1210)
                break
        }     
    }, 3000);
}
function loadBoard() {
    board = Array.from({ length: numGrids }, (_, index) => index + 1)
    gameBoard.innerHTML = ''
}

// THIS FUNCTION GETS THE REGIONAL CO-RDS WHICH THE PLAYER IS IN -- FOR UTMOST CONVENIENCE
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
    because the basis of the player's co- ordinates is the distance global
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
    let maxX = bodyWidth/distance,
        maxY = bodyHeight/distance

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

// This function checks whether the provided region is within the board
function checkIfInBoard (num) {
    for (let i = 0; i < 192; i++){
        if (!board.includes(i+1)) {
            console.log('AAAAA',num, i+1)
        }
    }
    console.log(Hazards)
}

// THIS FUNCTION CHECKS WHETHER THE PLAYER HAS GOTTEN TO A COIN
function checkPlayerGotCoin (mode) {
    if (gotCoin) {return}
    const playerRegions = getPlayerRegions()
    

    switch (mode) {
        case 'one-chase':
            playerRegions.forEach((region) => {
                if (coinRegions.includes(region)) {
                    gotCoin = true
                }
            })
            if (gotCoin) {
                coinsPlaced = false
                document.querySelector('.coin').remove()
                
                loadedHazards = []
                clearInterval(loadBoardInterval)
                generateBoard('one-chase')
                gotCoin = false
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

}



enablePlayerMovement()
displayPlayerPosition()
generateBoard('one-chase')

