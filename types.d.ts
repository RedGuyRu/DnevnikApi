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

    /**
     * Returns all homeworks from selected period. If {@link from} or {@link to}, they set to current date.
     * @param from
     * @param to
     */
    getHomework(from?: DateTime, to?: DateTime): Promise<Homework[]>;

    /**
     * Returns schedule for selected date. If {@link date} is not set, it set to current date.
     * @param date
     */
    getSchedule(date: DateTime): Promise<Schedule>;

    /**
     * Returns teacher profile by {@link id}.
     */
    getTeacher(id: number): Promise<Teacher>;

    /**
     * Returns teams links for date. If {@link date} is not set, it set to current date.
     */
    getTeamsLinks(date?: DateTime): Promise<TeamsLink[]>;

    /**
     * Returns menu for date. If {@link date} is not set, it set to current date.
     * @param date
     */
    getMenu(date?: DateTime): Promise<Menu[]>;

    /**
     * Return array of Notifications.
     */
    getNotifications(): Promise<Notification[]>;

    /**
     * Returns array of Answers on selected {@link variant}.
     * @param variant
     * @param context_type
     */
    static getMeshAnswers(variant: number, context_type?: "homework"): Promise<Question[]>;

    /**
     * Return array of Visits. If {@link from} or {@link to} is not set, it set to current date.
     * @param from
     * @param to
     */
    getVisits(from?: DateTime, to?: DateTime): Promise<VisitDay[]>;

    /**
     * Returns billing details, such as balance, payment history.
     * @param from
     * @param to
     */
    getBilling(from?: DateTime, to?: DateTime): Promise<Billing>;

    /**
     * Returns education plan and progress.
     */
    getProgress(): Promise<Progress>;
}

export class Utils {
    /**
     * Returns average of the given values.
     */
    static average(values: number[]): number;

    static parseMarksWithWeight(mark: MarkWithWidth[]);
}

declare class Progress {
    title: string;
    hours: number;
    //TODO find field type
    comments: null;
    //TODO find field type
    specialization: null;
    sections: Section[];
    short_name: string;
    education_level: string;
    days_in_week: number;
    education_form: "FULL_TIME";
    class_level_id: number;
    //TODO find field type
    study_profile: null;
    is_adapted: boolean;
}

declare class Section {
    knowledge_field_name: string;
    subjects: SubjectHours[];
}

declare class SubjectHours {
    subject_name: string;
    subject_id: number;
    total_hours: number;
    passed_hours: number;
    max_hours_per_week: number;
    min_hours_per_week: number;
}

declare class Billing {
    /** Balance in kopecks. */
    balance: number;
    payload: Bill[];
}

declare class Bill {
    date: DateTime;
    /** Day delta in kopecks. */
    delta: number;
    details: BillDetail[];
}

declare class BillDetail {
    type: "PURCHASE" | "REFILL";
    time: DateTime;
    /** Amount in kopecks. */
    amount: number;
    description: string;
}

declare class VisitDay {
    date: DateTime;
    visits: Visit[];
}

declare class Visit {
    in: DateTime | null;
    out: DateTime | null;
    duration: string;
    address: string;
    type: "COMMON";
    is_warning: boolean;
    short_name: string;
}

declare class Question {
    question: string;
    question_attachments: string[];
    answer: Answer;
}

declare class Answer {
    type: string;
}

declare class AnswerText extends Answer {
    type: "text";
    text: string;
}

declare class AnswerTextArray extends Answer {
    type: "texts";
    texts: string[];
}

declare class AnswerNumber extends Answer {
    type: "number";
    number: number;
}

declare class AnswerMap extends Answer {
    type: "map";
    map: object;
}

declare class AnswerFree extends Answer {
    /**
     * Ответ проверяется вручную учителем через веб-интерфейс.
     */
    type: "free";
}

declare class Notification {
    event_type: string;
    datetime: DateTime;
    created_at: DateTime;
    updated_at: DateTime;
    teacher_name: string;
    student_profile_id: number;
    author_profile_id: number;
}

declare class CreateMarkNotification extends Notification {
    event_type: "create_mark";
    /**
     * Урок на который была поставлена оценка.
     */
    lesson_date: DateTime;
    old_mark_value: string;
    new_mark_value: string;
    new_is_exam: boolean;
    new_mark_weight: number;
    control_form_name: string;
    subject_name: string;
}

declare class UpdateMarkNotification extends Notification {
    event_type: "update_mark";
    /**
     * Урок на который была поставлена оценка.
     */
    lesson_date: DateTime;
    old_mark_value: string;
    new_mark_value: string;
    new_is_exam: boolean;
    old_is_exam: boolean;
    new_mark_weight: number;
    old_mark_weight: number;
    control_form_name: string;
    subject_name: string;
}

