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
    const [isVerifying, setIsVerifying] = useState(false);

    const handleLogout = async () => {
        setIsVerifying(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.replace('/login');
            router.refresh();
        } catch (error) {
            console.error('Error during logout:', error);
            setIsVerifying(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <main className="flex flex-col md:flex-row h-screen overflow-hidden relative bg-[#05070a]">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Left / Top Panel: Editor */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden border-r border-white/5 relative z-10">
                <Editor data={data} onChange={setData} onLogout={handleLogout} />
            </div>

            {/* Right / Bottom Panel: Preview */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden bg-slate-900/40 backdrop-blur-sm relative z-10">
                <Preview data={data} />
            </div>
        </main>
    );
}
