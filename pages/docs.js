import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Docs() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Hello World</title>
            </Head>
            <main className={styles.main}>
                <p>Guten Morgen</p>
            </main>
        </div>      
    );
};