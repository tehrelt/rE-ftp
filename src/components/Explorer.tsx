import {DEntry} from "../types/DEntry.ts";
import {DEntryDisplay} from "./DEntryDisplay.tsx";
import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api";

type Props = {
    disabled?: boolean | true
};
export const Explorer = ({disabled, }: Props) => {

    if(disabled) {
        return (
            <div className={"mt-40 flex justify-center"}>
                <h2 className='text-2xl'>CONNECT FIRST</h2>
            </div>
        )
    }

    const [path, setPath] = useState<string>("/");
    const [dentries, setDentries] = useState<DEntry[]>([]);


    useEffect(() => {
        const getList = async () => {
            const r: string = await invoke('list');
            console.log("response:", r);

            const elements = r.split(';');
            elements.pop();
            console.log("elements:", elements);

            setDentries(elements.map((entry) => {
                const attrs: string[] = entry.trim().replace(/\s{2,}/g, ' ').split(' ');
                console.log(attrs);

                const dentry: DEntry = {
                    fileName: attrs[8],
                    modifyTime: `${attrs[5]} ${attrs[6]} ${attrs[7]}`,
                    size: attrs[4],
                    isDir: attrs[0].charAt(0) == 'd',
                }
                return dentry;
            }));
        }

        getList();

        setDentries(dentries.sort((a, b) => {
            if(b.isDir) return 1;
            else if(a.isDir) return -1;
            else return 0;
        }));
    }, [path]);


    return (
        <div className={`w-full h-screen p-6 rounded rounded-2xl shadow-2xl border-sky-800 mt-10 overflow-y-auto ${disabled ? "bg-slate-50" : "bg-slate-200"}`}>
            <div className="block py-12">
                {dentries.map((dentry: DEntry) => (
                    <DEntryDisplay dentry={dentry}/>
                ))}
            </div>
        </div>
    );
};