import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EditComponent} from "./edit/edit.component";
import {PreviewComponent} from "./preview/preview.component";

const routes: Routes = [
  { path: 'edit/:fileBase64', component: EditComponent },
  { path: 'preview/:fileBase64', component: PreviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
