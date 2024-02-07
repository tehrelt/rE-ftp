import {ConnectionForm} from "./components/forms/ConnectionForm.tsx";
import {Explorer} from "./components/Explorer.tsx";
import {LogWindow} from "./components/LogWindow.tsx";
import {Message} from "./types/Message.ts";
import {invoke} from "@tauri-apps/api";
import {Options} from "./types/Options.ts";
import {LogSocketConnection} from "./components/RustySocket.tsx";
import {useState} from "react";

export default function App() {

    const [messages, setMessages] = useState<Message[]>([])
    const [connectionAlive, setConnectionAlive] = useState<boolean>(false)

    const handleLogSocketMessage = (message: Message) => {
        message.datetime = new Date(message.datetime);
        // This is where you do the actions - im just writing the message to a state variable
        setMessages(old => [...old, message]);
    };

    LogSocketConnection(handleLogSocketMessage);

    // useEffect(() => {
    //     const ping = async () => {
    //         invoke("ping").then(r => setConnectionAlive(r)).catch(e => console.error("ping", e));
    //     }
    //
    //     ping();
    // }, [messages])

    async function handleConnect(options: Options) {
        console.log("connect to ", options);
        // @ts-ignore
        await invoke("connect", options)
            .then(() => setConnectionAlive(true))
            .catch(e => console.error(e));
    }

    async function handleDisconnect() {
        invoke("disconnect").then(() => setConnectionAlive(false));
    }

    return (
        <>
            <div className="container mx-auto relative">
                <h1 className="absolute font-extrabold text-3xl ">rE FTP</h1>
                <ConnectionForm connectionAlive={connectionAlive} onConnect={handleConnect} onDisconnect={handleDisconnect} />
                <Explorer disabled={!connectionAlive} />
                <LogWindow messages={messages} clearCallback={() => setMessages([])}/>
            </div>
        </>
    );
}
