const player = document.getElementById('player'),
    body = document.querySelector('body'),
    computedBody = window.getComputedStyle(body),
    hazardContainer = document.getElementById('hazard-area')
    


// Giving the player height and width
player.style.height = player.style.width = '50px'


const bodyHeight = Number(computedBody.height.split('p')[0]),
    bodyWidth = Number(computedBody.width.split('p')[0]),
    playerHeight = Number(player.style.height.split('p')[0]),
    playerWidth = Number(player.style.width.split('p')[0])


let playing = false

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


player.addEventListener('keyup', (e) => {
    if (!playing) {return}
    key = e.key.toLowerCase()

    // Returns for any other key
    if (key !=='w' && key !=='a' && key !=='s' && key!=='d') {return}

    /* console.log("Stopping",key) */

    // Stops the program from moving in a certain direction any more
    keyStates[key] = false
})


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
            checkPlayerAlive()
            break
        case 's':
            // Positions the player ten pixels down
            if(playerCoordinates['Y'][0] <= -bodyHeight/distance + playerHeight/distance) {return}
            playerCoordinates['Y'][0]--
            playerCoordinates['Y'][1]--
            player.style.top = -distance*playerCoordinates['Y'][0] + 'px'
            checkPlayerAlive()
            break
        case 'd':
            // Positions the player ten pixels right
            if(playerCoordinates['X'][0] >= bodyWidth/distance - playerWidth/distance) {return}
            playerCoordinates['X'][0]++
            playerCoordinates['X'][1]++
            player.style.left = distance*playerCoordinates['X'][0] + 'px'
            checkPlayerAlive()
            break
        case 'a':
            // Positions the player ten pixels left
            if(playerCoordinates['X'][0] <= 0 ) {return}
            playerCoordinates['X'][0]--
            playerCoordinates['X'][1]--
            player.style.left = distance*playerCoordinates['X'][0] + 'px'
            checkPlayerAlive()
            break
    }
}

// This function returns the player's position
function playerCurrentXY () {
    return [playerCoordinates['X'],playerCoordinates['Y']]
}



// This function tells the program to continuously update the player's position
let interval;
const updatePlayer = function() {
    playing = true
    interval = setInterval(() => {
        update('w')
        update('s')
        update('a')
        update('d')
    },speed)
}

// This function stops the program from updating the player's position
const stationPlayer = function() {
    clearInterval(interval)
}

// This function displays the players position every second
function displayPlayerPosition(){
    setInterval(function () {
        /* console.log(...playerCurrentXY()) */
        /* getPlayerRegions() */
    }, 1000)
}


// HAZARDS / HAZARD AREAS / GAME END AREAS
let widthDivisions = 16, 
    heightDivisions = 12,
    ratioHazards = 0.6,
    numGrids = widthDivisions * heightDivisions


let square, numHazards, hazWidth, hazHeight



let Hazards = [],
    hazardData = {},
    loadedHazards = [],
    loadHazards

function generateHazardAreas(){
    Hazards = []
    hazardData = {}

    // This is the hazard area divided into a grid. 
    square = Array.from({ length: numGrids }, (_, index) => index + 1)

    // This is the number of hazards, given by the ratio provided
    numHazards = Math.floor(numGrids * ratioHazards) + 1

    // This is the width and height of the hazards
    hazWidth = bodyWidth/widthDivisions,
            hazHeight = bodyHeight/heightDivisions

    // Generate the hazards at random places. For now, this process is random
    for (let i =0; i < numHazards; i++){
        // Get that random place
        Hazards.push(...square.splice(Math.floor(Math.random() * (numGrids - i + 1)),1))
    }

    // Going through each hazard
    Hazards.forEach((hazard) => {

        // Determine the row AND column
        let row = Math.floor((hazard - 1) / widthDivisions) + 1
        let column = ((hazard - 1) % widthDivisions) + 1
        
        // Position the hazard (in terms of pixels)
        let hazardX = (column - 1) * hazWidth
        let hazardY = (row - 1) * hazHeight

        // Store this data
        hazardData[hazard] = {
            "co-ords": {
                'R':row,
                'C':column
            },
            "placement": {
                'X':hazardX,
                'Y':hazardY
            }
        }
    })

    console.log(Hazards)
}

/* console.log('Hazard Width',hazWidth,'::','Hazard Height',hazHeight) */
function placeHazards(){
    loadedHazards = []
    // This function places the hazards in the game area
    let divs = ''
    
    Hazards.forEach((hazard) => {
        /* let { R, C } = hazardData[hazard]["co-ords"] */
        let { X: haz_X, Y :haz_Y } = hazardData[hazard]["placement"]
        /* console.log(hazard,'::',haz_Y.toFixed(1),'by',haz_X.toFixed(1),'::',R,'b',C) */
        // Each hazard's start location (X and Y) is given as already calculated
        divs += `
        <div class="hazard" id="haz_${hazard}" style = "width:${hazWidth}px; height:${hazHeight}px; position: fixed; top:${haz_Y}px; left:${haz_X}px;"></div>
        `
    })

    hazardContainer.innerHTML = divs

    setTimeout(() => {
        loadedHazards = Hazards
        checkPlayerAlive()
    }, 1010)
    
}

function generateHazards() {
    loadHazards = setInterval(() => {
        generateHazardAreas()
        placeHazards()
    }, 3000);
}


function getPlayerRegions (){
    let playerCoords = playerCurrentXY()
    //console.log(playerCoords)

    /* 
    This function is necessary to check whether the player has entered 
    a region where there is a hazard. 
    This is done by getting the regions the player is in (because the player
    is a square, it is sufficient to check only the player's corners) 
    
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
    console.log(alive)
    if (!alive) {
        endGame()
    }
    return alive
}

function endGame() {
    playing = false

    // Stop the player from moving
    stationPlayer()

    // Stop loading hazards
    clearInterval(loadHazards)

    player.classList.toggle('dead-player')

}

updatePlayer()
displayPlayerPosition()
generateHazards()