import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CampeonatosI } from 'src/app/modelos/campeonatos.interface';
import { ApiCampeonatosService } from 'src/app/servicios/api/api-campeonatos.service';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-campeonatos',
  templateUrl: './campeonatos.component.html',
  styleUrls: ['./campeonatos.component.scss']
})
export class CampeonatosComponent implements OnInit {


  datosTabla: any[] = [];

  //Entidades
  campeonatos: CampeonatosI[]
  campeonato: CampeonatosI;

  //Selector de campeonato

  mostrarTabla = true;
  mostrarFormularioEditar = false;
  mostrarFormularioNuevo = false;

  //Editar
  editarCampeonato: FormGroup;

  //Crear
  nuevoCampeonato: FormGroup;

  campeonatoGlobal: CampeonatosI = null;

  userRol: string = '';

  constructor(private api: ApiCampeonatosService, private apiLog: ApiLoginService, private alertas: ToastrService, private router: Router) { }

  ngOnInit(): void {
    this.getUsuario();
    this.obtenerCampeonato();
    this.cargarCampeonatos();

    this.editarCampeonato = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl(''),
      fecha_inicio: new FormControl(''),
      fecha_fin: new FormControl(''),
    })

    this.nuevoCampeonato = new FormGroup({
      nombre: new FormControl(''),
      fecha_inicio: new FormControl(''),
      fecha_fin: new FormControl(''),
    })
  }

  getUsuario() {
    const user = this.apiLog.getUser();
    this.userRol = user ? user.rol : '';
  }

  obtenerCampeonato() {
    //Local Storage
    this.campeonatoGlobal = JSON.parse(localStorage.getItem('campeonatoSeleccionado') || '{}');

  }

  checkTokenExpiration(): void {
    const expirationTime = localStorage.getItem('token_expiration');
    const currentTime = new Date().getTime();

    if (expirationTime && currentTime > parseInt(expirationTime)) {
      // Si el token ha expirado, cerrar sesión
      this.logout();
    }
  }

  // Método para cerrar sesión
  logout(): void {
    // Eliminar el token del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiration');

    // Redirigir al usuario a la página de login o cualquier otra
    this.router.navigate(['/login']);
  }
  cargarCampeonatos() {
    this.api.getCampeonatos().subscribe(data => {
      this.campeonatos = data;
      this.datosTabla = this.campeonatos;
    })
  }

  crearCampeonato() {
    Swal.fire({
      title: '¿Guardar este registro?',
      text: 'Verifica que la información sea correcta',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamar al servicio para guardar
        const campeonato = this.nuevoCampeonato.value;
        this.api.crearCampeonato(campeonato).subscribe(
          (Response) => {
            this.alertas.success('Campeonato creado con éxito', 'Hecho');
            this.mostrarDatos()

          }, (error) => {
            this.alertas.error(error.error.message || 'Error desconocido', 'Error al crear el Campeonato')
          }
        )
      }
    });

  }

  seleccionarCampeonato(campeonato: any) {
    this.campeonatoGlobal = campeonato;
    console.log('Campeonato seleccionado', campeonato);
    localStorage.setItem('campeonatoSeleccionado', JSON.stringify(campeonato));
  }

  actualizarCampeonato() {

    Swal.fire({
      title: '¿Guardar estos cambios?',
      text: 'Verifica que la información sea correcta',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Ejecutar lógica de edición
        const campeonato = this.editarCampeonato.value;
        this.api.actualizarCampeonato(campeonato).subscribe(
          (response) => {
            this.alertas.success('Campeonato actualizado con éxito', 'Hecho')
            this.mostrarDatos()
          },
          (error) => {
            this.alertas.error(error.error.message || 'Error desconocido', 'Error al actualizar Campeonato');

          }
        )
      }
    });


  }



  eliminarCampeonato(item: CampeonatosI) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Elemento eliminado');
        // Llamar al servicio para eliminar
        this.api.eliminarCampeonato(item.id).subscribe(
          (response) => {
            this.alertas.success('Campeonato ' + item.nombre + ' eliminado con éxito.', 'Hecho');
            this.cargarCampeonatos()
          },
          (error) => {
            this.alertas.error(error.error.message || 'Error desconocido', 'Error al eliminar Campeonato.');

          }
        )
      }
    });

  }

  mostrarFormEditar(item: CampeonatosI) {
    this.mostrarTabla = false;
    this.mostrarFormularioEditar = true;
    this.mostrarFormularioNuevo = false;
    this.api.getCampeonatoById(item.id).subscribe(data => {
      this.editarCampeonato.setValue({
        id: data.id,
        nombre: data.nombre,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
      })
      console.log('Campeonato', this.editarCampeonato)

    })
  }

  mostrarFormNuevo() {
    this.mostrarTabla = false;
    this.mostrarFormularioEditar = false;
    this.mostrarFormularioNuevo = true;
  }

  mostrarDatos() {
    this.mostrarTabla = true;
    this.mostrarFormularioEditar = false;
    this.mostrarFormularioNuevo = false;
    this.cargarCampeonatos();
  }

  regresar() {
    this.mostrarTabla = true;
    this.mostrarFormularioEditar = false;
    this.mostrarFormularioNuevo = false;
    this.cargarCampeonatos();

  }

}
