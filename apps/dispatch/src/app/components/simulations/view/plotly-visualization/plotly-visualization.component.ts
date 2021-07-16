import { Component, Input, HostListener, ElementRef } from '@angular/core';

export enum AxisType {
  linear = 'linear',
  log = 'log',
}

export enum TraceMode {
  lines = 'lines',
  markers = 'markers',
}

export enum TraceType {
  scatter = 'scatter',
  histogram = 'histogram',
  heatmap = 'heatmap',
}

export interface Trace {
  name?: string;
  x?: any[];
  y?: any[];
  z?: any[];
  xaxis?: string;
  yaxis?: string;
  type: TraceType;
  mode?: TraceMode;
  hoverongaps?: boolean;
}

export interface Axis {
  anchor: string;
  title: string | undefined;
  type: AxisType;
}

export interface Grid {
  rows: number;
  columns: number;
  pattern: 'independent';
}

export interface Layout {
  grid: Grid;
  showlegend: boolean;
  width: number | undefined;
  height: number | undefined;
  [axisId: string]: any; // compiler complains about using type Axis here
}

export interface DataLayout {
  data: Trace[];
  layout: Layout;
}

@Component({
  selector: 'biosimulations-plotly-visualization',
  templateUrl: './plotly-visualization.component.html',
  styleUrls: ['./plotly-visualization.component.scss'],
})
export class PlotlyVisualizationComponent {
  loading = false;
  data: Trace[] | undefined = undefined;
  layout: Layout | undefined = undefined;
  config: any = {
    scrollZoom: true,
    editable: false,
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'chart',
      height: 500,
      width: 700,
      scale: 1, // Multiply title/legend/axis/canvas sizes by this factor
    },
    modeBarButtonsToRemove: [],
    showEditInChartStudio: true,
    plotlyServerURL: 'https://chart-studio.plotly.com',
    // responsive: true,
  };
  error = false;

  @Input()
  set dataLayout(value: DataLayout | null | false) {
    if (value) {
      this.loading = false;
      this.data = value.data;
      this.layout = value.layout;
      this.error = false;
      this.setLayout();

    } else if (value == null) {
      this.loading = true;
      this.error = false;

    } else {
      this.loading = false;
      this.error = true;
    }
  }

  visible = false;

  constructor(private hostElement: ElementRef) {}

  @HostListener('window:resize')
  onResize() {
    this.setLayout();
  }

  setLayout(): void {
    this.visible = this.hostElement.nativeElement.offsetParent != null;
    if (this.visible && this.layout) {
      const rect =
        this.hostElement.nativeElement.parentElement.getBoundingClientRect();
      this.layout.width = rect.width;
      this.layout.height = rect.height;
    }
  }
}
