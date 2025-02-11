import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiLoginService } from '../servicios/api/api-login.service';
import { jwtDecode } from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class ModuleGuard implements CanLoad {
  constructor(private api: ApiLoginService, private router: Router) { }

  canLoad(route: Route): boolean {
    const user = this.api.getUser();
    const token = localStorage.getItem('access_token');

    if (!user || !token || this.isTokenExpired(token)) {
      console.log('No autorizado para cargar el módulo.');
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRoles = route.data?.['rol'];
    if (!requiredRoles || requiredRoles.includes(user.rol)) {
      return true;
    }

    console.log('Acceso denegado: rol no permitido');
    this.router.navigate(['/unauthorized']);
    return false;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000;
      return Date.now() >= exp;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return true;
    }
  }

}
