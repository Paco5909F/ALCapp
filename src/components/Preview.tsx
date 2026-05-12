'use client';

import { useState, useEffect, useDeferredValue } from 'react';
import dynamic from 'next/dynamic';
import { BudgetData } from '@/types';
import { PresupuestoPdf } from './pdf/Documento';
import { Download, Loader2 } from 'lucide-react';

import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer';

interface PreviewProps {
    data: BudgetData;
}

export default function Preview({ data }: PreviewProps) {
    const deferredData = useDeferredValue(data);
    const getFileName = () => {
        const name = data?.client?.name ? data.client.name.split(' ')[0] : 'Cliente';
        const dateDate = data?.client?.date ? new Date(data.client.date + 'T12:00:00') : new Date();
        const day = dateDate.getDate().toString().padStart(2, '0');
        const month = (dateDate.getMonth() + 1).toString().padStart(2, '0');
        return `Presupuesto-${name}-${day}${month}.pdf`;
    };

    return (
        <div className="h-full w-full bg-gray-100 border-l border-gray-200 relative flex flex-col">
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm z-10">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vista Previa</h3>
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
            <div className="flex-1 overflow-hidden w-full h-full relative">
                {/* Usamos BlobProvider manual con key para forzar la recarga del iframe y evitar el bug de Safari iOS/Móvil */}
                <BlobProvider document={<PresupuestoPdf data={deferredData} />}>
                    {({ url, loading, error }) => {
                        if (error) {
                            return <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">Error al generar PDF: {error.message}</div>;
                        }
                        if (loading || !url) {
                            return (
                                <div className="flex items-center justify-center h-full flex-col text-gray-500">
                                    <Loader2 size={24} className="animate-spin mb-2 text-blue-500" />
                                    <span className="text-sm">Generando vista previa...</span>
                                </div>
                            );
                        }
                        return (
                            <div className="w-full h-full flex flex-col">
                                <div className="flex-1 relative bg-white border border-gray-200">
                                    <iframe 
                                        key={url} 
                                        src={url} 
                                        className="w-full h-full border-none" 
                                        title="Vista Previa PDF"
                                    />
                                </div>
                                {/* Mobile Fallback Button */}
                                <div className="md:hidden p-4 bg-white border-t border-gray-200 flex justify-center">
                                    <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-bold text-center flex items-center justify-center gap-2"
                                    >
                                        <Download size={20} />
                                        VER PDF EN PANTALLA COMPLETA
                                    </a>
                                </div>
                            </div>
                        );
                    }}
                </BlobProvider>
            </div>
        </div>
    );
}