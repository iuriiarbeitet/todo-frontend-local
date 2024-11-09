import {User} from '../../auth/service/auth.service';

export class Priority {
    id: number;
    title: string;
    color: string;
    user: User;

    constructor(id: number, title: string, color: string, user: User) {
        this.id = id;
        this.title = title;
        this.color = color;
        this.user = user;
    }


}
