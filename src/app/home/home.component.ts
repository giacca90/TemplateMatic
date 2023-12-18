import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantillaComponent } from '../modelos/plantilla/plantilla.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PlantillaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent implements OnInit{
  public plantillas: Plantilla[];
  ngOnInit(): void {
     if(localStorage.getItem("ruta") != null) {
      this.plantillas = JSON.parse(localStorage.getItem("ruta"));
    }; 
    let input: HTMLInputElement | null  = <HTMLInputElement | null >document.getElementById("input");
    input.addEventListener("change", (ev:any) =>{
      console.log("RUTA: "+input?.value);
      localStorage.removeItem("ruta");
           this.plantillas = new Array<Plantilla>;  
      if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
          if(input.files[0].name.substring(input.files[0].name.length-4)==".odt" || input.files[0].name.substring(input.files[0].name.length-4)=="docx"){
            const url= input.files[i].webkitRelativePath
            //        console.log(url);
            this.plantillas.push(new Plantilla(i + 1, input.files[i].name, url));
          }
        }
        localStorage.setItem("ruta", JSON.stringify(this.plantillas));
        console.log("localStorage: "+localStorage.getItem("ruta"));
      }
//    console.log("Plantillas: "+this.plantillas.toString());
//    APlantillas = this.plantillas;
    });
  }
}

export class Plantilla {
  id: Number;
  nombre: String;
  address: String;

  constructor(_id:Number, _nombre:String, _address:String) {
    this.id = _id;
    this.nombre = _nombre;
    this.address = _address;
  }

  toString() {
    return this.id+": "+this.nombre;
  }
}
