import {Observable} from 'rxjs';
import {Stat} from '../../../model/Stat';

export interface StatDAO {

    getOverallStat(email: string): Observable<Stat>;

}
