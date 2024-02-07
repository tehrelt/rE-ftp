import "./App.css";
import {ConnectionForm} from "./components/forms/ConnectionForm.tsx";
import {Explorer} from "./components/Explorer.tsx";
import {LogWindow} from "./components/LogWindow.tsx";
import {Message, test_messages} from "./types/Message.ts";
import {invoke} from "@tauri-apps/api";
import {Options} from "./types/Options.ts";
import {useEffect, useState} from "react";
import RustySocketConnection, {LogSocketConnection} from "./components/RustySocket.tsx";

function App() {

    const [messages, setMessages] = useState<Message[]>([])

    const handleLogSocketMessage = (message: Message) => {
        // This is where you do the actions - im just writing the message to a state variable
        setMessages(old => [...old, message]);
    };

    LogSocketConnection(handleLogSocketMessage);


    async function handleConnect(options: Options) {
        console.log("connect to ", options);
        // @ts-ignore
        let response = await invoke("connect", options);
        console.log(response);
    }

    return (
        <>
            <div className="container mx-auto relative">
                <h1 className="absolute font-extrabold text-3xl ">rE FTP</h1>
                <ConnectionForm onSubmit={handleConnect} />
                <Explorer />
                <LogWindow messages={messages} />
            </div>
        </>
    );
}



export default App;
