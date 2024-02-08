import {InputBox} from "./InputBox.tsx";
import {useEffect, useState} from "react";
import {Options} from "../../types/Options.ts";

type Props = {
    connectionAlive: boolean
    connect: (options: Options) => void
    disconnect: () => void
};
export const ConnectionForm = ({ connectionAlive, connect, disconnect }: Props) => {

    const [host, setHost] = useState<string>("")
    const [user, setUser] = useState<string>("")
    const [pass, setPass] = useState<string>("")
    const [port, setPort] = useState<number>(21)

    useEffect(() => {
        const cn = localStorage.getItem('credentials');

        if (cn) {
           const splitted = cn.split(';');

           setHost(splitted[0]);
           setUser(splitted[1]);
           setPass(splitted[2]);

           // @ts-ignore
            setPort(splitted[3]);
        }

    }, []);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (connectionAlive) {
            disconnect();
            return;
        }

        connect({ host, user, pass, port } );

        localStorage.setItem('credentials', `${host};${user};${pass};${port}`);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div></div>

                <InputBox
                    label="Host" id="host" placeholder="127.0.0.1" disabled={connectionAlive}
                    value={host} callback={(val) => setHost(val.toString())}/>

                <InputBox label="Username" id="user" disabled={connectionAlive}
                          value={user} callback={(val) => setUser(val.toString())} />

                <InputBox label="Password" id="password" type="password" disabled={connectionAlive}
                          value={pass} callback={(val) => setPass(val.toString())}/>

                <InputBox label="Port" id="port" type="number" max={65535} disabled={connectionAlive}
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