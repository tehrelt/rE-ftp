import {ConnectionForm} from "./components/forms/ConnectionForm.tsx";
import {Explorer} from "./components/Explorer.tsx";
import {LogWindow} from "./components/LogWindow.tsx";
import {Message} from "./types/Message.ts";
import {invoke} from "@tauri-apps/api";
import {Options} from "./types/Options.ts";
import {LogSocketConnection} from "./components/RustySocket.tsx";
import {useEffect, useState} from "react";
import {sample_dentries} from "./types/DEntry.ts";

function App() {

    const [messages, setMessages] = useState<Message[]>([])
    const [connectionAlive, setConnectionAlive] = useState<boolean>(false)

    const handleLogSocketMessage = (message: Message) => {
        message.datetime = new Date(message.datetime);
        // This is where you do the actions - im just writing the message to a state variable
        setMessages(old => [...old, message]);
    };

    LogSocketConnection(handleLogSocketMessage);

    useEffect(() => {
        const ping = async () => {
            const r: boolean = await invoke("ping")
            setConnectionAlive(r);
        }

        ping().then(r => console.log("ping"));

    }, [messages])


    

    async function handleConnect(options: Options) {
        console.log("connect to ", options);
        // @ts-ignore
        let response = await invoke("connect", options);
        console.log(response);
    }

    async function handleDisconnect() {
        await invoke("disconnect");
    }

    return (
        <>
            <div className="container mx-auto relative">
                <h1 className="absolute font-extrabold text-3xl ">rE FTP</h1>
                <ConnectionForm connectionAlive={connectionAlive} onConnect={handleConnect} onDisconnect={handleDisconnect} />
                <Explorer disabled={!connectionAlive} dentries={sample_dentries} />
                <LogWindow messages={messages} clearCallback={() => setMessages([])}/>
            </div>
        </>
    );
}



export default App;
