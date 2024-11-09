// стандартные методы CRUD (create, read, update, delete)

import {Observable} from 'rxjs';

// все методы возвращают Observable - для асинхронности и работы в реактивном стиле
export interface CommonDAO<T> {

    // получить все значения
    findAll(email: string): Observable<T[]>;

    // получить одно значение по id
    findById(id: number): Observable<T>; // получение значения по уникальному id

    // обновить значение
    update(obj: T): Observable<T>;

    // удалить значение
    delete(id: number): Observable<T>; // удаление по id

    // добавить значение
    add(obj: T): Observable<T>;

}
