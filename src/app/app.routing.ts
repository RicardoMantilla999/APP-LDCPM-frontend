import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { CampeonatosComponent } from './pages/campeonatos/campeonatos.component';
import { GestionComponent } from './pages/gestion/gestion.component';
import { ComisionComponent } from './pages/comision/comision.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { HistorialComponent } from './pages/historial/historial.component';

const routes: Routes = [
  // Redirección por defecto a 'campeonatos'
  {
    path: '',
    redirectTo: 'campeonatos',
    pathMatch: 'full',
  },

  // Rutas protegidas por 'AdminLayoutComponent'
  {
    path: '',
    component: AdminLayoutComponent, // Layout de administración
    children: [
      // Rutas protegidas por AuthGuard
      {
        path: 'campeonatos',
        component: CampeonatosComponent,
        canActivate: [AuthGuard],  // Requiere autenticación y permisos
        data: { rol: ['admin', 'user'] },  // Permitir a admin y user
      },
      {
        path: 'gestion',
        component: GestionComponent,
        canActivate: [AuthGuard],
        data: { rol: ['admin'] },  // Solo 'admin' puede acceder
      },
      {
        path: 'comision',
        component: ComisionComponent,
        canActivate: [AuthGuard],
        data: { rol: ['admin'] },  // Solo 'admin' puede acceder
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [AuthGuard],
        data: { rol: ['admin', 'user'] },  // Permitir a admin y user
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        canActivate: [AuthGuard],
        data: { rol: ['admin'] },  // Solo 'admin' puede acceder
      },
      {
        path: '',
        redirectTo: 'campeonatos', // Redirige a campeonatos por defecto dentro del layout
        pathMatch: 'full',
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [AuthGuard],
        data: { rol: ['admin'] },
      },
      {
        path: 'historial',
        component: HistorialComponent,
        canActivate: [AuthGuard],
        data: { rol: ['admin', 'user'] },
      }
    ],
  },

  // Rutas para el layout de autenticación
  {
    path: '',
    component: AuthLayoutComponent, // Layout de autenticación
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/layouts/auth-layout/auth-layout.module').then(m => m.AuthLayoutModule),
      },
    ],
  },

  // Ruta para manejar cualquier ruta no definida
  {
    path: '**',
    redirectTo: 'campeonatos',  // Redirigir a campeonatos si la ruta no existe
  },
];


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
      useHash: true
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
