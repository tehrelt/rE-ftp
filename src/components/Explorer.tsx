import {DEntry} from "../types/DEntry.ts";
import {DEntryDisplay} from "./DEntryDisplay.tsx";
import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api";
import {open, save} from "@tauri-apps/api/dialog";
import {BaseDirectory, readBinaryFile, writeBinaryFile} from "@tauri-apps/api/fs";

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

        const elements = r.split(';');
        elements.pop();

        setDentries(elements.map((entry) => {
            const attrs: string[] = entry.trim().replace(/\s{2,}/g, ' ').split(' ');

            let size = Number(attrs[4]);
            let unit = "b";
            if(size > 1 << 20) {
                size /= 1<<20;
                unit = "mb"
            } else if (size > 1 << 10) {
                size /= 1<<10;
                unit = "kb"
            }

            size = Math.ceil(size);

            const dentry: DEntry = {
                fileName: attrs.slice(8, attrs.length).join(' '),
                modifyTime: `${attrs[5]} ${attrs[6]} ${attrs[7]}`,
                size: `${size} ${unit}`,
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

    const mkdir = async () => {
        refreshDentries();
        const count = dentries.filter(function(d) { return d.fileName.includes("New Folder") }).length

        const dirName = count == 0 ? 'New Folder' : `New Folder (${count})`;

        await invoke('mkdir', { dirName });
        refreshDentries();
    }

    const downloadFile = async (fileName: string) => {
        const filePath = await save({
            defaultPath: BaseDirectory.Download + "/" + fileName,
            filters: [{
                name: "Files",
                extensions: ['*']
            }]
        });

        let r = await invoke('get', {fileName});

        if (filePath != null) {
            // @ts-ignore
            await writeBinaryFile(filePath, new Uint8Array((r)));
        }

    }

    const uploadFile = async () => {
        const filePath = await open({
            filters: [{
                name: "Files",
                extensions: ['*']
            }]
        });

        console.log("uploadFile() filePath:", filePath);

        // const bytes = await readBinaryFile(filePath);
        // console.log("uploadFile() bytes:", bytes);

        await invoke('put', { path: filePath })

        refreshDentries();
    }

    // @ts-ignore
    return (
        <div className={` w-full h-screen p-6 rounded rounded-2xl shadow-2xl border-sky-800 mt-10 overflow-y-auto ${disabled ? "bg-slate-50" : "bg-slate-200"}`}>
            <div className="relative mx-40">
                <h2>
                    {path.split('*/').map((p: string) => (
                        <span key={"p"}>{p}</span>
                    ))}
                </h2>
                <div className="block py-12">
                    {path !== '/' && (
                        <DEntryDisplay dentry={{ fileName: "..", isDir: true }} doubleClickCallback={(name) => enterDirectory(name)}/>
                    )}
                    {dentries.map((dentry: DEntry) => (
                        <DEntryDisplay key={dentry.fileName} dentry={dentry} doubleClickCallback={(name) => dentry.isDir ? enterDirectory(name) : downloadFile(name)}/>
                    ))}
                </div>
                <div id="button_mkdir" className="absolute top-0 right-2">
                    <button className="bg-slate-300 text-gray-900 px-3 py-1 rounded rounded-b hover:bg-slate-400 transition-all ease-in-out"
                            onClick={mkdir}>
                        Make dir
                    </button>
                    <button className="bg-slate-300 text-gray-900 px-3 py-1 rounded rounded-b hover:bg-slate-400 transition-all ease-in-out ml-4"
                            onClick={uploadFile}>
                        Upload file
                    </button>
                </div>
            </div>
        </div>
    );
};