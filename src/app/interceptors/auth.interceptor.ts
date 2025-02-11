import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ApiLoginService } from '../servicios/api/api-login.service';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private api: ApiLoginService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = localStorage.getItem('access_token');

    if (token) {
        const decodedToken: any = jwtDecode(token);
        const expiration = decodedToken.exp * 1000;
        const now = Date.now();

        // Si faltan menos de 60 segundos para expirar, intentamos refrescar el token
        if (expiration - now < 60000) {
            return this.api.refreshToken().pipe(
                switchMap((response) => {
                    token = response.access_token;
                    localStorage.setItem('access_token', token);  // Guardamos el nuevo token
                    const clonedRequest = req.clone({
                        setHeaders: { Authorization: `Bearer ${token}` }
                    });
                    return next.handle(clonedRequest);
                }),
                catchError(err => {
                    this.api.logout();  // Si ocurre un error en el refresh, cerramos sesión
                    return throwError(() => new Error('Sesión expirada, por favor inicia sesión nuevamente.'));
                })
            );
        }

        const clonedRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });

        return next.handle(clonedRequest);
    }

    return next.handle(req);
}
  
}
