import { Component, OnInit } from '@angular/core';
import { CampeonatosI } from 'src/app/modelos/campeonatos.interface';
import { CategoriasI } from 'src/app/modelos/categorias.interface';
import { FasesI } from 'src/app/modelos/fases.interface';
import { GolesI } from 'src/app/modelos/goles.interface';
import { PosicionI } from 'src/app/modelos/posiciones.interface';
import { ApiReportesService } from 'src/app/servicios/api/api-reportes.service';
import { ResportesPDFService } from 'src/app/servicios/reportes/resportes-pdf.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ApiLoginService } from 'src/app/servicios/api/api-login.service';
import { EquiposI } from 'src/app/modelos/equipos.interface';
import { JugadoresI } from 'src/app/modelos/jugadores.interface';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PartidosI } from 'src/app/modelos/partidos.interface';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  datosTabla: any[] = [];
  tituloTabla: string = 'Tabla de Posiciones';
  cantidadRegistros: number;
  datosPosiciones = [];
  datosGoleadores = [];

  //Entidades
  categorias: CategoriasI[];
  jugadores: JugadoresI[] = [];
  fases: FasesI[];
  posiciones: PosicionI[];
  goleadores: GolesI[];
  equipos: EquiposI[];
  equipo: EquiposI;
  categoria: CategoriasI;

  //Partidos de Cuartos
  partido1CuartosG1: any;
  partido2CuartosG1: any;
  partido1CuartosG2: any;
  partido2CuartosG2: any;

  //Partidos de Semifinal
  partidoSemifinalG1: any = null;
  partidoSemifinalG2: any = null;

  //Partidos de Final
  partidoFinal: any = null;

  //Equipo Campeon
  equipoCampeon: EquiposI;

  tarjetas: any = [];
  fechas: string[] = [];
  displayedColumns: string[] = [];

  mostrarResultadoPosiciones: boolean = false;

  //Logal Storage
  campeonatoGlobal: CampeonatosI;


  //Selectores
  categoriaSeleccionada: number | null = null;
  faseSeleccionada: number | null = null;
  equipoSeleccionado: number | null = null;

  //Rol del usuario
  userRol: string = '';

  rutaImagenes = '';

  constructor(private api: ApiReportesService, private apiLog: ApiLoginService, private router: Router, private alertas: ToastrService) { }

  ngOnInit(): void {

    this.obtenerCampeonatoGlobal();
    this.getUsuario();

  }


  getUsuario() {
    const user = this.apiLog.getUser();
    this.userRol = user ? user.rol : '';
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

  // obtenerTarjetas() {
  //   this.api.getReporteTarjetas(this.categoriaSeleccionada, this.equipoSeleccionado, this.faseSeleccionada)
  //     .subscribe((data) => {
  //       this.tarjetas = data;

  //       // Configurar columnas dinámicamente
  //       this.displayedColumns = ['nombres', 'apellidos', ...Object.keys(data[0]).filter((key) => key.startsWith('Fecha'))];
  //     });
  // }

  cargarTarjetas() {
    this.api.getReporteTarjetas(this.categoriaSeleccionada, this.equipoSeleccionado, this.faseSeleccionada).subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data); // Verificar los datos
        if (!data || Object.keys(data).length === 0) {
          console.log('No hay datos o los datos son vacíos');
          this.datosTabla = [];
          this.fechas = [];
          return;
        }

        // Convertir los datos en un array y asignar a datosTabla
        this.datosTabla = Object.values(data);

        // Extraer las fechas únicas y ordenarlas
        this.fechas = Object.keys(data[Object.keys(data)[0]].fechas)
          .sort((a, b) => {
            const numA = parseInt(a.replace('Fecha ', ''), 10);
            const numB = parseInt(b.replace('Fecha ', ''), 10);
            return numA - numB;
          });

        console.log('Fechas extraídas:', this.fechas);
        console.log('Datos procesados:', this.datosTabla);
      },
      error: (err) => {
        console.error('Error al cargar las tarjetas:', err);
      },
    });
  }


  obtenerJugadoresByEquipo() {
    const asignarFotoPredeterminada = (jugadores: any[]) => {
      const fotoPredeterminada = 'foto/sin foto.png'; // Reemplaza con tu URL o ruta
      return jugadores.map(jugador => ({
        ...jugador,
        foto: jugador.foto || fotoPredeterminada, // Asignar foto predeterminada si no tiene una
      }));
    };

    this.apiLog.getJugadoresByEquipo(this.equipoSeleccionado).subscribe(data => {
      this.jugadores = asignarFotoPredeterminada(data);
      //this.jugadores = data;
      this.datosTabla = this.jugadores;
    })
  }


  obtenerEquipos() {
    this.apiLog.getEquiposByCategoria(this.categoriaSeleccionada).subscribe(data => {
      this.equipos = data;
    })
  }

  obtenerEquipo() {
    this.apiLog.getEquipoByID(this.equipoSeleccionado).subscribe(data => {
      this.equipo = data;
    })
  }

  obtenerCampeonatoGlobal() {
    this.campeonatoGlobal = JSON.parse(localStorage.getItem('campeonatoSeleccionado') || '{}');
    if (!this.campeonatoGlobal || !this.campeonatoGlobal.id) {
      this.alertas.warning('Por favor seleccione un campeonato', 'Advertencia');
      this.router.navigate(['/campeonatos']);
    } else {
      this.obtenerCategorias();
      this.obtenerFases();
    }
  }

  obtenerCategorias() {
    this.api.getCategoriaByCampeonato(this.campeonatoGlobal.id).subscribe(data => {
      this.categorias = data;
    })
  }

  obtenerTablaPosiciones() {
    this.obtenerUnaCategoria();
    if (!this.categoriaSeleccionada) {
      this.alertas.error('Seleccione una categoría', 'Error');
      return;
    }

    console.log('fase', this.faseSeleccionada);
    const fase = Number(this.faseSeleccionada);

    switch (fase) {
      case 1: // GRUPOS 1
        this.mostrarResultadoPosiciones = false;
        this.datosTabla = [];
        this.vaciarPartidos();
        this.api.getTablaPosiciones(this.categoriaSeleccionada, this.faseSeleccionada).subscribe(data => {
          this.posiciones = data;
          this.datosTabla = this.posiciones;
        });
        break;

      case 3: // CUARTOS 3
        this.mostrarResultadoPosiciones = true;
        this.datosTabla = [];
        this.vaciarPartidos();
        this.api.getResultadosFaseCuartos(this.categoriaSeleccionada).subscribe(data => {
          this.partido1CuartosG2 = data[0];
          this.partido2CuartosG2 = data[1];
          this.partido2CuartosG1 = data[2];
          this.partido1CuartosG1 = data[3];
        });
        break;

      case 4: // SEMIFINAL 4
        this.mostrarResultadoPosiciones = true;
        this.datosTabla = [];
        this.vaciarPartidos();
        this.api.getResultadosFaseCuartos(this.categoriaSeleccionada).subscribe(data => {
          this.partido1CuartosG2 = data[0];
          this.partido2CuartosG2 = data[1];
          this.partido2CuartosG1 = data[2];
          this.partido1CuartosG1 = data[3];
        });
        this.api.getResultadosFaseSemifinal(this.categoriaSeleccionada).subscribe(data => {
          this.partidoSemifinalG2 = data[0];
          this.partidoSemifinalG1 = data[1];
        });
        break;

      case 9: // FINAL 9
        this.mostrarResultadoPosiciones = true;
        this.datosTabla = [];
        this.vaciarPartidos();
        this.api.getResultadosFaseCuartos(this.categoriaSeleccionada).subscribe(data => {
          this.partido1CuartosG2 = data[0];
          this.partido2CuartosG2 = data[1];
          this.partido2CuartosG1 = data[2];
          this.partido1CuartosG1 = data[3];
        });
        this.api.getResultadosFaseSemifinal(this.categoriaSeleccionada).subscribe(data => {
          this.partidoSemifinalG2 = data[0];
          this.partidoSemifinalG1 = data[1];
        });
        this.api.getResultadosFaseFinal(this.categoriaSeleccionada).subscribe(data => {
          this.partidoFinal = data[0];
        });
        this.api.getCampeon(this.categoriaSeleccionada).subscribe(data => {
          this.equipoCampeon = data;
        });
        break;

      default:
        this.alertas.error('Fase seleccionada no válida', 'Error');
    }

  }

  obtenerFases() {
    this.api.getFases().subscribe(data => {
      this.fases = data;
    })
  }

  obtenerGoleadores() {
    this.obtenerUnaCategoria();
    this.obtenerEquipos();
    this.api.getGoleadores(this.categoriaSeleccionada, this.cantidadRegistros).subscribe(data => {
      this.goleadores = data;
      this.datosTabla = this.goleadores;
      console.log('goleadores', this.datosTabla)
    })
  }

  vaciarDatos() {
    this.datosTabla = [];
    this.datosPosiciones = [];
    this.categoriaSeleccionada = null;
    this.faseSeleccionada = null;

  }

  obtenerUnaCategoria() {
    this.apiLog.getCategoriaByID(this.categoriaSeleccionada).subscribe(data => {
      this.categoria = data;
    })
  }


  vaciarPartidos() {
    this.partido1CuartosG1 = null;
    this.partido2CuartosG1 = null;
    this.partido1CuartosG2 = null;
    this.partido2CuartosG2 = null;
    this.partidoSemifinalG1 = null;
    this.partidoSemifinalG2 = null;
    this.partidoFinal = null;
    this.equipoCampeon = null;
  }


  mostrarDetalles(tipo: string) {
    this.mostrarResultadoPosiciones = false;


    switch (tipo) {

      case 'Posiciones':
        this.tituloTabla = 'Tabla de Posiciones';
        this.vaciarDatos();
        break;
      case 'Goleadores':
        this.tituloTabla = 'Tabla de Goleadores';
        this.vaciarDatos();

        break;
      case 'Tarjetas':
        this.tituloTabla = 'Tarjetas';
        this.vaciarDatos();

        break;
      case 'Partidos':
        this.tituloTabla = 'Partidos No Jugados';
        this.vaciarDatos()

        break;
      case 'Carnets':
        this.tituloTabla = 'Carnets Jugadores';
        this.vaciarDatos();

        break;
    }

  }

  convertirArreglo() {
    const data = this.datosTabla.map((pos, index) => [
      index + 1,  // Número de la posición
      pos.equipo.nombre,
      pos.partidosJugados,
      pos.partidosGanados,
      pos.partidosEmpatados,
      pos.partidosPerdidos,
      pos.golesFavor,
      pos.golesContra,
      pos.diferenciaGoles,
      pos.puntos
    ]);
    this.datosPosiciones = data;
  }

  generarReporte(tipo: string) {
    this.getFechaYHora();
    //this.obtenerEquipo();
    switch (tipo) {

      case 'Tabla de Posiciones':
        if (this.faseSeleccionada !== 1) {

          this.reporteCuadrangular();
        } else {

          this.reporteTablaPosiciones();

        }
        break;
      case 'Tabla de Goleadores':
        this.vaciarPartidos()
        this.reporteGoleadores();

        break;
      case 'Tarjetas':
        this.vaciarPartidos()
        this.reporteTarjetas();

        break;
      case 'Carnets Jugadores':
        this.vaciarPartidos()
        this.reporteCarnets();

        break;
    }
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


  reporteCarnets() {
    const doc = new jsPDF();
    const logo = new Image();
    const includeTitle = false; // Cambiar a false si no quieres el título en la página
    this.obtenerEquipo();
    logo.src = "../../../assets/img/theme/logo LDCPM.jpg";

    const carnetWidth = 80; // Ancho del carnet
    const carnetHeight = 58; // Alto del carnet
    const margin = 5; // Margen alrededor de cada carnet
    const gap = 2; // Espacio entre carnets
    const pageWidth = 210; // Ancho de la página A4
    const pageHeight = 297; // Alto de la página A4
    const carnetsPerRow = 2;
    const carnetsPerColumn = Math.floor((pageHeight - margin * 2 - (includeTitle ? 20 : 0)) / (carnetHeight + gap));

    logo.onload = () => {
      let currentY = margin + (includeTitle ? 20 : 0);

      if (includeTitle) {
        // Título principal
        doc.setFontSize(10);
        doc.setFont('Normal', 'bold');
        doc.text('LIGA DEPORTIVA CANTONAL DE PEDRO MONCAYO', pageWidth / 2, 15, { align: 'center' });
        doc.text('COPA "' + this.campeonatoGlobal.nombre + '"', pageWidth / 2, 20, { align: 'center' });
        doc.text('CARNETS DE JUGADORES', pageWidth / 2, 25, { align: 'center' });
      }

      this.datosTabla.forEach((jugador, index) => {
        const row = Math.floor(index / carnetsPerRow);
        const col = index % carnetsPerRow;

        const x = margin + col * (carnetWidth + gap);
        const y = currentY + row * (carnetHeight + gap);

        // Cambia de página si se alcanza el límite
        if (y + carnetHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }

        // Restablecer color y grosor de línea
        doc.setLineWidth(0.3); // Línea normal para el rectángulo
        doc.setDrawColor(0, 0, 0); // Negro para el borde del carnet
        doc.rect(x, y, carnetWidth, carnetHeight);

        // Fondo rojo para el título
        doc.setDrawColor(255, 0, 0); // Rojo
        doc.setLineWidth(7);
        doc.line(x + 1, y + 9, x + carnetWidth - 5, y + 9);

        // Título del carnet
        doc.setFontSize(8);
        doc.setFont('Normal', 'bold');
        doc.setTextColor(255, 255, 255); // Blanco
        doc.text('"PEDRO MONCAYO"', x + carnetWidth / 2, y + 10, { align: 'center' });
        doc.setTextColor(0, 0, 0); // Negro
        doc.text('LIGA DEPORTIVA CANTONAL', x + carnetWidth / 2, y + 5, { align: 'center' });
        doc.text('COPA: ' + this.campeonatoGlobal.nombre, x + carnetWidth / 2, y + 15, { align: 'center' });
        //logo
        doc.addImage(logo, 'JPEG', x + 6, y + 1, 12, 17)

        // Foto del jugador
        const fotoJugador = new Image();
        fotoJugador.src = this.rutaImagenes + jugador.foto;
        fotoJugador.onload = () => {
          doc.addImage(fotoJugador, 'JPEG', x + 2, y + 20, 20, 25);

          // Información del jugador
          //equipo
          doc.setFontSize(8);
          doc.setFont('Normal', 'bold');
          doc.text(jugador.equipo.nombre, x + carnetWidth / 2, y + 20, { align: 'center' })
          doc.setFontSize(7);
          doc.setFont('Normal', 'normal');
          doc.text('APELLIDOS: ', x + 24, y + 25);
          doc.text('NOMBRES: ', x + 24, y + 30);
          doc.text('C.I: ', x + 24, y + 35);
          doc.text('F. NACIMIENTO: ', x + 24, y + 40);
          doc.setFont('Normal', 'bold');
          doc.text(jugador.apellidos, x + 39, y + 25);
          doc.text(jugador.nombres, x + 37, y + 30);
          doc.text(jugador.cedula, x + 29, y + 35);
          doc.text(jugador.fecha_nacimiento, x + 44, y + 40);

          // Línea lateral azul
          doc.setDrawColor(0, 55, 200);
          doc.setLineWidth(10);
          doc.line(x + carnetWidth - 5, y + 2, x + carnetWidth - 5, y + carnetHeight - 2);
          doc.setFontSize(11);
          doc.setFont('Normal', 'bold');
          doc.setTextColor(255, 255, 255); // Blanco
          doc.text('Serie: ' + this.categoria.categoria, x + carnetWidth - 4, y + carnetHeight - 5, { angle: 90 });

          // Dorsal
          doc.setFontSize(14);
          doc.setFont('Normal', 'bold');
          doc.setTextColor(255, 255, 255); // Blanco
          doc.text('#' + jugador.dorsal, x + carnetWidth - 5, y + 10, { align: 'center' });

          // Firma
          doc.setFontSize(6);
          doc.setFont('Normal', 'normal');
          doc.setTextColor(0, 0, 0); // Negro
          doc.text('F. PRESIDENTE C.F.', x + 10, y + carnetHeight - 2);
          doc.text('F. SECRETARIO C.F.', x + carnetWidth - 40, y + carnetHeight - 2);

          if (index === this.datosTabla.length - 1) {
            doc.save('Carnet_Jugadores.pdf');
          }
        };

        fotoJugador.onerror = () => {
          doc.text('Error al cargar la foto', x + carnetWidth / 2, y + 20, { align: 'center' });
          if (index === this.datosTabla.length - 1) {
            doc.save('carnet_jugadores_error.pdf');
          }
        };
      });
    };

    logo.onerror = () => {
      doc.text('Error al cargar el logotipo', pageWidth / 2, 15, { align: 'center' });
      doc.save('carnet_jugadores_error.pdf');
    };
  }






  reporteTarjetas() {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "../../../assets/img/theme/logo LDCPM.jpg"; // Ruta de la imagen

    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 40, 40); // (x=10, y=10), con ancho=40 y alto=40

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
      doc.text(`Equipo: ${this.equipo.nombre}`, 10, 60);
      doc.text(`Fase: ${this.faseSeleccionada}`, 110, 60);
      doc.text(`Categoría: ${this.categoria.categoria}`, 10, 70);
      doc.text(`Fecha: ` + this.getFechaYHora(), 110, 70);
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('REPORTE DE AMONESTADOS', 70, 80);

      // Cabecera de la tabla de tarjetas
      const headers = ['Nombre completo', ...this.fechas];

      // Crea el cuerpo de la tabla de tarjetas
      const body = this.datosTabla.map((item) => {
        const row = [item.nombres + ' ' + item.apellidos];
        this.fechas.forEach(fecha => {
          row.push(item.fechas[fecha] || 'ST'); // 'ST' si no hay tarjeta para esa fecha
        });
        return row;
      });

      autoTable(doc, {
        head: [headers],
        body: body,
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
      doc.save('Reporte_Tarjetas.pdf');
    };
  }



  reporteTablaPosiciones() {
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
      doc.text(`Fase: ${this.faseSeleccionada}`, 50, 60);
      doc.text(`Fecha: ` + this.getFechaYHora(), 100, 60);
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('TABLA DE POSICIONES', 70, 75);

      // Cabecera de la tabla
      const headers = [['Pos', 'Equipo', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'GD', 'Pts']];

      this.convertirArreglo()

      autoTable(doc, {
        head: headers,
        body: this.datosPosiciones,
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
      doc.save('Teporte_Tabla_Posiciones.pdf');
    }

  }

  reporteGoleadores() {
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
      doc.text(`Nro registros: ` + this.cantidadRegistros, 50, 60);
      doc.text(`Fecha: ` + this.getFechaYHora(), 100, 60);
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('TABLA DE GOLEADORES', 70, 75);

      // Cabecera de la tabla
      const headers = [['Nro', 'Equipo', 'Nombres', 'Apellidos', 'Goles']];

      const data = this.datosTabla.map((pos, index) => [
        index + 1,  // Número de la posición
        pos.equipoNombre,
        pos.nombres,
        pos.apellidos,
        pos.totalGoles
      ]);
      this.datosGoleadores = data;

      autoTable(doc, {
        head: headers,
        body: this.datosGoleadores,
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
      doc.save('Reporte_Tabla_Goleadores.pdf');
    }

  }


  reporteCuadrangular() {
    const doc = new jsPDF('landscape'); // Orientación horizontal
    const logo = new Image();
    logo.src = "../../../assets/img/theme/logo LDCPM.jpg"; // Ruta de la imagen

    const obtenerLogo = (equipo) =>
      equipo?.logo ? this.rutaImagenes + equipo.logo : this.rutaImagenes + 'foto/logo default.png';


    const logosEquipos = {
      LogoEquipo1G1: new Image(),
      LogoEquipo2G1: new Image(),
      LogoEquipo3G1: new Image(),
      LogoEquipo4G1: new Image(),

      LogoEquipo1G2: new Image(),
      LogoEquipo2G2: new Image(),
      LogoEquipo3G2: new Image(),
      LogoEquipo4G2: new Image(),

      LogoEquipoSemi1G1: new Image(),
      LogoEquipoSemi2G1: new Image(),
      LogoEquipoSemi1G2: new Image(),
      LogoEquipoSemi2G2: new Image(),

      LogoEquipoFinalG1: new Image(),
      LogoEquipoFinalG2: new Image(),

      LogoEquipoCampeon: new Image(),
    };

    // Asignación de los logos a cada imagen
    logosEquipos.LogoEquipo1G1.src = obtenerLogo(this.partido1CuartosG1?.equipo_1);
    logosEquipos.LogoEquipo2G1.src = obtenerLogo(this.partido1CuartosG1?.equipo_2);
    logosEquipos.LogoEquipo3G1.src = obtenerLogo(this.partido2CuartosG1?.equipo_1);
    logosEquipos.LogoEquipo4G1.src = obtenerLogo(this.partido2CuartosG1?.equipo_2);

    logosEquipos.LogoEquipo1G2.src = obtenerLogo(this.partido1CuartosG2?.equipo_1);
    logosEquipos.LogoEquipo2G2.src = obtenerLogo(this.partido1CuartosG2?.equipo_2);
    logosEquipos.LogoEquipo3G2.src = obtenerLogo(this.partido2CuartosG2?.equipo_1);
    logosEquipos.LogoEquipo4G2.src = obtenerLogo(this.partido2CuartosG2?.equipo_2);

    logosEquipos.LogoEquipoSemi1G1.src = obtenerLogo(this.partidoSemifinalG1?.equipo_1);
    logosEquipos.LogoEquipoSemi2G1.src = obtenerLogo(this.partidoSemifinalG1?.equipo_2);
    logosEquipos.LogoEquipoSemi1G2.src = obtenerLogo(this.partidoSemifinalG2?.equipo_1);
    logosEquipos.LogoEquipoSemi2G2.src = obtenerLogo(this.partidoSemifinalG2?.equipo_2);

    logosEquipos.LogoEquipoFinalG1.src = obtenerLogo(this.partidoFinal?.equipo_1);
    logosEquipos.LogoEquipoFinalG2.src = obtenerLogo(this.partidoFinal?.equipo_2);

    logosEquipos.LogoEquipoCampeon.src = obtenerLogo(this.equipoCampeon);


    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 40, 40); // (x=10, y=10), con ancho=50 y alto=30

      // Título
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('LIGA DEPORTIVA CANTONAL DE PEDRO MONCAYO', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('COPA: ' + this.campeonatoGlobal.nombre, doc.internal.pageSize.width / 2, 30, { align: 'center' });
      doc.setFont('Times', 'italic');

      doc.setFontSize(12);
      doc.text('Calle Alfredo Boada y Juan Montalvo', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('ligadeportivapedromoncayo@gmail.com', doc.internal.pageSize.width / 2, 45, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Times', 'normal');
      doc.text(`Categoría: ${this.categoria.categoria}`, 20, 60);
      doc.text(`Fecha: ` + this.getFechaYHora(), 100, 60);
      doc.setFontSize(16);
      doc.setFont('Times', 'bold');
      doc.text('RESULTADOS DEL CUADRANGULAR', doc.internal.pageSize.width / 2, 75, { align: 'center' });


      // Dibujar una línea desde (x1, y1) hasta (x2, y2)
      doc.setLineWidth(1); // Grosor de la línea
      doc.setDrawColor(23, 62, 137); // Color de la línea (azul)
      //doc.setDrawColor(207, 18, 40); // Color de la línea (rojo)
      //doc.setDrawColor(5, 128, 63); // Color de la línea (verde)
      doc.line(50, 90, 50, 120);  //lateral
      doc.line(50, 90, 35, 90); //horizontal
      doc.line(50, 120, 35, 120); //horizontal
      doc.line(50, 105, 75, 105); // lateral 2

      doc.line(50, 150, 50, 180); //lateral
      doc.line(50, 150, 35, 150); //horizontal
      doc.line(50, 180, 35, 180); //horizontal
      doc.line(50, 165, 75, 165); //lat 2

      //Equipos de Cuartos
      doc.addImage(logosEquipos.LogoEquipo1G1, 'JPEG', 20, 80, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipo2G1, 'JPEG', 20, 110, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipo3G1, 'JPEG', 20, 140, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipo4G1, 'JPEG', 20, 170, 20, 20); // (x=10, y=10), con ancho=50 y alto=30


      doc.line(230, 90, 230, 120);  //lateral
      doc.line(230, 90, 245, 90); //horizontal
      doc.line(230, 120, 245, 120); //horizontal
      doc.line(230, 105, 205, 105); // lateral 2

      doc.line(230, 150, 230, 180); //lateral
      doc.line(230, 150, 245, 150); //horizontal
      doc.line(230, 180, 245, 180); //horizontal
      doc.line(230, 165, 205, 165); //lat 2

      //Equipos de Cuartos
      doc.addImage(logosEquipos.LogoEquipo1G2, 'JPEG', 240, 80, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipo2G2, 'JPEG', 240, 110, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipo3G2, 'JPEG', 240, 140, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipo4G2, 'JPEG', 240, 170, 20, 20); // (x=10, y=10), con ancho=50 y alto=30

      // Lineas semi final
      doc.setDrawColor(207, 18, 40); // Color de la línea (rojo)
      doc.line(90, 105, 90, 165);  //lateral
      doc.line(90, 105, 80, 105); //horizontal
      doc.line(90, 165, 80, 165); //horizontal
      doc.line(90, 135, 115, 135); // lateral 2

      doc.line(190, 105, 190, 165);  //lateral
      doc.line(190, 105, 200, 105); //horizontal
      doc.line(190, 165, 200, 165); //horizontal
      doc.line(190, 135, 175, 135); // lateral 2
      //Equipos de SemiFinal
      doc.addImage(logosEquipos.LogoEquipoSemi1G1, 'JPEG', 60, 155, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipoSemi2G1, 'JPEG', 60, 95, 20, 20); // (x=10, y=10), con ancho=50 y alto=30

      doc.addImage(logosEquipos.LogoEquipoSemi1G2, 'JPEG', 200, 95, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipoSemi2G2, 'JPEG', 200, 155, 20, 20); // (x=10, y=10), con ancho=50 y alto=30


      // Lineas final
      doc.setDrawColor(5, 128, 63); // Color de la línea (verde)
      doc.line(110, 110, 170, 110); // horizontal 
      doc.line(110, 110, 110, 140);  //lateral
      doc.line(170, 110, 170, 140);  //lateral

      //Equipos de Final
      doc.addImage(logosEquipos.LogoEquipoFinalG1, 'JPEG', 100, 125, 20, 20); // (x=10, y=10), con ancho=50 y alto=30
      doc.addImage(logosEquipos.LogoEquipoFinalG2, 'JPEG', 160, 125, 20, 20); // (x=10, y=10), con ancho=50 y alto=30

      //Equipos de Campeon
      doc.addImage(logosEquipos.LogoEquipoCampeon, 'JPEG', 125, 90, 30, 30); // (x=10, y=10), con ancho=50 y alto=30

      // Guardamos el PDF
      doc.save('Reporte_Cuadrangular.pdf');
    }
  }

}
