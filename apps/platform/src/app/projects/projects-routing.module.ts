import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsComponent } from './projects.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  { path: '', component: ProjectsComponent, data: { breadcrumb: 'Overview' } },
  { path: ':id', component: ViewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
