import { DEntry } from "../types/DEntry.ts";
import { DEntryDisplay } from "./DEntryDisplay.tsx";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { open, save } from "@tauri-apps/api/dialog";
import { BaseDirectory, writeBinaryFile } from "@tauri-apps/api/fs";
import {notifyInfo, notifySuccess} from "../App.tsx";
import {ProgressBar} from "./ProgressBar.tsx";

type Props = {
  disabled?: boolean | true;

  onError: (message: string) => void;
};
export const Explorer = ({ disabled, onError }: Props) => {
  if (disabled) {
    return (
      <div className={"mt-40 flex justify-center"}>
        <h2 className="text-2xl">CONNECT FIRST</h2>
      </div>
    );
  }

  const [path, setPath] = useState<string>("/");
  const [dentries, setDentries] = useState<DEntry[]>([]);

  const refreshPath = async () => {
    // @ts-ignore
    invoke("pwd").then((p: string) => setPath(p)).catch(e => onError(e.message))
  };

  const refreshDentries = async () => {
    try {
      const entries: string[] = await invoke("list");

      setDentries(
        entries
          .map((entry) => {
            const attrs: string[] = entry
              .trim()
              .replace(/\s{2,}/g, " ")
              .split(" ");

            let size = Number(attrs[4]);
            let unit = "b";
            
            if (size > 1 << 20) {
              size /= 1 << 20;
              unit = "mb";
            } else if (size > 1 << 10) {
              size /= 1 << 10;
              unit = "kb";
            }

            size = Math.ceil(size);

            return {
              fileName: attrs.slice(8, attrs.length).join(" "),
              modifyTime: `${attrs[5]} ${attrs[6]} ${attrs[7]}`,
              size: `${size} ${unit}`,
              isDir: attrs[0].charAt(0) == "d",
            };
          })
          .sort((a, b) => {
            if (b.isDir) return 1;
            else if (a.isDir) return -1;
            else return 0;
          })
      );
    } catch (e) {
      // @ts-ignore
      onError(e.message);
    }
  };

  useEffect(() => {
    refreshPath();
  }, []);

  useEffect(() => {
    refreshDentries();
  }, [path]);

  const enterDirectory = async (fileName: string) => {
    invoke("cwd", { fileName }).then(refreshPath).catch(refreshDentries);
  };

  const mkdir = async () => {
    refreshDentries();
    const count = dentries.filter(function (d) {
      return d.fileName.includes("New Folder");
    }).length;

    const dirName = count == 0 ? "New Folder" : `New Folder (${count})`;

    invoke("mkdir", { dirName }).then(_ => notifySuccess(`${dirName} successfully created`)).catch(e => onError(e.message));
    refreshDentries();
  };

  const downloadFile = async (fileName: string) => {

    notifyInfo(`${fileName} starts downloading`);
    invoke("get", { fileName })
        .then(r => {
          const f = async () => {
            const filePath = await save({
              defaultPath: BaseDirectory.Download + "/" + fileName,
              filters: [
                {
                  name: "Files",
                  extensions: ["*"],
                },
              ],
            });

            if (filePath) {
              // @ts-ignore
              await writeBinaryFile(filePath, new Uint8Array(r))
              notifySuccess(`${fileName} successfully saved`)
            } else {
              notifyInfo("File downloading cancelled");
            }
          }

          f();
        })
        .catch(e => onError(e.message));
  };

  const uploadFile = async () => {
    const filePath = await open({
      filters: [
        {
          name: "Files",
          extensions: ["*"],
        },
      ],
    });


    if (filePath) {
      invoke("put", { path: filePath }).then(refreshDentries).catch(e => onError(e.message));
    } else {
      notifyInfo("File path is null");
    }
  };

  return (
    <div className="w-full max-h-96 p-6 rounded rounded-2xl shadow-2xl border-sky-800 mt-10 overflow-y-auto bg-slate-200">
      <div className="relative mx-40">
        <div className="grid grid-cols-10">
          <ProgressBar className='col-span-8'/>
          <div className='flex my-auto justify-end'>
            <button
                className="bg-slate-300 text-gray-900 px-3 py-1 rounded rounded-b hover:bg-slate-400 transition-all ease-in-out"
                onClick={mkdir}
            >
              Make dir
            </button>
          </div>

          <div className='my-auto'>
            <button
                className="bg-slate-300 text-gray-900 px-3 py-1 rounded rounded-b hover:bg-slate-400 transition-all ease-in-out ml-4"
                onClick={uploadFile}
            >
              Upload file
            </button>
          </div>

        </div>

        <h2>
          {path.split("*/").map((p: string) => (
            <span key={"p"}>{p}</span>
          ))}
        </h2>
        <div className="block py-12">
          {path !== "/" && (
            <DEntryDisplay
              dentry={{ fileName: "..", isDir: true }}
              doubleClickCallback={(name) => enterDirectory(name)}
            />
          )}
          {dentries.map((dentry: DEntry) => (
            <DEntryDisplay
              key={dentry.fileName}
              dentry={dentry}
              doubleClickCallback={(name) =>
                dentry.isDir ? enterDirectory(name) : downloadFile(name)
              }
            />
          ))}
        </div>

      </div>
    </div>
  );
};
