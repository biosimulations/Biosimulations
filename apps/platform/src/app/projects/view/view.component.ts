import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'biosimulations-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent implements OnInit {
  name = 'Model 1';
  summary = 'Test i';
  constructor() {}

  ngOnInit(): void {}
}
