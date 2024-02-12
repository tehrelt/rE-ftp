import {ConnectionForm} from "./components/forms/ConnectionForm.tsx";
import {Explorer} from "./components/Explorer.tsx";
import {LogWindow} from "./components/LogWindow.tsx";
import {Message} from "./types/Message.ts";
import {invoke} from "@tauri-apps/api";
import {Options} from "./types/Options.ts";
import {LogSocketConnection} from "./components/RustySocket.tsx";
import {useEffect, useState} from "react";
import {Bounce, toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export function notifyInfo(msg: string) {
    toast.info(msg, {
        position: "bottom-left",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
}


export function notifySuccess(msg: string) {
    toast.success(msg, {
        position: "bottom-left",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
}

export function notifyError(msg: string) {
    toast.error(msg, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
    });
}

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

    function onConnection() {
        setConnectionAlive(true);
        localStorage.setItem('connection-alive', String(true));
        notifySuccess("Connected");
    }

    function handleError(message: string) {
        notifyError(message);
        handleDisconnect();
    }

    function onDisconnection() {
        setConnectionAlive(false);
        localStorage.removeItem('connection-alive');
        localStorage.removeItem('credentials');
        notifySuccess("Disconnected")

    }

    async function handleConnect(options: Options) {
        // @ts-ignore
        invoke("connect", options)
            .then(onConnection)
            .catch(handleError);
    }

    async function handleDisconnect() {
        invoke("disconnect").finally(onDisconnection)
    }

    return (
        <>
            <div className="container mx-auto relative">
                <h1 className="absolute font-extrabold text-3xl ">rE FTP</h1>
                <ConnectionForm connectionAlive={connectionAlive} connect={(options: Options) => handleConnect(options) } disconnect={handleDisconnect} />
                <Explorer disabled={!connectionAlive} onError={handleError} />
                <LogWindow messages={messages} clearCallback={() => setMessages([])}/>
            </div>
            <ToastContainer/>

        </>
    );
}
