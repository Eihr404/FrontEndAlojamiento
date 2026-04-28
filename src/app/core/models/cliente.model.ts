export interface Cliente {
    id: string;
    usuarioId: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    documentoIdentidad?: string;
}