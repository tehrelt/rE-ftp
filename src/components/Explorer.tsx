import {DEntry} from "../types/DEntry.ts";
import {DEntryDisplay} from "./DEntryDisplay.tsx";
import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api";
import {save} from "@tauri-apps/api/dialog";
import {BaseDirectory, writeBinaryFile} from "@tauri-apps/api/fs";

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

    const refreshPath = async () => {
        setPath(await invoke('pwd'));
    }

    const refreshDentries = async () => {
        const r: string = await invoke('list');
        console.log("response:", r);

        const elements = r.split(';');
        elements.pop();
        console.log("elements:", elements);

        setDentries(elements.map((entry) => {
            const attrs: string[] = entry.trim().replace(/\s{2,}/g, ' ').split(' ');
            console.log(attrs);

            const dentry: DEntry = {
                fileName: attrs.slice(8, attrs.length).join(' '),
                modifyTime: `${attrs[5]} ${attrs[6]} ${attrs[7]}`,
                size: attrs[4],
                isDir: attrs[0].charAt(0) == 'd',
            }
            return dentry;
        }).sort((a, b) => {
            if(b.isDir) return 1;
            else if(a.isDir) return -1;
            else return 0;
        }));
    }

    useEffect(() => {
        refreshPath();
    }, []);

    useEffect(() => {
        refreshDentries();
    }, [path]);

    const enterDirectory = async (fileName: string) => {
        await invoke('cwd', { fileName });
        refreshPath();
    }

    const handleMkdir = async () => {
        refreshDentries();
        const count = dentries.filter(function(d) { return d.fileName.includes("New Folder") }).length

        const dirName = count == 0 ? 'New Folder' : `New Folder (${count})`;

        await invoke('mkdir', { dirName });
        refreshDentries();
    }

    const downloadFile = async (fileName: string) => {
       let r = await invoke('get', {fileName});
        // @ts-ignore
        // var blob = new Blob([new Uint8Array(r)], {type: "application/binary"});
        // var link = document.createElement("a");
        // link.href = window.URL.createObjectURL(blob);
        // link.download = fileName;
        // link.click();
        // window.URL.revokeObjectURL(link.href);

        const filePath = await save({
            defaultPath: BaseDirectory.Download + "/" + fileName,
            filters: [{
                name: "Files",
                extensions: ['*']
            }]
        });

        if (filePath != null) {
            console.log("filePath:", filePath);
            // @ts-ignore
            await writeBinaryFile(filePath, new Uint8Array((r)));
        }

    }

    // @ts-ignore
    return (
        <div className={` w-full h-screen p-6 rounded rounded-2xl shadow-2xl border-sky-800 mt-10 overflow-y-auto ${disabled ? "bg-slate-50" : "bg-slate-200"}`}>
            <div className="relative mx-40">
                <h2>
                    {path.split('*/').map((p: string) => (
                        <span>{p}</span>
                    ))}
                </h2>
                <div className="block py-12">
                    {path !== '/' && (
                        <DEntryDisplay dentry={{ fileName: "..", isDir: true }} doubleClickCallback={(name) => enterDirectory(name)}/>
                    )}
                    {dentries.map((dentry: DEntry) => (
                        <DEntryDisplay dentry={dentry} doubleClickCallback={(name) => dentry.isDir ? enterDirectory(name) : downloadFile(name)}/>
                    ))}
                </div>
                <div id="button_mkdir" className="absolute top-0 right-2">
                    <button className="bg-slate-300 text-gray-900 px-3 py-1 rounded rounded-b hover:bg-slate-400 transition-all ease-in-out"
                            onClick={handleMkdir}>
                        Make dir
                    </button>
                </div>
            </div>
        </div>
    );
};