import {Component, inject, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Status} from '../status/status.component';
import {StatusService} from '../../services/status.service';
import {PlantillaService} from '../../services/plantilla.service';
import {ClientesService} from '../../services/clientes.service';
import {IpcService} from '../../services/ipc-render.service';
import {FormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {ClienteDinamico} from '../../objects/cliente';
import {Documento} from '../../objects/documento';
import JSZip from 'jszip';

@Component({
	selector: 'app-plantilla',
	standalone: true,
	imports: [FormsModule, NgSelectModule],
	templateUrl: './plantilla.component.html',
	styleUrl: './plantilla.component.css'
})
export class PlantillaComponent implements OnDestroy {
	route: ActivatedRoute = inject(ActivatedRoute);
	id: number;
	nuevoFile: File;
	path: string;
	selected: string;
	estadoCreacionArchivo: boolean = false;
	progresoCreacionArchivo: number = 0;
	cortina: boolean = false;
	clientesTemporales: Array<ClienteDinamico>;
	plantilla: Documento = null;

	progresoCargaInicial: number;
	estadoCargaInicial: boolean;

	imagen: Blob | string = null;

	constructor(
		public PS: PlantillaService,
		public CS: ClientesService,
		public SS: StatusService,
		public IPC: IpcService,
		private cdr: ChangeDetectorRef
	) {
		IPC.clear();
		this.clientesTemporales = this.CS.clientes;
		this.id = this.route.snapshot.queryParams['id'];

		if (this.id) {
			this.plantilla = PS.getPlantillaForId(this.id);
			console.log('Plantilla: ' + this.plantilla.toString());
			if (this.plantilla.file === null) {
				IPC.send('busca', this.plantilla.address);
				IPC.on('arraybuffer', (_event, arraybuffer: ArrayBuffer) => {
					this.plantilla.file = new File([arraybuffer], this.plantilla.nombre);
					console.log('nombre: ' + this.plantilla.nombre);
					console.log('ruta: ' + this.plantilla.address);
					this.cargaInicial();
					this.plantilla.abrirArchivo();
				});
			} else {
				this.cargaInicial();
				this.plantilla.abrirArchivo();
			}
		}
	}

	//TODO: tendrá que destruir el objecto Documento
	ngOnDestroy(): void {
		if (this.plantilla.worker !== null) {
			this.plantilla.worker.terminate();
		}
	}

	cargaInicial() {
		this.plantilla.estadoCargaInicial.subscribe((estado: boolean) => {
			console.log('estado carga inicial: '+ estado);
			this.estadoCargaInicial = estado;
			this.cdr.detectChanges();
		});

		this.plantilla.progresoCargaInicial.subscribe((progreso: number) => {
			this.progresoCargaInicial = progreso;
			this.cdr.detectChanges();
		});

		this.plantilla.vista.subscribe((vista: Blob | string) => {
			if (vista instanceof Blob) {
				const reader = new FileReader();
				reader.readAsDataURL(vista);
				reader.onload = () => {
					const view = document.getElementById('contentContainer');
					const imgElement = document.createElement('img');
					imgElement.src = reader.result as string;
					imgElement.alt = 'Cargando...';
					imgElement.style.width = '100%';
					view.innerHTML = '';
					view.appendChild(imgElement);
				};
			}

			if (typeof vista === 'string') {
				const view = document.getElementById('contentContainer');
				view.innerHTML = '<div id="contenido" style="width: 100%; height: 100%; overflow: hidden;">' + vista + '</div>';
			}
		});
	}

	cambiaColor() {
		for (const clave of this.plantilla.claves) {
			console.log('Clave: ' + clave);
			const campo = document.getElementById(clave) as HTMLInputElement;
			campo.addEventListener('change', () => {
				if (campo.value.length === 0) {
					campo.classList.remove('campoValido');
					campo.classList.add('campoVacio');
				} else {
					campo.classList.remove('campoVacio');
					campo.classList.add('campoValido');
				}
			});
		}
		const numeroDocAuto = document.getElementById('numeroDocAuto') as HTMLInputElement;
		const campoNumeroDocumento = document.getElementById('$$$');
		if (numeroDocAuto) {
			numeroDocAuto.addEventListener('change', () => {
				if (numeroDocAuto) {
					if (numeroDocAuto.checked === true) {
						if (campoNumeroDocumento) {
							campoNumeroDocumento.classList.remove('campoVacio');
							campoNumeroDocumento.classList.add('campoValido');
						}
					} else {
						if (campoNumeroDocumento) {
							campoNumeroDocumento.classList.remove('campoValido');
							campoNumeroDocumento.classList.add('campoVacio');
						}
					}
				}
			});
		}
	}

	async creaDocumento() {
		console.log('Comienza creaDocumento');
		this.nuevoFile = this.plantilla.file;
		this.estadoCreacionArchivo = true;
		this.cdr.detectChanges();
		const fecha: Date = new Date();
		let numeroDocumento = '';
		const parejas: Array<{clave: string; valor: string}> = [];
		const parejaStringArray: string[] = [];
		for (const clave of this.plantilla.claves) {
			const ele = document.getElementById(clave) as HTMLInputElement;
			let val: string;
			if (clave === '$$$' && this.plantilla.numeroDocumento === true) {
				numeroDocumento =
					fecha.getFullYear().toString() +
					(fecha.getMonth() + 1).toString() +
					fecha.getDate().toString() +
					fecha.getHours().toString() +
					fecha.getMinutes().toString() +
					fecha.getSeconds().toString();
				val = numeroDocumento;
			} else if (clave === '$$$' && this.plantilla.numeroDocumento === false) {
				val = ele.value;
				numeroDocumento = ele.value;
			} else {
				val = ele.value;
				parejaStringArray.push(clave + ': ' + val);
			}
			const par = {clave: clave, valor: val};
			parejas.push(par);
		}

		const nuevosContenidos: Map<string,string> = new Map<string, string>;
		this.plantilla.contenido.forEach(async (contenido: string, nombre: string) => {
			nuevosContenidos.set(nombre, await this.sustituyeClaves(contenido, parejas));
		});
		const zip = new JSZip();
		// Lee el contenido del archivo original
		const originalZip = await zip.loadAsync(this.nuevoFile);
		// Sustituye el contenido XML modificado
		console.log('Sustituye el contenido XML modificado');
		nuevosContenidos.forEach((contenido: string, nombre: string) => {
			originalZip.file(nombre, contenido);
		});
		// Crea el nuevo archivo
		this.nuevoFile = (await originalZip.generateAsync({
			type: 'blob'
		})) as File;

		console.log('Comienza la descarga del documento modificado');
		const link = document.createElement('a');
		link.href = URL.createObjectURL(this.nuevoFile);
		let nombreFinal: string = '';
		if (this.plantilla.claves.includes('$$$')) {
			nombreFinal = numeroDocumento + '_' + this.plantilla.file.name;
		} else {
			nombreFinal = 'rellenado_' + this.plantilla.file.name;
		}
		link.download = nombreFinal;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		const status = new Status(this.SS.getStatus().length + 1, this.plantilla.file.name, parejaStringArray, numeroDocumento, Date());
		this.SS.addStatus(status, true);
		if (this.IPC.isElectron()) this.IPC.send('addStatus', status.toString());
	}

	async sustituyeClaves(SxmlDoc: string, parejas: Array<{clave: string; valor: string}>) {
		console.log('Comienza sustituyeClaves');
		let documento: string = '';
		let index: number = 0;
		let indexTemp: number = 0;
		while (index !== -1) {
			index = SxmlDoc.indexOf('{{', index);
			if (index !== -1) {
				const indexEnd = SxmlDoc.indexOf('}}', index);
				if (indexEnd !== -1) {
					let clave = SxmlDoc.substring(index + 2, indexEnd);
					clave = clave.replace(/<.*?>/g, '');
					let valor = '';
					if (clave[0] === '@') {
						const generos: string = (document.querySelector('input[name="generos"]:checked') as HTMLInputElement).value;
						if (generos === 'masculino') {
							valor = clave.substring(1, clave.indexOf('/'));
						} else {
							valor = clave.substring(clave.indexOf('/') + 1);
						}
					} else if (clave[0] === '#') {
						const plurales: string = (document.querySelector('input[name="plurales"]:checked') as HTMLInputElement).value;
						if (plurales === 'singular') {
							valor = clave.substring(1, clave.indexOf('/'));
						} else {
							valor = clave.substring(clave.indexOf('/') + 1);
						}
					} else {
						parejas.forEach((par) => {
							if (par.clave === clave) {
								valor = par.valor;
							}
						});
					}

					documento = documento + SxmlDoc.substring(indexTemp, index) + valor;

					index = indexEnd;
					indexTemp = indexEnd + 2;
				}
			}
		}
		documento = documento + SxmlDoc.substring(indexTemp);
		return documento;
	}

	completa(id: number) {
		const cliente: ClienteDinamico = this.CS.getClienteForId(id);
		console.log('Cliente obtenido: ' + cliente.toString());
		for (const atributo of cliente.atributos) {
			for (const clave of this.plantilla.claves) {
				if (clave === atributo.clave) {
					const a = document.getElementById(clave) as HTMLInputElement;
					a.value = atributo.valor;
					a.classList.remove('campoVacio');
					a.classList.add('campoValido');
					a.removeAttribute('placeholder');
				}
			}
		}
		this.cortina = false;
		this.cdr.detectChanges();
	}

	buscaCliente() {
		const val: string = (document.getElementById('opciones') as HTMLInputElement).value;
		console.log('buscaCliente: ' + val);
		this.clientesTemporales = [];
		this.CS.clientes.forEach((cliente) => {
			if (cliente.toString().toLowerCase().includes(val.toLowerCase())) {
				this.clientesTemporales.push(cliente);
			}
		});
		this.cdr.detectChanges();
	}

	abreCortina() {
		this.cortina = true;
		this.cdr.detectChanges();
	}
}
