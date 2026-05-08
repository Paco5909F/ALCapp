'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2, Eye } from 'lucide-react';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">Cargando visor PDF...</div>,
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
    const [isMobile, setIsMobile] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(isTouchDevice || isSmallScreen);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getFileName = () => {
        const name = data.client.name ? data.client.name.split(' ')[0] : 'Cliente';
        const dateDate = data.client.date ? new Date(data.client.date + 'T12:00:00') : new Date();
        const day = dateDate.getDate().toString().padStart(2, '0');
        const month = (dateDate.getMonth() + 1).toString().padStart(2, '0');
        return `Presupuesto-${name}-${day}${month}.pdf`;
    };

    return (
        <div className="h-full w-full bg-gray-100 border-l border-gray-200 relative flex flex-col">
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm z-10">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vista Previa</h3>
                <PDFDownloadLink
                    document={<PresupuestoPdf data={data} />}
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
            <div className="flex-1 overflow-hidden relative">
                {isMobile && !showViewer ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                        <Eye size={48} className="mb-4 text-slate-400" />
                        <p className="text-sm font-medium mb-2">Vista previa no disponible en móvil</p>
                        <p className="text-xs text-slate-400">Usa el botón "Descargar PDF" para ver el documento</p>
                        <button
                            onClick={() => setShowViewer(true)}
                            className="mt-4 px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded transition"
                        >
                            Probar visor
                        </button>
                    </div>
                ) : (
                    <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
                        <PresupuestoPdf data={data} />
                    </PDFViewer>
                )}
            </div>
        </div>
    );
}