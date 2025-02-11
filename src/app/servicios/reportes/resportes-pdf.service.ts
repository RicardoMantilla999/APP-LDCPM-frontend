import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})
export class ResportesPDFService {

  constructor() {

  }


  // crearPDF(datos: any) {
  //   // Definición del documento
  //   const docDefinition = {
  //     content: [
  //       {
  //         columns: [
  //           {
  //             image: 'logo',
  //             width: 100
  //           },
  //           {
  //             text: 'LIGA DEPORTIVA CANTONAL DE PEDRO MONCAYO\n',
  //             style: 'header',
  //             alignment: 'center',
  //           },
  //         ]
  //       },
  //       {
  //         text: 'Av. Eugenio Espejo y Tobías Mena\nTeléfono: 2585-445\n\n',
  //         style: 'subheader',
  //         alignment: 'center',
  //       },
  //       {
  //         text: `Categoría: ${datos.categoria}\nFecha: ${datos.fecha}\nFase: ${datos.fase}\n\n`,
  //         alignment: 'center',
  //       },
  //       {
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
  //           body: [
  //             // Encabezados
  //             [
  //               { text: 'Pos', style: 'tableHeader' },
  //               { text: 'Equipo', style: 'tableHeader' },
  //               { text: 'PJ', style: 'tableHeader' },
  //               { text: 'PG', style: 'tableHeader' },
  //               { text: 'PE', style: 'tableHeader' },
  //               { text: 'PP', style: 'tableHeader' },
  //               { text: 'GF', style: 'tableHeader' },
  //               { text: 'GC', style: 'tableHeader' },
  //               { text: 'GD', style: 'tableHeader' },
  //               { text: 'Pts', style: 'tableHeader' }
  //             ],
  //             // Cuerpo de la tabla
  //             ...datos.posiciones.map(pos => [
  //               pos.pos,
  //               pos.equipo,
  //               pos.pj,
  //               pos.pg,
  //               pos.pe,
  //               pos.pp,
  //               pos.gf,
  //               pos.gc,
  //               pos.gd,
  //               pos.pts
  //             ])
  //           ]
  //         },
  //         layout: 'lightHorizontalLines'
  //       },
  //       {
  //         text: '\nReporte generado automáticamente por el sistema de gestión de campeonatos.',
  //         style: 'footer',
  //         alignment: 'center'
  //       }
  //     ],
  //     styles: {
  //       header: {
  //         fontSize: 18,
  //         bold: true,
  //         margin: [0, 10, 0, 10]
  //       },
  //       subheader: {
  //         fontSize: 12,
  //         margin: [0, 5, 0, 10]
  //       },
  //       tableHeader: {
  //         bold: true,
  //         fontSize: 11,
  //         color: 'white',
  //         fillColor: '#A80000',
  //         alignment: 'center'
  //       },
  //       footer: {
  //         fontSize: 10,
  //         italics: true
  //       }
  //     },
  //     images: {
  //       // Base64 de tu logo
  //       logo: 'data:image/png;base64,INSERTA_AQUÍ_TU_BASE64'
  //     }
  //   };

  //   // Generar y descargar el PDF
  //   pdfMake.createPdf(docDefinition).download('reporte.pdf');
  // }

}
