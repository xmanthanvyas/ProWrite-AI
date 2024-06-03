import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ResultComponent } from './result/result.component';
import { ResumeGeneratorComponent } from './resume-generator/resume-generator.component';
import { TemplateSelectionComponent } from './template-selection/template-selection.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'resume-generator',
    component: ResumeGeneratorComponent,
  },
  {
    path: 'template-selection',
    component: TemplateSelectionComponent,
  },
  {
    path: 'success',
    component: ResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
