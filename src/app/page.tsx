'use client';

import { useState } from 'react';
import Editor from '@/components/Editor';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Preview = dynamic(() => import('@/components/Preview'), { ssr: false });
import { BudgetData } from '@/types';

const INITIAL_DATA: BudgetData = {
    client: {
        name: '',
        date: '', // Initialize empty to avoid hydration mismatch
        conditions: '',
        eventType: '',
        eventTime: '',
        emissionDate: '', // Initialize empty
        validityDays: 15,
    },
    items: [],
    requirements: {
        parlantes: 0,
        potencia: 0,
        retornos: 0,
        micCable: 0,
        micWireless: 0,
        iluminacion: 'ninguna',
        consola: 'ninguna',
        karaoke: false,
    },
};

export default function Home() {
    const router = useRouter();
    const [data, setData] = useState<BudgetData>(INITIAL_DATA);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/login');
        router.refresh();
    };

    return (
        <main className="flex flex-col md:flex-row h-screen overflow-hidden relative">
            <button
                type="button"
                onClick={handleLogout}
                className="absolute top-3 right-3 z-20 bg-slate-800 text-white border border-slate-600 rounded-md px-3 py-1 text-sm hover:bg-slate-700"
            >
                Cerrar sesión
            </button>
            {/* Left / Top Panel: Editor */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden border-r border-gray-200">
                <Editor data={data} onChange={setData} />
            </div>

            {/* Right / Bottom Panel: Preview */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden bg-gray-100">
                <Preview data={data} />
            </div>
        </main>
    );
}
