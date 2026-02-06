export interface BudgetItem {
    id: string;
    concept: string;
    quantity: number;
    price: number;
}

export interface ClientData {
    name: string;
    date: string;
    conditions: string;
    eventType?: string;
    eventTime?: string;
    emissionDate?: string;
    validityDays?: number;
}

export interface TechnicalRequirements {
    parlantes: number;
    potencia: number;
    retornos: number;
    micCable: number;
    micWireless: number;
    iluminacion: string;
    consola: string;
    karaoke: boolean;
}

export interface BudgetLogistics {
    id: string;
    location: string;
    details: string;
    requirements?: TechnicalRequirements;
}

export interface BudgetData {
    client: ClientData;
    items: BudgetItem[];
    requirements: TechnicalRequirements;
    customTotal?: number;
    logistics?: BudgetLogistics[];
}
