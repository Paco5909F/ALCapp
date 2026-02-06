'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Trash2, Calendar, Clock, User, FileText, Settings, DollarSign, MapPin, Minus } from 'lucide-react';
import { BudgetData, BudgetItem } from '@/types';

interface EditorProps {
    data: BudgetData;
    onChange: (data: BudgetData) => void;
}

// Internal Stepper Component for improved mobile UX
const Stepper = ({ value, onChange, min = 0 }: { value: number, onChange: (val: number) => void, min?: number }) => {
    const handleIncrement = () => onChange(value + 1);
    const handleDecrement = () => {
        if (value > min) onChange(value - 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (isNaN(val)) onChange(0); // Optional: handle empty as 0
        else onChange(val);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
            <button
                onClick={handleDecrement}
                className="p-2 hover:bg-slate-700 active:bg-slate-600 text-slate-400 transition"
                type="button"
            >
                <Minus size={14} />
            </button>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                className="w-12 bg-transparent text-center font-bold outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
                onClick={handleIncrement}
                className="p-2 hover:bg-slate-700 active:bg-slate-600 text-slate-400 transition"
                type="button"
            >
                <Plus size={14} />
            </button>
        </div>
    );
};

export default function Editor({ data, onChange }: EditorProps) {
    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Automatic Uppercase for specific fields
        const shouldUpperCase = ['name', 'eventType', 'eventTime', 'eventEndTime'].includes(name);

        onChange({
            ...data,
            client: {
                ...data.client,
                [name]: shouldUpperCase ? value.toUpperCase() : value,
            },
        });
    };

    const handleRequirementChange = (field: keyof typeof data.requirements, value: number | boolean | string) => {
        onChange({
            ...data,
            requirements: {
                ...data.requirements,
                [field]: value,
            },
        });
    };



    const addLogisticsItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            location: '',
            details: '',
            requirements: {
                parlantes: 0,
                potencia: 0,
                retornos: 0,
                micCable: 0,
                micWireless: 0,
                iluminacion: 'ninguna',
                consola: 'ninguna',
                karaoke: false
            }
        };
        onChange({
            ...data,
            logistics: [...(data.logistics || []), newItem],
        });
    };

    const updateLogisticsItem = (id: string, field: string, value: any) => {
        onChange({
            ...data,
            logistics: (data.logistics || []).map((item) => {
                if (item.id !== id) return item;

                // Handle nested requirement updates
                if (field.startsWith('req.')) {
                    const reqField = field.split('.')[1];
                    return {
                        ...item,
                        requirements: {
                            ...(item.requirements || { parlantes: 0, potencia: 0, retornos: 0, micCable: 0, micWireless: 0, iluminacion: 'ninguna', consola: 'ninguna', karaoke: false }),
                            [reqField]: value
                        }
                    };
                }

                return { ...item, [field]: value };
            }),
        });
    };

    const removeLogisticsItem = (id: string) => {
        onChange({
            ...data,
            logistics: (data.logistics || []).filter((item) => item.id !== id),
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white p-6 overflow-y-auto shadow-xl scrollbar-thin scrollbar-thumb-slate-700">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-700">
                <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden shadow-lg border-2 border-slate-600">
                    <Image
                        src="/images/logo.png"
                        alt="ALC Logo"
                        fill
                        className="object-contain p-1"
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight uppercase text-white">ALC Presupuestos</h2>
                    <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Generador de Cotizaciones</p>
                </div>
            </div>

            {/* Client Section */}
            <section className="mb-8 space-y-6">
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                    <User size={18} />
                    <h3 className="text-lg font-semibold uppercase tracking-wider">Datos del Cliente</h3>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase group-hover:text-blue-400 transition-colors">Nombre / Razón Social</label>
                        <input
                            type="text"
                            name="name"
                            value={data.client.name}
                            onChange={handleClientChange}
                            className="w-full bg-transparent border-b-2 border-slate-600 focus:border-blue-500 outline-none transition-all py-2 text-lg font-medium placeholder-slate-600"
                            placeholder="EJ: JUAN PÉREZ"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Fecha de Emisión</label>
                            <input
                                type="date"
                                name="emissionDate"
                                value={data.client.emissionDate || ''}
                                onChange={handleClientChange}
                                className="w-full bg-transparent text-white outline-none [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>

                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Validez</label>
                            <select
                                name="validityDays"
                                value={data.client.validityDays || 15}
                                onChange={(e) => handleClientChange({ target: { name: 'validityDays', value: parseInt(e.target.value) } } as any)}
                                className="w-full bg-slate-800 text-white outline-none cursor-pointer"
                            >
                                <option value={15}>15 días</option>
                                <option value={7}>7 días</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <Calendar size={16} />
                            <span className="text-xs font-bold uppercase">Detalles del Evento</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">FECHA</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={data.client.date}
                                    onChange={handleClientChange}
                                    className="w-full bg-transparent border-b border-slate-600 focus:border-blue-500 outline-none pb-1 [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">TIPO</label>
                                    <input
                                        list="event-types"
                                        type="text"
                                        name="eventType"
                                        value={data.client.eventType || ''}
                                        onChange={handleClientChange}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-green-500 outline-none placeholder-slate-700 transition"
                                        placeholder="SELECCIONAR..."
                                    />
                                    <datalist id="event-types">
                                        <option value="CUMPLEAÑOS" />
                                        <option value="CASAMIENTO" />
                                        <option value="15 AÑOS" />
                                        <option value="EVENTO PRIVADO" />
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">HORARIO</label>
                                    <input
                                        type="time"
                                        name="eventTime"
                                        value={data.client.eventTime || ''}
                                        onChange={handleClientChange}
                                        className="w-full bg-transparent border-b border-slate-600 focus:border-blue-500 outline-none pb-1 [&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Requirements Section (Hidden if Logistics exist) */}
            {(!data.logistics || data.logistics.length === 0) && (
                <section className="mb-8 space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-4">
                        <Settings size={18} />
                        <h3 className="text-lg font-semibold uppercase tracking-wider">Técnica</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Parlantes', key: 'parlantes' },
                            { label: 'Potencia', key: 'potencia' },
                            { label: 'Retornos', key: 'retornos' },
                            { label: 'Mic. Cable', key: 'micCable' },
                            { label: 'Mic. Inal.', key: 'micWireless' },
                        ].map((req) => (
                            <div key={req.key} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col justify-center items-center gap-2 shadow-sm">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide text-center">{req.label}</label>
                                <Stepper
                                    value={(data.requirements as any)[req.key] || 0}
                                    onChange={(val) => handleRequirementChange(req.key as any, val)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Iluminación</label>
                            <select
                                value={data.requirements.iluminacion}
                                onChange={(e) => handleRequirementChange('iluminacion', e.target.value)}
                                className="w-full bg-slate-900 text-white p-2 rounded border border-slate-600 outline-none text-sm"
                            >
                                <option value="ninguna">Ninguna</option>
                                <option value="basica">Básica</option>
                                <option value="parled">Par LED</option>
                                <option value="cabezales">Cabezales</option>
                                <option value="estruct_chica">Est. Chica</option>
                                <option value="estruct_media">Est. Media</option>
                                <option value="estruct_grande">Est. Grande</option>
                            </select>
                        </div>

                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Consola</label>
                            <select
                                value={data.requirements.consola}
                                onChange={(e) => handleRequirementChange('consola', e.target.value)}
                                className="w-full bg-slate-900 text-white p-2 rounded border border-slate-600 outline-none text-sm"
                            >
                                <option value="ninguna">Ninguna</option>
                                <option value="8ch">8 Canales</option>
                                <option value="12ch">12 Canales</option>
                                <option value="32ch">32 Canales</option>
                            </select>
                        </div>

                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col justify-center">
                            <label className="flex items-center gap-2 cursor-pointer hover:border-purple-500 transition w-full h-full">
                                <input
                                    type="checkbox"
                                    checked={data.requirements?.karaoke || false}
                                    onChange={(e) => handleRequirementChange('karaoke', e.target.checked)}
                                    className="accent-purple-500 w-4 h-4 ml-2"
                                />
                                <span className="text-sm font-medium ml-2">Karaoke</span>
                            </label>
                        </div>
                    </div>
                </section>
            )}

            {/* Logistics Section */}
            <section className="mb-8 space-y-4">
                <div className="flex justify-between items-center mb-4 text-orange-400">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        <h3 className="text-lg font-semibold uppercase tracking-wider">Logística / Ubicaciones</h3>
                    </div>
                    <button
                        onClick={addLogisticsItem}
                        className="flex items-center gap-2 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-full transition shadow-lg shadow-orange-900/20 text-[10px] font-bold uppercase tracking-wide"
                    >
                        <Plus size={14} />
                        Agregar
                    </button>
                </div>

                <div className="space-y-3">
                    {(!data.logistics || data.logistics.length === 0) ? (
                        <div className="text-slate-500 text-center py-4 border border-dashed border-slate-700 rounded-lg">
                            <p className="text-xs">No hay ubicaciones agregadas.</p>
                        </div>
                    ) : (
                        data.logistics.map((item) => (
                            <div key={item.id} className="relative p-3 rounded-lg bg-slate-800 border border-slate-700 group hover:border-orange-500/50 transition-all">
                                <button
                                    onClick={() => removeLogisticsItem(item.id)}
                                    className="absolute -top-2 -right-2 bg-slate-700 text-slate-400 hover:bg-red-500 hover:text-white transition p-1.5 rounded-full shadow-md z-10"
                                    title="Eliminar ubicación"
                                >
                                    <Trash2 size={14} />
                                </button>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Lugar / Ubicación</label>
                                            <input
                                                type="text"
                                                value={item.location}
                                                onChange={(e) => updateLogisticsItem(item.id, 'location', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-orange-500 outline-none placeholder-slate-700"
                                                placeholder="Ej: Cuartel de Bomberos"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Observaciones / Detalle Adicional</label>
                                            <input
                                                type="text"
                                                value={item.details}
                                                onChange={(e) => updateLogisticsItem(item.id, 'details', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm focus:border-orange-500 outline-none placeholder-slate-700"
                                                placeholder="Notas adicionales..."
                                            />
                                        </div>
                                    </div>

                                    {/* Per-Location Requirements */}
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                                            {[
                                                { label: 'Parlantes', key: 'parlantes' },
                                                { label: 'Retornos', key: 'retornos' },
                                                { label: 'Potencia', key: 'potencia' },
                                                { label: 'Mic. Cable', key: 'micCable' },
                                                { label: 'Mic. Inal.', key: 'micWireless' },
                                            ].map((req) => (
                                                <div key={req.key} className="bg-slate-800 p-2 rounded border border-slate-700 flex flex-col justify-center items-center gap-1">
                                                    <label className="text-[10px] font-medium text-slate-400 truncate w-full text-center">{req.label}</label>
                                                    <Stepper
                                                        value={(item.requirements as any)?.[req.key] || 0}
                                                        onChange={(val) => updateLogisticsItem(item.id, `req.${req.key}`, val)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <select
                                                value={item.requirements?.iluminacion || 'ninguna'}
                                                onChange={(e) => updateLogisticsItem(item.id, 'req.iluminacion', e.target.value)}
                                                className="bg-slate-800 text-white rounded border border-slate-700 text-xs p-1 outline-none"
                                            >
                                                <option value="ninguna">Ilum: Ninguna</option>
                                                <option value="basica">Ilum: Básica</option>
                                                <option value="parled">Ilum: Par LED</option>
                                                <option value="cabezales">Ilum: Cabezales</option>
                                                <option value="estruct_chica">Ilum: Estructura Chica</option>
                                                <option value="estruct_media">Ilum: Estructura Media</option>
                                                <option value="estruct_grande">Ilum: Estructura Grande</option>
                                            </select>

                                            <select
                                                value={item.requirements?.consola || 'ninguna'}
                                                onChange={(e) => updateLogisticsItem(item.id, 'req.consola', e.target.value)}
                                                className="bg-slate-800 text-white rounded border border-slate-700 text-xs p-1 outline-none"
                                            >
                                                <option value="ninguna">Consola: Ninguna</option>
                                                <option value="8ch">Consola: 8 Canales</option>
                                                <option value="12ch">Consola: 12 Canales</option>
                                                <option value="32ch">Consola: 32 Canales</option>
                                            </select>

                                            <label className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition bg-slate-800 rounded border border-slate-700 p-1 justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.requirements?.karaoke || false}
                                                    onChange={(e) => updateLogisticsItem(item.id, 'req.karaoke', e.target.checked)}
                                                    className="accent-orange-500 w-3 h-3"
                                                />
                                                <span className="text-xs font-medium text-slate-400">Karaoke</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Finalization Section */}
            <section className="mb-8 space-y-4">

                <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-600">
                        <label className="block text-xs font-bold text-green-400 mb-2 uppercase tracking-wide">Total Personalizado (Opcional)</label>
                        <p className="text-[10px] text-slate-400 mb-3">Si se deja vacío, se calcula automáticamente.</p>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                value={data.customTotal !== undefined ? new Intl.NumberFormat('es-AR').format(data.customTotal) : ''}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\./g, '');
                                    const val = raw === '' ? undefined : Number(raw);
                                    if (raw === '' || !isNaN(Number(raw))) {
                                        onChange({ ...data, customTotal: val });
                                    }
                                }}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-10 text-xl font-bold text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Observaciones / Condiciones</label>
                        <textarea
                            name="conditions"
                            value={data.client.conditions}
                            onChange={handleClientChange}
                            rows={3}
                            className="w-full bg-slate-900/50 p-3 rounded border border-slate-600 focus:border-blue-500 outline-none transition resize-none text-sm"
                            placeholder="Forma de pago, horarios, requerimientos..."
                        />
                    </div>
                </div>
            </section >

            <div className="pt-8 pb-4 text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white">
                    Sistema desarrollado por Joaquín Rosas
                </p>
            </div>
        </div >
    );
}
