import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as AOS from "aos";

@Component({
  selector: 'app-template-selection',
  templateUrl: './template-selection.component.html',
  styleUrls: ['./template-selection.component.css'],
})
export class TemplateSelectionComponent implements OnInit {
  templates: Array<{ imgSrc: string; path: string; name: string }> = [
    {
      imgSrc: '../../assets/images/templates/rs_template_5.png',
      name: 'Template 1',
      path: '../../assets/rs_template_5.docx',
    },

    {
      imgSrc: '../../assets/images/templates/rs_template_6.png',
      name: 'Template 2',
      path: '../../assets/rs_template_6.docx',
    },
    {
      imgSrc: '../../assets/images/templates/rs_template_7.png',
      name: 'Template 3',
      path: '../../assets/rs_template_7.docx',
    },
    {
      imgSrc: '../../assets/images/templates/rs_template_8.png',
      name: 'Template 4',
      path: '../../assets/rs_template_8.docx',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    AOS.init();
  }

  onSelectTemplate(item: { imgSrc: string; path: string; name: string }) {
    this.router.navigateByUrl('/resume-generator', { state: { item } });
  }
}
