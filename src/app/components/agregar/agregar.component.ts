import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { IpcService } from '../../services/ipc-render.service';
import { ClienteDinamico } from '../../objects/cliente';

@Component({
	selector: 'app-agregar',
	standalone: true,
	imports: [],
	templateUrl: './agregar.component.html',
	styleUrl: './agregar.component.css',
})
export class AgregarComponent implements OnInit {
	CSV: File;
	clientes: ClienteDinamico[] = [];

	constructor(private CS: ClientesService, public ipc: IpcService, private cdr: ChangeDetectorRef) {
		if(this.clientes.length === 0 && ipc.isElectron()) {
			ipc.send('PersistenciaCSV');
			ipc.on('CSVRecuperado', (_event, file) => {
				if(file.length > 0) {
					this.cargaCSV(file);
				}
			});
		}
	}
  
	ngOnInit(): void {
		this.clientes = this.CS.clientes;
	}

	precargaCSV() {
		if(this.ipc.isElectron()) {
			this.ipc.send('DialogCSV');
			this.ipc.on('CSV', (_event, file: string) => {
				console.log('CSV recibido: \n'+file);
				this.cargaCSV(file);
			});
		}else{
			const input = <HTMLInputElement>document.getElementById('CSV');
			this.CSV = input.files[0];
			const reader = new FileReader();
			reader.readAsText(this.CSV);
			reader.onload = () => {
				this.cargaCSV(reader.result.toString());
			};
		}
	}
  
	cargaCSV(file: string) {
		this.CS.clientes = [];
		const rows: string[] = file.split('\n');
		let atributos: string[];
		for (let i = 0; i < rows.length; i++) {
			let cliente: ClienteDinamico;
			const val: string[] = rows[i].split(',');
			if(val.length > 1) {
				if (i === 0) {
					atributos = val;
				} else {
					cliente = new ClienteDinamico(atributos, val);
					this.CS.clientes.push(cliente);
				}  
			}
		}
		this.clientes = this.CS.clientes;
		this.cdr.detectChanges();
	}
}
