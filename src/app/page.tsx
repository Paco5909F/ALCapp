'use client';

import { useState } from 'react';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
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
        micCable: 0,
        micWireless: 0,
        iluminacion: false,
        karaoke: false,
    },
};

export default function Home() {
    const [data, setData] = useState<BudgetData>(INITIAL_DATA);

    return (
        <main className="flex flex-col md:flex-row h-screen overflow-hidden">
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
