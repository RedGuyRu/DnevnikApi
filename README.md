# dnevnik-mos-ru-api
Библиотека для доступа к API сайта [Московской электронной Школы](https://school.mos.ru/)

## Установка
```bash
npm install dnevnik-mos-ru-api
yarn add dnevnik-mos-ru-api
```

## Поддерживаемые методы
- [Получение профиля пользователя](#Получение-профиля-пользователя)
- [Получение средних оценок](#Получение-средних-оценок)
- [Получение текущего академического года](#Получение-текущего-академического-года)
- [Получение списка предметов](#Получение-списка-предметов)
- [Получение списка оценок](#Получение-списка-оценок)
- [Получение списка домашних заданий](#Получение-списка-домашних-заданий)
- [Получение расписания](#Получение-расписания)
- [Получение информации о преподавателе](#Получение-информации-о-преподавателе)
- [Получение ссылок на онлайн-уроки](#Получение-ссылок-на-онлайн-уроки)
- [Получение меню](#Получение-меню)
- Получение списка уведомлений
- Получение ответов на тесты Библиотеки МЭШ
- Получение списка посещаемости
- Получение детализации баланса
- Получение информации об обучении
- Получение списка групп дополнительного образования
- Получение списка оценок по четвертям

## Примеры использования
### Получение профиля пользователя
```js
client.getProfile({with_groups:true, with_ae_attendances: true, with_attendances: true, with_ec_attendances: true, with_assignments: true, with_parents: true, with_subjects: true, with_marks: true, with_final_marks: true, with_home_based_periods: true, with_lesson_info: true, with_lesson_comments: true}).then(e => {
    for (let mark of e.marks) {
        console.log(mark.name + " " + mark.subject_id);
    }
}).catch(e => console.log(e))
```
### Получение средних оценок
```js
client.getAverageMarks().then(e => {
    e.forEach(m => console.log(m.name + " " + m.mark));
}).catch(e => console.error(e));
```
### Получение текущего академического года
```js
Client.getCurrentAcademicYear().then(e => console.log(e.name)).catch(e => console.error(e));
```
### Получение списка предметов
```js
client.getSubjects().then(e => {
    for (let subject of e) {
        console.log(subject.name);
    }
}).catch(e => console.error(e));
```
### Получение списка оценок
```js
client.getMarks(DateTime.now().minus(Duration.fromObject({week:1}))).then(e => {
    for (let subject of e) {
        console.log(subject.subject_id + ": " + subject.values[0].grade.five);
    }
}).catch(e => console.error(e));
```
### Получение списка домашних заданий
```js
client.getHomework(DateTime.now().minus(Duration.fromObject({week:1}))).then(e => {
    for (let subject of e) {
        console.log(subject.homework_entry.homework.subject.name + " " + subject.homework_entry.description);
    }
}).catch(e => console.error(e));
```
### Получение расписания
```js
client.getSchedule(DateTime.now().minus(Duration.fromObject({week:1}))).then(e => {
    for (let a of e.activities) {
        if(a.type==="LESSON") {
            console.log(a.begin_time + ": " + a.lesson.subject_name);
        }
    }
}).catch(e => console.error(e));
```
### Получение информации о преподавателе
```js
client.getTeacher(2483049).then(e => {
    console.log(e.user.first_name+" "+e.user.middle_name);
}).catch(e => console.log(e))
```
### Получение ссылок на онлайн-уроки
```js
client.getTeamsLinks(DateTime.now().minus({day:1})).then(e => {
    for (let teamsLink of e) {
        console.log(teamsLink.link);
    }
}).catch(e => console.log(e))
```
### Получение меню
```js
client.getMenu().then(e => {
    for (let meal of e) {
        console.log(meal.meals.map(e => e.name).join(", "));
    }
}).catch(e => console.log(e));
```