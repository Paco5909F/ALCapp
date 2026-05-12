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
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

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
            <div className="h-screen w-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="flex flex-col h-[100dvh] overflow-hidden relative bg-[var(--background)] font-sans max-w-full overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Mobile Tabs Header */}
            <div className="md:hidden flex w-full bg-[var(--background)] backdrop-blur-md border-b border-[var(--border)] z-20 shrink-0">
                <button 
                    onClick={() => setActiveTab('editor')}
                    className={`flex-1 py-3 text-[10px] font-black tracking-wider uppercase transition-colors whitespace-nowrap ${activeTab === 'editor' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[var(--text-muted)] hover:text-slate-300'}`}
                >
                    Editor
                </button>
                <button 
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-3 text-[10px] font-black tracking-wider uppercase transition-colors whitespace-nowrap ${activeTab === 'preview' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-[var(--text-muted)] hover:text-slate-300'}`}
                >
                    Vista Previa
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 w-full h-full max-w-full overflow-x-hidden">
                {/* Left Panel: Editor */}
                <div className={`w-full md:w-1/2 h-full overflow-hidden border-r border-white/5 ${activeTab === 'editor' ? 'block' : 'hidden md:block'}`}>
                    <Editor data={data} onChange={setData} onLogout={handleLogout} />
                </div>

                {/* Right Panel: Preview */}
                <div className={`w-full md:w-1/2 h-full overflow-hidden bg-[var(--background)] ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
                    <Preview data={data} />
                </div>
            </div>
        </main>
    );
}
