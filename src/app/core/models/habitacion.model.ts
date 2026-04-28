export interface CrearHabitacionRequest {
  nombreTipo:        string;
  capacidadPersonas: number;
  numeroCamas:       number;
}

export interface Habitacion {
  id:                string;
  // Nombres nuevos
  nombreTipo:        string;
  capacidadPersonas: number;
  numeroCamas:       number;
  precioNoche?:      number;
  cantidadTotal?:    number;
  // Aliases para compatibilidad con detalle-alojamiento
  nombre?:           string;
  descripcion?:      string;
  capacidad?:        number;
  precioPorNoche?:   number;
  estado?:           string;
}