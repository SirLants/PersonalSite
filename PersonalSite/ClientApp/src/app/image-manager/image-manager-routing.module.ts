import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ImageManagerHomeComponent } from "./image-manager/image-manager.component";

export const ImageManagerRoutes: Routes = [
  { path: '', component: ImageManagerHomeComponent }
]

@NgModule({
  imports: [RouterModule.forChild(ImageManagerRoutes)],
  exports: [RouterModule]
})
export class ImageManagerRoutingModule { }
