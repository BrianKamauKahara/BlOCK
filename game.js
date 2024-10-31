const player = document.getElementById('player'),
    body = document.querySelector('body'),
    computedBody = window.getComputedStyle(body)
    

const playerCoordinates = {
    'Y':0,
    'X':0
}


// Giving the player height and width
player.style.height = player.style.width = '50px'


const bodyHeight = Number(computedBody.height.split('p')[0]) - 2,
    bodyWidth = Number(computedBody.width.split('p')[0]) - 2,
    playerHeight = Number(player.style.height.split('p')[0]),
    playerWidth = Number(player.style.width.split('p')[0])



//const [trail_X, trail_Y ] = trail

const keyStates = {
    'w':false,
    'd':false,
    'a':false,
    's':false
}

let distance = 10,
    speed = 20

player.addEventListener('keypress', (e) => {
    key = e.key.toLowerCase()
    
    // Returns for any other key
    if (key !=='w'&& key !=='a' && key !=='s' && key!=='d') {return}
    console.log("Moving",key)
    
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
    key = e.key.toLowerCase()

    // Returns for any other key
    if (key !=='w' && key !=='a' && key !=='s' && key!=='d') {return}

    console.log("Stopping",key)

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

    Note that, the player's co-ordinates work like a graph, with a small
    difference though. While the top corner is (0,0), Moving down would not be moving into
    negative y co-ordinate territory as one would expect. Instead, moving down increases
    the y-ordinate rather than decreases it
    Thus, the player would normally have a positive x-ordinate, and a positive y-ordinate
    

                   (-1)
                    /\ 
             (-1)<------>(+1)
                    \/
                   (+1)

    */
    switch (direction){
        case 'w':
            // Positions the player ten pixels up
            if(playerCoordinates['Y'] >= 0 ) {return}
            playerCoordinates['Y']++
            player.style.top = -distance*playerCoordinates['Y'] + 'px'
            break
        case 's':
            // Positions the player ten pixels down
            if(playerCoordinates['Y'] <= -bodyHeight/distance + playerHeight/distance) {return}
            playerCoordinates['Y']--
            player.style.top = -distance*playerCoordinates['Y'] + 'px'
            break
        case 'd':
            // Positions the player ten pixels right
            if(playerCoordinates['X'] >= bodyWidth/distance - playerWidth/distance) {return}
            playerCoordinates['X']++
            player.style.left = distance*playerCoordinates['X'] + 'px'
            break
        case 'a':
            // Positions the player ten pixels left
            if(playerCoordinates['X'] <= 0 ) {return}
            playerCoordinates['X']--
            player.style.left = distance*playerCoordinates['X'] + 'px'
            break
    }
}

let interval;

// This function tells the program to continuously update the player's position
const updatePlayer = function() {
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

updatePlayer()

// This function displays the players position every second
setInterval(function () {
    const playerPos = player.getBoundingClientRect();
    const bodyPos = body.getBoundingClientRect();

    console.log(playerPos.bottom, bodyPos.bottom)
    console.log(playerCoordinates['X'], playerCoordinates['Y'])
}, 1000)

