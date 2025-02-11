import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { ArbitrosI } from 'src/app/modelos/arbitros.interface';
import { CategoriasI } from 'src/app/modelos/categorias.interface';
import { DirigenteI } from 'src/app/modelos/dirigentes.interface';
import { EquiposI } from 'src/app/modelos/equipos.interface';
import { JugadoresI } from 'src/app/modelos/jugadores.interface';
import { LoginI } from 'src/app/modelos/login.interface';
import { ResponseI } from 'src/app/modelos/response.interface';
import { jwtDecode } from 'jwt-decode';
import { UsuarioI } from 'src/app/modelos/usuarios.interface';
import { UsersI } from 'src/app/modelos/user.interface';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ApiLoginService {
  ///desarrollo
  url: string = 'http://localhost:3000/api/';

  ///produccion
  //url: string = 'https://backend-ldcpm-9amscjvbd-ricardomantillas-projects.vercel.app/api/';



  private inactivityTime = 5 * 60 * 1000; // ⏳ Tiempo de inactividad en milisegundos (30 min)
  private timeout: any;


  constructor(private http: HttpClient, private router: Router) {
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

  getUser() {
    const token = localStorage.getItem('access_token'); // Obtener token

    if (!token) return null; // Si no hay token, retorna null

    try {
      const decodedToken: any = jwtDecode(token); // Decodificar token

      // Verificar si el token tiene los campos esperados
      if (!decodedToken || !decodedToken.rol) {
        console.warn('Token inválido o sin rol definido');
        return null;
      }

      return decodedToken; // Retornar el usuario decodificado
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null; // En caso de error, retornar null
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('user');
    localStorage.removeItem('campeonatoSeleccionado');
    this.router.navigate(['/login']);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }


  refreshToken(): Observable<any> {
    const refresh_token = localStorage.getItem('refresh_token');

    if (!refresh_token) {
      this.logout();
      return of(null);
    }

    return this.http.post(`${this.url}/auth/refresh`, { refresh_token }).pipe(
      tap((res: any) => {
        // Guardar el nuevo access_token y refresh_token
        this.setTokens(res.access_token, res.refresh_token);
      }),
      catchError(() => {
        console.log('Error al renovar el token');
        this.logout();
        return of(null);
      })
    );
  }



  getUsuario(id: number): Observable<UsuarioI> {
    let direccion = this.url + 'usuarios/' + id;
    return this.http.get<UsuarioI>(direccion);
  }

  getAllUsuarios(): Observable<UsersI[]> {
    let direccion = this.url + 'usuarios';
    return this.http.get<UsersI[]>(direccion);
  }

  getAllUsuario(id: number): Observable<UsersI> {
    let direccion = this.url + 'usuarios/all/' + id;
    return this.http.get<UsersI>(direccion);
  }

  createUsuario(usuario: UsersI): Observable<UsersI> {
    let direccion = this.url + 'usuarios';
    return this.http.post<UsersI>(direccion, usuario);
  }

  actualizarUsuario(usuario: UsersI) {
    const direccion = this.url + 'usuarios/' + usuario.id;
    return this.http.patch(direccion, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    const direccion = this.url + 'usuarios/' + id;
    return this.http.delete(direccion);
  }


  LoginByEmail(form: LoginI): Observable<ResponseI> {
    let direccion = this.url + 'auth/login';
    return this.http.post<ResponseI>(direccion, form);
  }

  register(data: { email: string, password: string, username: string }) {
    let direccion = this.url + 'auth/registrar';
    return this.http.post(direccion, data);
  }

  verifyEmail(token: string) {
    return this.http.get(this.url + 'auth/verify-email/' + token);
  }

  getCategorias(): Observable<CategoriasI[]> {
    let direccion = this.url + 'categorias';
    return this.http.get<CategoriasI[]>(direccion);
  }

  getEquipos(id: number): Observable<EquiposI[]> {
    let direccion = this.url + 'equipos/bycampeonato/' + id;
    return this.http.get<EquiposI[]>(direccion);
  }

  getDirigentes(id: number): Observable<DirigenteI[]> {
    let direccion = this.url + 'dirigentes/bycampeonato/' + id;
    return this.http.get<DirigenteI[]>(direccion);
  }

  getArbitros(id: number): Observable<ArbitrosI[]> {
    let direccion = this.url + 'arbitros/bycampeonato/' + id;
    return this.http.get<ArbitrosI[]>(direccion);
  }

  getJugadores(id: number): Observable<JugadoresI[]> {
    let direccion = this.url + 'jugadores/bycampeonato/' + id;
    return this.http.get<JugadoresI[]>(direccion);
  }

  contarEquipos(id: number): Observable<number> {
    let direccion = this.url + 'equipos/count/' + id;
    return this.http.get<number>(direccion);
  }
  contarCategorias(id: number): Observable<number> {
    let direccion = this.url + 'categorias/count/' + id;
    return this.http.get<number>(direccion);
  }

  contarJugadores(id: number): Observable<number> {
    let direccion = this.url + 'jugadores/count/' + id;
    return this.http.get<number>(direccion);
  }

  contarDirigentes(id: number): Observable<number> {
    let direccion = this.url + 'dirigentes/count/' + id;
    return this.http.get<number>(direccion);
  }

  contarArbitros(id: number): Observable<number> {
    let direccion = this.url + 'arbitros/count/' + id;
    return this.http.get<number>(direccion);
  }

  actualizarCategoria(cat: CategoriasI): Observable<CategoriasI> {
    let direccion = this.url + 'çategorias/${arbitro.id}';
    return this.http.put<CategoriasI>(direccion, cat);
  }


  // OBTENER UN OBJETO POR ID
  getCategoriaByID(id: number): Observable<CategoriasI> {
    const direccion = this.url + 'categorias/' + id
    return this.http.get<CategoriasI>(direccion);
  }




  getEquipoByID(id: number): Observable<EquiposI> {
    const direccion = this.url + 'equipos/' + id
    return this.http.get<EquiposI>(direccion);
  }
  getJugadorByID(id: number): Observable<JugadoresI> {
    const direccion = this.url + 'jugadores/' + id
    return this.http.get<JugadoresI>(direccion);
  }
  getDirigenteByID(id: number): Observable<DirigenteI> {
    const direccion = this.url + 'dirigentes/' + id
    return this.http.get<DirigenteI>(direccion);
  }
  getArbitroByID(id: number): Observable<ArbitrosI> {
    const direccion = this.url + 'arbitros/' + id
    return this.http.get<ArbitrosI>(direccion);
  }


  // CREAR Objetos
  crearCategoria(categoria: CategoriasI): Observable<CategoriasI> {
    const direccion = this.url + "categorias"
    return this.http.post<CategoriasI>(direccion, categoria);
  }

  crearDirigente(dirigente: DirigenteI): Observable<DirigenteI> {
    const direccion = this.url + "dirigentes"
    return this.http.post<DirigenteI>(direccion, dirigente);
  }

  crearEquipo(equipo: any, logo: File): Observable<any> {
    const direccion = `${this.url}equipos/upload`;
    // Crear un FormData para incluir los datos del equipo y el archivo
    const formData: FormData = new FormData();
    formData.append('nombre', equipo.nombre);
    formData.append('uniforme', equipo.uniforme);
    formData.append('nro_sorteo', equipo.nro_sorteo);
    formData.append('fecha_fundacion', equipo.fecha_fundacion);
    formData.append('categoria', equipo.categoria);
    formData.append('dirigente', equipo.dirigente);
    formData.append('campeonato', equipo.campeonato);
    formData.append('logo', logo); // Aquí subimos el archivo
    // Hacemos la petición HTTP usando FormData
    return this.http.post<any>(direccion, formData);
  }

  // crearJugador(jugador: JugadoresI): Observable<JugadoresI> {
  //   const direccion = this.url + "jugadores"
  //   return this.http.post<JugadoresI>(direccion, jugador);
  // }

  createJugador(jugadorData: any): Observable<any> {
    const formData = new FormData();

    // Agregar los datos del jugador al FormData
    formData.append('nombres', jugadorData.nombres);
    formData.append('apellidos', jugadorData.apellidos);
    formData.append('cedula', jugadorData.cedula);
    formData.append('dorsal', jugadorData.dorsal);
    formData.append('fecha_nacimiento', jugadorData.fecha_nacimiento);
    formData.append('canton_juega', jugadorData.canton_juega);
    formData.append('direccion', jugadorData.direccion);
    formData.append('telefono', jugadorData.telefono);
    formData.append('email', jugadorData.email);
    formData.append('origen', jugadorData.origen);
    formData.append('equipo', jugadorData.equipo);
    formData.append('foto', jugadorData.foto);

    // Enviar la solicitud POST con FormData
    return this.http.post<any>(`${this.url}jugadores`, formData);
  }

  crearArbitro(arbitro: ArbitrosI): Observable<ArbitrosI> {
    const direccion = this.url + "arbitros"
    return this.http.post<ArbitrosI>(direccion, arbitro);
  }

  // ELIMINAR OBJETOS
  eliminarCategoria(id: number): Observable<any> {
    const direccion = this.url + "categorias/" + id;
    return this.http.delete(direccion);
  }
  eliminarEquipo(id: number): Observable<any> {
    const direccion = this.url + "equipos/" + id;
    return this.http.delete(direccion);
  }
  eliminarjugador(id: number): Observable<any> {
    const direccion = this.url + "jugadores/" + id;
    return this.http.delete(direccion);
  }
  eliminardirigente(id: number): Observable<any> {
    const direccion = this.url + "dirigentes/" + id;
    return this.http.delete(direccion);
  }
  eliminarArbitro(id: number): Observable<any> {
    const direccion = this.url + "arbitros/" + id;
    return this.http.delete(direccion);
  }

  //EDITAR OBJETOS 
  editarCategoria(categoria: CategoriasI) {
    const direccion = this.url + "categorias/" + categoria.id;
    return this.http.patch(direccion, categoria);
  }

  editarEquipo(equipo: FormData, id: number): Observable<any> {
    const direccion = this.url + "equipos/" + id;
    return this.http.patch<any>(direccion, equipo);
  }
  editarJugador(jugador: JugadoresI) {
    const direccion = this.url + "jugadores/" + jugador.id;
    return this.http.patch(direccion, jugador);
  }
  editarDirigente(dirigente: DirigenteI) {
    const direccion = this.url + "dirigentes/" + dirigente.id;
    return this.http.patch(direccion, dirigente);
  }
  editarArbitro(arbitro: ArbitrosI) {
    const direccion = this.url + "arbitros/" + arbitro.id;
    return this.http.patch(direccion, arbitro);
  }


  //FILTROS
  getEquiposByCategoria(id: number): Observable<EquiposI[]> {
    const direccion = this.url + 'equipos/bycategoria/' + id;
    return this.http.get<EquiposI[]>(direccion);
  }


  getJugadoresByEquipo(id: number): Observable<JugadoresI[]> {
    const direccion = this.url + 'jugadores/byequipo/' + id;
    return this.http.get<JugadoresI[]>(direccion);
  }


  //FILTROPS POR CAMPEONATO
  getCategoriaByCampeonato(id: number): Observable<CategoriasI[]> {
    const direccion = this.url + 'categorias/bycampeonato/' + id
    return this.http.get<CategoriasI[]>(direccion);
  }
  getEquiposByCategoriaAndCampeonato(categoriaId: number, campeonatoId: number): Observable<EquiposI[]> {
    const direccion = this.url + 'equipos/bycategoria/' + categoriaId + '/bycampeonato/' + campeonatoId + '';
    return this.http.get<EquiposI[]>(direccion);
  }


  //Historial
  getHistorialJugador(): Observable<any[]> {
    const direccion = this.url + 'jugadores/historial'
    return this.http.get<any[]>(direccion)
  }
  getHistorialJugadores(cedula: string): Observable<any[]> {
    const direccion = this.url + 'jugadores/historial/' + cedula
    return this.http.get<any[]>(direccion)
  }


  //IMPORTAR JUGADORES
  importarJugadores(jugadores: FormData): Observable<any> {
    const direccion = this.url + 'jugadores/importar';
    return this.http.post(direccion, jugadores);
  }

}
