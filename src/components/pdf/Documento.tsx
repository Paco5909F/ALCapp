/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { BudgetData, TechnicalRequirements } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';

const COLORS = {
    primary: '#000000',
    secondary: '#505050',
    accent: '#F0F0F0',
    border: '#000000',
    text: '#141414',
    textLight: '#646464',
};

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: COLORS.text,
        lineHeight: 1.3,
    },

    // --- HEADER ---
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        height: 80,
    },
    logoSection: {
        flexDirection: 'row',
        width: '60%',
        alignItems: 'center',
    },
    logoImage: {
        width: 75,
        height: 75,
        marginRight: 20,
        flexShrink: 0,
    },
    companyDetails: {
        justifyContent: 'center',
        minHeight: 60,
    },
    companyName: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    companySub: {
        fontSize: 8,
        color: COLORS.text,
        marginBottom: 2,
    },

    // --- BOX: PRECIO / FECHA ---
    docBox: {
        width: 180,
        height: 75,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    docTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    docSubtitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 10,
    },
    docDate: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },

    // --- SECTIONS ---
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#FFF',
        paddingRight: 5,
        textTransform: 'uppercase',
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },

    // --- DATA GRIDS ---
    dataBox: {
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flexDirection: 'column',
        width: '48%',
    },
    fieldContainer: {
        marginBottom: 6,
    },
    fieldLabel: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.primary,
    },

    // --- TABLE ---
    tableContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#333333',
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableHeaderCell: {
        color: '#FFF',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 9,
        color: '#333',
        fontFamily: 'Helvetica',
    },

    // Columns
    colConcepto: { width: '40%', textAlign: 'left', paddingLeft: 4 },
    colCant: { width: '15%', textAlign: 'center' },
    colUnidad: { width: '15%', textAlign: 'center' },
    colPrecio: { width: '15%', textAlign: 'right' },
    colTotal: { width: '15%', textAlign: 'right', fontFamily: 'Helvetica-Bold', paddingRight: 4 },

    // --- TOTALS ---
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalBox: {
        width: 200,
        backgroundColor: COLORS.accent,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    totalValue: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
    },

    // --- FOOTER ---
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 5,
    },
    footerText: {
        fontSize: 6,
        color: COLORS.textLight,
        marginBottom: 2,
    }
});

// End of styles

interface PresupuestoPdfProps {
    data: BudgetData;
}

