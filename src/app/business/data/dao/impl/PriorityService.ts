import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from './CommonService';
import {PriorityDAO} from '../interface/PriorityDAO';
import {CategorySearchValues} from '../search/SearchObjects';
import {Observable} from 'rxjs';
import {Priority} from '../../../model/Priority';


export const PRIORITY_URL_TOKEN = new InjectionToken<string>('url');


@Injectable({
    providedIn: 'root'
})

export class PriorityService extends CommonService<Priority> implements PriorityDAO {

    constructor(@Inject(PRIORITY_URL_TOKEN) private baseUrl,
                private http: HttpClient
    ) {
        super(baseUrl, http);
    }

    findPriorities(categorySearchValues: CategorySearchValues): Observable<Priority[]> {
        return this.http.post<Priority[]>(this.baseUrl + '/search', categorySearchValues);
    }

}
