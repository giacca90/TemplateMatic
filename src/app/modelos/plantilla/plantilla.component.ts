import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantillaService } from '../../services/plantilla.service';
import * as file2html from 'file2html';
import OOXMLReader from 'file2html-ooxml';
import OdtReader from 'file2html-odf';

file2html.config({
  readers: [
      OdtReader,
      OOXMLReader
  ]
});
@Component({
  selector: 'app-plantilla',
  standalone: true,
  imports: [],
  templateUrl: './plantilla.component.html',
  styleUrl: './plantilla.component.css'
})

export class PlantillaComponent implements OnInit{
  route: ActivatedRoute = inject(ActivatedRoute);
  PS: PlantillaService;
  id: number;
  file: File;
  nombre: string;
  ruta: string;
  
  constructor(private ps:PlantillaService) {
    this.PS = ps;
  
    this.id = this.route.snapshot.queryParams['id'];
    console.log("id: "+this.id);
    this.file = this.ps.getPlantillaForId(this.id)
    this.nombre = this.file.name;
    console.log("nombre: "+this.nombre);
    this.ruta = this.file.webkitRelativePath
    console.log("ruta: "+this.ruta);

    if(this.ruta.substring((this.ruta.length-4)).toLowerCase() == ".odt") {
      this.EditOdt(this.file);
    }else if (this.ruta.substring((this.ruta.length-4)).toLowerCase() == "docx") {
      this.EditDocx(this.file);
    }
  }
  ngOnInit(): void {
   
  }

  async EditOdt(file: File) {
    console.log("Desde EditOdt");
    
    try {
        // Espera a que se resuelva la Promesa y obtén el contenido del archivo en formato ArrayBuffer
        const content = await file.arrayBuffer();
        
        // Lee el archivo y conviértelo a HTML
        const fileData = await file2html.read({
            fileBuffer: content,
            meta: {mimeType: "application/vnd.oasis.opendocument.text"}
        });

        // Extrae los estilos y el contenido del archivo
        const { styles, content: fileContent } = fileData.getData();
        
        // Concatena estilos y contenido
        const html = styles + fileContent;

        console.log("RESULTADO: \n" + html);
    } catch (error) {
        // Maneja cualquier error que pueda ocurrir durante el proceso
        console.error("Error:", error);

        // Imprime información adicional sobre el error específico
        if (error.code === 'file2html.errors.unsupportedFile') {
            console.error("El formato del archivo no es compatible.");
        }
    }
}

  async EditDocx(file:File) {
    console.log("Desde EditDocx");
    try {
      // Espera a que se resuelva la Promesa y obtén el contenido del archivo en formato ArrayBuffer
      const content = await file.arrayBuffer();
      
      // Lee el archivo y conviértelo a HTML
      const fileData = await file2html.read({
          fileBuffer: content,
          meta: {mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
      });

      // Extrae los estilos y el contenido del archivo
      const { styles, content: fileContent } = fileData.getData();
      
      // Concatena estilos y contenido
      const html = styles + fileContent;

      console.log("RESULTADO: \n" + html);
  } catch (error) {
      // Maneja cualquier error que pueda ocurrir durante el proceso
      console.error("Error:", error);

      // Imprime información adicional sobre el error específico
      if (error.code === 'file2html.errors.unsupportedFile') {
          console.error("El formato del archivo no es compatible.");
      }
  }
  
  }
}
