'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2 } from 'lucide-react';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center h-full bg-yellow-100 text-yellow-800 gap-3 p-8">
                <Loader2 size={32} className="animate-spin text-yellow-600" />
                <span className="text-sm font-bold">CARGANDO VISOR...</span>
                <p className="text-xs">Si esto no desaparece, el visor no funciona</p>
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
    const [forceViewer, setForceViewer] = useState(false);
    const [width, setWidth] = useState(0);

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

    if (isMobile && !forceViewer) {
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
                        Ancho de pantalla: {width}px
                    </p>
                    <p className="text-xs text-gray-500 mb-6">
                        El visor PDF no funciona en dispositivos móviles reales.
                    </p>
                    <button
                        onClick={() => setForceViewer(true)}
                        className="px-6 py-3 text-base font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        PROBAR VISOR IGUAL
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-blue-100 border-l border-blue-300 relative flex flex-col">
            <div className="bg-white border-b border-blue-200 p-3 flex justify-between items-center shadow-sm z-10">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Vista Previa ({width}px)</h3>
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