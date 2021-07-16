import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {
  TocSection,
  TocSectionsContainerDirective,
} from '@biosimulations/shared/ui';
import exampleVega from './example-vega.json';
import exampleSedmlData from './example-sedml-data.json';

@Component({
  templateUrl: './data-visualization.component.html',
  styleUrls: ['./data-visualization.component.sass'],
})
export class DataVisualizationComponent {
  tocSections!: Observable<TocSection[]>;

  @ViewChild(TocSectionsContainerDirective)
  set tocSectionsContainer(container: TocSectionsContainerDirective) {
    setTimeout(() => {
      this.tocSections = container.sections$;
    });
  }

  exampleVega: string;
  exampleSedmlData: string;
  exampleVegaWithData: string;

  constructor() {
    this.exampleVega = JSON.stringify(
      exampleVega,
      null,
      2,
    );
    this.exampleSedmlData = JSON.stringify(
      exampleSedmlData,
      null,
      2,
    );

    const exampleVegaWithData = JSON.parse(JSON.stringify(exampleVega));
    delete exampleVegaWithData.signals[1]['sedmlUri']
    delete exampleVegaWithData.data[1]['sedmlUri']
    exampleVegaWithData.signals[1]['value'] = 100
    exampleVegaWithData.data[1]['values'] = JSON.parse(JSON.stringify(exampleSedmlData));

    this.exampleVegaWithData = JSON.stringify(
      exampleVegaWithData,
      null,
      2,
    );
  }
}
