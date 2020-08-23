import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'biosimulations-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass'],
})
export class AboutComponent implements OnInit {
  // TODO: get from app config
  apiUrl = 'https://api.biosimulations.dev/'
  issueUrl = 'https://github.com/biosimulations/Biosimulations/issues/new/choose'
  emailUrl = 'mailto:' + 'info@biosimulations.org'

  constructor() { }

  ngOnInit(): void { }
}
