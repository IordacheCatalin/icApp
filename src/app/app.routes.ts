import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Home } from './Pages/Home/home.component';

export const routes: Routes = [
    { path: '', component: Home, },
    { path: 'home', component: Home, },
    { path: '*', component: Home, },

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }