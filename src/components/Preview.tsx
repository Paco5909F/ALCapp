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

const WhatsappIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.06-.301-.15-1.265-.464-2.409-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.098-.202.049-.382-.025-.532-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.246-.705.246-1.29.174-1.425-.075-.15-.274-.225-.576-.375z" />
        <path d="M12.003 2c-5.514 0-10 4.486-10 10 0 1.954.515 3.792 1.425 5.385l-1.425 5.216 5.34-1.4C8.905 21.685 10.422 22 12.003 22c5.514 0 10-4.486 10-10s-4.486-10-10-10zm0 18.39c-1.656 0-3.265-.429-4.685-1.24l-.335-.195-3.485.914.93-3.396-.21-.34A8.344 8.344 0 0 1 3.613 12c0-4.636 3.774-8.41 8.39-8.41 4.615 0 8.389 3.774 8.389 8.41s-3.774 8.41-8.389 8.41z" />
    </svg>
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
                
                <BlobProvider document={<PresupuestoPdf data={data} />}>
                    {({ blob, url, loading }) => (
                        <div className="flex gap-2 w-full sm:w-auto">
                            {/* Compartir por WhatsApp (Sólo Mobile) */}
                            <button
                                onClick={async () => {
                                    if (!blob) return;
                                    try {
                                        const file = new File([blob], getFileName(), { type: 'application/pdf' });
                                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                                            await navigator.share({
                                                files: [file],
                                                title: getFileName(),
                                            });
                                        } else {
                                            alert("Tu dispositivo no soporta compartir archivos directamente. Usa el botón Descargar.");
                                        }
                                    } catch (err) {
                                        console.error('Error al compartir:', err);
                                    }
                                }}
                                disabled={loading || !blob}
                                className="flex md:hidden flex-1 items-center justify-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl shadow-green-900/20 btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <WhatsappIcon size={16} />}
                                Enviar
                            </button>

                            {/* Descargar PDF */}
                            <a
                                href={url || '#'}
                                download={url ? getFileName() : undefined}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 btn-premium ${loading || !url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        Descargar PDF
                                    </>
                                )}
                            </a>
                        </div>
                    )}
                </BlobProvider>
            </div>
            
            {/* DESKTOP (md:flex) - Visor iframe nativo completo */}
            <div className="hidden md:flex flex-1 w-full h-full relative bg-[var(--background)] flex-col p-0 overflow-y-auto">
                <div className="w-full h-full min-h-[80vh] bg-white relative shrink-0">
                    <BlobProvider document={<PresupuestoPdf data={data} />}>
                        {({ url, loading, error }) => {
                            if (error) {
                                return <div className="text-red-500 text-sm p-4 text-center">Error al generar PDF: {error.message}</div>;
                            }
                            if (loading || !url) {
                                return (
                                    <div className="flex items-center justify-center h-full flex-col text-[var(--text-muted)] bg-[var(--background)]">
                                        <Loader2 size={32} className="animate-spin mb-4 text-blue-500/50" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Renderizando Documento...</span>
                                    </div>
                                );
                            }
                            return (
                                <iframe 
                                    key={url} 
                                    src={url} 
                                    className="absolute inset-0 w-full h-full border-none block" 
                                    title="Vista Previa PDF"
                                />
                            );
                        }}
                    </BlobProvider>
                </div>
            </div>

            {/* MOBILE (md:hidden) - Solución con react-pdf para encajar en pantalla */}
            <div className="flex md:hidden flex-1 w-full h-full relative bg-[var(--background)] flex-col p-2 overflow-y-auto" ref={containerRef}>
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