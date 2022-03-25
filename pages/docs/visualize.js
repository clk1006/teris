import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBook,
    faCirclePlay, faCode,
    faCodeBranch,
    faEllipsis,
    faExternalLink,
    faExternalLinkSquare, faQuestion,
    faAnchor, faAngleLeft
} from '@fortawesome/free-solid-svg-icons';

export default function Docs() {
    const [isActive, toggleActive] = useState(true);
    const handleToggle = () => {
        toggleActive(!isActive);
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Tetris</title>
                <meta name="description" content="Generated by create next app"/>
            </Head>

            <main className={styles.main}>
                <div className={`nav-bar ${isActive ? "" : "active"}`}>
                    <a href="." className="menu-icon">
                        <FontAwesomeIcon className="icon" icon={faAngleLeft}/>
                    </a>
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
                                <span>Play Tetris</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="container">
                    <div className="content-block visualization-guide">
                        <h1>How to visualize your project</h1>

                        <hr/>

                        <p>There are <b>2 ways</b> in which you can visualize your work.</p>
                        <p>For both of them to work, you must of course use the functions/requests provided by the API accordingly.</p>

                        <hr/>

                        <h2>1. Let your program play via the server that provides the API</h2>
                        <p>If you want to hook up your project with the server providing the API, you will need to send the requests to the originated server. The current URL to our server is:</p>
                        <p className='code-field'>https://tetris-em.vercel.app</p>
                        <p>Further important is the usage of a unique (custom) gameID. It is recommended following the logics of the <a href="./docs">provided template</a>, which assigns each started game of yours to an unique ID.</p>
                        <p>As soon as you are able to get an insight in your gameID, you will be able to observe the requests visually, that are send to the server. For that, you will need to append the gameID to the originated server in your browser manually as following:</p>
                        <p className='code-field'>https://tetris-em.vercel.app?<span className='syntax parameter'>gameID</span>=<span className='syntax request'>id</span></p>
                        <p>If you have fetched an ID from the server via the parameter <a className="tag" href="./docs">gameID</a>, you can i.e. print your ID to further manual usage.</p>
                        <p>This method is usually accompanied by a very high latency if the server is accessed by several clients at the same time. Accordingly, it is not suitable for training an AI.</p>

                        <br/>
                        <h2>2. Host your own server to reduce latency</h2>
                        <p>In order to create your own instance of the server you have to have <a href="https://www.docker.com/"
                               target="_blank" className="text-link" rel="noreferrer">Docker <FontAwesomeIcon
                               size="xs"
                               icon={faExternalLink}/>
                               </a> installed on your local machine.
                         As soon as that is the case, you may pull the latest image of the server via the following command:
                        </p>
                        <p className="code-field">sudo docker pull clk1006/tetris:latest</p>
                        <p>Then you can start the server with</p>
                        <p className="code-field">sudo docker run -p [PORT]:3000 clk1006/tetris:lastest</p>
                        <p>where [PORT] is the port on which you want your server to listen.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};