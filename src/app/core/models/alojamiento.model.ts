// src/app/core/models/alojamiento.model.ts

// Modelo de Lectura (GET)
export interface Alojamiento {
    id: string;
    adminId: string;
    nombre: string;
    tipo: string;          // 'Hotel' | 'Apartamento' | 'Casa' | 'Hostal'
    descripcion?: string;
    ciudad: string;
    direccion: string;
    latitud?: number;
    longitud?: number;
    checkIn: string;       // El backend enviar� TimeSpan "HH:mm:ss"
    checkOut: string;
    politicaCancelacionHoras: number;
    normasAdicionales?: string;
    calificacionAvg: number; // Campo calculado, no lo enviamos al crear
    tieneWifi: boolean;
    tienePiscina: boolean;
    admiteMascotas: boolean;
    tieneCocina: boolean;
}

// Modelo de Escritura (POST)
export interface CrearAlojamientoRequest {
    adminId: string;
    nombre: string;
    tipo: string;
    descripcion?: string;
    ciudad: string;
    direccion: string;
    latitud?: number;
    longitud?: number;
    checkIn: string;
    checkOut: string;
    politicaCancelacionHoras: number;
    normasAdicionales?: string;
    tieneWifi: boolean;
    tienePiscina: boolean;
    admiteMascotas: boolean;
    tieneCocina: boolean;
}

// Modelo para los Query Params (GET con filtros)
export interface AlojamientoFiltro {
    nombre?: string;
    ciudad?: string;
    tipo?: string;
    tieneWifi?: boolean;
    tienePiscina?: boolean;
    admiteMascotas?: boolean;
    tieneCocina?:       boolean;  // ← verificar que exista
    pagina?: number;
    registrosPorPagina?: number;
    adminId?: string; // ← agregar esto

}