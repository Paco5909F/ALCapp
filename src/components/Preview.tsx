'use client';

import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2 } from 'lucide-react';

const BlobProvider = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.BlobProvider),
    {
        ssr: false,
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
    const getFileName = () => {
        const name = data?.client?.name ? data.client.name.split(' ')[0] : 'Cliente';
        const dateDate = data?.client?.date ? new Date(data.client.date + 'T12:00:00') : new Date();
        const day = dateDate.getDate().toString().padStart(2, '0');
        const month = (dateDate.getMonth() + 1).toString().padStart(2, '0');
        return `Presupuesto-${name}-${day}${month}.pdf`;
    };

    return (
        <div className="h-full w-full bg-[var(--background)] relative flex flex-col">
            <div className="glass-panel border-b border-[var(--border)] p-4 flex justify-between items-center z-10">
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Vista Previa</h3>
                <PDFDownloadLink
                    document={<PresupuestoPdf data={data} />}
                    fileName={getFileName()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 btn-premium"
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
            <div className="flex-1 overflow-hidden w-full h-full relative">
                {/* Usamos BlobProvider manual con key para forzar la recarga del iframe y evitar el bug de Safari iOS/Móvil */}
                <BlobProvider document={<PresupuestoPdf data={data} />}>
                    {({ url, loading, error }) => {
                        if (error) {
                            return <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">Error al generar PDF: {error.message}</div>;
                        }
                        if (loading || !url) {
                            return (
                                <div className="flex items-center justify-center h-full flex-col text-[var(--text-muted)]">
                                    <Loader2 size={32} className="animate-spin mb-4 text-blue-500/50" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Renderizando Documento...</span>
                                </div>
                            );
                        }
                        return (
                            <iframe 
                                key={url} 
                                src={`${url}#toolbar=0`} 
                                className="w-full h-full border-none" 
                                title="Vista Previa PDF"
                            />
                        );
                    }}
                </BlobProvider>
            </div>
        </div>
    );
}