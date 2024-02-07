import { appWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import {Message} from "../types/Message.ts";


interface RustyPipe {
    payload: string;
}

type OnLogCallback = (message: Message) => void;

export const LogSocketConnection = (onMessage: OnLogCallback) => {
    useEffect(() => {
        const rustyPipe = appWindow.listen(
            "log-socket-message",
            (event: RustyPipe) => {
                // console.log(`Function message -> `);
                console.log(event.payload);
                onMessage(event.payload)
            }
        );

        return () => {
            rustyPipe.then((dispose) => dispose());
        };
    }, []);
};