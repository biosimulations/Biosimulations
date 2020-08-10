import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpComponent } from './help/help.component';
import { AboutComponent } from './about/about.component';
import { FaqComponent } from './faq/faq.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

const routes: Routes = [
    { path: '', component: HelpComponent },
    { path: 'about', component: AboutComponent, data: { breadcrumb: 'About' } },
    { path: 'faq', component: FaqComponent, data: { breadcrumb: 'FAQ' } },
    { path: 'privacy', component: PrivacyPolicyComponent, data: { breadcrumb: 'Privacy policy' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule { }
