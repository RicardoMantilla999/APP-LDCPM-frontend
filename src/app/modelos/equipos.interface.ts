export interface EquiposI {

    id: number;
    nombre: string;
    uniforme: string;
    fecha_fundacion: Date;
    nro_sorteo: number;
    logo: string;
    categoria: {
        id: string;
    };
    dirigente: {
        id: string;
    };
    campeonato: {
        id: string;
    };
}
