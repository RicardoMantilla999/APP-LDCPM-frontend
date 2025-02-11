
export interface PartidosI {

    id: number;
    equipo_1: {
        id: number;
    };
    equipo_2: {
        id: number
    };
    goles_1: number;
    goles_2: number;
    fase: {
        id: number;
    };
    categoria: {
        id: number;
    };
    nro_fecha: number;
    fecha: Date;
    hora: string;
    culminado: boolean;

}
