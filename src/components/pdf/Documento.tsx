/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { BudgetData } from '@/types';
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
    },
    logoImage: {
        width: 60,
        height: 60,
        marginRight: 10,
        marginTop: 5,
    },
    companyDetails: {
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 12,
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
        fontSize: 7,
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
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 9,
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

    const formatRequirements = (reqs?: any) => {
        if (!reqs) return '';
        const parts = [];
        if (reqs.parlantes > 0) parts.push(`${reqs.parlantes} Parlantes`);
        if (reqs.potencia > 0) parts.push(`${reqs.potencia} Potencia`);
        if (reqs.micCable > 0) parts.push(`${reqs.micCable} Mic. Cable`);
        if (reqs.micWireless > 0) parts.push(`${reqs.micWireless} Mic. Inal.`);
        if (reqs.iluminacion) parts.push('Iluminación');
        if (reqs.karaoke) parts.push('Karaoke');
        return parts.join(', ');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoSection}>
                        {/* Logo kept as it adds value, but layout adjusted to match text style of reference */}
                        <Image src="/images/logo.png" style={styles.logoImage} />
                        <View style={styles.companyDetails}>
                            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 4 }}>
                                ALC SONIDO EVENTOS
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#000' }}>
                                Blanco Laura
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#000', marginBottom: 2 }}>
                                O'Higgins, Buenos Aires
                            </Text>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#000' }}>
                                Tel: 2364 - 608008 | Email: alcproduccionescontacto@gmail.com
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.docBox, { height: 75, justifyContent: 'space-between', paddingVertical: 10 }]}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>PRESUPUESTO</Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>OFICIAL</Text>
                        </View>
                        <View style={{ alignItems: 'flex-start', width: '100%', paddingLeft: 10 }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>FECHA: {emissionDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
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
                        <View style={{ width: '30%' }}>
                            <Text style={styles.fieldLabel}>FECHA</Text>
                            <Text style={styles.fieldValue}>{formatDate(data.client.date) || '-'}</Text>
                        </View>
                        <View style={{ width: '30%' }}>
                            <Text style={styles.fieldLabel}>TIPO</Text>
                            <Text style={styles.fieldValue}>{data.client.eventType || '-'}</Text>
                        </View>
                        <View style={{ width: '30%' }}>
                            <Text style={styles.fieldLabel}>HORARIO</Text>
                            <Text style={styles.fieldValue}>{data.client.eventTime || '-'}</Text>
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
                                <Text style={[styles.tableHeaderCell, { width: '16%' }]}>Parlantes</Text>
                                <Text style={[styles.tableHeaderCell, { width: '16%' }]}>Potencia</Text>
                                <Text style={[styles.tableHeaderCell, { width: '16%' }]}>Mic. Cable</Text>
                                <Text style={[styles.tableHeaderCell, { width: '16%' }]}>Mic. Inalám.</Text>
                                <Text style={[styles.tableHeaderCell, { width: '16%' }]}>Iluminación</Text>
                                <Text style={[styles.tableHeaderCell, { width: '16%' }]}>Karaoke</Text>
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
                                    <Text style={[styles.tableCell, { width: '16%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.parlantes}</Text>
                                    <Text style={[styles.tableCell, { width: '16%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.potencia}</Text>
                                    <Text style={[styles.tableCell, { width: '16%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.micCable}</Text>
                                    <Text style={[styles.tableCell, { width: '16%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.micWireless}</Text>
                                    <Text style={[styles.tableCell, { width: '16%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000000' }]}>{data.requirements.iluminacion ? 'Sí' : 'No'}</Text>
                                    <Text style={[styles.tableCell, { width: '16%', textAlign: 'center' }]}>{data.requirements.karaoke ? 'Sí' : 'No'}</Text>
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
                                <View style={{ width: '40%', borderRightWidth: 1, borderRightColor: '#FFFFFF', paddingVertical: 10, paddingLeft: 14 }}>
                                    <Text style={[styles.tableHeaderCell, { textAlign: 'left' }]}>UBICACIÓN / LUGAR</Text>
                                </View>
                                <View style={{ width: '60%', paddingVertical: 10, paddingLeft: 12 }}>
                                    <Text style={[styles.tableHeaderCell, { textAlign: 'left' }]}>DETALLE / EQUIPAMIENTO</Text>
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
                                        backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F4F4F4',
                                        borderBottomWidth: index === data.logistics!.length - 1 ? 0 : 1
                                    }]}>
                                        <Text style={[styles.tableCell, { width: '40%', textAlign: 'left', paddingLeft: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: '#000000' }]}>{item.location}</Text>
                                        <View style={{ width: '60%', paddingLeft: 12, paddingRight: 4 }}>
                                            <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>
                                                {formatRequirements(item.requirements)}
                                            </Text>
                                            {item.details && (
                                                <Text style={[styles.tableCell, { color: '#444' }]}>
                                                    {item.details}
                                                </Text>
                                            )}
                                        </View>
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
        </Document>
    );
};
