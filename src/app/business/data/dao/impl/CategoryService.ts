import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from './CommonService';
import {CategoryDAO} from '../interface/CategoryDAO';
import {CategorySearchValues} from '../search/SearchObjects';
import {Observable} from 'rxjs';
import {Category} from '../../../model/Category';


// глобальная переменная для хранения URL
export const CATEGORY_URL_TOKEN = new InjectionToken<string>('url');

// класс реализовывает методы доступа к данным с помощью RESTful запросов в формате JSON
// напоминает паттер Фасад (Facade) - выдает только то, что нужно для функционала

// JSON формируется автоматически для параметров и результатов

@Injectable({
    providedIn: 'root'
})

// благодаря DAO и единому интерфейсу - мы можем вынести общую реализация в класс выше и избежать дублирования кода
// классу остается только реализовать свои специфичные методы доступа к данным
export class CategoryService extends CommonService<Category> implements CategoryDAO {

    constructor(@Inject(CATEGORY_URL_TOKEN) private baseUrl,
                private http: HttpClient // для выполнения HTTP запросов
    ) {
        super(baseUrl, http);
    }


    findCategories(categorySearchValues: CategorySearchValues): Observable<Category[]> {
        return this.http.post<Category[]>(this.baseUrl + '/search', categorySearchValues);
    }


}
