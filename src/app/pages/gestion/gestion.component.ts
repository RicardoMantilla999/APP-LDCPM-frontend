import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { dir, error } from 'console';
import { ToastrService } from 'ngx-toastr';
import { ArbitrosI } from 'src/app/modelos/arbitros.interface';
import { CampeonatosI } from 'src/app/modelos/campeonatos.interface';
import { CategoriasI } from 'src/app/modelos/categorias.interface';
import { DirigenteI } from 'src/app/modelos/dirigentes.interface';
import { EquiposI } from 'src/app/modelos/equipos.interface';
import { JugadoresI } from 'src/app/modelos/jugadores.interface';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import { LoadingService } from 'src/app/servicios/loading.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.scss']
})
export class GestionComponent implements OnInit {

  datosTabla: any[] = [];
  tituloTabla: string = 'Categorías'; // Título que se muestra en la tabla
  //Entidades
  categorias: CategoriasI[];
  equipos: EquiposI[];
  dirigentes: DirigenteI[] = [];
  arbitros: ArbitrosI[];
  jugadores: JugadoresI[];

  //Total de Datos
  totalEquipos: number;
  totalCategorias: number;
  totalJugadores: number;
  totalDirigentes: number;
  totalArbitros: number;

  //Variables para la Vista
  mostrarTabla: boolean = true;
  mostrarForm: boolean = false;
  mostrarFormEditar: boolean = false;
  mostrarFormImportar: boolean = false;
  formularioActual: string = 'Categorías';
  itemSeleccionado: any = null;

  file: File | null = null;

  //LocalStorage
  campeonatoGlobal: CampeonatosI;

  isLoading = false;

  constructor(private api: ApiLoginService, private router: Router, activeRouter: ActivatedRoute, private formBuilder: FormBuilder, private alertas: ToastrService, public loading: LoadingService) { }


  //Editar Objetos
  editarCategoria: FormGroup;
  editarEquipo: FormGroup;
  editarJugador: FormGroup;
  editarDirigente: FormGroup;
  editarArbitro: FormGroup;

  // Crear Nuevos Objetos
  nuevaCat: FormGroup;
  nuevoEquipo: FormGroup;
  nuevoJugador: FormGroup;
  nuevoDirigente: FormGroup;
  nuevoArbitro: FormGroup;

  //Selectores 
  categoriaSeleccionada: number | null = null;
  equipoSeleccionado: number | null = null;

  //Selector archivo 
  selectedFile: File | null = null;


  ngOnInit(): void {
    //Local Storage
    this.loading.show();
    this.getCampeonato();
    this.loading.hide()
  }

  getCampeonato() {
    this.campeonatoGlobal = JSON.parse(localStorage.getItem('campeonatoSeleccionado') || '{}');

    if (!this.campeonatoGlobal || !this.campeonatoGlobal.id) {
      this.alertas.warning('Por favor seleccione un campeonato', 'Advertencia');
      this.router.navigate(['/campeonatos']);
    } else {

      this.refrescarCantidad();

      this.cargarFormularios();

      this.mostrarDetalles(this.tituloTabla);
    }
  }

  cargarFormularios() {

    this.nuevaCat = this.formBuilder.group({
      categoria: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
    this.nuevoEquipo = this.formBuilder.group({
      nombre: ['', Validators.required],
      uniforme: ['', Validators.required],
      fecha_fundacion: ['', Validators.required],
      categoria: ['', Validators.required],
      dirigente: ['', Validators.required],
    });
    this.nuevoJugador = this.formBuilder.group({
      cedula: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      dorsal: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      canton_juega: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', Validators.required],
      origen: ['', Validators.required],
      foto: [null],
      equipo: ['', Validators.required],
    });
    this.nuevoDirigente = this.formBuilder.group({
      cedula: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', Validators.required],
      lugar_nacimiento: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
    });
    this.nuevoArbitro = this.formBuilder.group({
      cedula: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', Validators.required],
      direccion: ['', Validators.required],
    });

    //EDITAR OBJETOS
    this.editarCategoria = new FormGroup({
      id: new FormControl(''),
      categoria: new FormControl(''),
      descripcion: new FormControl('')
    })
    this.editarEquipo = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl(''),
      uniforme: new FormControl(''),
      fecha_fundacion: new FormControl(''),
      categoria: new FormControl(''),
      dirigente: new FormControl(''),
      logo: new FormControl(''),
    })
    this.editarJugador = new FormGroup({
      id: new FormControl(''),
      cedula: new FormControl(''),
      nombres: new FormControl(''),
      apellidos: new FormControl(''),
      dorsal: new FormControl(''),
      fecha_nacimiento: new FormControl(''),
      canton_juega: new FormControl(''),
      direccion: new FormControl(''),
      telefono: new FormControl(''),
      email: new FormControl(''),
      origen: new FormControl(''),
      foto: new FormControl(''),
      equipo: new FormControl(''),
      //suspendido: new FormControl(''),
    })
    this.editarDirigente = new FormGroup({
      id: new FormControl(''),
      cedula: new FormControl(''),
      nombres: new FormControl(''),
      apellidos: new FormControl(''),
      telefono: new FormControl(''),
      lugar_nacimiento: new FormControl(''),
      fecha_nacimiento: new FormControl(''),
      suspendido: new FormControl(''),
    })
    this.editarArbitro = new FormGroup({
      id: new FormControl(''),
      cedula: new FormControl(''),
      nombres: new FormControl(''),
      apellidos: new FormControl(''),
      telefono: new FormControl(''),
      email: new FormControl(''),
      direccion: new FormControl(''),
    })
  }

