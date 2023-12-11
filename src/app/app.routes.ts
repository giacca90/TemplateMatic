import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AgregarComponent } from './agregar/agregar.component';
import { StatusComponent } from './status/status.component';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'status', component: StatusComponent },
    { path: 'agregar', component: AgregarComponent },
];