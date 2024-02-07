import {InputBox} from "./InputBox.tsx";
import {useState} from "react";
import {Options} from "../../types/Options.ts";

type Props = {
    connectionAlive: boolean
    onConnect: (options: Options) => void
    onDisconnect: () => void
};
export const ConnectionForm = ({ connectionAlive, onConnect, onDisconnect }: Props) => {

    const [host, setHost] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [port, setPort] = useState<number>(21)

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (connectionAlive) {
            onDisconnect()
        } else {
            onConnect({
                host,
                user: username,
                pass: password,
                port
            });
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div></div>

                <InputBox
                    label="Host" id="host" placeholder="127.0.0.1"
                    value={host} callback={(val) => setHost(val.toString())}/>

                <InputBox label="Username" id="user"
                          value={username} callback={(val) => setUsername(val.toString())} />

                <InputBox label="Password" id="password" type="password"
                          value={password} callback={(val) => setPassword(val.toString())}/>

                <InputBox label="Port" id="port" type="number" max={65535}
                          value={port} callback={(val) => setPort(Number(val))}/>

                <div className="w-full flex justify-center items-center">
                    {connectionAlive == false ? (
                        <button type="submit" className="bg-sky-600 px-4 py-2 text-white rounded-xl">Connect</button>
                    ) : (
                        <button type="submit" className="bg-orange-500 px-4 py-2 text-white rounded-xl">Disconnect</button>
                    )}
                </div>
            </div>
        </form>
    );
};