'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2 } from 'lucide-react';

// react-pdf core imports
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(1);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                // Sin margen extra, toma el 100% del contenedor disponible
                setContainerWidth(entries[0].contentRect.width); 
            }
        });
        
        if (containerRef.current) {
            observer.observe(containerRef.current);
            setContainerWidth(containerRef.current.clientWidth);
        }
        
        return () => observer.disconnect();
    }, []);

    const getFileName = () => {
        const name = data?.client?.name ? data.client.name.split(' ')[0] : 'Cliente';
        const dateDate = data?.client?.date ? new Date(data.client.date + 'T12:00:00') : new Date();
        const day = dateDate.getDate().toString().padStart(2, '0');
        const month = (dateDate.getMonth() + 1).toString().padStart(2, '0');
        return `Presupuesto-${name}-${day}${month}.pdf`;
    };

    return (
        <div className="h-full w-full bg-[var(--background)] relative flex flex-col">
            <div className="glass-panel border-b border-[var(--border)] p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 z-10">
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Vista Previa</h3>
                <PDFDownloadLink
                    document={<PresupuestoPdf data={data} />}
                    fileName={getFileName()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 btn-premium"
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
            
            {/* Visor Único (react-pdf) para Desktop y Mobile, solucionando zoom y renderizado en todas las plataformas */}
            <div className="flex-1 w-full h-full relative bg-[var(--background)] flex flex-col p-2 sm:p-8 overflow-y-auto" ref={containerRef}>
                <div className="w-full min-h-[50vh] flex flex-col items-center justify-start pb-20">
                    <BlobProvider document={<PresupuestoPdf data={data} />}>
                        {({ url, loading, error }) => {
                            if (error) {
                                return <div className="text-red-500 text-sm p-4 text-center">Error al generar PDF: {error.message}</div>;
                            }
                            if (loading || !url) {
                                return (
                                    <div className="flex items-center justify-center min-h-[50vh] flex-col text-[var(--text-muted)] w-full">
                                        <Loader2 size={32} className="animate-spin mb-4 text-blue-500/50" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Renderizando Documento...</span>
                                    </div>
                                );
                            }
                            return (
                                <div className="bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col items-center" style={{ width: containerWidth ? `${containerWidth}px` : 'auto' }}>
                                    <Document 
                                        file={url} 
                                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                        loading={
                                            <div className="flex items-center justify-center h-[500px] flex-col text-[var(--text-muted)] w-full">
                                                <Loader2 size={32} className="animate-spin mb-4 text-blue-500/50" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Cargando Visualizador...</span>
                                            </div>
                                        }
                                    >
                                        {Array.from(new Array(numPages), (el, index) => (
                                            <div key={`page_${index + 1}`} className={index > 0 ? "border-t border-gray-200 pt-2 mt-2 w-full flex justify-center" : "w-full flex justify-center"}>
                                                <Page 
                                                    pageNumber={index + 1} 
                                                    width={containerWidth ? containerWidth - 2 : undefined} 
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                    className="max-w-full"
                                                />
                                            </div>
                                        ))}
                                    </Document>
                                </div>
                            );
                        }}
                    </BlobProvider>
                </div>
            </div>
        </div>
    );
}