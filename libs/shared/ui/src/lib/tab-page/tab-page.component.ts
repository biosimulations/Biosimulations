import {
  Component,
  AfterViewInit,
  AfterViewChecked,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ContentChildren,
  QueryList,
} from '@angular/core';
import {
  MatTab,
  MatTabGroup,
  MAT_TAB_GROUP,
  MatTabChangeEvent,
} from '@angular/material/tabs';
import { TabPageTabComponent } from './tab-page-tab.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'biosimulations-tab-page',
  templateUrl: './tab-page.component.html',
  styleUrls: ['./tab-page.component.scss'],
  /*
   *Not sure why this is needed.
   * The page-tab-tab component has <mat-tab> elements that fail to find the mat tab group to inject.
   * Providing the injection token here somehow fixes the problem. The mat tab group component used here should be the same one that is being provided
   */
  providers: [
    {
      provide: MAT_TAB_GROUP,
      useClass: MatTabGroup,
    },
  ],
})
export class TabPageComponent implements AfterViewInit, AfterViewChecked {
  @Input()
  loading = false;

  @Output() selectedTabChange: EventEmitter<any> = new EventEmitter();

  private urlHashFragmentToITabMap: { [urlHashFragment: string]: number } = {};
  private iTabToUrlHashFragmentMap: { [iTab: number]: string } = {};

  constructor(private router: Router, private route: ActivatedRoute) {}

  @ViewChild(MatTabGroup) matTabGroup!: MatTabGroup;
  @ContentChildren(TabPageTabComponent, { descendants: true })
  tabs!: QueryList<TabPageTabComponent>;

  @Input()
  selectedTabIndex = 0;

  ngAfterViewInit(): void {
    const baseTabs: MatTab[] = [];
    this.urlHashFragmentToITabMap = {};
    this.iTabToUrlHashFragmentMap = {};
    this.tabs
      .toArray()
      .forEach((tab: TabPageTabComponent, iTab: number): void => {
        baseTabs.push(tab.tab);
        if (tab.urlHashFragment) {
          this.urlHashFragmentToITabMap[tab.urlHashFragment] = iTab;
          this.iTabToUrlHashFragmentMap[iTab] = tab.urlHashFragment;
        }
      });
    this.matTabGroup._tabs.reset(baseTabs);
    this.matTabGroup._tabs.notifyOnChanges();

    combineLatest(this.route.paramMap, this.route.fragment).subscribe(
      ([paramMap, fragment]: [ParamMap, string | null]): void => {
        let selectedTabIndex = 0;
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const tab = params.get('tab');
          if (tab && this.urlHashFragmentToITabMap?.[tab]) {
            selectedTabIndex = this.urlHashFragmentToITabMap[tab];
            /*
            if (baseTabs[selectedTabIndex].disabled) {
              selectedTabIndex = 0;
            }
            */
          }
        }
        setTimeout(() => (this.selectedTabIndex = selectedTabIndex), 0);
      },
    );
  }

  ngAfterViewChecked(): void {
    this.matTabGroup.realignInkBar();
  }

  tabChanged(event: MatTabChangeEvent): void {
    this.selectedTabChange.emit(event);
    let params = new URLSearchParams();
    if (this.route.snapshot.fragment) {
      params = new URLSearchParams(this.route.snapshot.fragment);
    }
    if (this.selectedTabIndex in this.iTabToUrlHashFragmentMap) {
      const urlHashFragment: string =
        this.iTabToUrlHashFragmentMap[this.selectedTabIndex];
      params.set('tab', urlHashFragment);
    } else if (params.has('tab')) {
      params.delete('tab');
    }
    this.router.navigate([], { fragment: params.toString() || undefined });
  }
}
