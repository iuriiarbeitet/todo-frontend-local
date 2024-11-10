import {Observable} from 'rxjs';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {CommonService} from './CommonService';
import {Task} from 'src/app/business/model/Task';
import {TaskDAO} from '../interface/TaskDAO';
import {TaskSearchValues} from '../search/SearchObjects';


export const TASK_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
    providedIn: 'root'
})


export class TaskService extends CommonService<Task> implements TaskDAO {

    constructor(@Inject(TASK_URL_TOKEN) private baseUrl,
                private http: HttpClient
    ) {
        super(baseUrl, http);
    }


    findTasks(searchObj: TaskSearchValues): Observable<any> {
        return this.http.post<Task[]>(this.baseUrl + '/search', searchObj);
    }


}
