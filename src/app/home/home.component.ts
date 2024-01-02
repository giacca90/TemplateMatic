import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantillaComponent } from '../modelos/plantilla/plantilla.component';
import { PlantillaService, Plantilla } from '../services/plantilla.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PlantillaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  public plantillas: Array<Plantilla>;
  public plantillasBuscadas: Array<Plantilla> = [];
  public ps: PlantillaService;

  constructor(PS: PlantillaService) {
    this.ps = PS;
  }

  ngOnInit(): void {
    if (this.ps.getTemp()) {
      this.plantillas = this.ps.getTemp();
      this.plantillasBuscadas = this.plantillas;
    }
    let input: HTMLInputElement | null = <HTMLInputElement | null>(
      document.getElementById('input')
    );
    input.addEventListener('change', (ev: any) => {
      console.log('RUTA: ' + input?.value);
      this.ps.setTemp([]);
      this.plantillas = [];
      if (input.files) {
        for (let i = 0; i < input.files.length; i++) {
          if (
            input.files[i].name.endsWith('odt') ||
            input.files[i].name.endsWith('docx')
          ) {
            this.plantillas.push(new Plantilla(i + 1, input.files[i]));
          }
        }
        this.ps.setTemp(this.plantillas);
        this.plantillasBuscadas = this.plantillas;
      }

      console.log('maxiprueba: ' + this.ps.getTemp().toString());
    });
  }

  busca() {
    let buscador: HTMLInputElement = document.getElementById('buscador') as HTMLInputElement;
    console.log('DETECTADOS CAMBIOS EN EL BUSCADOR \n Valor: '+buscador.value);
    this.plantillasBuscadas = [];
    for(let plantilla of this.plantillas) {
      if(plantilla.nombre.toLocaleLowerCase().includes(buscador.value.toLocaleLowerCase())) {
        this.plantillasBuscadas.push(plantilla);
      }
    }
  }
}
