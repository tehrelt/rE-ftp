import {Message} from "../types/Message.ts";

type Props = {
   messages: Message[]
};
export const LogWindow = ({messages}: Props) => {
    return (
        <div className="fixed w-3/4 bottom-10 left-1/2 -translate-x-1/2 flex justify-center">
            <div className="h-40 w-full rounded shadow-2xl p-2 grid grid-cols-10 overflow-y-auto bg-slate-300">
                    {messages.map((m) => (
                        <>
                            <div className="col-span-3 text-slate-600 font-bold">
                                {m.datetime.toISOString()}
                            </div>
                            <div className="col-span-7">
                                {m.message}
                            </div>
                        </>
                    ))}
            </div>
        </div>
    );
};