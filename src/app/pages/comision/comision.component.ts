import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TipoTarjeta } from 'src/app/enums/tipo-tarjeta.enum';
import { CampeonatosI } from 'src/app/modelos/campeonatos.interface';
import { CategoriasI } from 'src/app/modelos/categorias.interface';
import { EquiposI } from 'src/app/modelos/equipos.interface';
import { FasesI } from 'src/app/modelos/fases.interface';
import { PartidosI } from 'src/app/modelos/partidos.interface';
import { ApiComisionService } from 'src/app/servicios/api/api-comision.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import { catchError, Observable, of, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { LoadingService } from 'src/app/servicios/loading.service';

@Component({
  selector: 'app-comision',
  templateUrl: './comision.component.html',
  styleUrls: ['./comision.component.scss']
})
export class ComisionComponent implements OnInit {

  tituloTabla = 'Sorteo';
  datosTabla: any[] = [];
  tipoTarjeta = TipoTarjeta;

  editarPartido: FormGroup;


  //Entidades
  categorias: CategoriasI[] = [];
  categoria: CategoriasI;
  equipos: EquiposI[] = [];
  fases: FasesI[] = [];
  partidos: PartidosI[] = [];
  partidoDet: PartidosI = null;
  partido: any;
  fechas: number[] = [];
  jugadoresEquipo1: any[] = [];
  jugadoresEquipo2: any[] = [];
  posiciones: any[] = [];

  partidoDatos = [];
  sorteoDatos = [];

  partidoID!: number;
  goles: any[] = [];

  //Total de datos
  totalEquipos: number;

  //Selectores
  categoriaSeleccionada: number | null = null;
  faseSeleccionada: number | null = null;
  fechaSeleccionada: number | null = null;


  //Mostrar
  mostrarTabla = true;
  mostrarEquipos = false;
  mostrarFormEditar = false;
  mostrarBotonGuardar: boolean = false;
  mostrarBotonSortear: boolean = false;
  mostrarFormEditarResultadosPartidos = false;

  mostrarGoles = true;
  mostrarTarjetas = false;
  accionActual: 'goles' | 'tarjetas' = 'goles'; // Valores posibles: 'goles' o 'tarjetas'


  equipo_1_logo: string = '';
  equipo_2_logo: string = '';

  //CAmpeonato global / LocalStorage
  campeonatoGlobal: CampeonatosI = null;
  fase_actual: FasesI = { id: 0, nombre: 'Sin Fase', orden: 0 };

  //Crear objetos
  nuevoSorteo: FormGroup;

  isLoading = false;

