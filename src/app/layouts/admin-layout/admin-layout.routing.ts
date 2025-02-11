import { Routes } from '@angular/router';

import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { GestionComponent } from 'src/app/pages/gestion/gestion.component';
import { ComisionComponent } from 'src/app/pages/comision/comision.component';
import { CampeonatosComponent } from 'src/app/pages/campeonatos/campeonatos.component';
import { ReportesComponent } from 'src/app/pages/reportes/reportes.component';
import { UsuariosComponent } from 'src/app/pages/usuarios/usuarios.component';
import { HistorialComponent } from 'src/app/pages/historial/historial.component';

export const AdminLayoutRoutes: Routes = [

    //RUTAS PARA ADMIN
    { path: 'campeonatos', component: CampeonatosComponent },
    { path: 'gestion', component: GestionComponent },
    { path: 'comision', component: ComisionComponent },
    { path: 'reportes', component: ReportesComponent },
    { path: 'user-profile', component: UserProfileComponent },
    { path: 'usuarios', component: UsuariosComponent },
    { path: 'historial', component: HistorialComponent },

    // Redirección por defecto
    { path: '', redirectTo: '/login', pathMatch: 'full' }

];
