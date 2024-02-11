import { appWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import {Message} from "../types/Message.ts";


interface RustyPipe {
    payload: string;
}

type OnProgressCallback = (value: number) => void;
type OnLogCallback = (message: Message) => void;

export const LogSocketConnection = (onMessage: OnLogCallback) => {
    useEffect(() => {
        const rustyPipe = appWindow.listen(
            "log-socket-message",
            (event: RustyPipe) => {
                // @ts-ignore
                onMessage(event.payload)
            }
        );

        return () => {
            rustyPipe.then((dispose) => dispose());
        };
    }, []);
};

export const ProgressSocketConnection = (onMessage: OnProgressCallback) => {
    useEffect(() => {
        const rustyPipe = appWindow.listen(
            "progress-socket-message",
            (event: RustyPipe) => {
                // @ts-ignore
                onMessage(event.payload)
            }
        );

        return () => {
            rustyPipe.then((dispose) => dispose());
        };
    }, []);
};