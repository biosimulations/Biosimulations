import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccessLevel } from 'src/app/Shared/Enums/access-level';
import { getLicenseInfo } from 'src/app/Shared/Enums/license';
import { ChartType } from 'src/app/Shared/Models/chart-type';
import { Visualization } from 'src/app/Shared/Models/visualization';
import { VisualizationService } from 'src/app/Shared/Services/visualization.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NavItemDisplayLevel } from 'src/app/Shared/Enums/nav-item-display-level';
import { NavItem } from 'src/app/Shared/Models/nav-item';
import { BreadCrumbsService } from 'src/app/Shared/Services/bread-crumbs.service';
import { OkCancelDialogComponent, OkCancelDialogData } from 'src/app/Shared/Components/ok-cancel-dialog/ok-cancel-dialog.component';

@Component({
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.sass'],
})
export class ViewComponent implements OnInit {
  getLicenseInfo = getLicenseInfo;
  public readonly vegaOptions: object = {
    renderer: 'canvas',
  };

  id: string;
  visualization: Visualization;
  vegaSpec: object;
  vegaData: object;
  historyTreeNodes: object[];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(BreadCrumbsService) private breadCrumbsService: BreadCrumbsService,
    private visualizationService: VisualizationService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(routeParams => {
      this.id = routeParams.id;
      if (this.id) {
        this.getData();
      } else {
        this.setUp();
      }
    });
  }

  setUp(): void {
    const crumbs: object[] = [
      {label: 'Visualizations', route: '/visualizations'},
      {label: 'Visualization ' + this.id},
    ];
    const buttons: NavItem[] = [
      {
        iconType: 'fas',
        icon: 'paint-brush',
        label: 'Visualize',
        route: ['/visualizations', this.id],
        display: NavItemDisplayLevel.always,
      },
      {
        iconType: 'fas',
        icon: 'code-branch',
        label: 'Fork',
        route: ['/visualizations', this.id, 'fork'],
        display: NavItemDisplayLevel.always,
      },
      {
        iconType: 'fas',
        icon: 'pencil-alt',
        label: 'Edit',
        route: ['/visualizations', this.id, 'edit'],
        display: (
          this.visualization
          && this.visualization.access === AccessLevel.public
          ? NavItemDisplayLevel.never
          : NavItemDisplayLevel.user),
        displayUser: (!!this.visualization ? this.visualization.owner : null),
      },
      {
        iconType: 'fas',
        icon: 'trash-alt',
        label: 'Delete',
        click: () => { this.openDeleteDialog() },
        display: (
          this.visualization
          && this.visualization.access === AccessLevel.public
          ? NavItemDisplayLevel.never
          : NavItemDisplayLevel.user),
        displayUser: (!!this.visualization ? this.visualization.owner : null),
      },
      {
        iconType: 'fas',
        icon: 'plus',
        label: 'New',
        route: ['/visualizations', 'new'],
        display: NavItemDisplayLevel.always,
      },
      {
        iconType: 'fas',
        icon: 'user',
        label: 'Your visualizations',
        route: ['/user', 'visualizations'],
        display: NavItemDisplayLevel.loggedIn,
      },
      {
        iconType: 'fas',
        icon: 'list',
        label: 'Browse',
        route: ['/visualizations'],
        display: NavItemDisplayLevel.always,
      },
    ];
    this.breadCrumbsService.set(crumbs, buttons, ['tabs']);
  }

  getData(): void {
    this.visualizationService
      .getVisualization(this.id)
      .subscribe((res: object[]) => {
        this.visualization = VisualizationService._get(this.id);
        this.vegaSpec = this.visualization.layout[0].chartType.spec;
        console.log(res[0]['spec']);

        this.setUp();
      });
    this.historyTreeNodes = this.visualizationService.getHistory(this.id, true, true);
  }

  openDeleteDialog(): void {
    this.dialog.open(OkCancelDialogComponent, {
      data: {
        title: `Delete visualization ${ this.id }?`,
        action: () => {
          this.visualizationService.delete(this.id);
          this.router.navigate(['/visualizations']);
        },
      },
    });
  }
}
