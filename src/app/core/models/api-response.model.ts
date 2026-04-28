// src/app/core/models/api-response.model.ts

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PagedResult<T> {
    items: T[];
    totalRegistros: number;
    pagina: number;
    registrosPorPagina: number;
}