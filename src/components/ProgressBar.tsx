import {useState} from "react";
import {ProgressSocketConnection} from "./RustySocket.tsx";

export const ProgressBar = (props) => {

    const [progress, setProgress] = useState<number>(0);

    const handleSocket = (p: number) => {
        setProgress(p);
    }

    ProgressSocketConnection(handleSocket);



    return (
        // @ts-ignore
        <div className='rounded rounded-2xl shadow-2xl py-2 px-4' {...props}>
            {progress == 0 || progress == 99 && (
                <>
                    <h2>Downloading...</h2>
                    <div className="w-auto h-4 border">
                        <div style={{width: `${progress}%`}} className='bg-green-400 h-full'/>
                    </div>
                </>
            )}
        </div>
    );
};