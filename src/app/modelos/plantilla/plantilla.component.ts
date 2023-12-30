import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantillaService } from '../../services/plantilla.service';
import * as file2html from 'file2html';
import OOXMLReader from 'file2html-ooxml';
import OdtReader from 'file2html-odf';
import JSZip from 'jszip';

file2html.config({
  readers: [OdtReader, OOXMLReader],
});
@Component({
  selector: 'app-plantilla',
  standalone: true,
  imports: [],
  templateUrl: './plantilla.component.html',
  styleUrl: './plantilla.component.css',
})
export class PlantillaComponent implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  PS: PlantillaService;
  id: number;
  file: File;
  nombre: string;
  ruta: string;
  claves: Array<string> = [];

  constructor(private ps: PlantillaService) {
    this.PS = ps;

    this.id = this.route.snapshot.queryParams['id'];
    console.log('id: ' + this.id);
    this.file = this.ps.getPlantillaForId(this.id);
    this.nombre = this.file.name;
    console.log('nombre: ' + this.nombre);
    this.ruta = this.file.webkitRelativePath;
    console.log('ruta: ' + this.ruta);

    if (this.ruta.substring(this.ruta.length - 4).toLowerCase() == '.odt') {
      this.EditOdt(this.file);
    } else if (
      this.ruta.substring(this.ruta.length - 4).toLowerCase() == 'docx'
    ) {
      this.EditDocx(this.file);
    }
  }
  ngOnInit(): void {}

  buscaClaves(fileString: string) {

    let index: number = 0;
    while (index !== -1) {
      index = fileString.indexOf('{{', index);
      if (index !== -1) {
        let indexEnd = fileString.indexOf('}}', index);
        if (indexEnd !== -1) {
          let clave = fileString.substring(index + 2, indexEnd);
          clave = clave.replace(/<.*?>/g, '');
          if (!this.claves.includes(clave)) {
            this.claves.push(clave);
          }
          index = indexEnd;
        }
      }
    }
    console.log("Se han encontrado "+this.claves.length+" claves");
    for(let clave of this.claves) {
      console.log(clave);
    }
  }

  replaceXmlInCopy(originalBlob: Blob, modifiedXml: string, outputPath: string) {
    const zip = new JSZip();
  
    // Lee el contenido del archivo original
    zip.loadAsync(originalBlob).then((originalZip) => {
      // Sustituye el contenido XML modificado
      originalZip.file(outputPath, modifiedXml);
  
      // Crea el nuevo archivo
      originalZip.generateAsync({ type: 'blob' }).then((newBlob) => {
        // Puedes usar newBlob como prefieras, por ejemplo, guardarlo o descargarlo
        // Aquí un ejemplo de descarga
        const link = document.createElement('a');
        link.href = URL.createObjectURL(newBlob);
        link.download = 'nuevo_archivo.odt'; // Puedes cambiar el nombre según el tipo de archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  }

  async EditOdt(file: File) {
    console.log('Desde EditOdt');
    //prueba con XML
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      // Descomprime el archivo .odt
      const zip = await JSZip().loadAsync(this.file);

      // Accede al contenido del archivo content.xml
      const contentXml = await zip.file('content.xml').async('text');

      // Ahora puedes procesar el contenido XML como desees
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(contentXml, 'text/xml');
      const serializer = new XMLSerializer();
      const SxmlDoc = serializer.serializeToString(xmlDoc);

      console.log('Resultado XML: \n' + SxmlDoc);

      this.buscaClaves(SxmlDoc);
    };

    reader.readAsArrayBuffer(file);

    //prueba con file2html
    try {
      // Espera a que se resuelva la Promesa y obtén el contenido del archivo en formato ArrayBuffer
      const content = await file.arrayBuffer();

      // Lee el archivo y conviértelo a HTML
      const fileData = await file2html.read({
        fileBuffer: content,
        meta: { mimeType: 'application/vnd.oasis.opendocument.text' },
      });

      // Extrae los estilos y el contenido del archivo
      const { styles, content: fileContent } = fileData.getData();

      // Concatena estilos y contenido
      const html = styles + fileContent;

      console.log('RESULTADO: \n' + html);
    } catch (error) {
      // Maneja cualquier error que pueda ocurrir durante el proceso
      console.error('Error:', error);

      // Imprime información adicional sobre el error específico
      if (error.code === 'file2html.errors.unsupportedFile') {
        console.error('El formato del archivo no es compatible.');
      }
    }
  }

  async EditDocx(file: File) {
    console.log('Desde EditDocx');
  //prueba con XML
  const reader = new FileReader();

  reader.onload = async (e: ProgressEvent<FileReader>) => {
    // Descomprime el archivo .odt
    const zip = await JSZip().loadAsync(this.file);
    // Accede al contenido del archivo document.xml
    const documentXml = await zip.file('word/document.xml').async('text');
     // Ahora puedes procesar el contenido XML como desees
     const parser = new DOMParser();
     const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
     const serializer = new XMLSerializer();
     const SxmlDoc = serializer.serializeToString(xmlDoc);

     console.log('Resultado XML: \n' + SxmlDoc);

     this.buscaClaves(SxmlDoc);
  }
  reader.readAsArrayBuffer(file);




    //prueba con file2html
    try {
      // Espera a que se resuelva la Promesa y obtén el contenido del archivo en formato ArrayBuffer
      const content = await file.arrayBuffer();

      // Lee el archivo y conviértelo a HTML
      const fileData = await file2html.read({
        fileBuffer: content,
        meta: {
          mimeType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });

      // Extrae los estilos y el contenido del archivo
      const { styles, content: fileContent } = fileData.getData();

      // Concatena estilos y contenido
      const html = styles + fileContent;

      console.log('RESULTADO: \n' + html);

      let view = document.getElementById('view');
      view.innerHTML = html;
    } catch (error) {
      // Maneja cualquier error que pueda ocurrir durante el proceso
      console.error('Error:', error);

      // Imprime información adicional sobre el error específico
      if (error.code === 'file2html.errors.unsupportedFile') {
        console.error('El formato del archivo no es compatible.');
      }
    }
  }
  creaDocumento() {
    let parejas: Array<{clave:string, valor:string}> = [];
    for(let clave of this.claves) {
      let ele = document.getElementById(clave) as HTMLInputElement;
      let val = ele.value;
      let par = {clave: clave, valor: val};
      parejas.push(par);
    }
    console.log("PAREJAS:");  
    for(let pareja of parejas) {
      console.log("Clave: "+pareja.clave+" Valor: "+pareja.valor);
    }
  }
}
