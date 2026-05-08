'use client';

import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2 } from 'lucide-react';

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
    // Generate Filename: Presupuesto-Nombre-DDMM.pdf
    const getFileName = () => {
        const name = data.client.name ? data.client.name.split(' ')[0] : 'Cliente';
        // Use client date (event date) as requested "fecha sea 19/02..."
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
            <div className="flex-1 overflow-hidden">
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
                    <PresupuestoPdf data={data} />
                </PDFViewer>
            </div>
        </div>
    );
}