declare class CreateHomeworkNotification extends Notification {
    event_type: "create_homework";
    subject_name: string;
    new_hw_description: string;
    new_date_assigned_on: DateTime;
    new_date_prepared_for: DateTime;
}

declare class UpdateHomeworkNotification extends Notification {
    event_type: "update_homework";
    subject_name: string;
    old_hw_description: string;
    new_hw_description: string;
    new_date_assigned_on: DateTime;
    new_date_prepared_for: DateTime;
}

declare class Menu {
    /**
     * Name of the menu.
     */
    title: "Полдник" | "Обед" | "Завтрак" | string;
    description: string;
    /**
     * Price of the menu in kopecks, divide by 100 to get in rubles. May be 0 for preferential meals.
     */
    summary: number;
    meals: Meal[];
    /**
     * Is it menu preferential meals.
     */
    is_discount_complex: boolean;
    used_subscription_feeding: boolean;
    used_special_menu: boolean;
    used_variable_feeding: boolean;
}

declare class Meal {
    name: string;
    ingredients: string;
    /**
     * Price of the meal in kopecks, divide by 100 to get in rubles. May be 0 randomly :D
     */
    price: number;
    nutrition: Nutrition;
    full_name: string;
}

declare class Nutrition {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    vitamins: [];
}

declare class TeamsLink {
    lesson: LessonActivity;
    link: string;
}

declare class Teacher {
    "id": number;
    "created_at": DateTime;
    "updated_at": DateTime|null;
    "deleted_at": DateTime|null;
    "user_id": number;
    "gusoev_login": string|null;
    "name": string;
    "school_id": number;
    "type": "teacher"|"staff";
    "roles": ("teacher"|"staff")[];
    "mobility": string;
    "education_level_ids": [];
    "deleted": boolean;
    "workload": number;
    "subjects": Subject[];
    "class_unit_ids": [];
    "class_units": [];
    "group_ids": [];
    "managed_class_unit_ids": number[];
    "managed_class_units": ClassUnit[];
    "building_ids": number[];
    "buildings": Building[];
    "room_ids": number[];
    "assigned_group_ids": [];
    "assigned_ae_group_ids": [];
    "assigned_ec_group_ids": [];
    "rooms": Room[];
    //TODO find field type
    "comment": null;
    "user": FIO;
    "virtual": boolean;
    "gap_allowed": boolean;
    "user_integration_id": number;
    "is_gap_allowed": boolean;
    "for_consideration": boolean;
    "subject_ids": number[]
    "week_day_ids": [];
    "teacher_week_days": [];
    "replacement_groups_ids": [];
    "is_newcomer": boolean;
}

declare class FIO {
    "last_name": string;
    "middle_name": string;
    "first_name": string;
}

declare class Room {
    "id": number;
    //TODO find field type
    "created_at": null;
    //TODO find field type
    "updated_at": null;
    //TODO find field type
    "deleted_at": null;
    "name": string;
    "number": string;
    "capacity": number;
    //TODO find field type
    "responsible_id": null;
    //TODO find field type
    "room_type_id": null;
    //TODO find field type
    "floor": null;
    //TODO find field type
    "description": null;
    "education_level_ids": [];
    "subject_ids": [];
    "teacher_ids": [];
    //TODO find field type
    "is_ae_education": null;
    //TODO find field type
    "is_subsidiary": null;
    //TODO find field type
    "is_administrative": null
    "building_id": number;
}

declare class Building {
    "id": number;
    "created_at": DateTime|null;
    "updated_at": DateTime|null;
    "deleted_at": DateTime|null;
    "name": string;
    "address": string;
    //TODO find field type
    "school_id": null;
    //TODO find field type
    "rooms_number": null;
    //TODO find field type
    "floor_count": null;
    //TODO find field type
    "number": null;
    //TODO find field type
    "postal_index": null;
    //TODO find field type
    "county": null;
    //TODO find field type
    "gusoev_county_key": null;
    //TODO find field type
    "district": null;
    //TODO find field type
    "gusoev_district_key": null;
    //TODO find field type
    "eo_address": null;
    //TODO find field type
    "gusoev_eu_key": null;
    //TODO find field type
    "eu": null;
    //TODO find field type
    "city": null;
    //TODO find field type
    "gusoev_kladr_key": null;
    //TODO find field type
    "street": null;
    //TODO find field type
    "gusoev_address_key": null;
    //TODO find field type
    "building": null;
    //TODO find field type
    "description": null;
    //TODO find field type
    "education_level_ids": null;
    //TODO find field type
    "capacity": null;
    //TODO find field type
    "unom": null;
    //TODO find field type
    "image": null;
    //TODO find field type
    "type": null;
    //TODO find field type
    "org_territory": null
}

