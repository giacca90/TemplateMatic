import { Injectable } from '@angular/core';
import * as localforage from 'localforage';

@Injectable({
  providedIn: 'root',
})
export class PlantillaService {
  private plantillas: Plantilla[] 
  private per:Plantilla[];
  constructor() {
    localforage.config({
      driver: localforage.INDEXEDDB, // Selecciona IndexedDB como el motor de almacenamiento
      name: 'Persistencia',
      version: 1.0,
      storeName: 'Plantillas',
      description: 'Persistencia de Plantillas'
    });
     localforage.getItem("Plantillas").then((datos:Plantilla[]) => {
      if(datos) {
        this.per = datos;
        this.realizarOperacionesDespuesDeObtenerDatos()
      }
    });
    
  }

  private realizarOperacionesDespuesDeObtenerDatos() {
    // Coloca aquí las operaciones que quieres realizar después de obtener los datos
    this.plantillas = this.per;
    // Por ejemplo, puedes llamar a una función en el componente que utiliza este servicio.
    // this.componente.operacionesDespuesDeObtenerDatos(this.plantillas);
  }

  setTemp(_plantillas: Array<Plantilla>) {
    this.plantillas = _plantillas;
    localforage.setItem("Plantillas",_plantillas);
  }

  getTemp() {
    return this.plantillas;
  }

  getPlantillaForId(id: number): File {
    for (let i = 0; i < this.plantillas.length; i++) {
      if (this.plantillas[i].id == id) {
        return this.plantillas[i].file;
      }
    }
    return null;
  }
}

export class Plantilla {
  id: number;
  file: File;
  nombre: string;
  address: string;

  constructor(_id: number, _file: File) {
    this.id = _id;
    this.file = _file;
    this.nombre = _file.name;
    this.address = _file.webkitRelativePath;
  }

  toString() {
    return this.id + ': ' + this.nombre;
  }
}
