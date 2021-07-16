import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  HostListener,
} from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Spec } from 'vega';
import vegaEmbed from 'vega-embed';

@Component({
  selector: 'biosimulations-vega-visualization',
  templateUrl: './vega-visualization.component.html',
  styleUrls: ['./vega-visualization.component.scss'],
})
export class VegaVisualizationComponent {
  @ViewChild('vegaContainer', { static: false })
  private vegaContainer!: ElementRef;

  constructor(private hostElement: ElementRef) {}

  private loading = new BehaviorSubject<boolean>(true);
  loading$ = this.loading.asObservable();

  private _spec: Spec | undefined | false = undefined;

  error = '';

  @Input()
  set spec(value: Observable<Spec | undefined | false>) {
    this._spec = undefined;
    this.loading.next(true);
    value.subscribe((value: Spec | undefined | false): void => {
      this._spec = value;
      this.loading.next(false);
      this.render();
    });
  }

  render(): void {
    if (this.hostElement) {
      if (this._spec) {
        const rect =
          this.hostElement.nativeElement.parentElement?.getBoundingClientRect();
        const options = {
          width: Math.max(rect?.width || 0, 10),
          height: Math.max(rect?.height || 0, 10),
          padding: 0,
        };
        vegaEmbed(this.vegaContainer.nativeElement, this._spec as Spec, options)
          .catch((error: Error): void => {
            this.error = `The visualization is invalid: ${error.message}.`;
          });
      } else {
        this.error = 'Visualization could not be loaded.';
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.render();
  }
}
