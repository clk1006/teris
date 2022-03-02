const rotateArray = (arr, rot) => {
    let [rows, cols] = rot % 2 == 0 ? [arr.length, arr[0].length] : [arr[0].length, arr.length];

    return Array(rows).fill(0).map((_, row) => Array(cols).fill(0).map((_, col) => {
        switch (rot % 4) {
            case 0:
                return arr[row][col];
            case 1:
                return arr[arr.length - col - 1][row];
            case 2:
                return arr[arr.length - row - 1][arr[0].length - col - 1];
            case 3:
                return arr[col][arr[0].length - row - 1]
        }
    }))
};
export default rotateArray