import {Observable} from 'rxjs';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {CommonService} from './CommonService';
import {Task} from 'src/app/business/model/Task';
import {TaskDAO} from '../interface/TaskDAO';
import {TaskSearchValues} from '../search/SearchObjects';


// глобальная переменная для хранения URL
export const TASK_URL_TOKEN = new InjectionToken<string>('url');

// класс реализовывает методы доступа к данным с помощью RESTful запросов в формате JSON
// напоминает паттер Фасад (Facade) - выдает только то, что нужно для функционала

// JSON формируется автоматически для параметров и результатов

@Injectable({
    providedIn: 'root'
})

// благодаря DAO и единому интерфейсу - мы можем вынести общую реализация в класс выше и избежать дублирования кода
// классу остается только реализовать свои специфичные методы доступа к данным
export class TaskService extends CommonService<Task> implements TaskDAO {

    constructor(@Inject(TASK_URL_TOKEN) private baseUrl,
                private http: HttpClient // для выполнения HTTP запросов
    ) {
        super(baseUrl, http);
    }


    // поиск задач по любым параметрам
    findTasks(searchObj: TaskSearchValues): Observable<any> { // из backend получаем тип Page, поэтому указываем any
        return this.http.post<Task[]>(this.baseUrl + '/search', searchObj);
    }


}
