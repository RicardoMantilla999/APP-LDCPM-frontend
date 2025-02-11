import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { GestionComponent } from './pages/gestion/gestion.component';
import { ComisionComponent } from './pages/comision/comision.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input'
import { IgxDatePickerModule } from 'igniteui-angular';
import { HammerModule } from '@angular/platform-browser';

import { ToastrModule } from 'ngx-toastr';
import { CampeonatosComponent } from './pages/campeonatos/campeonatos.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { ResportesPDFService } from './servicios/reportes/resportes-pdf.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { FilterPipe } from './pipes/filter.pipe';



@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    IgxDatePickerModule,
    HammerModule,
    ToastrModule.forRoot(),

  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    GestionComponent,
    ComisionComponent,
    CampeonatosComponent,
    ReportesComponent,
    UserProfileComponent,
    UsuariosComponent,
    HistorialComponent,
    FilterPipe
  
  ],
  providers: [ResportesPDFService, {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