declare class Schedule {
    "summary": string;
    "date": DateTime;
    "activities": (BreakActivity|LessonActivity)[];
    "has_homework": boolean;
}

declare class Activity {
    info: string;
    begin_utc: DateTime;
    end_utc: DateTime;
}

declare class BreakActivity extends Activity {
    type: 'BREAK';
    duration: number;
}

declare class LessonActivity extends Activity {
    "type": "LESSON";
    "begin_time": string;
    "end_time": string;
    "room_number": string;
    "room_name": string;
    "building_name": string;
    "lesson": Lesson;
    "homework_presence_status_id": number;
}

declare class Lesson {
    "schedule_item_id": number;
    "subject_id": number;
    "subject_name": string;
    //TODO find field type
    "course_lesson_type": null;
    "teacher": ShortTeacher;
    "marks": LessonMark[];
    "homework": string;
    "link_types": [];
    "materials_count": Object;
    "lesson_type": "NORMAL"|"REMOTE";
    "lesson_education_type": string;
    //TODO find field type
    "evaluation": null;
    //TODO find field type
    "absence_reason_id": null;
    "bell_id": number;
    "replaced": boolean;
    "homework_count": HomeworkCount;
    //TODO find field type
    "esz_field_id": null;
    "is_cancelled": boolean;
    "is_missed_lesson": boolean;
    "is_virtual": boolean;
}

declare class HomeworkCount {
    "total_count": number;
    "ready_count": number;
}

declare class ShortTeacher {
    "last_name": string;
    "first_name": string;
    "middle_name": string;
    //TODO find field type
    "birth_date": null;
    //TODO find field type
    "sex": null;
    //TODO find field type
    "user_id": null;
}

declare class LessonMark {
    "id": number;
    "value": "5"|"4"|"3"|"2";
    "values": MarkValue[];
    "comment": string;
    "weight": number;
    "point_date": null;
    "control_form_name": string;
    "comment_exists": boolean;
    "created_at": DateTime;
    "updated_at": DateTime;
    "criteria": [];
    "is_exam": boolean;
    "is_point": boolean;
    "original_grade_system_type": string;
}

declare class Homework {
    "id": number;
    "created_at": DateTime;
    "updated_at": DateTime|null;
    "deleted_at": DateTime|null;
    "student_id": number;
    "homework_entry_id": number;
    "student_name": string;
    "comment": null|string;
    "is_ready": boolean;
    "attachments": [];
    "remote_attachments": [];
    "homework_entry": HomeworkEntry;
    "attachment_ids": []
}

declare class HomeworkEntry {
    "id": number;
    "created_at": DateTime;
    "updated_at": DateTime|null;
    "deleted_at": DateTime|null;
    "homework_id": number;
    "description": string;
    "duration": number;
    //TODO find field type
    "no_duration": null;
    "homework": HomeworkInfo;
    "attachments": Attachment[];
    //TODO find field type
    "homework_entry_student_answer": null;
    "controllable_items": [];
    "homework_entry_comments": [];
    "student_ids": number[];
    "attachment_ids": [];
    //TODO find field type
    "controllable_item_ids": null;
    //TODO find field type
    "books": null;
    //TODO find field type
    "tests": null;
    //TODO find field type
    "scripts": null;
    /**
     * string with json object
     */
    "data": string;
    //TODO find field type
    "update_comment": null;
    //TODO find field type
    "game_apps": null;
    //TODO find field type
    "atomic_objects": null;
    //TODO find field type
    "related_materials": null;
    "eom_urls": Eom[];
    "long_term": boolean;
    //TODO find field type
    "is_digital_homework": null;
}

declare class Eom {
    type: "LessonTemplate" | "TestSpecification" | "AtomicObject";
    urls: EomUrl[];
}

declare class EomUrl {
    url: string;
    url_type: "player" | "view";
    profile_type: string|null;
}

declare class Attachment {
    path: string;
}

declare class HomeworkInfo {
    "id": number;
    "created_at": DateTime;
    "updated_at": DateTime|null;
    "deleted_at": DateTime|null;
    //TODO find field type
    "deleted_by": null;
    "teacher_id": number;
    "subject_id": number;
    //TODO find field type
    "is_required": null;
    //TODO find field type
    "mark_required": null;
    "group_id": number
    "date_assigned_on": DateTime;
    "date_prepared_for": DateTime;
    "subject": HomeworkSubject;
}

declare class HomeworkSubject {
    "id": number;
    "name": string;
    //TODO find field type
    "exam_name": null;
}

declare class Mark {
    "created_at": DateTime;
    "updated_at": DateTime|null;
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