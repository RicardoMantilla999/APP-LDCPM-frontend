import { Component, OnInit } from '@angular/core';
import { get } from 'http';
import { ResponseI } from 'src/app/modelos/response.interface';
import { UsuarioI } from 'src/app/modelos/usuarios.interface';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  id: number = null;
  usuario: { username: string; email: string } = { username: '', email: '' };
  username: string = '';

  constructor(private api: ApiLoginService) { }

  ngOnInit() {
    this.getUsuario();
    this.obtenerUsuario();
  }

  getUsuario() {
    const user = this.api.getUser();
    this.id = user ? user.sub : null;
    this.username = user ? user.username : '';
  }

  obtenerUsuario() {
    this.usuario = { username: '', email: '' };
    this.api.getUsuario(this.id).subscribe((data: UsuarioI) => {
      console.log('Datos obtenidos del usuario:', data);
      if (data && data.username && data.email) {
        this.usuario = {
          username: data.username,
          email: data.email
        };
        console.log('Usuario:', this.usuario.username);
        console.log('email:', this.usuario.email);
        console.log('username:', this.username);
      } else {
        console.error('La respuesta no contiene las propiedades esperadas.');
      }
    });
  }


}
