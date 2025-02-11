import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriasI } from 'src/app/modelos/categorias.interface';
import { FasesI } from 'src/app/modelos/fases.interface';
import { GolesI } from 'src/app/modelos/goles.interface';
import { PosicionI } from 'src/app/modelos/posiciones.interface';



@Injectable({
  providedIn: 'root'
})
export class ApiReportesService {

  ///desarrollo
  url: string = 'http://localhost:3000/api/';

  ///produccion
  //url: string = 'https://backend-ldcpm-9amscjvbd-ricardomantillas-projects.vercel.app/api/';
                

  constructor(private http: HttpClient) {


  }

  getCategoriaByCampeonato(id: number): Observable<CategoriasI[]> {
    const direccion = this.url + 'categorias/bycampeonato/' + id
    return this.http.get<CategoriasI[]>(direccion);
  }

  getFases(): Observable<FasesI[]> {
    const direccion = this.url + 'fases';
    return this.http.get<FasesI[]>(direccion);
  }

  getTablaPosiciones(categoriaId: number, faseId: number): Observable<PosicionI[]> {
    const direccion = this.url + 'posiciones/' + categoriaId + '/' + faseId;
    return this.http.get<PosicionI[]>(direccion);
  }

  getGoleadores(categoriaId: number, cantidad: number): Observable<GolesI[]> {
    const direccion = this.url + 'goles/goleadores/' + categoriaId + '/' + cantidad;
    return this.http.get<GolesI[]>(direccion);
  }

  getReporteTarjetas(categoriaId: number, equipoId: number, faseId: number): Observable<any> {
    const direccion = this.url + 'tarjetas/reporte/' + categoriaId + '/' + equipoId + '/' + faseId;
    return this.http.get(direccion);
  };

  getResultadosFaseCuartos(categoriaId: number): Observable<any> {
    const direccion = this.url + 'partidos/Cuartos/' + categoriaId;
    return this.http.get(direccion);
  }

  getResultadosFaseSemifinal(categoriaId: number): Observable<any> {
    const direccion = this.url + 'partidos/Semifinal/' + categoriaId;
    return this.http.get(direccion);
  }


  getResultadosFaseFinal(categoriaId: number): Observable<any> {
    const direccion = this.url + 'partidos/Final/' + categoriaId;
    return this.http.get(direccion);
  }

  getCampeon(categoriaId: number): Observable<any> {
    const direccion = this.url + 'partidos/Campeon/' + categoriaId;
    return this.http.get(direccion);
  }


}
