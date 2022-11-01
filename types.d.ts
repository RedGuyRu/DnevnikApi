// noinspection JSUnusedGlobalSymbols

import {DateTime} from "luxon";

export class Authenticator {
    /**
     * Initialize the authenticator.
     */
    init(): Promise<void>;

    /**
     * Try to authenticate the user and returns true is successful.
     */
    authenticate(): Promise<boolean>;

    /**
     * Returns user student ID.
     */
    getStudentId(): Promise<number | null>;

    /**
     * Returns user token.
     */
    getToken(): Promise<string | null>;
}

export class PredefinedAuthenticator extends Authenticator {
    constructor(studentId: number, token: string);
}

export class Client {
    constructor(authenticator: Authenticator);

    /**
     * Returns the user profile.
     */
    getProfile(): Promise<Profile>;

    /**
     * Returns the user average marks.
     */
    getAverageMarks(): Promise<AverageMark[]>;

    /**
     * Returns all academic years.
     */
    static getAcademicYears(): Promise<AcademicYear[]>;

    /**
     * Returns current academic year.
     */
    static getCurrentAcademicYear(): Promise<AcademicYear>;

    /**
     * Returns selected subjects is {@link subjects} passed, otherwise returns all subjects.
     */
    getSubjects(subjects?: string[] | number[]): Promise<Subject[]>;

    /**
     * Returns all marks from selected period. If {@link from} or {@link to}, they set to current date.
     * @param from
     * @param to
     */
    getMarks(from?: DateTime, to?: DateTime): Promise<Mark[]>;
}

export class Utils {
    /**
     * Returns average of the given values.
     */
    static average(values: number[]): number;

    static parseMarksWithWeight(mark: MarkWithWidth[]);
}

declare class Mark {
    "created_at": DateTime;
    "updated_at": DateTime;
    "id": number;
    "student_profile_id": number;
    "weight": number;
    "teacher_id": number;
    "name": "5"|"4"|"3"|"2";
    "comment": string;
    "control_form_id": number;
    //TODO find field type
    "deleted_by": null;
    "grade_id": number;
    "schedule_lesson_id": number;
    "is_exam": boolean;
    "group_id": number;
    "date": DateTime;
    "is_point": boolean;
    //TODO find field type
    "point_date": null;
    "subject_id": number
    "grade_system_id": number;
    "grade_system_type": "five"| "four" | "three" | "two";
    "values": MarkValue[];
    //TODO find field type
    "course_lesson_topic_id": null;
    "theme_frame_integration_id": string;
    //TODO find field type
    "project_id": null
}

declare class MarkValue {
    "grade_system_id": number;
    "name": string;
    "nmax": number;
    "grade_system_type": string;
    "grade": Grade
}

declare class Grade {
    "origin": string;
    "five": number;
    "hundred": number;
}

declare class Subject {
    "id": number;
    //TODO find field type
    "created_at": null;
    //TODO find field type
    "updated_at": null;
    //TODO find field type
    "deleted_at": null;
    "name": string;
    "exam_name": string;
    "subject_group_id": number;
    //TODO find field type
    "school_id": null;
    "subject_status": number;
    "is_curriculum_subject": boolean;
    "is_discipline": boolean;
    "only_group": boolean;
    "is_adapt": boolean;
    "is_spo": boolean;
    "knowledge_field_ids": number[];
    "fgos_version_id": number[];
    //TODO find field type
    "curriculum_subject_ids": null;
    //TODO find field type
    "curriculum_subjects": null;
    //TODO find field type
    "discipline_ids": null;
    //TODO find field type
    "disciplines": null;
    //TODO find field type
    "children_subjects": null;
    //TODO find field type
    "curriculum_subject_attributes": null;
    //TODO find field type
    "curriculum_levels": null;
    //TODO find field type
    "control_forms": null;
    "knowledge_field_link": [];
    "adapt_parameters": boolean[];
    "integration_id": number;
    //TODO find field type
    "parent_subject_ids": null;
    "education_level_ids": number[];
}

declare class AverageMark {
    name: string;
    mark: number;
}

declare class AcademicYear {
    id: number;
    name: string;
    begin_date: DateTime;
    end_date: DateTime;
    calendar_id: number;
    current_year: boolean;
}

declare class MarkWithWidth {
    mark: number;
    weight: number;
}

declare class Profile {
    id: number;
    created_at: DateTime | null;
    updated_at: DateTime | null;
    deleted_at: DateTime | null;
    person_id: string;
    transferred: boolean;
    school_id: number;
    organization_id: string;
    user_id: number;
    study_mode_id: number;
    user_name: string;
    short_name: string;
    last_name: string | null;
    first_name: string | null;
    middle_name: string | null;
    change_password_required: boolean;
    birth_date: DateTime | null;
    left_on: DateTime | null;
    enlisted_on: DateTime | null;
    gusoev_login: string | null;
    age: number | null;
    sex: "male" | "female";
    deleted: boolean;
    email: string | null;
    phone_number: string | null;
    email_ezd: string | null;
    phone_number_ezd: string | null;
    class_unit: ClassUnit;
    previously_class_unit: ClassUnit | null;
    curricula: Curricula | null;
    non_attendance: number;
    mentors: [];
    ispp_account: number | null;
    previously_profile_id: number | null;
    //TODO find field type
    student_viewed: null;
    migration_date: DateTime | null;
    //TODO find field type
    education_level: null;
    //TODO find field type
    class_level: null;
    //TODO find field type
    snils: null;
    last_sign_in_at: DateTime | null;
    groups: [];
    parents: Parent[];
    marks: [];
    final_marks: [];
    attendances: []
    lesson_comments: []
    home_based_periods: []
    subjects: []
    ae_attendances: []
    ec_attendances: []
    assignments: []
    left_on_registry: DateTime | null;
}

export class ClassUnit {
    id: number;
    class_level_id: number;
    name: string;
    home_based: boolean;
}

declare class Curricula {
    id: number;
    name: string;
}

declare class Parent {
    id: number;
    user_id: number;
    type: "Родитель";
    gusoev_login: string | null;
    name: string;
    phone_number_ezd: string | null;
    email_ezd: string | null;
    phone_number: string | null;
    email: string | null;
    //TODO find field type
    snils: null;
    last_sign_in_at: DateTime | null;
    hidden: boolean;
}