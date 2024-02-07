type Props = {
    value: string | number
    label: string
    id: string
    type?: string
    placeholder?: string

    max?: number
    min?: number

    disabled?: boolean

    callback: (val: string | number) => void
};
export const InputBox = ({ label, id, placeholder, type, callback, value, max, min, disabled }: Props) => {


    return (
        <div className="flex gap-x-1 items-center">
            <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900 align-middle">
                {label}
            </label>
            <input
                value={value}
                type={type ? type : "text"}
                name={id}
                id={id}
                max={max}
                min={min}
                disabled={disabled}
                className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900
                        ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={placeholder}
                onChange={event => callback(event.target.value)}
            />
        </div>
    );
};