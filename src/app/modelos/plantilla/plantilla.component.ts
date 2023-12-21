import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantillaService } from '../../services/plantilla.service'

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

  EditOdt(file:File) {
    console.log("Desde EditOdt");
  }

  EditDocx(file:File) {
    console.log("Desde EditDocx");
  }
}
