import { Component, OnInit } from '@angular/core';
import { error } from 'console';
import { HistorialJugador } from 'src/app/modelos/historialJugador.interface';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {

  buscarJugador: string = ''; // El valor del campo de búsqueda
  datosFiltrados: any[] = []; // Datos filtrados a mostrar en la tabla

  constructor(private api: ApiLoginService) { }

  ngOnInit(): void {

  }

  filtrarDatos() {
    if (this.buscarJugador.trim() === '') {
      this.datosFiltrados = []; // Si no hay búsqueda, la tabla se mantiene vacía
    } else {
      // Realizamos la consulta al servidor con la cédula proporcionada
      this.api.getHistorialJugadores(this.buscarJugador.trim()).subscribe(
        (response) => {
          // Asignamos los datos filtrados de la API
          this.datosFiltrados = response; 
        },
        (error) => {
          // Manejo de errores si la API falla
          console.error('Error al obtener datos:', error);
          this.datosFiltrados = []; // En caso de error, mantenemos la tabla vacía
        }
      );
    }
  }
}
