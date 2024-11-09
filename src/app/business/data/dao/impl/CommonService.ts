import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CommonDAO} from '../interface/CommonDAO';


// базовые методы доступа к данным, одинаковые для всех классов,
// чтобы не нужно было дублировать весь этот код в каждом классе-сервисе

// JSON формируется автоматически для параметров и результатов

export class CommonService<T> implements CommonDAO<T>{

    private readonly url: string;

    constructor(url: string,  // базовый URL для доступа к данным
                private httpClient: HttpClient // для выполнения HTTP запросов
    ) {
        this.url = url;
    }

    add(t: T): Observable<T> {
        return this.httpClient.put<T>(this.url + '/add', t);
    }

    delete(id: number): Observable<any> {
        // для удаления используем типа запроса put, а не delete, т.к. он позволяет передавать значение в body, а не в адресной строке
        return this.httpClient.delete<any>(this.url + '/delete/' + id);
    }

    findById(id: number): Observable<T> {
        return this.httpClient.post<T>(this.url + '/id', id);
    }

    findAll(email: string): Observable<T[]> {
        return this.httpClient.post<T[]>(this.url + '/all', email);
    }

    update(t: T): Observable<any> {
        return this.httpClient.patch<any>(this.url + '/update', t);
    }


}
