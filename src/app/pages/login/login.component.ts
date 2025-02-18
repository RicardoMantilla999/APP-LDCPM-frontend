import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginI } from 'src/app/modelos/login.interface';
import { ResponseI } from 'src/app/modelos/response.interface';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/servicios/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })

  constructor(private api: ApiLoginService, private router: Router, private alertas: ToastrService, public loading: LoadingService) { }

  ngOnInit(): void {
    this.checkLocalStorage();
  }

  checkLocalStorage() {
    if (localStorage.getItem('access_token')) {
      this.router.navigate(['campeonatos']);
    }
  }

  ngOnDestroy() {
  }

  onLogin(form: any): void {
    this.loading.show();
    this.api.LoginByEmail(form).subscribe({
      next: (data) => {
        this.loading.hide();
        const dataResponse: any = data;

        // Verificar que el token y el rol estén presentes
        if (dataResponse && dataResponse.access_token) {
          // Guarda el token en el localStorage
          localStorage.setItem('access_token', dataResponse.access_token);

          // Decodificar el token JWT para obtener la fecha de expiración
          const decodedToken: any = jwtDecode(dataResponse.access_token);

          // Obtener la fecha de expiración (exp) del token y guardarla
          const expirationTime = decodedToken.exp * 1000; // El valor de 'exp' es en segundos, lo multiplicamos por 1000 para convertirlo a milisegundos.
          localStorage.setItem('token_expiration', expirationTime.toString());

          // Verificar el rol del usuario
          const userRole = dataResponse.rol;  // Asegúrate de que 'rol' esté en la respuesta

          console.log('Inicio de sesión exitoso, rol:', userRole);


          // Redirigir según el rol del usuario
          if (userRole === 'admin') {
            this.router.navigate(['/campeonatos']); // Redirige a la página de administración
          } else if (userRole === 'user') {
            this.router.navigate(['/campeonatos']); // Redirige a la página de usuario
          } else {
            // Si el rol no es ADMIN ni USER, redirigir a una página de acceso denegado o similar
            this.router.navigate(['/unauthorized']);
          }
        } else {
          this.loading.hide();
          this.alertas.error('No se pudo autenticar, intente nuevamente.', 'Error');
        }
      },
      error: (error) => {
        this.loading.hide();
        this.alertas.error('Email o constraseña incorrecta.', 'Error');
      }
    });
  }


  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('user');
    localStorage.removeItem('campeonatoSeleccionado');
    this.router.navigate(['/login']);
  }


}
