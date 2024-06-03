import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResumeModel } from '../model/resume.model';

import Docxtemplater from 'docxtemplater';
import * as PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs } from 'file-saver';

function loadFile(url: any, callback: any) {
  PizZipUtils.getBinaryContent(url, callback);
}

// const baseUrl = 'http://localhost:3000/api';
const baseUrl = 'https://prowrite-ai.onrender.com/api'

@Injectable({
  providedIn: 'root',
})
export class ResumeDocService {
  constructor(private http: HttpClient) {}

  async generateResume(resumeModel: ResumeModel, templatePath: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      /* -------------------------------------------------------------------------- */
      /*                                Get objective                               */
      /* -------------------------------------------------------------------------- */

      const objectiveResponsePormise = this.http
        .post<{ response: string }>(`${baseUrl}/users/objective`, {
          role: resumeModel.jobDetails.appliedRole,
          experienceLevel: resumeModel.jobDetails.experienceLevel,
          keywords: resumeModel.jobDetails.keywords,
          // experienceList: resumeModel.experiences.map((el) => {
          //   return {
          //     role: el.role,
          //     skillsUsed: el.skillsUsed,
          //   };
          // }),
        })
        .toPromise();

      /* -------------------------------------------------------------------------- */
      /*                                 Get skills                                 */
      /* -------------------------------------------------------------------------- */
      const skillsResponsePromise = this.http
        .post<{ response: string }>(`${baseUrl}/users/skills`, {
          role: resumeModel.jobDetails.appliedRole,
          keywords: resumeModel.jobDetails.keywords,
        })
        .toPromise();

      const promiseArray = [objectiveResponsePormise, skillsResponsePromise];

      if (resumeModel.experiences.length > 0) {
        /* -------------------------------------------------------------------------- */
        /*                               Get Experience                               */
        /* -------------------------------------------------------------------------- */
        const experienceResponsePromise = this.http
          .post<{ response: string }>(`${baseUrl}/users/experience`, {
            experienceList: resumeModel.experiences.map((el) => {
              return {
                role: el.role,
                skillsUsed: el.skillsUsed,
              };
            }),
          })
          .toPromise();

        promiseArray.push(experienceResponsePromise);
      }

      try {
        const generatedResponse = await Promise.all(promiseArray);

        const generatedObjective = generatedResponse[0]?.response ?? '';
        const generatedSkills = generatedResponse[1]?.response ?? '';

        if (resumeModel.experiences.length > 0) {
          const expInfo = generatedResponse[2]?.response ?? '';

          if (expInfo) {
            const splitInfo = expInfo.split(/(Experience \d+:)/g);
            let n = 2;
            resumeModel.experiences.forEach((el, i) => {
              el.description = splitInfo[n].split(';').join('\n');
            });
          }
        }

        const setDataOb: any = {
          NAME: resumeModel.personalDetails.name,
          ADDRESS: resumeModel.personalDetails.address,
          OBJECTIVE: generatedObjective,
          EMAIL: resumeModel.personalDetails.email,
          MOBILE: resumeModel.personalDetails.mobile,
          EDUCATION: resumeModel.education.map((el) => {
            return {
              DEGREE: el.degree,
              UNIVERSITY: el.university,
              RELEVANT_COURSEWORK: el.relevantModules,
              UNIDATES: el.dates,
            };
          }),
          HOBBIES: resumeModel.personalDetails.hobbies,
          HASEXP: false,
          SKILLS: generatedSkills,
        };

        if (resumeModel.experiences.length > 0) {
          setDataOb.HASEXP = true;
          setDataOb.EXPERIENCE = resumeModel.experiences.map((el) => {
            return {
              ROLE: el.role,
              COMPANY: el.company,
              EXPDATES: el.dates,
              EXPD: el.description,
            };
          });
        }

        console.log(setDataOb);

        loadFile(
          templatePath,
          function (error: Error | null, content: string) {
            if (error) {
              throw error;
            }
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
              paragraphLoop: true,
              linebreaks: true,
            });
            doc.setData(setDataOb);
            try {
              // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
              doc.render();
            } catch (error) {
              console.log('Error', error);
              reject(false);
            }
            const out = doc.getZip().generate({
              type: 'blob',
              mimeType:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            // Output the document using Data-URI
            saveAs(out, `${resumeModel.personalDetails.name} Resume.docx`);
            resolve(true);
          }
        );
      } catch (err) {
        console.log(err);
        reject(false);
      }
    });
  }
}
