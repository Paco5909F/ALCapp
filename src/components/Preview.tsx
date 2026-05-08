'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2, Eye, EyeOff } from 'lucide-react';

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

function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'iphone', 'ipad', 'mobile', 'tablet'];
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    return (isMobileUA || isTouchDevice) && isSmallScreen;
}

export default function Preview({ data }: PreviewProps) {
    const [isMobile, setIsMobile] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [forceViewer, setForceViewer] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsMobile(isMobileDevice());
    }, []);

    const getFileName = () => {
        const name = data?.client?.name ? data.client.name.split(' ')[0] : 'Cliente';
        const dateDate = data?.client?.date ? new Date(data.client.date + 'T12:00:00') : new Date();
        const day = dateDate.getDate().toString().padStart(2, '0');
        const month = (dateDate.getMonth() + 1).toString().padStart(2, '0');
        return `Presupuesto-${name}-${day}${month}.pdf`;
    };

    const showFallback = mounted && isMobile && !forceViewer;

    if (showFallback) {
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
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <Eye size={48} className="mb-4 text-slate-400" />
                    <p className="text-sm font-medium text-gray-600 mb-2">
                        Vista previa no disponible en móvil
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                        Usá el botón "Descargar PDF" para ver el documento
                    </p>
                    <button
                        onClick={() => setForceViewer(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded transition"
                    >
                        <EyeOff size={16} />
                        Probar visor
                    </button>
                </div>
            </div>
        );
    }

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
            <div className="flex-1 overflow-hidden">
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
                    <PresupuestoPdf data={data} />
                </PDFViewer>
            </div>
        </div>
    );
}