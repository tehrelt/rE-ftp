export interface DEntry {
    fileName: string
    size?: string
    modifyTime?: string
    isDir: boolean
}


export const sample_dentries: DEntry[] = [
    { fileName: "file 1",   size: "123 kb", modifyTime: "TUE FEB 2", isDir: false },
    { fileName: "file 2",   size: "123 kb", modifyTime: "TUE FEB 2", isDir: false },
    { fileName: "file 3",   size: "123 kb", modifyTime: "TUE FEB 2", isDir: false },
    { fileName: "file 4",   size: "123 kb", modifyTime: "TUE FEB 2", isDir: false },
    { fileName: "dir 1",    size: "123 kb", modifyTime: "WED FEB 2", isDir: true },
    { fileName: "file 5",   size: "123 kb", modifyTime: "TUE FEB 5", isDir: false },
    { fileName: "dir 2",    size: "123 kb", modifyTime: "TUE FEB 4", isDir: true },
]