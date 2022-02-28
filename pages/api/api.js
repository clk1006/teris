const fs=require('fs')
let data=require('../../data/storage.json')
const seedrandom=require("seedrandom")
const SCORE_BLOCK = 5
const SCORE_CLEAR = 100
const STORAGE_BASE={
    id: "stoTet",
    state: 0,
    score: 0,
    tiles: Array(200).fill(0),
    current: {
        type: 0,
        pos: 4,
        rot: 0
    },
    seq:[0,1,2,3,4,5,6]
}
const rotateArray = (arr, rot) => {
    let [rows, cols] = rot % 2 == 0 ? [arr.length, arr[0].length] : [arr[0].length, arr.length]

    return Array(rows).fill(0).map((_, row) => Array(cols).fill(0).map((_, col) => {
        switch (rot % 4) {
            case 0:
                return arr[row][col]
            case 1:
                return arr[arr.length - col - 1][row]
            case 2:
                return arr[arr.length - row - 1][arr[0].length - col - 1]
            case 3:
                return arr[col][arr[0].length - row - 1]
        }
    }))
}
const getShape = (block) => {
    let arr = []

    switch (block.type) {
        case 0: arr = [
            [1, 1, 1, 1]
        ]

            break
        case 1: arr = [
            [0, 1, 0],
            [1, 1, 1]
        ]
            break
        case 2: arr = [
            [1, 1, 0],
            [0, 1, 1]
        ]

            break
        case 3: arr = [
            [0, 1, 1],
            [1, 1, 0]
        ]

            break
        case 4: arr = [
            [1, 0, 0],
            [1, 1, 1]
        ]

            break
        case 5: arr = [
            [0, 0, 1],
            [1, 1, 1]
        ]

            break
        case 6: arr = [
            [1, 1],
            [1, 1]
        ]

            break
    }

    return rotateArray(arr, block.rot)
}

const shuffle=(arr,rng)=>{
    let currentIndex = arr.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(rng() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex], arr[currentIndex]];
    }
  
    return [arr,rng];
  }

const getOccupiedTiles = (pos, shape) => {
    let tiles = []

    shape.forEach((x, row) => x.forEach((val, col) => {
        if (val == 1) {
            tiles.push(10 * (pos.y - row) + pos.x + col)
        }
    }))

    return tiles
}

const copy=(x)=>{
    return JSON.parse(JSON.stringify(x))
}

const dropBlock = (block, tiles) => {
    let id = tiles.reduce((a, b) => Math.max(a, b)) + 1
    let shape = getShape(block)

    for (let i = 19; i >= 0; i--) {
        let pos = {
            x: block.pos,
            y: i
        }
        let fits = true
        let tilesOcc = getOccupiedTiles(pos, shape)
        tilesOcc.forEach((x) => {
            if (tiles[x] != 0) {
                fits = false
            }
        })
        if(fits && i-shape.length>-1){
            continue
        }
        if(!fits && i==19){
            return [false]
        }
        if (!fits){
            pos.y++
            tilesOcc = getOccupiedTiles(pos, shape)
        }
        
        tilesOcc.forEach((x)=>{
            tiles[x]=id;
        })
        return [true,tiles]
    }
}

const updateState = (score, tiles) => {

    for (let row = 0; row < 20; row++) {
        let full = true

        for (let col = 0; col < 10; col++) {
            if (tiles[10 * row + col] == 0) {
                full = false

                break
            }
        }

        if (full) {
            for (let clearRow = row; clearRow < 19; clearRow++) {
                for (let clearCol = 0; clearCol < 10; clearCol++) {
                    tiles[10 * clearRow + clearCol] = tiles[10 * (clearRow + 1) + clearCol]
                }
            }

            for (let clearCol = 0; clearCol < 10; clearCol++) {
                tiles[190 + clearCol] = 0
            }

            score += SCORE_CLEAR
            row--
        }
    }
    let state=tiles.filter((_,i)=>i>189).filter((x)=>x!=0).length==0 ? 0 : 1
    return [score, tiles, state]
}

module.exports = async (req, res) => {
    let storage=copy(STORAGE_BASE)
    let gameId=req.query.gameId || 0
    let index=0
    let rng
    if(data.filter(x=>x.gameId==gameId).length==1){
        storage=data.filter(x=>x.gameId==gameId)[0]
        data.forEach((x,i)=>{
            if(x.gameId==gameId){
                index=i
            }
        })
        rng=seedrandom(storage.seed)
        Array(storage.seedUsed).fill(0).forEach(()=>{
            rng()
        })
    }
    else{
        storage.gameId=gameId
        storage.seed=req.query.seed || Math.random().toString()
        rng=seedrandom(storage.seed)
        storage.seedUsed=2
        storage.current.type=Math.floor(rng()*7)
        let shuffled=shuffle(storage.seq,rng)
        storage.seq=shuffled[0]
        rng=shuffled[1]
        data.push({})
        index=data.length-1
    }

    switch (req.query.type) {
        case "getState":
            res.status(200).json([storage.score, storage.tiles, storage.current, storage.seq[0], storage.state])
            break
        case "endTurn":
            let dropRes = dropBlock(storage.current, storage.tiles)
            if (!dropRes[0]) {
                res.status(404).send()

                break
            }
            let state = updateState(storage.score, dropRes[1])
            storage.score=state[0]+SCORE_BLOCK
            storage.tiles=state[1]
            storage.current.type = storage.seq.shift()
            storage.current.pos = 4
            storage.current.rot = 0
            storage.state=state[2]

            if(storage.seq.length==0){
                let shuffled=shuffle(storage.seq,rng)
                storage.seq=shuffled[0]
                rng=shuffled[1]
                storage.seedUsed++
            }
            res.status(200).json([storage.score, storage.tiles, storage.current, storage.seq[0],storage.state])
            
            break
        case "moveLeft":
            if (storage.current.pos > 0) {
                storage.current.pos--
                res.status(200).json(storage.current)
            } else {
                res.status(404).send()
            }

            break
        case "moveRight":
            let shape = getShape(storage.current)

            if (storage.current.pos + shape[0].length < 10) {
                storage.current.pos++
                res.status(200).json(storage.current)
            } else {
                res.status(404).send()
            }

            break
        case "rotLeft": 
            storage.current.rot = (storage.current.rot - 1) % 4
            shape = getShape(storage.current)

            while (storage.current.pos + shape[0].length > 10) {
                storage.current.pos--
            }

            res.status(200).json(storage.current)

            break
        case "rotRight": 
            storage.current.rot = (storage.current.rot + 1) % 4
            shape = getShape(storage.current)

            while (storage.current.pos + shape[0].length > 10) {
                storage.current.pos--
            }

            res.status(200).json(storage.current)

            break
        case "getId":
            let games=copy(data)
            if(games.length==0){
                res.status(200).send(1)
            }
            else if(games.length==1){
                res.status(200).send(parseInt(games[0].gameId)+1)
            }
            else{
                games=games.map((x)=>parseInt(x.gameId))
                res.status(200).send(games.reduce((a,b)=>Math.max(a,b))+1)
            }
        case "reset":
            storage=STORAGE_BASE
            storage.gameId=gameId
            res.status(200).send()
        default:
            res.status(404).send()
    }
    data[index]=storage
    fs.writeFile("data/storage.json",JSON.stringify(data),()=>{
    })
}