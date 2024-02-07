import {DEntry} from "../types/DEntry.ts";

type Props = {
    dentry: DEntry

    doubleClickCallback: (name: string) => void;
};
export const DEntryDisplay = ({ dentry, doubleClickCallback }: Props) => {
    return (
        <div className="grid grid-cols-6 items-center border-b-4 border-slate-300 hover:bg-slate-300 px-10 py-2 transition-all ease-in-out select-none "
             onDoubleClick={() => doubleClickCallback(dentry.fileName)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 fill-gray-600 mx-auto">
                {dentry.isDir ? (
                    <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                ) : (
                    <>
                    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </>
                )}
            </svg>

            <div className="col-span-2 select-none"> {dentry.fileName} </div>
            <div className="select-none"> {dentry.size} </div>
            <div className="select-none"> {dentry.modifyTime} </div>
        </div>
    );
};