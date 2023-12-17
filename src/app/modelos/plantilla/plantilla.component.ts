import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeComponent, Plantilla } from '../../home/home.component'

@Component({
  selector: 'app-plantilla',
  standalone: true,
  imports: [],
  templateUrl: './plantilla.component.html',
  styleUrl: './plantilla.component.css'
})

export class PlantillaComponent implements OnInit{
  route: ActivatedRoute = inject(ActivatedRoute);
  nombre: String;
  ruta: String;
  
  constructor() {
    this.nombre = this.route.snapshot.queryParams['nombre'];
    console.log("nombre: "+this.nombre);
    this.ruta = this.route.snapshot.queryParams['address'];
    console.log("ruta: "+this.ruta);
    if(this.ruta.substring((this.ruta.length-4)).toLowerCase() == ".odt") {
      this.EditOdt(this.ruta);
    }else if (this.ruta.substring((this.ruta.length-4)).toLowerCase() == "docx") {
      this.EditDocx(this.ruta);
    }
  }
  ngOnInit(): void {
   
  }

  EditOdt(ruta:String) {
    console.log("Desde EditOdt");
  }

  EditDocx(ruta:String) {
    console.log("Desde EditDocx");
  }
}
