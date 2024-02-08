import {ConnectionForm} from "./components/forms/ConnectionForm.tsx";
import {Explorer} from "./components/Explorer.tsx";
import {LogWindow} from "./components/LogWindow.tsx";
import {Message} from "./types/Message.ts";
import {invoke} from "@tauri-apps/api";
import {Options} from "./types/Options.ts";
import {LogSocketConnection} from "./components/RustySocket.tsx";
import {useEffect, useState} from "react";

export default function App() {

    const [messages, setMessages] = useState<Message[]>([])
    const [connectionAlive, setConnectionAlive] = useState<boolean>(false)

    const handleLogSocketMessage = (message: Message) => {
        message.datetime = new Date(message.datetime);
        // This is where you do the actions - im just writing the message to a state variable
        setMessages(old => [message, ...old]);
    };

    LogSocketConnection(handleLogSocketMessage);

    useEffect(() => {
        const alive = localStorage.getItem('connection-alive');
        setConnectionAlive(alive != null);
    }, []);


    // useEffect(() => {
    //     const ping = async () => {
    //         invoke("ping").then(r => setConnectionAlive(r)).catch(e => console.error("ping", e));
    //     }
    //
    //     ping();
    // }, [messages])


    function connect() {
        setConnectionAlive(true);
        localStorage.setItem('connection-alive', String(true));
    }

    function disconnect() {
        setConnectionAlive(false);
        localStorage.removeItem('connection-alive');
        localStorage.removeItem('credentials');
    }

    async function handleConnect(options: Options) {
        // @ts-ignore
        invoke("connect", options)
            .then(connect)
            .catch(disconnect);
    }

    async function handleDisconnect() {
        invoke("disconnect").finally(disconnect)
    }

    return (
        <>
            <div className="container mx-auto relative">
                <h1 className="absolute font-extrabold text-3xl ">rE FTP</h1>
                <ConnectionForm connectionAlive={connectionAlive} connect={handleConnect} disconnect={handleDisconnect} />
                <Explorer disabled={!connectionAlive} onError={disconnect} />
                <LogWindow messages={messages} clearCallback={() => setMessages([])}/>
            </div>
        </>
    );
}
