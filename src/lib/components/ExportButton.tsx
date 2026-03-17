import { useState } from 'react';
import { EllipsisVertical } from 'lucide-react';

export const ExportButton = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative flex items-center">
            <div className="flex items-center gap-2 mr-2">
                <h1 className={`
                        px-1 py-1 transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>Экспорт:</h1>
                <button
                    className={`
                        px-3 py-1 bg-black border border-black  text-white hover:bg-white hover:text-black rounded-lg shadow
                        transition-all duration-300
                        ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                    `}
                >
                    .XLSX
                </button>
                <button
                    className={`
                        px-3 py-1 bg-black border border-black text-white hover:bg-white hover:text-black rounded-lg shadow
                        transition-all duration-300 delay-75
                        ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                    `}
                >
                    .CSV
                </button>
                <button
                    className={`
                        px-3 py-1 bg-black border border-black text-white hover:bg-white hover:text-black rounded-lg shadow
                        transition-all duration-300 delay-75
                        ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                    `}
                >
                    .PDF
                </button>
            </div>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="hover:bg-gray-100 p-2 rounded-full z-10 bg-white"
            >
                <EllipsisVertical size={24} />
            </button>
        </div>
    );
};