  vaciarDatos() {
    this.datosTabla = null;

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

    // Redirigir al usuario a la página de login o cualquier otra
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;  // Asegúrate de que esta es la variable usada
    }
  }



  mostrarFormulario(tipo: string) {
    this.mostrarFormEditar = false;
    this.mostrarTabla = false;
    this.mostrarForm = true;
    this.formularioActual = tipo;
    this.categoriaSeleccionada = -1;
    this.equipoSeleccionado = -1;
    this.mostrarFormImportar = false;
  }

  mostrarFormularioImportar() {
    this.mostrarFormImportar = true;
    this.mostrarTabla = false;
    this.mostrarForm = false;
    this.mostrarFormEditar = false;
    this.categoriaSeleccionada = -1;
    this.equipoSeleccionado = -1;
  }

  volverATabla() {
    this.mostrarTabla = true;
    this.formularioActual = '';
    this.mostrarFormEditar = false;
    this.mostrarForm = false;
    this.mostrarFormImportar = false;
  }


  mostrarDetalles(tipo: string) {
    // Actualiza los datos y el título de la tabla según el tipo seleccionado
    this.vaciarDatos();
    switch (tipo) {
      case 'Categorías':
        this.categoriaSeleccionada = -1;
        this.equipoSeleccionado = -1;
        this.isLoading = true;
        this.api.getCategoriaByCampeonato(this.campeonatoGlobal.id).subscribe(data => {
          this.isLoading = false;
          this.categorias = data;
          this.datosTabla = this.categorias;
          this.tituloTabla = 'Categorías';
          this.volverATabla();
          this.refrescarCantidad();
        });
        break;
      case 'Equipos':

        this.isLoading = true;
        if (this.categoriaSeleccionada < 0) {
          this.api.getEquipos(this.campeonatoGlobal.id).subscribe(data => {
            this.isLoading = false;
            this.equipos = data;
            this.datosTabla = this.equipos;
            this.tituloTabla = 'Equipos';
            this.volverATabla();
            this.refrescarCantidad();
          });
        } else if (this.categoriaSeleccionada > 0) {
          this.api.getEquiposByCategoriaAndCampeonato(this.categoriaSeleccionada, this.campeonatoGlobal.id).subscribe(data => {
            this.isLoading = false;
            this.equipos = data;
            this.datosTabla = this.equipos;
            this.tituloTabla = 'Equipos';
            this.volverATabla();
            this.refrescarCantidad();
          })
        }

        break;
      case 'Jugadores':
        this.categoriaSeleccionada = -1;
        this.isLoading = true;
        this.api.getEquipos(this.campeonatoGlobal.id).subscribe(data => {
          this.equipos = data;
        });
        if (!this.equipoSeleccionado) {
          this.equipos = [];
        }
        const asignarFotoPredeterminada = (jugadores: any[]) => {
          const fotoPredeterminada = '../assets/img/theme/sin foto.png'; // Reemplaza con tu URL o ruta
          return jugadores.map(jugador => ({
            ...jugador,
            foto: jugador.foto || fotoPredeterminada, // Asignar foto predeterminada si no tiene una
          }));
        };

        if (this.equipoSeleccionado < 0) {
          this.api.getJugadores(this.campeonatoGlobal.id).subscribe(data => {
            this.isLoading = false;
            this.jugadores = asignarFotoPredeterminada(data); // Aplicar la función para asignar la foto
            this.datosTabla = this.jugadores;
            this.tituloTabla = 'Jugadores';
            this.volverATabla();
            this.refrescarCantidad();
          });
        } else {
          this.api.getJugadoresByEquipo(this.equipoSeleccionado).subscribe(data => {
            this.isLoading = false;
            this.jugadores = asignarFotoPredeterminada(data); // Aplicar la función para asignar la foto
            this.datosTabla = this.jugadores;
            this.tituloTabla = 'Jugadores';
            this.volverATabla();
            this.refrescarCantidad();
          });
        }

        break;

      case 'Arbitros':
        this.categoriaSeleccionada = -1;
        this.equipoSeleccionado = -1;
        this.isLoading = true;
        this.api.getArbitros(this.campeonatoGlobal.id).subscribe(data => {
          this.isLoading = false;
          this.arbitros = data;
          this.datosTabla = this.arbitros;
          this.tituloTabla = 'Arbitros';
          this.volverATabla();
          this.refrescarCantidad();
        });
        break;
      case 'Dirigentes':
        this.categoriaSeleccionada = -1;
        this.equipoSeleccionado = -1;
        this.isLoading = true;
        this.api.getDirigentes(this.campeonatoGlobal.id).subscribe(data => {
          this.isLoading = false;
          this.dirigentes = data;
          this.datosTabla = this.dirigentes;
          this.tituloTabla = 'Dirigentes';
          this.volverATabla();
          this.refrescarCantidad();
        });
        break;

      // Añade más casos según sea necesario
      default:
        this.categoriaSeleccionada = -1;
        this.equipoSeleccionado = -1;
        this.isLoading = true;
        this.api.getCategorias().subscribe(data => {
          this.isLoading = false;
          this.categorias = data;
          this.datosTabla = this.categorias;
          this.tituloTabla = 'Categorías';
          this.volverATabla();
          this.refrescarCantidad();
        });
    }
  }


  crearObjeto(tipo: string) {
    switch (tipo) {
      case 'Categorías':
        Swal.fire({
          title: '¿Guardar este registro?',
          text: 'Verifica que la información sea correcta',
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Llamar al servicio para guardar
            const nuevaCategoria = this.nuevaCat.value; // Aquí asegúrate de que editarForm tenga los controles correctos para la categoría
            nuevaCategoria.campeonato = this.campeonatoGlobal.id;
            this.api.crearCategoria(nuevaCategoria).subscribe(
              (response) => {
                this.isLoading = false;
                this.alertas.success('Categoria ' + nuevaCategoria.categoria + ' creada con éxito.', 'Hecho');
                this.mostrarDetalles('Categorías');
                this.refrescarCantidad();
              },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al crear la categoría.');
              }
            );
          }
        });

        break;

      case 'Equipos':
        this.categoriaSeleccionada = -1;
        if (this.selectedFile) {
          Swal.fire({
            title: '¿Guardar este registro?',
            text: 'Verifica que la información sea correcta',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.isLoading = true;
              // Llamar al servicio para guardar
              const equipoData = this.nuevoEquipo.value;
              equipoData.campeonato = this.campeonatoGlobal.id;
              equipoData.nro_sorteo = Number(0);
              this.api.crearEquipo(equipoData, this.selectedFile).subscribe({
                next: (response) => {
                  this.isLoading = false;
                  this.alertas.success('Equipo creado con éxito', 'Hecho')
                  this.mostrarDetalles('Equipos');
                  this.refrescarCantidad();
                },
                error: (error) => {
                  this.isLoading = false;
                  this.alertas.error(error.error.message || 'Error desconocido', 'Error al crear Equipo')

                },
              });
            }
          });
        } else {
          console.error('Por favor, selecciona una imagen para el logo.');
          this.alertas.warning('Debe seleccionar un logo', 'Error al crear Equipo')
        }
        break;

      case 'Jugadores':
        this.categoriaSeleccionada = -1;
        Swal.fire({
          title: '¿Guardar este registro?',
          text: 'Verifica que la información sea correcta',
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Llamar al servicio para guardar
            const jugadorData = this.nuevoJugador.value
            const dorsal: number = this.nuevoJugador.value.dorsal
            const equipo: number = this.equipoSeleccionado;
            console.log('datos del form: ', this.nuevoJugador.value)
            jugadorData.dorsal = dorsal;
            jugadorData.equipo = equipo;
            if (this.selectedFile) {
              //formData.append('foto', this.selectedFile);
              jugadorData.foto = this.selectedFile;
            }
            console.log('datos recibidos ', jugadorData)
            this.api.createJugador(jugadorData).subscribe((response) => {
              this.isLoading = false;
              this.alertas.success('Jugador creado con éxito', 'Hecho')
              this.equipoSeleccionado = -1;
              this.mostrarDetalles('Jugadores');
              this.refrescarCantidad();

            }, (error) => {
              this.isLoading = false;
              this.alertas.error(error.error.message || 'Error desconocido', 'Error al crear Jugador');
            });
          }
        });

        break;
      case 'Arbitros':
        Swal.fire({
          title: '¿Guardar este registro?',
          text: 'Verifica que la información sea correcta',
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Llamar al servicio para guardar
            const nuevoArbitro = this.nuevoArbitro.value; // Aquí asegúrate de que editarForm tenga los controles correctos para la categoría
            nuevoArbitro.campeonato = this.campeonatoGlobal.id;
            this.api.crearArbitro(nuevoArbitro).subscribe(
              (response) => {
                this.isLoading = false;
                this.alertas.success('Arbitro ' + nuevoArbitro.nombres + ' creado con éxito.', 'Hecho');
                this.mostrarDetalles('Arbitros');
                this.refrescarCantidad();
              },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al crear Arbitro.',);
              }
            );
          }
        });

        break;

      case 'Dirigentes':
        Swal.fire({
          title: '¿Guardar este registro?',
          text: 'Verifica que la información sea correcta',
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Llamar al servicio para guardar
            const nuevoDirigente = this.nuevoDirigente.value;
            nuevoDirigente.campeonato = this.campeonatoGlobal.id;
            this.api.crearDirigente(nuevoDirigente).subscribe(
              (response) => {
                this.isLoading = false;
                this.alertas.success('Dirigente ' + nuevoDirigente.nombres + ' creado con éxito.', 'Hecho');
                this.mostrarDetalles('Dirigentes');
                this.refrescarCantidad();
              },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al crear Dirigente.',);
              }
            );
          }
        });

        break;

      default:
        this.datosTabla = [];
        this.tituloTabla = '';
    }
  }

  eliminarObjeto(item: any) {
    this.categoriaSeleccionada = -1;
    switch (this.tituloTabla) {

      case 'Categorías':
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Llamar al servicio para eliminar el elemento
            this.api.eliminarCategoria(item.id).subscribe(
              (response) => {
                this.alertas.success('Categoría ' + item.categoria + ' eliminada con éxito.', 'Hecho');
                this.mostrarDetalles('Categorías');
                this.refrescarCantidad();
              },
              (error) => {
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al eliminar Categoría.');
              }
            );
          }
        });

        break;

      case 'Equipos':
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Llamar al servicio para eliminar el elemento
            this.api.eliminarEquipo(item.id).subscribe(
              (response) => {
                this.alertas.success('Equipo ' + item.nombre + ' eliminado con éxito.', 'Hecho');
                this.mostrarDetalles('Equipos');
                this.refrescarCantidad();
              },
              (error) => {
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al eliminar Equipo.');
              }
            );
          }
        });

        break;

      case 'Jugadores':
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Llamar al servicio para eliminar el elemento
            this.api.eliminarjugador(item.id).subscribe(
              (response) => {
                this.alertas.success('Jugador ' + item.nombres + ' eliminado con éxito.', 'Hecho');
                this.mostrarDetalles('Jugadores');
                this.refrescarCantidad();
              },
              (error) => {
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al eliminar Jugador.');
              }
            );
          }
        });

        break;

      case 'Arbitros':
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Llamar al servicio para eliminar el elemento
            this.api.eliminarArbitro(item.id).subscribe(
              (response) => {
                this.alertas.success('Arbitro ' + item.nombres + ' eliminado con éxito.', 'Hecho');
                this.mostrarDetalles('Arbitros');
                this.refrescarCantidad();
              },
              (error) => {
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al eliminar Arbitro.');
              }
            );
          }
        });

        break;
      case 'Dirigentes':
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Llamar al servicio para eliminar el elemento
            this.api.eliminardirigente(item.id).subscribe(
              (response) => {
                this.alertas.success('Dirigente ' + item.nombres + ' eliminado con éxito.', 'Hecho');
                this.mostrarDetalles('Dirigentes');
                this.refrescarCantidad();
              },
              (error) => {
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al eliminar Dirigente.');
              });
          }
        });

        break;

      default:
        this.datosTabla = [];
        this.tituloTabla = '';
    }
  }



  guardarCambios(tipo: string) {
    switch (tipo) {
      case 'Categorías':
        Swal.fire({
          title: '¿Estas seguro de editar esta categoría?',
          text: 'Verifica que los datos sean correctos antes de continuar.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, editar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Ejecutar lógica de edición
            const categoriaEditada = this.editarCategoria.value;
            categoriaEditada.campeonato = this.campeonatoGlobal.id;
            this.api.editarCategoria(categoriaEditada).subscribe(
              (response) => {
                this.isLoading = false;
                this.alertas.success('Categoría actualizada con éxito.', 'Hecho');
                this.mostrarDetalles('Categorías');
                this.refrescarCantidad();
              },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al actualizar Categoría.');
              });
          }
        });

        break;

      case 'Equipos':
        Swal.fire({
          title: '¿Estas seguro de editar este equipo?',
          text: 'Verifica que los datos sean correctos antes de continuar.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, editar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Ejecutar lógica de edición
            const formData = new FormData();
            formData.append('nombre', this.editarEquipo.value.nombre);
            formData.append('uniforme', this.editarEquipo.value.uniforme);
            formData.append('fecha_fundacion', this.editarEquipo.value.fecha_fundacion);
            formData.append('categoria', this.editarEquipo.value.categoria);
            formData.append('dirigente', this.editarEquipo.value.dirigente);
            formData.append('campeonato', this.campeonatoGlobal.id.toString());

            if (this.selectedFile) {
              formData.append('logo', this.selectedFile);
            }

            const id = this.editarEquipo.value.id;
            this.api.editarEquipo(formData, id).subscribe(
              (response) => {
                this.isLoading = false;
                this.alertas.success('Equipo actualizado con éxito.', 'Hecho');
                this.mostrarDetalles('Equipos');
                this.refrescarCantidad();
              },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al actualizar Equipo.');
              }
            );
          }
        });
        break;

      case 'Jugadores':
        Swal.fire({
          title: '¿Estas seguro de editar este jugador?',
          text: 'Verifica que los datos sean correctos antes de continuar.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, editar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Ejecutar lógica de edición
            const jugadorEditado = { ...this.editarJugador.value };

            // Si no se seleccionó una nueva foto, eliminar la propiedad `foto`
            if (!this.selectedFile) {
              delete jugadorEditado.foto;
            }
            const formData = new FormData();
            for (const key in jugadorEditado) {
              if (jugadorEditado[key] !== null && jugadorEditado[key] !== undefined) {
                formData.append(key, jugadorEditado[key]);
              }
            }
            // Si hay una nueva foto, agregarla al FormData
            if (this.selectedFile) {
              formData.append('foto', this.selectedFile);
            }

            const id = this.editarJugador.value.id;
            this.api.editarJugador(formData, id).subscribe(
              (response) => {
                this.isLoading = false;
                this.alertas.success('Jugador actualizado con éxito.', 'Hecho');
                this.mostrarDetalles('Jugadores');
                this.refrescarCantidad();
              },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al actualizar Jugador.');
              }
            );

          }
        });

        break;
      case 'Arbitros':
        Swal.fire({
          title: '¿Estas seguro de editar este árbitro?',
          text: 'Verifica que los datos sean correctos antes de continuar.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, editar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Ejecutar lógica de edición
            const arbitroEditado = this.editarArbitro.value;
            arbitroEditado.campeonato = this.campeonatoGlobal.id;
            this.api.editarArbitro(arbitroEditado).subscribe(
              (response) => {
                this.isLoading = false;
                this.alertas.success('Arbitro actualizado con éxito.', 'Hecho');
                this.mostrarDetalles('Arbitros');
                this.refrescarCantidad();
              },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al actualizar Arbitro.');
              });
          }
        });

        break;
      case 'Dirigentes':
        Swal.fire({
          title: '¿Estas seguro de editar este dirigente?',
          text: 'Verifica que los datos sean correctos antes de continuar.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, editar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoading = true;
            // Ejecutar lógica de edición
            const dirigenteEditado = this.editarDirigente.value;
            dirigenteEditado.campeonato = this.campeonatoGlobal.id;
            this.api.editarDirigente(dirigenteEditado).subscribe(response => {
              this.alertas.success('Dirigente actualizado con éxito.', 'Hecho');
              this.isLoading = false;
              this.mostrarDetalles('Dirigentes');
              this.refrescarCantidad();
            },
              (error) => {
                this.isLoading = false;
                this.alertas.error(error.error.message || 'Error desconocido', 'Error al actualizar Dirigente.');
              });
          }
        });

        break;

      default:
        this.datosTabla = [];
        this.tituloTabla = '';
    }
  }




  showFormEdit(item: any) {
    this.mostrarTabla = false;
    this.mostrarFormEditar = true;
    this.categoriaSeleccionada = -1;
    this.equipoSeleccionado = -1;

    switch (this.tituloTabla) {

      case 'Categorías':
        this.api.getCategoriaByID(item.id).subscribe(data => {
          console.log('Respuesta API: ', data);
          this.editarCategoria.setValue({
            id: data.id,
            categoria: data.categoria,
            descripcion: data.descripcion,
          });
        });
        break;

      case 'Equipos':
        this.api.getEquipoByID(item.id).subscribe(data => {
          console.log('Respuesta API: ', data);
          this.editarEquipo.patchValue({
            id: data.id,
            nombre: data.nombre,
            uniforme: data.uniforme,
            fecha_fundacion: data.fecha_fundacion,
            categoria: data.categoria.id,
            dirigente: data.dirigente.id,
            logo: data.logo
          })
        });
        this.selectedFile = null;
        break;

      case 'Jugadores':
        this.api.getJugadorByID(item.id).subscribe(data => {
          console.log('Respuesta API: ', data);
          this.editarJugador.setValue({
            id: data.id,
            cedula: data.cedula,
            nombres: data.nombres,
            apellidos: data.apellidos,
            dorsal: data.dorsal,
            fecha_nacimiento: data.fecha_nacimiento,
            canton_juega: data.canton_juega,
            direccion: data.direccion,
            telefono: data.telefono,
            email: data.email,
            origen: data.origen,
            foto: data.foto,
            equipo: data.equipo.id,
          });
        });
        break;

      case 'Dirigentes':
        this.api.getDirigenteByID(item.id).subscribe(data => {
          console.log('Respuesta API: ', data);
          this.editarDirigente.setValue({
            id: data.id,
            cedula: data.cedula,
            nombres: data.nombres,
            apellidos: data.apellidos,
            telefono: data.telefono,
            lugar_nacimiento: data.lugar_nacimiento,
            fecha_nacimiento: data.fecha_nacimiento,
            suspendido: data.suspendido,
          });
        });
        break;

      case 'Arbitros':
        this.api.getArbitroByID(item.id).subscribe(data => {
          console.log('Respuesta API: ', data);
          this.editarArbitro.setValue({
            id: data.id,
            cedula: data.cedula,
            nombres: data.nombres,
            apellidos: data.apellidos,
            telefono: data.telefono,
            email: data.email,
            direccion: data.direccion
          });
        });
        break;

      default:
        this.datosTabla = [];
        this.tituloTabla = '';
    }
  }



  refrescarCantidad() {
    this.api.contarEquipos(this.campeonatoGlobal.id).subscribe(data => {
      this.totalEquipos = data;
    })
    this.api.contarCategorias(this.campeonatoGlobal.id).subscribe(data => {
      this.totalCategorias = data;
    })
    this.api.contarJugadores(this.campeonatoGlobal.id).subscribe(data => {
      this.totalJugadores = data;
    })
    this.api.contarDirigentes(this.campeonatoGlobal.id).subscribe(data => {
      this.totalDirigentes = data;
    })
    this.api.contarArbitros(this.campeonatoGlobal.id).subscribe(data => {
      this.totalArbitros = data;
    })
  }


  // Método para manejar el cambio de archivo
  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.file = input.files[0];
    }
  }

  // Método para enviar el archivo al servidor
  onSubmit() {
    if (this.file) {
      this.loading.show();
      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('equipoId', this.equipoSeleccionado.toString());

      this.api.importarJugadores(formData).subscribe(
        (response) => {
          this.loading.hide();
          this.alertas.success('Jugadores importados exitosamente', 'Hecho');
        },
        (error) => {
          this.loading.hide();
          console.error(error);  // Verifica la respuesta del error aquí
          this.alertas.error('Hubo un error al importar los jugadores', 'Error');
        }
      );
    }
  }


}
