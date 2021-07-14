import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { ModelData, ModelDataSource } from './models-datasource';
import { BrowseModelsService } from './model.service';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'biosimulations-browse-models',
  templateUrl: './browse-models.component.html',
  styleUrls: ['./browse-models.component.scss'],
  providers: [ModelDataSource],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowseModelsComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: BrowseModelsService,
  ) {}
  public data$;
  private ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.data$ = this.service.getModels();
  }
  navigate() {
    const id = '';
    this.router.navigate(['../' + id], { relativeTo: this.route });
  }
}
