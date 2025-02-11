import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiLoginService } from '../servicios/api/api-login.service';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private inactivityTime = 5 * 60 * 1000; // ⏳ Tiempo de inactividad en milisegundos (30 min)
  private timeout: any;

  constructor(private router: Router, private api: ApiLoginService) {
    this.startInactivityTimer();
  }

  private startInactivityTimer() {
    this.resetInactivityTimer();
    this.listenUserActivity();
  }

  private listenUserActivity() {
    ['mousemove', 'keydown', 'click'].forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });
  }
  
  private resetInactivityTimer() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.logout();  // Cierra sesión después de un período de inactividad
    }, this.inactivityTime);  // Tiempo de inactividad que has definido
  }
  
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const user = this.api.getUser();
    const token = localStorage.getItem('access_token');

    if (!user || !token) {
        console.log('No autenticado. Redirigiendo a login.');
        this.router.navigate(['/login']);
        return false;
    }

    // Verificar si el token ha expirado
    if (this.isTokenExpired(token)) {
        console.log('Sesión caducada.');

        this.api.logout();  // Eliminar datos del usuario
        this.router.navigate(['/login']);
        return false;
    }

    const requiredRoles = next.data['rol'];

    if (!requiredRoles) {
        return true;
    }

    const hasRole = Array.isArray(requiredRoles)
        ? requiredRoles.includes(user.rol)
        : user.rol === requiredRoles;

    if (!hasRole) {
        console.log('Acceso denegado: rol no permitido');
        this.router.navigate(['/unauthorized']);
        return false;
    }

    console.log('Acceso permitido');
    return true;
}

private isTokenExpired(token: string): boolean {
    try {
        const decoded: any = jwtDecode(token);
        const exp = decoded.exp * 1000; // Convertir a milisegundos
        return Date.now() >= exp; // Comparar con el tiempo actual
    } catch (error) {
        console.error('Error al decodificar token:', error);
        return true; // Si falla la decodificación, asumir que está expirado
    }
}

  
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('campeonatoSeleccionado');
    this.router.navigate(['/login']);
  }
  

}
