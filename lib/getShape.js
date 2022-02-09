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
export default getShape
module.exports=getShape