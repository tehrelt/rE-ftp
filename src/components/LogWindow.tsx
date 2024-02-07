import {Message} from "../types/Message.ts";

type Props = {
   messages: Message[]

    clearCallback: () => void;
};
export const LogWindow = ({messages, clearCallback}: Props) => {

    function handleClear(e: any){
        e.preventDefault()

        clearCallback();
    }

    return (
        <div className="fixed w-3/4 bottom-10 left-1/2 -translate-x-1/2">
            <div className="relative  flex justify-center">
                <button className={`absolute top-3  rounded rounded-b right-5 px-4 py-1  transition-all ${messages.length == 0 ? "bg-slate-100 text-slate-400" : "bg-sky-100 hover:bg-sky-50"}`} onClick={handleClear} disabled={messages.length == 0}>
                    CLEAR
                </button>
                <div className="h-40 w-full rounded shadow-2xl p-2 grid grid-cols-10 overflow-y-auto bg-slate-300">
                    {messages.map((m) => (
                        <>
                            <div className="col-span-2 text-slate-600 font-bold py-1 border-b-2 border-slate-200">
                                {m.datetime.toISOString()}
                            </div>
                            <div className="col-span-7 border-b-2 border-slate-200">
                                {m.message}
                            </div>
                        </>
                    ))}
                </div>
            </div>




        </div>
    );
};