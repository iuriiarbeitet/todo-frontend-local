import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from './CommonService';
import {PriorityDAO} from '../interface/PriorityDAO';
import {CategorySearchValues} from '../search/SearchObjects';
import {Observable} from 'rxjs';
import {Priority} from '../../../model/Priority';


// глобальная переменная для хранения URL
export const PRIORITY_URL_TOKEN = new InjectionToken<string>('url');

// класс реализовывает методы доступа к данным с помощью RESTful запросов в формате JSON
// напоминает паттер Фасад (Facade) - выдает только то, что нужно для функционала

@Injectable({
    providedIn: 'root'
})

// благодаря DAO и единому интерфейсу - мы можем вынести общую реализация в класс выше и избежать дублирования кода
// классу остается только реализовать свои специфичные методы доступа к данным
export class PriorityService extends CommonService<Priority> implements PriorityDAO {

    constructor(@Inject(PRIORITY_URL_TOKEN) private baseUrl,
                private http: HttpClient // для выполнения HTTP запросов
    ) {
        super(baseUrl, http);
    }

    findPriorities(categorySearchValues: CategorySearchValues): Observable<Priority[]> {
        return this.http.post<Priority[]>(this.baseUrl + '/search', categorySearchValues);
    }

}
