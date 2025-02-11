import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CampeonatosI } from 'src/app/modelos/campeonatos.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiCampeonatosService {

  ///desarrollo
  url: string = 'http://localhost:3000/api/';

  ///produccion
  //url: string = 'https://backend-ldcpm-9amscjvbd-ricardomantillas-projects.vercel.app/api/';

  constructor(private http: HttpClient) { }


  getCampeonatos(): Observable<CampeonatosI[]> {
    let direccion = this.url + 'campeonatos';
    return this.http.get<CampeonatosI[]>(direccion);
  }

  actualizarCampeonato(campeonato: CampeonatosI) {
    const direccion = this.url + 'campeonatos/actualizar/' + campeonato.id;
    return this.http.patch(direccion, campeonato);
  }

  crearCampeonato(campeonato: CampeonatosI): Observable<CampeonatosI> {
    const direccion = this.url + 'campeonatos';
    return this.http.post<CampeonatosI>(direccion, campeonato);
  }

  eliminarCampeonato(id: number): Observable<any> {
    const direccion = this.url + 'campeonatos/' + id;
    return this.http.delete(direccion);
  }

  getCampeonatoById(id: number): Observable<CampeonatosI> {
    const direccion = this.url + 'campeonatos/' + id;
    return this.http.get<CampeonatosI>(direccion);
  }

}
