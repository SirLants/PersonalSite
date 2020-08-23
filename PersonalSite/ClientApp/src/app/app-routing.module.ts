import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { BeansComponent } from "./beans/beans.component";
import { HomeComponent } from "./home/home.component";

export const AppRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'beans', component: BeansComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
