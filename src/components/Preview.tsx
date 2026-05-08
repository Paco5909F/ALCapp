'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2 } from 'lucide-react';

const BlobProvider = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.BlobProvider),
    { ssr: false }
);

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

interface PreviewProps {
    data: BudgetData;
}

export default function Preview({ data }: PreviewProps) {
    const [forceViewer, setForceViewer] = useState(false);
    const [width, setWidth] = useState(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        const updateWidth = () => setWidth(window.innerWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const isMobile = width < 768;
    const getFileName = () => {
        const name = data?.client?.name ? data.client.name.split(' ')[0] : 'Cliente';
        const dateDate = data?.client?.date ? new Date(data.client.date + 'T12:00:00') : new Date();
        const day = dateDate.getDate().toString().padStart(2, '0');
        const month = (dateDate.getMonth() + 1).toString().padStart(2, '0');
        return `Presupuesto-${name}-${day}${month}.pdf`;
    };

    if (isMobile && !pdfUrl) {
        return (
            <div className="h-full w-full bg-red-500 border-l border-red-700 relative flex flex-col">
                <div className="bg-white border-b border-red-200 p-3 flex justify-between items-center shadow-sm z-10">
                    <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">Vista Previa</h3>
                    <PDFDownloadLink
                        document={<PresupuestoPdf data={data} />}
                        fileName={getFileName()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition shadow-sm"
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
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-xl font-bold text-gray-800 mb-2">
                        MODO MÓVIL
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        Ancho: {width}px
                    </p>
                    <BlobProvider document={<PresupuestoPdf data={data} />}>
                        {({ url }) => {
                            if (url) {
                                setPdfUrl(url);
                            }
                            return null;
                        }}
                    </BlobProvider>
                    <button
                        onClick={() => {
                            setForceViewer(true);
                        }}
                        className="px-6 py-3 text-base font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        ABRIR EN PESTAÑA
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-blue-100 border-l border-blue-300 relative flex flex-col">
            <div className="bg-white border-b border-blue-200 p-3 flex justify-between items-center shadow-sm z-10">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Vista Previa</h3>
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
                {forceViewer && pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                        <p className="text-sm font-medium text-gray-600">Generando PDF...</p>
                    </div>
                )}
            </div>
        </div>
    );
}