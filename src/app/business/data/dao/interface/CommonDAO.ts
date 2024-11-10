// стандартные методы CRUD (create, read, update, delete)

import {Observable} from 'rxjs';

// Alle Methoden geben Observable zurück – für asynchrone und reaktive Arbeiten
export interface CommonDAO<T> {

    findAll(email: string): Observable<T[]>;

    findById(id: number): Observable<T>;

    update(obj: T): Observable<T>;

    delete(id: number): Observable<T>;

    add(obj: T): Observable<T>;
}
