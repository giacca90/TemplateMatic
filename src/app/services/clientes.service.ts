import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  public clientes:Array<Cliente> = [];
  constructor() { }

  addCliente(cliente:Cliente) {
    this.clientes.push(cliente);
  }
}

export class Cliente {
  id:number;
  nombre:string;
  apellido:string;
  nombreREML:string;
  numeroREML:string;
  direccion:string;
  correo:string;
  fechaNacimiento:string;

  constructor(_id:number, _nombre:string, _apellido:string, _nombreREML:string, _numeroREML:string, _direccion:string, _correo:string, _fechaNacimiento:string) {
    this.id = _id;
    this.nombre = _nombre;
    this.apellido = _apellido;
    this.nombreREML = _nombreREML;
    this.numeroREML = _numeroREML;
    this.direccion = _direccion;
    this.correo = _correo;
    this.fechaNacimiento = _fechaNacimiento;
  }

  toString(): string {
    return "Nombre: "+this.nombre+" Apellido: "+this.apellido+" Nombre REML: "+this.nombreREML+" Numero REML: "+this.numeroREML+" Dirección: "+this.direccion+" Correo Electronico: "+this.correo+" Fecha de nacimiento: "+this.fechaNacimiento
  }
}
