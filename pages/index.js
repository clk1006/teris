import Head from 'next/head'
import Image from 'next/image'
import {useEffect, useRef, useState} from 'react'
import styles from '../styles/Home.module.css'
import pic0 from '../public/tetris0.png'
import pic1 from '../public/tetris1.png'
import pic2 from '../public/tetris2.png'
import pic3 from '../public/tetris3.png'
import pic4 from '../public/tetris4.png'
import pic5 from '../public/tetris5.png'
import pic6 from '../public/tetris6.png'
import {encryptFromJSON, decrypt} from '../lib/crypt'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faArrowAltCircleDown,
    faBook,
    faCirclePlay,
    faCodeBranch, faCopy,
    faEllipsis,
    faMoon,
    faPlusCircle,
    faRedo, faSave,
    faSun
} from '@fortawesome/free-solid-svg-icons'

import getShape from "../lib/getShape"

const DIMENSIONS = [10, 20];
const BLOCK_SIZE = 29;
const BLOCK_COLORS = ["#327AB8", "#3AD9A7", "#FFC247", "#9951B3", "#CD4C4C", "#6610F2", "#32DE8A"];
const COLOR_NEXT = "#BCBECD";
const BLOCK_BASE = "rgba(214, 215, 224)";
let contextTiles, contextCurr;
let keepData = false;

const SCORE_BLOCK = 5;
const SCORE_CLEAR = 20;

const shuffle = (arr) => {
    let currentIndex = arr.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [arr[currentIndex], arr[randomIndex]] = [
            arr[randomIndex], arr[currentIndex]];
    }

    return arr;
};

const getOccupiedTiles = (pos, shape) => {
    let tiles = [];

    shape.forEach((x, row) => x.forEach((val, col) => {
        if (val == 1) {
            tiles.push(10 * (pos.y - row) + pos.x + col)
        }
    }));

    return tiles
};

const copy = (a) => {
    return JSON.parse(JSON.stringify(a))
};

const dropBlock = (block, tiles) => {
    let id = tiles.reduce((a, b) => Math.max(a, b)) + 1;
    let shape = getShape(block);

    for (let i = 19; i >= 0; i--) {
        let pos = {
            x: block.pos,
            y: i
        };
        let fits = true;
        let tilesOcc = getOccupiedTiles(pos, shape);

        tilesOcc.forEach((x) => {
            if (tiles[x] != 0) {
                fits = false
            }
        });
        if (fits && i - shape.length > -1) {
            continue
        }
        if (!fits && i == 19) {
            return [false]
        }
        if (!fits) {
            pos.y++;
            tilesOcc = getOccupiedTiles(pos, shape)
        }

        tilesOcc.forEach((x) => {
            tiles[x] = id;
        });
        return [true, tiles]
    }
};

let clearedRowsInGame = 0;

