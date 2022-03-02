import Head from 'next/head'
import {useRef, useState, useEffect, useCallback} from 'react'
import styles from '../styles/Home.module.css'
import axios from 'axios'

const DIMENSIONS = [10, 20];
const BLOCK_SIZE = 29;
const BLOCK_COLORS = ["#327AB8", "#3AD9A7", "#FFC247", "#9951B3", "#CD4C4C", "#6610F2", "#32DE8A"];
const COLOR_NEXT = "#BCBECD";
const BLOCK_BASE = "rgba(214, 215, 224)";
let contextTiles, contextCurr;
let id;
const getNeighbours = (tiles) => {
    return Array(tiles.reduce((a, b) => Math.max(a, b), 0))
        .fill(0)
        .map((_, id) => {
            id++;
            let neighbours = [];

            tiles.forEach((tileID, index) => {
                if (tileID == id) {
                    for (let i = -1; i < 2; i++) {
                        for (let j = -1; j < 2; j++) {
                            if (
                                0 <= (index % 10) + i < 10 &&
                                0 <= Math.floor(index / 10) + j < 20 &&

                                tiles[index + i + 10 * j] != tileID
                            ) {
                                neighbours.push(tiles[index + i + 10 * j]);
                            }
                        }
                    }
                }
            });

            return neighbours;
        });
};
export default function Home() {
    const refTiles = useRef();
    const refCurr = useRef();
    const [reRender, setReRender] = useState(1);
    const [state,setState] = useState(0);
    useEffect(async () => {
        let data = (await axios.get(`${location.origin}/api/api?type=getState`)).data
        console.log(data)
        setState(data)
    }, [reRender]);
    useEffect(() => {
        if(state!=0){
            CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
                if (w < 2 * r) r = w / 2;
                if (h < 2 * r) r = h / 2;
                this.beginPath();
                this.moveTo(x + r, y);
                this.arcTo(x + w, y, x + w, y + h, r);
                this.arcTo(x + w, y + h, x, y + h, r);
                this.arcTo(x, y + h, x, y, r);
                this.arcTo(x, y, x + w, y, r);
                this.closePath();
                return this;
            };
            console.log(state)
            let tiles = state[1];
            let colors = [BLOCK_BASE];
    
            getNeighbours(tiles).forEach((neighbours, id) => {
                id++;
                neighbours = neighbours.filter((x) => x < id);
                colors.push(
                    BLOCK_COLORS.filter(
                        (x) => neighbours.reduce((a, b) => (a == colors[b] ? 0 : a), x) != 0
                    )[0]
                );
            });
            tiles.forEach((id, i) => {
                contextTiles.fillStyle = colors[id];
                contextTiles.roundRect(
                    31 * (i % 10),
                    20 * BLOCK_SIZE - (31 * (Math.floor(i / 10) + 1)) + 41,
                    BLOCK_SIZE,
                    BLOCK_SIZE,
                    2
                ).fill();
            });
    
            let tilesWithNext = dropBlock(state[2], copy(state[1]));
            if (tilesWithNext[0]) {
                tilesWithNext = tilesWithNext[1];
                let idNew = tilesWithNext.reduce((a, b) => Math.max(a, b));
                tilesWithNext.forEach((x, i) => {
                    if (x == idNew) {
                        contextTiles.fillStyle = COLOR_NEXT;
                        contextTiles.roundRect(
                            31 * (i % 10),
                            20 * BLOCK_SIZE - (31 * (Math.floor(i / 10) + 1)) + 41,
                            BLOCK_SIZE,
                            BLOCK_SIZE,
                            2
                        ).fill();
                    }
                });
            }
            let tilesCurr = Array(40).fill(0);
            let shape = getShape(state[2]);
            let posY = shape.length - 1;
            shape.forEach((row, y) => row.forEach((v, x) => {
                if (v == 1) {
                    tilesCurr[(state[2].pos + x) + 10 * (posY - y)] = state[2].type + 1
                }
            }));
            tilesCurr.forEach((v, i) => {
                contextCurr.fillStyle = v == 0 ? BLOCK_BASE : BLOCK_COLORS[v - 1];
                contextCurr.roundRect(
                    31 * (i % 10),
                    4 * BLOCK_SIZE - (31 * (Math.floor(i / 10) + 1)) + 8,
                    BLOCK_SIZE,
                    BLOCK_SIZE,
                    2
                ).fill();
            })
        }
    }, [state]);
    const handleUpdate = useCallback(() => {
		setReRender(reRender + 1);
	});
	useEffect(
		() => {
			id = setInterval(handleUpdate, 10);
			return () => {
				clearInterval(id);
			};
		},
		[ handleUpdate ]
	);
    return (
        <div className={styles.container}>
            <Head>
                <title>Tetris</title>
                <meta name="description" content="Generated by create next app"/>
                <link rel="icon" href="/favicon.ico"/>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Lato:wght@300;700;900&family=Roboto+Mono:wght@300;400;500&display=swap"
                    rel="stylesheet"/>
            </Head>

            <main className={styles.main}>
                <div className="container">
                    <div className="block">
                        <div className="screen-container">
                            <canvas height={4 * BLOCK_SIZE + 6}
                                    width={DIMENSIONS[0] * BLOCK_SIZE + 2 * (DIMENSIONS[0] - 1)} ref={refCurr}/>
                        </div>
                        <div className="screen-container">
                            <canvas height={DIMENSIONS[1] * BLOCK_SIZE + 2 * [DIMENSIONS[1] - 1]}
                                    width={DIMENSIONS[0] * BLOCK_SIZE + 2 * (DIMENSIONS[0] - 1)} ref={refTiles}/>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}