import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Rol } from 'src/app/enums/roles.enum';
import { UsersI } from 'src/app/modelos/user.interface';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  datosTabla: any[] = [];

  usuarios: UsersI[];
  usuario: UsersI;

  mostrarTabla = true;
  mostrarFormularioEditar = false;

  //Editar  
  editarUsuario: FormGroup;

  //Crear
  nuevoUsuario: FormGroup;

  roles: { key: string; value: string }[] = [];
  rolSeleccionado: string = '';

  constructor(private api: ApiLoginService, private alertas: ToastrService, private router: Router) { }

  ngOnInit(): void {

    this.cargarUsuarios();

    this.roles = Object.keys(Rol).map(key => ({ key, value: Rol[key as keyof typeof Rol] }));

    this.editarUsuario = new FormGroup({
      id: new FormControl(''),
      username: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      rol: new FormControl(''),
    })

    this.nuevoUsuario = new FormGroup({
      username: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      rol: new FormControl(''),
    })


  }

  cargarUsuarios(): void {
    this.api.getAllUsuarios().subscribe(data => {
      this.usuarios = data;
      this.datosTabla = this.usuarios;
    })
  }

  actualizarUsuario() {
    Swal.fire({
      title: `¿Estás seguro de editar este usuario?`,
      text: 'Verifica que los datos sean correctos antes de continuar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Lógica para editar
        const usuario = this.editarUsuario.value;
        this.api.actualizarUsuario(usuario).subscribe(
          (response) => {
            this.alertas.success('Usuario actualizado correctamente');
            this.mostrarDatos();
          }, (error) => {
            this.alertas.error(error.error.message || 'Error desconocido', 'Error al actualizar Usuario');
          }
        )
      }
    });
  }


  eliminarUsuario(item: UsersI) {
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
        // Llamar al servicio para eliminar el elemento
        this.api.eliminarUsuario(item.id).subscribe(
          (response) => {
            this.alertas.success('Usuario ' + item.username + ' eliminado correctamente');
            this.cargarUsuarios();
          }, (error) => {
            this.alertas.error(error.error.message || 'Error desconocido', 'Error al eliminar Usuario');
          }
        )
      }
    });

  }


  mostrarFormEditar(item: UsersI) {
    this.mostrarTabla = false;
    this.mostrarFormularioEditar = true;
    this.api.getAllUsuario(item.id).subscribe(data => {
      this.editarUsuario.setValue({
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        rol: data.rol,
      })
      this.rolSeleccionado = data.rol;
      console.log(this.rolSeleccionado);
    })
  }

  mostrarDatos() {
    this.mostrarTabla = true;
    this.mostrarFormularioEditar = false;
    this.cargarUsuarios();
  }


  regresar() {
    this.mostrarTabla = true;
    this.mostrarFormularioEditar = false;
    this.cargarUsuarios();
  }

}
