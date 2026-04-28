export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    expirationUtc: string;
    userName: string;
    correoElectronico: string;
    nombreCompleto: string;
    roles: string[];
    usuarioId: string; // ← debe existir

}