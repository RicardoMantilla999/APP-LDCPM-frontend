import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  email = '';
  password = '';
  username = '';

  constructor(private api: ApiLoginService, private alertas: ToastrService) { }


  register() {
    this.api.register({ email: this.email, password: this.password, username: this.username }).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        this.alertas.success('Registro exitoso. Ya puedes iniciar sesión.', 'Éxito');
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        this.alertas.error('Hubo un error al registrar el usuario.', 'Error');
      },
    });
  }


}
