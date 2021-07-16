import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSortModule } from '@angular/material/sort';
import { SharedUiModule } from '@biosimulations/shared/ui';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedDebugModule } from '@biosimulations/shared/debug';
import { ResourceViewModule } from '@biosimulations/platform/view';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BiosimulationsIconsModule } from '@biosimulations/shared/icons';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [{ path: '', component: ProjectsComponent }];

@NgModule({
  declarations: [ProjectsComponent, ViewComponent],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatTableModule,
    MatStepperModule,
    MatSortModule,

    SharedUiModule,
    BiosimulationsIconsModule,
    MatPaginatorModule,
    MatExpansionModule,
    SharedDebugModule,
    MatCheckboxModule,
    DragDropModule,
    ResourceViewModule,
  ],
})
export class ProjectsModule {}
