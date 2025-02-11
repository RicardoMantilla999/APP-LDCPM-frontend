import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoTarjeta } from 'src/app/enums/tipo-tarjeta.enum';
import { CategoriasI } from 'src/app/modelos/categorias.interface';
import { EquiposI } from 'src/app/modelos/equipos.interface';
import { FasesI } from 'src/app/modelos/fases.interface';
import { JugadoresI } from 'src/app/modelos/jugadores.interface';
import { PartidosI } from 'src/app/modelos/partidos.interface';
import { PosicionI } from 'src/app/modelos/posiciones.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiComisionService {

  ///desarrollo
  url: string = 'http://localhost:3000/api/';

  ///produccion
  //url: string = 'https://backend-ldcpm-9amscjvbd-ricardomantillas-projects.vercel.app/api/';

  constructor(private http: HttpClient) { }

  //Obtener
  getCategoriaByCampeonato(id: number): Observable<CategoriasI[]> {
    const direccion = this.url + 'categorias/bycampeonato/' + id
    return this.http.get<CategoriasI[]>(direccion);
  }
  getEquipos(id: number): Observable<EquiposI[]> {
    let direccion = this.url + 'equipos/' + id;
    return this.http.get<EquiposI[]>(direccion);
  }

  getEquiposByCategoriaAndCampeonato(categoriaId: number, campeonatoId: number): Observable<EquiposI[]> {
    const direccion = this.url + 'equipos/bycategoria/' + categoriaId + '/bycampeonato/' + campeonatoId + '';
    return this.http.get<EquiposI[]>(direccion);
  }



  // Contar
  contarEquipos(idcat: number, idcam: number): Observable<number> {
    let direccion = this.url + 'equipos/count/' + idcat + '/' + idcam + '/';
    return this.http.get<number>(direccion);
  }



  //CRear
  crearSorteos(sorteos: { equipo: number; categoria: number; nroSorteo: number }[]): Observable<any> {
    const direccion = this.url + "sorteos"
    return this.http.post(direccion, { sorteos });
  }


  //Generar Calendario
  generarCalendario(id: number, cat: number): Observable<any> {
    const direccion = this.url + "campeonatos/" + id + "/categoria/" + cat + "/generar-calendario";
    return this.http.post(direccion, {});
  }

  //Generar Calendario Cuartos
  generarCalendarioCuartos(cat: number): Observable<any> {
    const direccion = this.url + "campeonatos/calendario-cuartos/" + cat;
    return this.http.post(direccion, {});
  }

  generarCalendarioSemifinales(cat: number): Observable<any> {
    const direccion = this.url + "campeonatos/generar/semifinales/" + cat;
    return this.http.post(direccion, {});
  }

  generarCalendarioFinal(cat: number): Observable<any> {
    const direccion = this.url + "campeonatos/generar/final/" + cat;
    return this.http.post(direccion, {});
  }

  actualizarNroSorteo(equipos: { id: number; nro_sorteo: number }[]): Observable<any> {
    const direccion = this.url + "equipos/actualizar-nro-sorteo"
    return this.http.patch(direccion, equipos);
  }

  actualizarFaseActual(id: number, categoria: CategoriasI): Observable<CategoriasI> {
    const direccion = this.url + 'categorias/' + id;
    return this.http.patch<CategoriasI>(direccion, categoria);
  }

  // Actualizar estado del partido ------ usando actualmente 11 de diciembre 2024
  actualizarPartido(partidoId: number, cambios: Partial<{ fecha: string; hora: string; culminado: boolean }>): Observable<any> {
    return this.http.patch(`${this.url + 'partidos'}/${partidoId}/actualizar`, cambios);
  }





  //Obetener Partidos
  getPartidos(fase: number, cat: number, fecha: number): Observable<PartidosI[]> {
    const direccion = this.url + "partidos/fase" + fase + "/categoria" + cat + '/fecha' + fecha;
    return this.http.get<PartidosI[]>(direccion);
  }

  getPartidosCompletos(fase: number, categoria: number): Observable<PartidosI[]> {
    const direccion = this.url + "partidos/fase" + fase + "/categoria" + categoria;
    return this.http.get<PartidosI[]>(direccion);
  }

  getFechas(id: number, fase: number): Observable<number[]> {
    const direccion = this.url + 'partidos/fechas/' + id + '/' + fase;
    console.log('direccion generada: ',direccion);
    return this.http.get<number[]>(direccion);
  }

  getFaseActual(id: number): Observable<FasesI> {
    const direccion = this.url + "categorias/" + id + "/fase-actual";
    return this.http.get<FasesI>(direccion);
  }

  getPartido(id: number): Observable<PartidosI> {
    const direccion = this.url + 'partidos/' + id;
    return this.http.get<PartidosI>(direccion);
  }

  getListaJugadoresByEquipo(id: number): Observable<JugadoresI[]> {
    const direccion = this.url + 'jugadores/byequipo/' + id;
    return this.http.get<JugadoresI[]>(direccion);
  }

  //Guardar Goles
  guardarGoles(jugadorId: number, goles: number, partidoId: number, equipoId: number): Observable<void> {
    const direccion = this.url + 'goles/guardar';
    return this.http.post<void>(direccion, { jugadorId, goles, partidoId, equipoId });
  }


  //Guardar Tarjetas
  // En tu servicio del frontend
  guardarTarjeta(jugadorId: number, partidoId: number, equipoId: number, tipo: TipoTarjeta): Observable<void> {
    const direccion = this.url + 'tarjetas/guardar';
    return this.http.post<void>(direccion, { jugadorId, partidoId, equipoId, tipo });
  }


  //Tabla de posiciones
  obtenerPosiciones(categoriaId: number, faseId: number): Observable<any> {
    return this.http.get(`${this.url + '/posiciones'}/listar?categoriaId=${categoriaId}&faseId=${faseId}`);
  }

  actualizarPosicion(partidoId: number, golesEquipo1: number, golesEquipo2: number): Observable<any> {
    const url = `${this.url}posiciones/actualizar`;
    const body = { partidoId, golesEquipo1, golesEquipo2 };
    return this.http.post(url, body);
  }

  actualizarTablaPosiciones(partidoId: number): Observable<any> {
    return this.http.patch(`${this.url + 'partidos'}/${partidoId}/actualizar`, {});
  }



}
