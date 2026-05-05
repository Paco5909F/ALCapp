'use client';

import { useDeferredValue, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2 } from 'lucide-react';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400 gap-3">
                <Loader2 size={24} className="animate-spin text-blue-500" />
                <span className="text-sm font-medium">Preparando visor de PDF...</span>
            </div>
        ),
    }
);

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

interface PreviewProps {
    data: BudgetData;
}

export default function Preview({ data }: PreviewProps) {
    // Use deferred value to prevent crashes during typing
    const deferredData = useDeferredValue(data);

    // Safety: check if we are on client
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Generate Filename: Presupuesto-Nombre-DDMM.pdf
    const getFileName = () => {
        const name = deferredData.client.name ? deferredData.client.name.split(' ')[0] : 'Cliente';
        const dateDate = deferredData.client.date ? new Date(deferredData.client.date + 'T12:00:00') : new Date();
        const day = dateDate.getDate().toString().padStart(2, '0');
        const month = (dateDate.getMonth() + 1).toString().padStart(2, '0');
        return `Presupuesto-${name}-${day}${month}.pdf`;
    };

    if (!isClient) return null;

    return (
        <div className="h-full w-full bg-slate-200 border-l border-slate-300 relative flex flex-col">
            <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center shadow-sm z-10">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Vista Previa</h3>
                <PDFDownloadLink
                    document={<PresupuestoPdf data={deferredData} />}
                    fileName={getFileName()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition shadow-sm"
                >
                    {({ loading }) => (
                        loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                Descargar PDF
                            </>
                        )
                    )}
                </PDFDownloadLink>
            </div>
            <div className="flex-1 bg-slate-300 relative overflow-hidden">
                <PDFViewer style={{ width: '100%', height: '100%', minHeight: '500px', border: 'none' }} showToolbar={false}>
                    <PresupuestoPdf data={deferredData} />
                </PDFViewer>
            </div>
        </div>
    );
}
