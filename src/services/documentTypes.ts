export interface DNIResponse {
  success: boolean;
  data?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
  };
  message?: string;
}

export interface RUCResponse {
  success: boolean;
  data?: {
    razonSocial: string;
    numeroDocumento: string;
    direccion: string;
    estado: string;
  };
  message?: string;
}