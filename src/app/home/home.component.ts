import { Component, OnInit } from '@angular/core';

let plantillas: any;
const div = document.createElement("p");
div.textContent = "No hay archivos!!!!";
document.body.appendChild(div);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
ngOnInit(): void {
  plantillas = document.getElementById("plantillas");

  plantillas?.addEventListener("change", (ev:any) =>{
    if(plantillas!==null) {
      div.textContent = "Hay archivos!!!"
      document.body.appendChild(div);
      if (plantillas.hasAttribute('file')) {
        // El elemento tiene el atributo file
        console.log("si");
      } else {
        // El elemento no tiene el atributo file
        console.log(plantillas);
        let ul = document.createElement("ul");
        document.body.appendChild(ul);
        for(let i=0; i<plantillas.files.length; i++) {
          console.log(plantillas.files[i]);
          let pl = document.createElement("li");
          let a = document.createElement("a");
          a.href = "/"+i;
          a.textContent = i+1+": "+plantillas.files[i].name;
          pl.appendChild(a);
          document.body.appendChild(pl);
          let plan = document.createElement("span");
          document.body.appendChild(plan);
          
        } 
      }
      
    
    }
  });
}
plantillas: any;


}