const updateState = (score, tiles) => {
    for (let row = 0; row < 20; row++) {
        let full = true;

        for (let col = 0; col < 10; col++) {
            if (tiles[10 * row + col] == 0) {
                full = false;

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

            clearedRowsInGame++;

            score += SCORE_CLEAR - SCORE_BLOCK + Math.ceil(Math.log(clearedRowsInGame) ^ 4) + clearedRowsInGame;
            row--
        }
    }
    let state = tiles.filter((x, i) => i > 189 && x != 0).length == 0 ? 0 : 1;
    return [score, tiles, state]
};
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

const DATA_BASE = {
    state: 0,
    score: 0,
    tiles: Array(200).fill(0),
    current: {
        type: 0,
        pos: 5,
        rot: 0
    },
    seq: [0, 1, 2, 3, 4, 5, 6]
};
let data = copy(DATA_BASE);
let dataInput = "";

export default function Home() {
    const refTiles = useRef();
    const refCurr = useRef();
    const [gameState, setGameState] = useState(false);
    const [reRender, setReRender] = useState(1);
    const [showInputWindow, setShowInputWindow] = useState(false);
    const [showGameFieldOutputWindow, setShowGameFieldOutputWindow] = useState(false);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (gameState == 1) {
            contextTiles = refTiles.current.getContext('2d');
            contextCurr = refCurr.current.getContext('2d');

            if (!keepData) {
                data = copy(DATA_BASE);
                data.seq = shuffle([0, 1, 2, 3, 4, 5, 6], data.rng);
                data.current.type = Math.floor(Math.random() * 7);
            } else {
                keepData = false;
            }

            setReRender(reRender + 1)
        }
    }, [gameState]);
    useEffect(() => {
        if (gameState == 1) {
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
            let tiles = data.tiles;
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

            let tilesWithNext = dropBlock(data.current, copy(data.tiles));
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
            let shape = getShape(data.current);
            let posY = shape.length - 1;
            shape.forEach((row, y) => row.forEach((v, x) => {
                if (v == 1) {
                    tilesCurr[(data.current.pos + x) + 10 * (posY - y)] = data.current.type + 1
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
    }, [gameState, reRender]);

    const [isActive, toggleActive] = useState(true);

    const [theme, setTheme] = useState('')
    const handleToggle = () => {
        toggleActive(!isActive);
    };

    const handleKeyDown = (event) => {
        if (!showGameFieldOutputWindow) {
            let kc = event.keyCode;
            if (kc == 65 || kc == 37) {
                if (data.current.pos > 0) {
                    data.current.pos--
                }
            } else if (kc == 68 || kc == 39) {
                let shape = getShape(data.current);
                if (data.current.pos + shape[0].length < 10) {
                    data.current.pos++
                }
            } else if (kc == 81) {
                data.current.rot = (data.current.rot + 3) % 4;
                shape = getShape(data.current);

                while (data.current.pos + shape[0].length > 10) {
                    data.current.pos--
                }
            } else if (kc == 69) {
                data.current.rot = (data.current.rot + 1) % 4;
                shape = getShape(data.current);

                while (data.current.pos + shape[0].length > 10) {
                    data.current.pos--
                }
            } else if (kc == 83 || kc == 40) {
                let dropRes = dropBlock(data.current, data.tiles);
                if (dropRes[0]) {
                    let state = updateState(data.score, dropRes[1]);
                    data.score = state[0] + SCORE_BLOCK;
                    data.tiles = state[1];
                    data.current.type = data.seq[0];
                    data.current.pos = 4;
                    data.current.rot = 0;
                    data.seq.shift();
                    data.state = state[2];
                    if (data.state == 1) {
                        setGameState(2);
                    }
                    if (data.seq.length == 0) {
                        data.seq = shuffle([0, 1, 2, 3, 4, 5, 6])
                    }

                } else {
                    setGameState(2);
                    data.state = 1
                }
            }
            setReRender(reRender + 1)
        }
    };

    useEffect(() => {
        if (gameState == 1) {
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    });

    let displayScore = data.score.toLocaleString();

    return (
        <div className={styles.container}>
            <Head>
                <title>Teris</title>
                <meta name="description" content="Generated by create next app"/>
                <link rel="icon" href="/favicon.ico"/>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Lato:wght@300;500;700;900&family=Roboto+Mono:wght@300;400;500&display=swap"
                    rel="stylesheet"/>
            </Head>

            <main className={styles.main}>
                <div className={`nav-bar ${isActive ? "" : "active"}`}>
                    <div className="menu-icon" onClick={handleToggle}>
                        <FontAwesomeIcon className="icon" icon={faEllipsis}/>
                    </div>
                    <div className="menu-opts">
                        <a className="opt-link" href="https://github.com/clk1006/tetris" target="_blank"
                           rel="noreferrer">
                            <div className="menu-opt">
                                <FontAwesomeIcon className="icon" icon={faCodeBranch}/>
                                <span>GitHub</span>
                            </div>
                        </a>
                        <a className="opt-link" href="docs">
                            <div className="menu-opt">
                                <FontAwesomeIcon className="icon" icon={faBook}/>
                                <span>Docs</span>
                            </div>
                        </a>
                        <a className="opt-link action-btn" href="./">
                            <div className="menu-opt">
                                <FontAwesomeIcon className="icon" icon={faCirclePlay}/>
                                <span>Play Teris</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="color-scheme-box">
                    <div className="light-color-scheme-icon" onClick={
                        function () {
                            loadTheme(getCurrentTheme())
                        }
                    }>
                        <FontAwesomeIcon className="icon" icon={faSun}></FontAwesomeIcon>
                    </div>
                    <div className="dark-color-scheme-icon" onClick={
                        function () {
                            loadTheme(getCurrentTheme())
                        }
                    }>
                        <FontAwesomeIcon className="icon" icon={faMoon}></FontAwesomeIcon>
                    </div>
                </div>

                <div className="container">
                    {
                        gameState > 0 &&
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
                    }
                    <div className="block">
                        {
                            gameState > 0 &&
                            <div className="screen-container">
                                <h2>Next block</h2>
                                <Image className="image-box" width="122" height="122" src={
                                    data.seq[0] == 0 ? pic0 : data.seq[0] == 1 ? pic1 : data.seq[0] == 2 ? pic2 : data.seq[0] == 3 ? pic3 : data.seq[0] == 4 ? pic4 : data.seq[0] == 5 ? pic5 : pic6
                                }/>
                            </div>
                        }

                        {
                            gameState > 0 &&
                            <div className="screen-container">
                                <div className="nextElement-block"></div>
                                <div className="info-block">
                                    <div className="info-container">
                                        <h2>Statistics</h2>

                                        <div className="stats-container">
                                            <div className="stat-container">
                                                <span>Current score: </span>
                                                <span className="hl">{displayScore}</span>
                                            </div>
                                        </div>

                                        <h2>Bindings</h2>

                                        <div className="bindings-container">
                                            <div className="binding-container">
                                                <span className="hl">A, Left</span>
                                                <span>— Move left</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">D, Right</span>
                                                <span>— Move right</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">Q</span>
                                                <span>— Rotate left</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">E</span>
                                                <span>— Rotate right</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">S, Down</span>
                                                <span>— Drop block</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="btn-container-row">
                                        <button className="action-btn" onClick={(event) => {
                                            setGameState(0);
                                        }}>
                                            <div className="btn-emblem">
                                                <FontAwesomeIcon className="icon" icon={faRedo}/>
                                            </div>
                                            Restart
                                        </button>
                                        <button className="secondary-btn" onClick={(event) => {
                                            setShowGameFieldOutputWindow(true);
                                        }
                                        }>
                                            <div className="nom-btn-emblem">
                                                <FontAwesomeIcon className="nom-icon" icon={faSave}/>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            gameState == 0 &&
                            <div className="screen-container">
                                <div className="nextElement-block"></div>
                                <div className="info-block">
                                    <div className="info-container">
                                        <h1>Play Teris</h1>

                                        <p>Click on the start button below to start teris via client.</p>

                                        <h2>Bindings</h2>

                                        <div className="bindings-container">
                                            <div className="binding-container">
                                                <span className="hl">A, Left</span>
                                                <span> — Move left</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">D, Right</span>
                                                <span> — Move right</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">Q</span>
                                                <span> — Rotate left</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">E</span>
                                                <span> — Rotate right</span>
                                            </div>
                                            <div className="binding-container">
                                                <span className="hl">S, Down</span>
                                                <span> — Drop block</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="btn-container-row">
                                        <button className="action-btn" onClick={(event) => {
                                            setShowInputWindow(false);
                                            setGameState(1);
                                        }}>
                                            <div className="btn-emblem">
                                                <FontAwesomeIcon icon={faPlusCircle}/>
                                            </div>
                                            Create game
                                        </button>
                                        <button className="secondary-btn" onClick={(event) => {
                                            setShowInputWindow(true);
                                        }}>
                                            <div className="btn-emblem">
                                                <FontAwesomeIcon icon={faArrowAltCircleDown}/>
                                            </div>
                                            Load game
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>

                    <div className="screen-container device-warning">
                        <h2>Sorry, there is nothing to see here :/</h2>
                        <p className="error">Please use a device with a bigger display. This application is not designed
                            for small medias.</p>
                    </div>
                </div>

                {
                    gameState == 2 &&
                    <div className="pop-up-frame">
                        {/* Exception for clients running out of tiles */}
                        <div className="game-fail-popup screen-container">
                            <h2>Game over</h2>

                            {
                                (data.score <= 5000) ? <p className="red">Sadly, you&#39;ve already reached the end of the game field, but you can surely
                                perform better next time.</p>: null
                            }

                            {
                                (data.score > 5000 && data.score <= 50000) ? <p className="orange">You&#39;ve reached the end of the game field,
                                but you can certainly fully unleash your potential in the next round!</p>: null
                            }

                            {
                                (data.score > 50000 && data.score <= 350000) ? <p className="green">Sadly, you&#39;ve reached the end of the game field, but
                                that was surely a remarkable score!</p>: null
                            }

                            {
                                (data.score > 350000 && data.score <= 1250000) ? <p className="blue">Congratulations! You hit a very good score right there!</p>: null
                            }

                            {
                                (data.score > 1250000) ? <p className="purple">That was insane! Your score is godlike :-) How much time did you invest?</p>: null
                            }

                            <div className="stat-container">
                                <span>Your score: </span>
                                <span className="hl">{displayScore}</span>
                            </div>
                            <p>You may try again via the button below.</p>
                            <button className="action-btn" onClick={(event) => {
                                setGameState(0);
                            }}>
                                <div className="btn-emblem">
                                    <FontAwesomeIcon icon={faRedo}/>
                                </div>
                                Restart
                            </button>
                        </div>
                    </div>
                }
                {
                    showInputWindow &&
                    <div className="pop-up-frame">
                        {/* Field to enter Game which should be loaded */}
                        <div className="game-fail-popup screen-container">
                            <h1>Load in your game data</h1>
                            <p>Paste and submit your previously saved game data to load the game board.</p>
                            <div className="btn-container-row">
                                <div className="inline-block">
                                    <input className="input-field" placeHolder="Input game code" onChange={(event) => {
                                        if (event.target.value.length > 990) {
                                            dataInput = event.target.value;
                                        }
                                    }}/>
                                    <button className="action-btn" onClick={(event) => {
                                        keepData = true;
                                        data = JSON.parse(decrypt(dataInput));
                                        setShowInputWindow(false);
                                        setGameState(1);
                                    }}>
                                        <div className="nom-btn-emblem">
                                            <FontAwesomeIcon className="nom-icon" icon={faArrowAltCircleDown}/>
                                        </div>
                                    </button>
                                </div>
                                <button className="secondary-btn" onClick={(event) => {
                                    !setShowInputWindow();
                                }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                }
                {
                    showGameFieldOutputWindow &&
                    <div className="pop-up-frame">
                        {/* Field to receive Game which should be saved */}
                        <div className="game-fail-popup screen-container">
                            <h1>Save your game data</h1>
                            <p>Click to copy or select and copy your game code out of the field below.</p>
                            <p>Please save your code externally so that you can retrieve and access it next time!</p>
                            <div className="btn-container-row">
                                <div className="inline-block">
                                    <input className="input-field force-select inactive"
                                           readOnly={true}
                                           defaultValue={
                                               encryptFromJSON(data)
                                           }
                                    />
                                    <CopyToClipboard text={
                                        encryptFromJSON(data)
                                    }
                                    onCopy={() => setCopied(true)}>
                                        <button className="action-btn">
                                            <div className="nom-btn-emblem">
                                                <FontAwesomeIcon className="nom-icon" icon={faCopy}/>
                                            </div>
                                        </button>
                                    </CopyToClipboard>
                                    { copied ? <span className="copied-sign">Copied to clipboard!</span>: null }
                                </div>
                                <button className="confirm-action-btn" onClick={(event) => {
                                    setCopied(false);
                                    !setShowGameFieldOutputWindow();
                                }}>
                                    Alright, thanks!
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </main>
        </div>
    );
}