type Props = {
    disabled?: boolean | true
};
export const Explorer = ({disabled}: Props) => {
    return (
        <div className={`w-full h-screen p-6 rounded rounded-2xl shadow-2xl border-sky-800 mt-10 ${disabled ? "bg-slate-50" : "bg-slate-200"}`}>

        </div>
    );
};