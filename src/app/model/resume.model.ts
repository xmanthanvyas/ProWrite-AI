export interface ResumeModel {
    personalDetails: ResumePersonalDetails;
    jobDetails: ResumeJobDetails;
    skills: string;
    experiences: Array<ResumeExperience>;
    education: Array<ResumeEducation>;
}

export interface ResumePersonalDetails {
    name: string;
    email: string;
    mobile: string;
    address: string;
    hobbies: string;
}

export interface ResumeExperience {
    company: string;
    role: string;
    dates: string;
    skillsUsed: string;
    description?: string;
}

export interface ResumeEducation {
    degree: string;
    university: string;
    dates: string;
    relevantModules: string;
}

export interface ResumeJobDetails {
    appliedRole: string;
    experienceLevel: string;
    keywords: string;
}