export const PresupuestoPdf: React.FC<PresupuestoPdfProps> = ({ data }) => {
    if (!data) {
        return (
            <Document>
                <Page size="A4" style={{ padding: 40 }}>
                    <Text>Cargando...</Text>
                </Page>
            </Document>
        );
    }

    const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    // Helper to parse "YYYY-MM-DD" or use today
    const parseDate = (dateStr?: string) => {
        if (!dateStr) return new Date();
        // HTML5 date input gives YYYY-MM-DD
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return new Date();
    };

    const emissionDate = parseDate(data.client.emissionDate);
    const validUntil = new Date(emissionDate);
    validUntil.setDate(emissionDate.getDate() + (data.client.validityDays || 15));

    const formatRequirements = (reqs?: TechnicalRequirements) => {
        if (!reqs) return '';
        const parts = [];
        if (reqs.parlantes > 0) parts.push(`${reqs.parlantes} ${reqs.parlantes === 1 ? 'Parlante' : 'Parlantes'}`);
        if (reqs.retornos > 0) parts.push(`${reqs.retornos} ${reqs.retornos === 1 ? 'Retorno' : 'Retornos'}`);
        if (reqs.potencia > 0) parts.push(`${reqs.potencia} ${reqs.potencia === 1 ? 'Potencia' : 'Potencias'}`);
        if (reqs.micCable > 0) parts.push(`${reqs.micCable} Mic. Cable`);
        if (reqs.micWireless > 0) parts.push(`${reqs.micWireless} Mic. Inal.`);

        const ilumMap: Record<string, string> = {
            'basica': 'Ilum. Básica',
            'media': 'Ilum. Media',
            'completa': 'Ilum. Completa',
            'torre_chica': 'Ilum. Torre Chica',
            'torre_media': 'Ilum. Torre Media',
            'estruct_grande': 'Ilum. Estructura Grande'
        };
        if (reqs.iluminacion && reqs.iluminacion !== 'ninguna') {
            parts.push(ilumMap[reqs.iluminacion] || 'Ilum. Gral');
        }

        if (reqs.consola && reqs.consola !== 'ninguna') {
            const consolaMap: Record<string, string> = {
                '8ch': '8 Canales',
                '12ch': '12 Canales',
                '32ch': '32 Canales'
            };
            parts.push(`Consola ${consolaMap[reqs.consola] || reqs.consola}`);
        }

        if (reqs.karaoke) parts.push('Karaoke');
        return parts.join(', ');
    };

    return (
        <Document
            title={`Presupuesto ${data.client.name || ''}`}
            author="Joaquín Rosas"
            subject="Sistema desarrollado por Joaquín Rosas"
            creator="Sistema desarrollado por Joaquín Rosas"
            producer="Desarrollado por Joaquín Rosas"
            keywords="Joaquín Rosas, Presupuesto, ALC Sonido"
        >
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoSection}>
                        <Image src="/images/logo.png" style={styles.logoImage} />
                        <View style={styles.companyDetails}>
                            <Text style={styles.companyName}>
                                ALC SONIDO EVENTOS
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#000' }}>
                                Blanco Laura
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#000', marginBottom: 2 }}>
                                O&apos;Higgins, Buenos Aires
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#000' }}>
                                Tel: 2364 - 608008 | Email: alcproducciones@gmail.com
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.docBox, { height: 75, justifyContent: 'space-between', paddingVertical: 10 }]}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>PRESUPUESTO</Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>OFICIAL</Text>
                        </View>
                        <View style={{ alignItems: 'flex-start', width: '100%', paddingLeft: 10 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>FECHA DE EMISIÓN: {emissionDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>VÁLIDO HASTA: {validUntil.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
                        </View>
                    </View>
                </View>

                {/* Client Info Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
                    <View style={styles.sectionLine} />
                </View>

                <View style={[styles.dataBox, { marginBottom: 5 }]}>
                    <View style={[styles.column, { width: '100%', flexDirection: 'row', justifyContent: 'space-between' }]}>
                        <View style={{ width: '60%' }}>
                            <Text style={styles.fieldLabel}>RAZÓN SOCIAL / NOMBRE</Text>
                            <Text style={styles.fieldValue}>{data.client.name || '-'}</Text>
                        </View>
                        <View style={{ width: '35%' }}>
                            <Text style={styles.fieldLabel}>CONDICIÓN IVA</Text>
                            <Text style={styles.fieldValue}>CONSUMIDOR FINAL</Text>
                        </View>
                    </View>
                </View>

                {/* Event Info Section - Reseparated */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>DETALLES DEL EVENTO</Text>
                    <View style={styles.sectionLine} />
                </View>

                <View style={styles.dataBox}>
                    <View style={[styles.column, { width: '100%', flexDirection: 'row', justifyContent: 'space-between' }]}>
                        <View style={{ width: '25%' }}>
                            <Text style={styles.fieldLabel}>FECHA</Text>
                            <Text style={styles.fieldValue}>{formatDate(data.client.date) || '-'}</Text>
                        </View>
                        <View style={{ width: '30%' }}>
                            <Text style={styles.fieldLabel}>TIPO</Text>
                            <Text style={styles.fieldValue}>{data.client.eventType || '-'}</Text>
                        </View>
                        <View style={{ width: '40%' }}>
                            <Text style={styles.fieldLabel}>HORARIO</Text>
                            <Text style={styles.fieldValue}>
                                {data.client.eventTime || '-'}
                                {data.client.eventEndTime ? ` - ${data.client.eventEndTime}` : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Requirements Table (Visible only if NO Logistics) */}
                {(!data.logistics || data.logistics.length === 0) && data.requirements && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>REQUERIMIENTOS TÉCNICOS</Text>
                            <View style={styles.sectionLine} />
                        </View>
                        <View style={styles.tableContainer}>
                            <View style={[styles.tableHeader, {
                                backgroundColor: '#000000',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                paddingVertical: 10
                            }]}>
                                <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Parlantes</Text>
                                <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Retornos</Text>
                                <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Potencias</Text>
                                <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Mic. Cable</Text>
                                <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Mic. Inal.</Text>
                                <Text style={[styles.tableHeaderCell, { width: data.requirements.karaoke ? '15%' : '25%' }]}>Iluminación</Text>
                                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Consola</Text>
                                {data.requirements.karaoke && (
                                    <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Karaoke</Text>
                                )}
                            </View>
                            <View style={{
                                borderWidth: 1,
                                borderColor: '#000000',
                                borderTopWidth: 0,
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                                overflow: 'hidden'
                            }}>
                                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                                    <Text style={[styles.tableCell, { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.parlantes}</Text>
                                    <Text style={[styles.tableCell, { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.retornos || 0}</Text>
                                    <Text style={[styles.tableCell, { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.potencia}</Text>
                                    <Text style={[styles.tableCell, { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.micCable}</Text>
                                    <Text style={[styles.tableCell, { width: '12%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.micWireless}</Text>
                                    <Text style={[styles.tableCell, { width: data.requirements.karaoke ? '15%' : '25%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000', fontSize: 8 }]}>
                                        {data.requirements.iluminacion === 'ninguna' ? '-' : (
                                            (data.requirements.karaoke ? {
                                                'basica': 'Básica',
                                                'media': 'Media',
                                                'completa': 'Completa',
                                                'torre_chica': 'Torre Chica',
                                                'torre_media': 'Torre Media',
                                                'estruct_grande': 'Estruc. Grande'
                                            } : {
                                                'basica': 'Básica',
                                                'media': 'Media',
                                                'completa': 'Completa',
                                                'torre_chica': 'Torre Chica',
                                                'torre_media': 'Torre Media',
                                                'estruct_grande': 'Estructura Grande'
                                            })[data.requirements.iluminacion as string] || '-'
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { width: '15%', textAlign: 'center', borderRightWidth: data.requirements.karaoke ? 1 : 0, borderRightColor: '#000000', fontSize: 8 }]}>
                                        {data.requirements.consola === 'ninguna' ? '-' : (
                                            {
                                                '8ch': '8 Canales',
                                                '12ch': '12 Canales',
                                                '32ch': '32 Canales'
                                            }[data.requirements.consola as string] || data.requirements.consola
                                        )}
                                    </Text>
                                    {data.requirements.karaoke && (
                                        <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>Sí</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* Logistics Table */}
                {data.logistics && data.logistics.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>LOGÍSTICA Y UBICACIONES</Text>
                            <View style={styles.sectionLine} />
                        </View>
                        <View style={styles.tableContainer}>
                            <View style={[styles.tableHeader, {
                                backgroundColor: '#000000',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                paddingVertical: 0,
                                paddingHorizontal: 0,
                                alignItems: 'stretch'
                            }]}>
                                <View style={{ width: '25%', borderRightWidth: 1, borderRightColor: '#FFFFFF', paddingVertical: 10, paddingLeft: 14 }}>
                                    <Text style={[styles.tableHeaderCell, { textAlign: 'left' }]}>UBICACIÓN / LUGAR</Text>
                                </View>
                                <View style={{ width: '50%', borderRightWidth: 1, borderRightColor: '#FFFFFF', paddingVertical: 10, paddingLeft: 12 }}>
                                    <Text style={[styles.tableHeaderCell, { textAlign: 'left' }]}>DETALLE / EQUIPAMIENTO</Text>
                                </View>
                                <View style={{ width: '25%', paddingVertical: 10, paddingLeft: 12 }}>
                                    <Text style={[styles.tableHeaderCell, { textAlign: 'left' }]}>OBSERVACIONES</Text>
                                </View>
                            </View>
                            <View style={{
                                borderWidth: 1,
                                borderColor: '#000000',
                                borderTopWidth: 0,
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                                overflow: 'hidden'
                            }}>
                                {data.logistics.map((item, index) => (
                                    <View key={item.id} style={[styles.tableRow, {
                                        borderBottomWidth: index === data.logistics!.length - 1 ? 0 : 1,
                                        alignItems: 'stretch',
                                        paddingVertical: 0,
                                        paddingHorizontal: 0,
                                        position: 'relative'
                                    }]}>
                                        <View style={{ width: '25%', paddingVertical: 10, paddingLeft: 14, paddingRight: 10 }}>
                                            <Text style={[styles.tableCell, { textAlign: 'left' }]}>{item.location}</Text>
                                        </View>


                                        <View style={{ width: '50%', paddingVertical: 10, paddingLeft: 12, paddingRight: 4 }}>
                                            <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>
                                                {formatRequirements(item.requirements)}
                                            </Text>
                                        </View>


                                        <View style={{ width: '25%', paddingVertical: 10, paddingLeft: 12, paddingRight: 4 }}>
                                            <Text style={[styles.tableCell, { color: '#000' }]}>
                                                {item.details || '-'}
                                            </Text>
                                        </View>

                                        {/* Floating Separators (Absolute Positioned Overlay) */}
                                        <View style={{ position: 'absolute', left: '25%', top: '15%', bottom: '15%', width: 1, backgroundColor: '#000000' }} />
                                        <View style={{ position: 'absolute', left: '75%', top: '15%', bottom: '15%', width: 1, backgroundColor: '#000000' }} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}

                {/* Items Table (Moved down) */}
                {/* Items Table (Moved down) - Only show if there are items */}


                {/* Totals */}
                <View style={styles.totalContainer}>
                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>TOTAL:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.customTotal !== undefined ? data.customTotal : total)}</Text>
                    </View>
                </View>

                {/* Observations */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
                    <View style={styles.sectionLine} />
                </View>
                <View style={[styles.dataBox, { minHeight: 40 }]}>
                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica' }}>
                        {data.client.conditions || 'Sin observaciones adicionales.'}
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Documento generado electrónicamente por el sistema de gestión de ALC PRODUCCIONES.
                    </Text>
                    <Text style={styles.footerText}>
                        Este documento no es válido como factura. Los precios pueden variar sin previo aviso una vez vencido el plazo de validez.
                    </Text>
                </View>

            </Page>

            {/* Terms and Conditions Page - Structured */}
            <Page size="A4" style={styles.page}>
                {/* Standard Header (Logo Left) */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoSection}>
                        <Image src="/images/logo.png" style={styles.logoImage} />
                        <View style={styles.companyDetails}>
                            <Text style={styles.companyName}>
                                ALC SONIDO EVENTOS
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#000', marginBottom: 2 }}>
                                TÉRMINOS Y CONDICIONES
                            </Text>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica', color: COLORS.textLight }}>
                                CONDICIONES GENERALES DEL SERVICIO
                            </Text>
                        </View>
                    </View>
                    {/* Optional: Add Date/Validity box if needed, or leave empty for clean look */}
                    {/* Optional: Add Date/Validity box if needed, or leave empty for clean look */}
                    <View style={{ justifyContent: 'center', alignItems: 'flex-end', width: '40%' }}>
                    </View>
                </View>

                {/* Title Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>CONDICIONES DEL SERVICIO</Text>
                    <View style={styles.sectionLine} />
                </View>

                {/* Structured Content */}
                <View style={{ marginTop: 10, flexDirection: 'column', gap: 12 }}>

                    {/* Item 1 */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <Text style={{ width: 20, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>1.</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2, textTransform: 'uppercase' }}>CONFIRMACIÓN Y PAGO</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#333' }}>
                                La fecha del evento queda confirmada únicamente con el pago acordado. El servicio deberá estar abonado en su totalidad antes del inicio del evento.
                            </Text>
                        </View>
                    </View>

                    {/* Item 2 */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <Text style={{ width: 20, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>2.</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2, textTransform: 'uppercase' }}>POLÍTICA DE CANCELACIÓN</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#333' }}>
                                En caso de cancelación por parte del cliente, no se realizan reintegros de dinero. Solo se podrá optar por una reprogramación de la fecha sujeta a la disponibilidad de la empresa.
                            </Text>
                        </View>
                    </View>

                    {/* Item 3 */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <Text style={{ width: 20, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>3.</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2, textTransform: 'uppercase' }}>CUIDADO DEL EQUIPAMIENTO</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#333' }}>
                                El cuidado de los equipos instalados y el respeto hacia el personal técnico son condición indispensable para la permanencia y continuidad del servicio durante el evento.
                            </Text>
                        </View>
                    </View>

                    {/* Item 4 */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <Text style={{ width: 20, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>4.</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2, textTransform: 'uppercase' }}>SEGURIDAD Y CLIMA</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#333' }}>
                                Las condiciones climáticas adversas (en eventos al aire libre) o situaciones de inseguridad que pongan en riesgo el equipamiento o al personal pueden implicar la suspensión momentánea o el desmontaje total del servicio.
                            </Text>
                        </View>
                    </View>

                    {/* Item 5 */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <Text style={{ width: 20, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>5.</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 2, textTransform: 'uppercase' }}>CONDICIONES ESPECIALES</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#333' }}>
                                Cualquier requerimiento especial como traslados fuera de zona, conexión de bandas en vivo, o uso del sistema de sonido por terceros debe ser consultado y aprobado previamente.
                            </Text>
                        </View>
                    </View>

                </View>

                {/* Footer for Terms Page */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Documento generado electrónicamente por el sistema de gestión de ALC PRODUCCIONES
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
