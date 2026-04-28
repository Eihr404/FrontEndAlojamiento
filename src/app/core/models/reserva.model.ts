export interface Reserva {
    id: string;
    clienteId: string;
    alojamientoId: string;
    fechaSolicitud: string;
    fechaCheckIn: string;
    fechaCheckOut: string;
    estado: string;        // 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada'
    montoTotal: number;
    nombreCliente?: string;
    correoCliente?: string;
    nombreAlojamiento?: string;
    nombreHabitacion?: string;
}

export interface CrearReservaRequest {
    clienteId: string;
    alojamientoId: string;
    fechaCheckIn: string;
    fechaCheckOut: string;
    habitacionId:  string;  // ← agregar esta línea
    montoTotal: number;
}