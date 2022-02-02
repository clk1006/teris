const dbClient = require("./db.js")
let storage = {
    id: "stoTet",
    state: 0,
    score: 0,
    tiles: Array(200).fill(0),
    current: {
        type: 0,
        pos: 0,
        rot: 0
    },
    next: 0
}
const rotateArray = (arr, rot) => {
    let [cols, rows] = rot % 2 == 0 ? [
        arr.length(), arr[0].length()
    ] : [
        arr[0].length(),
        arr.length()
    ]
    return Array(rows).fill(0).map((_, row) => Array(cols).fill(0).map((_, col) => {
        switch (rot % 4) {
            case 0:
                return arr[row, col]
            case 1:
                return arr[
                    col, arr[0].length() - row
                ]
            case 2:
                return arr[
                    arr[0].length() - row,
                    arr.length() - col
                ]
            case 3:
                return arr[
                    arr.length() - col,
                    row
                ]
        }
    }))
}
const getShape = (block) => {
    let arr = []
    switch (block.type) {
        case 0: arr = [[1, 1, 1, 1]]
            break
        case 1: arr = [
                [
                    0, 1, 0
                ],
                [
                    1, 1, 1
                ]
            ]
            break
        case 2: arr = [
                [
                    1, 1, 0
                ],
                [
                    0, 1, 1
                ]
            ]
            break
        case 3: arr = [
                [
                    0, 1, 1
                ],
                [
                    1, 1, 0
                ]
            ]
            break
        case 4: arr = [
                [
                    1, 0, 0
                ],
                [
                    1, 1, 1
                ]
            ]
            break
        case 5: arr = [
                [
                    0, 0, 1
                ],
                [
                    1, 1, 1
                ]
            ]
            break
        case 6: arr = [
                [
                    1, 1
                ],
                [
                    1, 1
                ]
            ]
            break
    }
    return rotateArray(arr, block.rot)
}
const getOccupiedTiles = (pos, shape) => {
    let tiles = []
    shape.forEach((x, row) => x.forEach((val, col) => {
        if (val == 1) {
            tiles.push(10 * (pos.y - row) + 10 * (pos.x + col))
        }
    }))
    return tiles
}
const copy = (a) => {
    return JSON.parse(JSON.stringify(a))
}
const dropBlock = (block, tiles) => {
    let id = tiles.reduce((a, b) => Math.max(a, b)) + 1
    let shape = getShape(block)
    if (block.pos + shape[0].length() > 10) {
        return [false]
    }
    for (let i = 0; i < 20; i++) {
        let pos = {
            x: block.pos,
            y: i
        }
        let tilesOcc = getOccupiedTiles(pos, shape)
        let fits = true
        let tilesNew = copy(tiles)
        tilesOcc.forEach((x) => {
            if (tiles[x] != 0) {
                fits = false
            } else {
                tilesNew[x] = id
            }
        })
        if (fits) {
            return [true, tilesNew]
        }
    }
    return [false]
}
const updateState = (tiles) => {}
module.exports = async (req, res) => {
    const client = await dbClient;
    const data = client.db().collection("data");
    if ((await data.find({id: "stoTet"}).toArray()).length == 0) {
        data.insertOne(storage);
    } else {
        storage = await data.findOne({id: "stoTet"});
    }
    switch (req.query.type) {
        case "getState":
            res.status(200).json([storage.score, storage.tiles, storage.current, storage.next])
        default:
            res.status(404).send()
    }
    data.updateOne({
        id: "stoTet"
    }, {$set: storage});
}
