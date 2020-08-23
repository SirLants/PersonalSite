import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { BeansComponent } from "./beans/beans.component";
import { ImageManagerComponent } from "./image-manager/image-manager.component";

export const AppRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'beans', component: BeansComponent },
  { path: 'image-manager', component: ImageManagerComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