  constructor(public loading: LoadingService, private api: ApiComisionService, private apiLog: ApiLoginService, private router: Router, private activeRouter: ActivatedRoute, private formBuilder: FormBuilder, private alertas: ToastrService) {
    this.editarPartido = this.formBuilder.group({
      equipo_1: [{ value: '', disabled: true }], // Campo deshabilitado
      equipo_2: [{ value: '', disabled: true }],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loading.show();
    this.obtenerCampeonato();
    this.loading.hide();
  }

  checkTokenExpiration(): void {
    const expirationTime = localStorage.getItem('token_expiration');
    const currentTime = new Date().getTime();

    if (expirationTime && currentTime > parseInt(expirationTime)) {
      // Si el token ha expirado, cerrar sesión
      this.logout();
    }
  }
  // Método para cerrar sesión
  logout(): void {
    // Eliminar el token del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('campeonatoSeleccionado');
    // Redirigir al usuario a la página de login o cualquier otra
    this.router.navigate(['/login']);
  }

  cargarCategorias() {
    this.api.getCategoriaByCampeonato(this.campeonatoGlobal.id).subscribe(data => {
      this.categorias = data;
    }, (error) => {
      console.log('Error al cargar categorias')
    });
  }

  cargarEquipos() {

    this.obtenerUnaCategoria();
    this.isLoading = true;
    if (this.categoriaSeleccionada < 1) {
      this.isLoading = false;
      this.datosTabla = [];
    } else {
      this.api.getEquiposByCategoriaAndCampeonato(this.categoriaSeleccionada, this.campeonatoGlobal.id).subscribe(data => {
        //this.equipos = data;
        this.isLoading = false;
        this.datosTabla = data;
      });
    }

  }

  cargarPartidos() {
    this.obtenerUnaCategoria(); // Asegúrate de que este método no altere lógica crítica.

    if (!this.fechaSeleccionada) {
      this.datosTabla = [];
      return;
    }
    this.isLoading = true;
    if (this.fechaSeleccionada < 0) {
      this.api.getPartidosCompletos(this.fase_actual.id, this.categoriaSeleccionada).subscribe(
        (data) => {
          this.isLoading = false;
          this.datosTabla = data || []; // Asegura que sea un array.
        },
        (error) => {
          this.isLoading = false;
          this.datosTabla = [];
        }
      );
    } else if (this.fechaSeleccionada > 0) {
      this.api.getPartidos(this.fase_actual.id, this.categoriaSeleccionada, this.fechaSeleccionada).subscribe(
        (data) => {
          this.isLoading = false;
          this.datosTabla = data || [];
        },
        (error) => {
          this.isLoading = false;
          this.alertas.error('Error al cargar los partidos', error);
          this.datosTabla = [];
        }
      );
    }
  }


  obtenerFaseActual(): Observable<any> {
    return this.api.getFaseActual(this.categoriaSeleccionada).pipe(
      tap((data) => {
        this.fase_actual = data || { id: 0, nombre: 'Sin Fase', orden: 0 };
      }),
      catchError((error) => {
        console.error('Error al obtener la fase actual:', error);
        this.fase_actual = { id: 0, nombre: 'Sin Fase', orden: 0 };
        return of(this.fase_actual); // Retorna un valor predeterminado en caso de error.
      })
    );
  }


  cargarFechas() {
    if (!this.categoriaSeleccionada) {
      this.fechas = [];
      this.fechaSeleccionada = null;
      this.datosTabla = [];
      this.fase_actual = { id: 0, nombre: 'Sin Fase', orden: 0 };
      return;
    }
    this.isLoading = true;
    // Obtiene la fase actual y luego carga las fechas
    this.obtenerFaseActual().subscribe(() => {
      this.api.getFechas(this.categoriaSeleccionada, this.fase_actual.id).subscribe(
        (data) => {
          this.isLoading = false;
          this.fechas = data || []; // Asegúrate de que siempre sea un array
          this.fechaSeleccionada = null;
          this.datosTabla = [];
        },
        (error) => {
          this.isLoading = false;
          this.fechas = [];
          this.fechaSeleccionada = null;
          this.datosTabla = [];
          this.alertas.error('Error al cargar las fechas.', error);
        }
      );
    });
  }



  vaciarDatos() {
    this.datosTabla = [];
    this.equipos = [];
    this.partidos = [];
    this.fase_actual = { id: 0, nombre: 'Sin Fase', orden: 0 };
    this.categoriaSeleccionada = null;
    this.fechaSeleccionada = null;
  }

  obtenerCampeonato() {
    //Local Storage
    this.campeonatoGlobal = JSON.parse(localStorage.getItem('campeonatoSeleccionado') || '{}');
    if (!this.campeonatoGlobal || !this.campeonatoGlobal.id) {
      //this.alertas.error('No se ha seleccionado un campeonato', 'Error');
      this.alertas.warning('Por favor seleccione un campeonato', 'Advertencia');
      this.router.navigate(['/campeonatos']);
    } else {
      this.cargarCategorias();
    }
  }

  mostrarTabSorteo() {
    this.mostrarTabla = true;
    this.mostrarFormEditar = false;
    this.mostrarBotonGuardar = true;
    this.mostrarBotonSortear = true;
    this.mostrarFormEditarResultadosPartidos = false;
    this.tituloTabla = 'Sorteo';
    this.vaciarDatos();

  }

  mostrarTabCalendario() {
    this.mostrarTabla = true;
    this.mostrarFormEditar = false;
    this.mostrarBotonGuardar = false;
    this.mostrarBotonSortear = false;
    this.mostrarFormEditarResultadosPartidos = false;
    this.tituloTabla = 'Calendario';
    this.vaciarDatos()
  }


  mostrarTabResultados() {
    this.mostrarTabla = true;
    this.mostrarEquipos = false;
    this.mostrarFormEditar = false;
    this.mostrarFormEditarResultadosPartidos = false;
    this.mostrarBotonGuardar = false;
    this.mostrarBotonSortear = false;
    this.tituloTabla = 'Resultados';
    this.vaciarDatos();
  }


  sortear() {
    if (!this.datosTabla || this.datosTabla.length === 0) {
      console.error('No hay equipos disponibles para sortear.');
      this.alertas.warning('No hay equipos disponibles para sortear.', 'Advertencia');
      return;
    }

    // Generar números aleatorios únicos
    const numerosSorteo = this.generarNumerosAleatorios(this.datosTabla.length);

    // Asignar números de sorteo a los equipos mostrados en la tabla
    this.datosTabla = this.datosTabla.map((equipo, index) => ({
      ...equipo,
      nro_sorteo: numerosSorteo[index], // Agregar el número de sorteo al equipo
    }));
    this.alertas.success('Sorteo realizado exitosamente', 'Hecho');

    console.log('Números de sorteo asignados:', this.datosTabla);
  }



  generarNumerosAleatorios(cantidad: number): number[] {
    const numeros: number[] = [];
    while (numeros.length < cantidad) {
      const random = Math.floor(Math.random() * cantidad) + 1;
      if (!numeros.includes(random)) {
        numeros.push(random);
      }
    }
    return numeros;
  }

  contarEquipos() {
    this.api.contarEquipos(this.categoriaSeleccionada, this.campeonatoGlobal.id).subscribe(data => {
      this.totalEquipos = data;
    })
  }

  guardarSorteo() {
    Swal.fire({
      title: '¿Guardar sorteo?',
      text: 'Verifica la información antes de guardar',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamar al servicio para guardar
        const equiposConNumero = this.datosTabla.map((equipo) => ({
          id: equipo.id,
          nro_sorteo: equipo.nro_sorteo,
        }));

        this.api.actualizarNroSorteo(equiposConNumero).subscribe({
          next: () => {
            this.alertas.success('Sorteo guardado correctamente.', 'Hecho');
          },
          error: (err) => {
            this.alertas.error('Error al guardar el sorteo.', 'Error');
          },
        });
      }
    });
  }


  // Método auxiliar para obtener el ID del equipo por nombre
  obtenerEquipoIdPorNombre(nombre: string): number {
    const equipo = this.datosTabla.find(e => e.nombre === nombre); // Asegúrate de tener una lista de equipos cargada
    return equipo ? equipo.id : null;
  }

  obtenerUnaCategoria() {
    this.apiLog.getCategoriaByID(this.categoriaSeleccionada).subscribe(data => {
      this.categoria = data;
    })
  }



  generarCalendario() {
    if (!this.categoriaSeleccionada) {
      this.alertas.warning('Por favor seleccione una categoría', 'Advertencia');
      return;
    }
    if (this.fase_actual.orden === 0) { // FASE DE INSCRIPCIÓN
      Swal.fire({
        title: '¿Quieres generar el Calendario?',
        text: 'Se generarán los partidos de la fase de Grupos',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, generar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ejecutar lógica de edición
          this.api.generarCalendario(this.campeonatoGlobal.id, this.categoriaSeleccionada).subscribe({
            next: (response) => {
              console.log('Calendario generado con éxito:', response);
              this.alertas.success('Calendario Fase de Grupos generado con éxito.', 'Hecho');
              this.obtenerFaseActual()
            },
            error: (calendarError) => {
              console.error('Error al generar el calendario:', calendarError);
              this.alertas.error('Error al generar calendario.', 'Error')
            },
          });
        }
      });

    } else if (this.fase_actual.orden === 1) { // FASE DE GRUPOS
      Swal.fire({
        title: '¿Quieres generar el Calendario?',
        text: 'Se generarán los partidos de la fase de Cuartos',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, generar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ejecutar lógica de edición
          this.api.generarCalendarioCuartos(this.categoriaSeleccionada).subscribe({
            next: (response) => {
              console.log('Calendario generado con éxito:', response);
              this.alertas.success('Calendario Fase Cuartos, generado con éxito.', 'Hecho');
              this.obtenerFaseActual()
            },
            error: (calendarError) => {
              console.error('Error al generar el calendario:', calendarError);
              this.alertas.error('Error al generar calendario.', 'Error')
            }
          });
        }
      });



    } else if (this.fase_actual.orden === 2) { // FASE DE CUARTOS - ELIMINATORIAS
      Swal.fire({
        title: '¿Quieres generar el Calendario?',
        text: 'Se generarán los partidos de la fase de Semifinales',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, generar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ejecutar lógica de edición
          this.api.generarCalendarioSemifinales(this.categoriaSeleccionada).subscribe({
            next: (response) => {
              console.log('Calendario generado con éxito:', response);
              this.alertas.success('Calendario Fase Semifinales, generado con éxito.', 'Hecho');
              this.obtenerFaseActual()
            },
            error: (calendarError) => {
              console.error('Error al generar el calendario:', calendarError);
              this.alertas.error('Error al generar calendario.', 'Error')
            }
          });
        }
      });


    } else if (this.fase_actual.orden === 3) { // FASE DE SEMIFINALES
      Swal.fire({
        title: '¿Quieres generar el Calendario?',
        text: 'Se generarán los partidos de la fase de Finales',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, generar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ejecutar lógica de edición
          this.api.generarCalendarioFinal(this.categoriaSeleccionada).subscribe({
            next: (response) => {
              console.log('Calendario generado con éxito:', response);
              this.alertas.success('Calendario Fase Final, generado con éxito.', 'Hecho');
              this.obtenerFaseActual()
            },
            error: (calendarError) => {
              console.error('Error al generar el calendario:', calendarError);
              this.alertas.error('Error al generar calendario.', 'Error')
            }
          });
        }
      });

    } else if (this.fase_actual.orden === 4) { // FASE DE FINALES
      this.alertas.warning('El campeonato ha concluido, ya no permite generar calendarios.', 'Advertencia');
    } else {
      this.alertas.error('No se puede generar el calendario, está en fase no válida.', 'Error')
      console.log('No se puede generar el calendario, está en fase no válida.');
    }
  }

  formEditarResultadosPartidos(partido: any) {
    this.datosTabla = [];
    this.mostrarTabla = false;
    this.mostrarFormEditarResultadosPartidos = true;
    this.cargarDetallesPartido(partido);
    this.partidoID = partido.id;
  }



  formEditarPartido(partido: any): void {
    this.mostrarTabla = false;
    this.mostrarFormEditar = true;
    this.partido = partido;

    // Actualizamos los valores del formulario
    this.editarPartido.patchValue({
      equipo_1: partido.equipo_1?.nombre || '',
      equipo_2: partido.equipo_2?.nombre || '',
      fecha: partido.fecha || '',
      hora: partido.hora || '',
    });
  }

  cargarDetallesPartido(partidoId: number) {

    this.isLoading = true;
    this.api.getPartido(partidoId).subscribe({
      next: (respuesta) => {
        // Si la respuesta es un arreglo, tomamos el primer elemento
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          const partido = respuesta[0];

          if (!partido || !partido.equipo_1 || !partido.equipo_2) {
            console.error('El partido o sus equipos no están correctamente definidos:', partido);
            return;
          }

          this.equipo_1_logo = partido.equipo_1.logo;
          this.equipo_2_logo = partido.equipo_2.logo;

          this.partido = partido;

          // Cargar jugadores del equipo 1
          this.api.getListaJugadoresByEquipo(this.partido.equipo_1.id).subscribe({
            next: (data) => {
              // Inicializar la propiedad 'tarjeta' para cada jugador
              this.jugadoresEquipo1 = data.map((jugador: any) => ({
                ...jugador,
                tarjeta: jugador.tarjeta || { tipo: null }, // Inicializa si no existe
              }));
              console.log('Jugadores del equipo 1 cargados:', this.jugadoresEquipo1);
            },
            error: (error) => {
              console.error('Error al cargar jugadores del equipo 1:', error);
            },
          });

          // Cargar jugadores del equipo 2
          this.api.getListaJugadoresByEquipo(this.partido.equipo_2.id).subscribe({
            next: (data) => {
              // Inicializar la propiedad 'tarjeta' para cada jugador
              this.jugadoresEquipo2 = data.map((jugador: any) => ({
                ...jugador,
                tarjeta: jugador.tarjeta || { tipo: null }, // Inicializa si no existe
              }));
              console.log('Jugadores del equipo 2 cargados:', this.jugadoresEquipo2);
            },
            error: (error) => {
              console.error('Error al cargar jugadores del equipo 2:', error);
            },
          });
          this.isLoading = false;
        } else {
          console.error('La respuesta no contiene datos del partido:', respuesta);
        }
      },
      error: (error) => {
        console.error('Error al cargar detalles del partido:', error);
      },
    });
  }




  asignarFechaHora() {
    Swal.fire({
      title: '¿Guardar los cambios?',
      text: 'Verifica la hora y fecha antes de guardar',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Ejecutar lógica de edición
        if (this.editarPartido.valid) {
          const { fecha, hora } = this.editarPartido.value;
          console.log('Valores del formulario:', { fecha, hora }); // Verifica los valores

          this.api.actualizarPartido(this.partido.id, { fecha, hora }).subscribe({
            next: (response) => {
              console.log('Fecha y hora asignadas con éxito:', response);
              this.alertas.success('Fecha y Hora asignada con éxito.', 'Hecho');

              // Recargar la tabla de partidos después de la asignación
              this.cargarPartidos(); // Método que recarga los datos de la tabla
              this.mostrarTabla = true; // Muestra la tabla
              this.mostrarFormEditar = false; // Oculta el formulario
            },
            error: (error) => {
              console.error('Error al asignar fecha y hora:', error);
              this.alertas.error('Error al asignar la fecha y hora', error);
            },
          });
        } else {
          console.error('Formulario inválido:', this.editarPartido.errors);
        }
      }
    });

  }

  guardarGoles(jugadorId: number, goles: number, partidoId: number, equipoId: number): void {
    this.api.guardarGoles(jugadorId, goles, partidoId, equipoId).subscribe(() => {
      console.log('Goles guardados exitosamente');
      this.cargarDetallesPartido(partidoId); // Recargar los detalles del partido
    }, error => {
      console.error('Error al guardar goles', error);
    });
  }


  guardarTarjeta(jugadorId: number, partidoId: number, equipoId: number, tipo: TipoTarjeta): void {
    // Aquí llamas al servicio para guardar la tarjeta
    this.api.guardarTarjeta(jugadorId, partidoId, equipoId, tipo).subscribe({
      next: () => {
        console.log('Tarjeta guardada');
      },
      error: (err) => {
        console.error('Error al guardar tarjeta', err);
      },
    });
  }

  alternarColumna() {
    this.mostrarGoles = !this.mostrarGoles;
    this.mostrarTarjetas = !this.mostrarTarjetas;
  }

  guardarAccion(jugador: any, partidoId: number, equipoId: number) {
    if (this.accionActual === 'goles') {
      // Guardar goles
      this.api.guardarGoles(jugador.id, jugador.goles, partidoId, equipoId).subscribe({
        next: () => {
          console.log('Gol guardado exitosamente');
          this.alertas.success('Gol agregado exitosamente', 'Hecho')
          this.cargarDetallesPartido(partidoId);
        },
        error: (err) => {
          console.error('Error al guardar gol', err);
          this.alertas.error('Error al agregar el gol', 'Error')
        },
      });
    } else if (this.accionActual === 'tarjetas') {
      // Guardar tarjetas
      this.api.guardarTarjeta(jugador.id, partidoId, equipoId, jugador.tarjeta.tipo).subscribe({
        next: () => {
          console.log('Tarjeta guardada exitosamente');
          this.alertas.success('Tarjeta agregada correctamente', 'Hecho')
        },
        error: (err) => {
          console.error('Error al guardar tarjeta', err);
          this.alertas.error('Error al agregar tarjeta', 'Error')
        },
      });
    }
  }

  obtenerGolesFavor(equipoId: number): number {
    // Aquí puedes calcular la suma de los goles del equipo basándote en los datos actuales.
    const equipo = this.jugadoresEquipo1.find((e: any) => e.id === equipoId);
    return equipo ? equipo.golesTotales : 0; // Reemplaza 'golesTotales' por la propiedad real de los goles.
  }

  obtenerGolesContra(equipoId: number): number {
    // Aquí debes buscar los goles del equipo contrario
    const equipoContrario = this.jugadoresEquipo2.find((e: any) => e.id !== equipoId);
    return equipoContrario ? equipoContrario.golesTotales : 0; // Reemplaza 'golesTotales' por la propiedad real de los goles.
  }


  finalizarPartido(partidoId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamar al servicio para eliminar el elemento
        const cambios = { culminado: true };

        this.api.actualizarPartido(partidoId, cambios).subscribe(
          (response) => {
            this.alertas.success('El partido se finalizó correctamente y la tabla de posiciones fue actualizada.', 'Éxito');
          },
          (error) => {
            this.alertas.error('Error al finalizar el partido.', 'Error');
          }
        );
      }
    });

  }





  regresar() {
    this.datosTabla = [];
    this.mostrarTabla = true;
    this.mostrarFormEditar = false;
    this.mostrarBotonGuardar = false;
    this.mostrarBotonSortear = false;
    this.mostrarFormEditarResultadosPartidos = false;
    this.cargarPartidos()
  }


  cargarPosiciones(): void {
    this.isLoading = true;
    this.api.obtenerPosiciones(this.categoriaSeleccionada, this.faseSeleccionada).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.posiciones = response.posiciones;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar posiciones:', error);
      },
    });
  }

  actualizarPosiciones(partidoId: number): void {
    this.api.actualizarTablaPosiciones(partidoId).subscribe(
      (response) => {
        console.log('Tabla de posiciones actualizada correctamente');
      },
      (error) => {
        console.error('Error al actualizar la tabla de posiciones:', error);
      }
    );
  }

  getFechaYHora(): string {
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();

    const fechaHora = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
    console.log(fechaHora); // Ejemplo: 12/12/2024 14:30:45
    return fechaHora;
  }

  generarReporte(tipo: string) {
    this.getFechaYHora();
    switch (tipo) {

      case 'Sorteo':
        this.reporteSorteo();
        break;
      case 'Calendario':
        this.reporteCalendarioCompleto();


        break;
      case 'Resultados':
        this.reporteResultados()

        break;
    }
  }



  /// SORTEO
  reporteSorteo() {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "../../../assets/img/theme/logo LDCPM.jpg"; // Ruta de la imagen

    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 40, 40); // (x=10, y=10), con ancho=50 y alto=30

      // Título
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('LIGA DEPORTIVA CANTONAL DE PEDRO MONCAYO', 120, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('COPA: ' + this.campeonatoGlobal.nombre, 120, 30, { align: 'center' });
      doc.setFont('Times', 'italic');

      doc.setFontSize(12);
      doc.text('Calle Alfredo Boada y Juan Montalvo', 120, 40, { align: 'center' });
      doc.text('ligadeportivapedromoncayo@gmail.com', 120, 45, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Times', 'normal');
      doc.text(`Categoría: ${this.categoria.categoria}`, 10, 60);
      doc.text(`Fecha: ` + this.getFechaYHora(), 100, 60);
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('TABLA DE SORTEO', 70, 75);

      // Cabecera de la tabla
      const headers = [['Nro', 'Equipo', 'Nro Sorteo']];

      const data = this.datosTabla.map((pos, index) => [
        index + 1,  // Número de la posición
        pos.nombre,
        pos.nro_sorteo,
      ]);
      this.sorteoDatos = data;

      autoTable(doc, {
        head: headers,
        body: this.sorteoDatos,
        startY: 85, // Ajusta la posición de la tabla
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [168, 0, 0], // Rojo para la cabecera
          textColor: [255, 255, 255], // Blanco
          fontSize: 12,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Color gris claro para filas alternas
        },
        margin: { top: 50, left: 10, right: 10 },
      });

      // Guardamos el PDF
      doc.save('Reporte_Sorteo.pdf');
    }

  }

  reporteCalendarioCompleto() {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "../../../assets/img/theme/logo LDCPM.jpg";

    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 40, 40);

      // Encabezado principal
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('LIGA DEPORTIVA CANTONAL DE PEDRO MONCAYO', 120, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('COPA: ' + this.campeonatoGlobal.nombre, 120, 30, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Times', 'italic');
      doc.text('Calle Alfredo Boada y Juan Montalvo', 120, 40, { align: 'center' });
      doc.text('ligadeportivapedromoncayo@gmail.com', 120, 45, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('Times', 'bold');
      doc.text('CALENDARIO DE JUEGOS', 120, 60, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Times', 'bold');
      doc.text(`Categoria: ${this.categoria.categoria}`, 50, 70);

      let startY = 70;

      // Agrupar los partidos por fecha
      const partidosPorFecha = this.datosTabla.reduce((acc, partido) => {
        if (!acc[partido.nro_fecha]) acc[partido.nro_fecha] = [];
        acc[partido.nro_fecha].push(partido);
        return acc;
      }, {});

      // Generar una tabla por cada fecha
      for (const nroFecha in partidosPorFecha) {
        const partidos = partidosPorFecha[nroFecha];

        // Título para la tabla de la fecha actual
        doc.setFontSize(12);
        doc.setFont('Times', 'bold');
        doc.text(`Nro Fecha: ${nroFecha}`, 10, startY);
        startY += 10;

        const headers = [['Nro', 'Equipo 1', 'VS', 'Equipo 2', 'Fecha y Hora']];
        const data = partidos.map((partido, index) => [
          index + 1,
          partido.equipo_1.nombre,
          'vs',
          partido.equipo_2.nombre,
          `${partido.fecha} - ${partido.hora}`,
        ]);

        autoTable(doc, {
          head: headers,
          body: data,
          startY: startY,
          styles: {
            fontSize: 10,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [168, 0, 0],
            textColor: [255, 255, 255],
            fontSize: 12,
            halign: 'center',
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
          margin: { top: 50, left: 10, right: 10 },
        });

        startY = (doc as any).lastAutoTable.finalY + 20;

        if (startY > doc.internal.pageSize.height - 30) {
          doc.addPage();
          startY = 20;
        }
      }

      doc.save('Reporte_Calendario.pdf');
    };
  }


  reporteResultados() {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "../../../assets/img/theme/logo LDCPM.jpg";

    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 40, 40);

      // Encabezado principal
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('LIGA DEPORTIVA CANTONAL DE PEDRO MONCAYO', 120, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('COPA: ' + this.campeonatoGlobal.nombre, 120, 30, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Times', 'italic');
      doc.text('Calle Alfredo Boada y Juan Montalvo', 120, 40, { align: 'center' });
      doc.text('ligadeportivapedromoncayo@gmail.com', 120, 45, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('Times', 'bold');
      doc.text('RESULTADO DE JUEGOS', 120, 60, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Times', 'bold');
      doc.text(`Categoria: ${this.categoria.categoria}`, 50, 70);

      let startY = 70;

      // Agrupar los partidos por fecha
      const partidosPorFecha = this.datosTabla.reduce((acc, partido) => {
        if (!acc[partido.nro_fecha]) acc[partido.nro_fecha] = [];
        acc[partido.nro_fecha].push(partido);
        return acc;
      }, {});

      // Generar una tabla por cada fecha
      for (const nroFecha in partidosPorFecha) {
        const partidos = partidosPorFecha[nroFecha];

        // Título para la tabla de la fecha actual
        doc.setFontSize(12);
        doc.setFont('Times', 'bold');
        doc.text(`Nro Fecha: ${nroFecha}`, 10, startY);
        startY += 10;

        const headers = [['#', 'Equipo 1', ' ', 'VS', ' ', 'Equipo 2']];
        const data = partidos.map((partido, index) => [
          index + 1,
          partido.equipo_1.nombre,
          partido.goles_1,
          'vs',
          partido.goles_2,
          partido.equipo_2.nombre
        ]);

        autoTable(doc, {
          head: headers,
          body: data,
          startY: startY,
          styles: {
            fontSize: 10,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [168, 0, 0],
            textColor: [255, 255, 255],
            fontSize: 12,
            halign: 'center',
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
          margin: { top: 50, left: 10, right: 10 },
        });

        startY = (doc as any).lastAutoTable.finalY + 20;

        if (startY > doc.internal.pageSize.height - 30) {
          doc.addPage();
          startY = 20;
        }
      }

      doc.save('Reporte_Resultados.pdf');
    };
  }


  // Método para agrupar datos por campo
  groupBy(array: any[], key: string) {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }




}
