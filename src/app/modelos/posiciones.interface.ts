export interface PosicionI {
    id: number;
    equipo: {
        id: number
    };
    categoria: {
        id: number
    };
    fase: {
        id: number
    };
    puntos: number;
    golesFavor: number;
    golesContra: number;
    diferenciaGoles: number;
    partidosJugados: number;
    partidosEmpatados: number;
    partidosGanados: number;
    partidosPerdidos: number;
}
