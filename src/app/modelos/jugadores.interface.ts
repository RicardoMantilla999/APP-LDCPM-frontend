export interface JugadoresI {

    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    dorsal: number;
    fecha_nacimiento: Date;
    canton_juega: string;
    direccion: string;
    telefono: string;
    email: string;
    origen: string;
    foto: string;
    equipo:{ 
        id: string;
     };


}