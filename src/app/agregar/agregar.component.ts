import { Component } from '@angular/core';
import { Cliente, ClientesService } from '../services/clientes.service';

@Component({
  selector: 'app-agregar',
  standalone: true,
  imports: [],
  templateUrl: './agregar.component.html',
  styleUrl: './agregar.component.css',
})
export class AgregarComponent {
  CSV: File;
  clientes:Cliente[] = this.CS.clientes;

  constructor(private CS: ClientesService) {

  }
  cargaCSV() {
    let input = <HTMLInputElement>document.getElementById('CSV');
    this.CSV = input.files[0];
    let reader = new FileReader();
    reader.readAsText(this.CSV);
//    reader.readAsArrayBuffer(this.CSV);
    reader.onload = () => {
      let CSVString = reader.result.toString();
      console.log("CSVString: "+CSVString);
      let rows = CSVString.split('\n');
      let count = 0;
      rows.forEach((row) => {
        console.log("raw: "+row)
        let val = row.split(',');
        console.log("val[0]: "+val[0]);
        let cliente = new Cliente(
          count,
          val[0],
          val[1],
          val[2],
          val[3],
          val[4],
          val[5],
          val[6]
        );
        count++;
        this.CS.addCliente(cliente);
      });
      this.clientes = this.CS.clientes;
    };
  }
}
