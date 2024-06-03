import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResumeDocService } from '../services/resume-doc.service';
import { DatePipe } from '@angular/common';
import {
  ResumeEducation,
  ResumeExperience,
  ResumeJobDetails,
  ResumeModel,
  ResumePersonalDetails,
} from '../model/resume.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-resume-generator',
  templateUrl: './resume-generator.component.html',
  styleUrls: ['./resume-generator.component.css'],
})
export class ResumeGeneratorComponent implements OnInit {
  dateRange: any;

  startDate?: Date;
  endDate?: Date;
  templateOb?: { imgSrc: string; path: string; name: string };

  resumeForm!: FormGroup;

  expLevels: Array<string> = ['Experienced', 'Begineer'];
  showLoader = false;

  constructor(
    private resumeService: ResumeDocService,
    public datePipe: DatePipe,
    private toastService: NzNotificationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.initResumeForm();

    this.route.paramMap.subscribe((res) => {
      const history = window.history.state;
      if (history && history.item) {
        this.templateOb = history.item;
        console.log(this.templateOb);
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                              init resume form                              */
  /* -------------------------------------------------------------------------- */
  initResumeForm() {
    this.resumeForm = new FormGroup({
      personalDetails: new FormGroup({
        name: new FormControl(null, Validators.required),
        mobile: new FormControl(null, Validators.required),
        email: new FormControl(null, [Validators.required, Validators.email]),
        address: new FormControl(null, Validators.required),
        hobbies: new FormControl(null, Validators.required),
      }),
      jobDetails: new FormGroup({
        appliedRole: new FormControl(null, Validators.required),
        experienceLevel: new FormControl(null, Validators.required),
        keywords: new FormControl(null),
      }),
      experiences: new FormArray(
        []
        // Validators.required
      ),
      education: new FormArray([this.addEducation()], Validators.required),
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                          Add experience form array                         */
  /* -------------------------------------------------------------------------- */
  addExperience() {
    return new FormGroup({
      company: new FormControl(null, Validators.required),
      role: new FormControl(null, Validators.required),
      dates: new FormControl(null),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      skillsUsed: new FormControl(null, Validators.required),
    });
  }

  get experienceControl() {
    return this.resumeForm!.get('experiences') as FormArray;
  }

  onAddExperience() {
    this.experienceControl.push(this.addExperience());
  }

  removeExperience(index: number) {
    this.experienceControl.removeAt(index);
  }

  /* -------------------------------------------------------------------------- */
  /*                          Add education form array                          */
  /* -------------------------------------------------------------------------- */

  addEducation() {
    return new FormGroup({
      degree: new FormControl(null, Validators.required),
      university: new FormControl(null, Validators.required),
      dates: new FormControl(null),
      relevantModules: new FormControl(null, Validators.required),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
    });
  }

  get educationControl() {
    return this.resumeForm!.get('education') as FormArray;
  }

  onAddEducation() {
    this.educationControl.push(this.addEducation());
  }

  removeEducation(index: number) {
    this.educationControl.removeAt(index);
  }

  onChangeEducationDate(result: Date[], i: number): void {
    if (result && result.length > 1) {
      const startNewDate = result[0];
      const endNewDate = result[1];

      const strDate = this.datePipe.transform(startNewDate, 'MM/YYYY');
      const endDate = this.datePipe.transform(endNewDate, 'MM/YYYY');

      this.educationControl.controls[i].get('startDate')?.setValue(strDate);
      this.educationControl.controls[i].get('endDate')?.setValue(endDate);
      this.educationControl.updateValueAndValidity();
    }
  }

  onChangeExperienceDate(result: Date[], i: number): void {
    console.log(result);

    if (result && result.length > 1) {
      const startNewDate = result[0];
      const endNewDate = result[1];

      const strDate = this.datePipe.transform(startNewDate, 'MM/YYYY');
      const endDate = this.datePipe.transform(endNewDate, 'MM/YYYY');

      this.experienceControl.controls[i].get('startDate')?.setValue(strDate);
      this.experienceControl.controls[i].get('endDate')?.setValue(endDate);
      this.experienceControl.updateValueAndValidity();
    }
  }

  async onSubmitForm() {
    console.log(this.resumeForm!.value);
    if (this.resumeForm.valid) {
      const formData = this.resumeForm.value;

      const personalDetails: ResumePersonalDetails = {
        name: formData.personalDetails.name,
        address: formData.personalDetails.address,
        email: formData.personalDetails.email,
        hobbies: formData.personalDetails.hobbies,
        mobile: formData.personalDetails.mobile,
      };

      const jobDetails: ResumeJobDetails = {
        appliedRole: formData.jobDetails.appliedRole,
        experienceLevel: formData.jobDetails.experienceLevel,
        keywords: formData.jobDetails.keywords,
      };

      const formExperiences: Array<ResumeExperience> = [];

      formData.experiences.forEach((el: any) => {
        const dates = el.startDate + ' - ' + el.endDate;
        formExperiences.push({
          dates: dates,
          company: el.company,
          role: el.role,
          skillsUsed: el.skillsUsed,
        });
      });

      const formEducation: Array<ResumeEducation> = [];
      formData.education.forEach((el: any) => {
        const dates = el.startDate + ' - ' + el.endDate;
        formEducation.push({
          dates: dates,
          degree: el.degree,
          relevantModules: el.relevantModules,
          university: el.university,
        });
      });

      const resumeModel: ResumeModel = {
        personalDetails: personalDetails,
        education: formEducation,
        experiences: formExperiences,
        jobDetails: jobDetails,
        skills: formData.skills,
      };

      this.showLoader = true;
      try {
        const res = await this.resumeService.generateResume(resumeModel, this.templateOb!.path);
        this.showLoader = false;
        if (res) {
          this.router.navigate(['/success'])
          this.toastService.create(
            'success',
            'Success!',
            'Your personalized AI-generated resume is ready. Review it to make sure all the information is correct and download it to start your job search today!',
            {
              nzPlacement: 'bottomRight',
            }
          );
        } else {
          this.toastService.create(
            'error',
            'Oops',
            'Something went wrong... Please try again later.'
          );
        }
      } catch (err) {
        this.showLoader = false;
        this.toastService.create(
          'error',
          'Oops',
          'Something went wrong... Please try again later.'
        );
      }
    }
  }
}
