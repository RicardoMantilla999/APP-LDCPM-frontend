import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import Swal from 'sweetalert2';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  //{ path: '/dashboard', title: 'Dashboard',  icon: 'ni-tv-2 text-primary', class: '' },
  { path: '/campeonatos', title: 'Campeonatos', icon: 'ni ni-trophy text-orange', class: '' },
  { path: '/gestion', title: 'Gestión', icon: 'ni ni-book-bookmark text-blue', class: '' },
  { path: '/comision', title: 'Comisión Técnica', icon: 'ni ni-calendar-grid-58 text-red', class: '' },
  { path: '/reportes', title: 'Reportes', icon: 'ni ni-archive-2 text-green', class: '' },
  { path: '/historial', title: 'Historial de Jugador', icon: 'ni ni-folder-17 text-brown', class: '' },
  { path: '/user-profile', title: 'Perfil de Usuario', icon: 'ni-single-02 text-yellow', class: '' },
  { path: '/login', title: 'Iniciar Sesión', icon: 'ni-key-25 text-info', class: '' },
  { path: '/register', title: 'Registrarse', icon: 'ni-circle-08 text-pink', class: '' },
  { path: '/usuarios', title: 'Usuarios', icon: 'fa fa-users text-yellow', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;
  username: string = '';

  constructor(private router: Router, private api: ApiLoginService) { }

  ngOnInit() {
    this.filterRoutesByRole();
    this.router.events.subscribe(() => {
      this.isCollapsed = true;
    });
    this.getUsuario();
  }

  getUsuario() {
    const user = this.api.getUser();
    this.username = user ? user.username : '';
  }

  filterRoutesByRole() {
    const user = this.api.getUser(); // Obtener el usuario autenticado
    const userRole = user ? user.rol : ''; // Obtener el rol del usuario, asumiendo que 'role' está en el objeto user

    // Filtrar las rutas en base al rol del usuario
    this.menuItems = ROUTES.filter(route => {

      // Si el usuario es 'admin', puede acceder a todas las rutas excepto a login y register
      if (userRole === 'admin') {
        return route.path === '/campeonatos' || route.path === '/gestion' || route.path === '/comision' || route.path === '/reportes' || route.path === '/usuarios' || route.path === '/historial';
      }

      // Si el usuario es 'user', puede acceder solo a campeonatos y reportes
      if (userRole === 'user') {
        return route.path === '/campeonatos' || route.path === '/reportes' || route.path === '/historial';
      }

      return false; // Si el rol no es admin ni user, no muestra ninguna ruta
    });
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
