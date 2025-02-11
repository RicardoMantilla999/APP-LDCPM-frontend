import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;

  username: string = '';

  constructor(location: Location, private element: ElementRef, private router: Router, private api: ApiLoginService) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    this.getUsuario();


  }

  getUsuario() {
    const user = this.api.getUser();
    this.username = user ? user.username : '';
  }

  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(1);
    }

    for (var item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return 'Campeonatos';
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Asegúrate de haber guardado tu trabajo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Cerrar sesión
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiration');
        localStorage.removeItem('campeonatoSeleccionado');
        this.router.navigate(['/login']);
      }
    });

  }

}
