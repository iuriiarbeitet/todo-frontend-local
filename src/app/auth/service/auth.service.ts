import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

/*
Cервис для взаимодействия с backend системой по части аутентификации/авторизации

*/

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = new BehaviorSubject<User>(null);  // текущий залогиненный пользователь (по-умолчанию null)
  isLoggedIn = false; // индикатор, залогинился пользователь или нет

  backendAuthURI = environment.backendURL + '/auth'; // ссылка на корневой URL бекенда, связанного с авторизацией

  constructor(
    private httpClient: HttpClient, // для отправки запросов на backend
    private router: Router // навигация

  ) {
  }

  // аутентификация
  public login(request: User): Observable<User> { // ajax запрос
    return this.httpClient.post<User>(this.backendAuthURI + '/login', request); // request - это body запроса в формате JSON
  }

  // регистрация нового пользователя
  public register(request: User): Observable<any> {
    return this.httpClient.put<any>(this.backendAuthURI + '/register', request);
  }


  // активация аккаунта
  public activateAccount(request: string): Observable<boolean> {
    return this.httpClient.post<boolean>(this.backendAuthURI + '/activate-account', request);
  }

  // повторная отправка письма активации аккаунта
  public resendActivateEmail(request: string): Observable<any> {
    return this.httpClient.post<any>(this.backendAuthURI + '/resend-activate-email', request);
  }

  // отправить письмо для сброса пароля
  public sendResetPasswordEmail(request: string): Observable<boolean> {
    return this.httpClient.post<boolean>(this.backendAuthURI + '/send-reset-password-email', request);
  }

  // обновить пароль пользователя
  public updatePassword(request: string, token: string): Observable<boolean> {

    /*

      При обновлении пароля пользователь незалогинен в системе, соответственно нет данных о пользователе.

      Поэтому чтобы обновить пароль - нам нужно добавить token к исходящему запросу,
      чтобы backend распознал его и разрешил выполнить метод обновления (иначе будет ошибка доступа, нет прав)

      У token действует ограничение по времени (устанавливается на backend), если пользователь не успеет за это время -
      нужно будет заново выполнять запрос на сброс пароля.

     */

    const tokenParam = new HttpParams().set('token', token); // создаем объект для параметров запроса и добавляем токен

    // добавляем токен в параметры, чтобы interceptor мог добавить его в исходящий запрос
    return this.httpClient.post<boolean>(this.backendAuthURI + '/update-password', request, {params: tokenParam});
  }


  // выход из системы
  public logout(): void {

    this.currentUser.next(null); // обнуляем текущего пользователя
    this.isLoggedIn = false; // указываем, что пользователь разлогинился

    // чтобы удалить кук с флагом httpOnly - нужно попросить об этом сервер, т.к. клиент не имеет доступ к куку
    this.httpClient.post<any>(this.backendAuthURI + '/logout', null).subscribe();

    this.router.navigate(['']); // переходим на страницу с бизнес данными

  }

  // авто логин пользователя (если есть в куках JWT - от бекенда вернется статус 200 и текущий пользователь)
  public autoLogin(): Observable<User> {
    return this.httpClient.post<User>(this.backendAuthURI + '/auto', null); // ничего не передаем (пустое тело)
  }

}


/*

Классы (объекты) для запросов и их результатов, которые автоматически будут преобразовываться в JSON.

Это аналог entity классов из backend проекта (в упрощенном виде)

Должны совпадать по полям с entity-классами backend!!! (иначе не будет правильно отрабатывать автом. упаковка и распаковка JSON)

*/

// пользователь - хранит свои данные
export class User {
  id: number; // обязательное поле, по нему определяется пользователь
  username: string;
  email: string;
  password: string; // не передается с сервера (только от клиента к серверу, например при обновлении пароля)
  roles: Array<Role>; // USER, ADMIN, MODERATOR
}
// роль пользователя
export class Role {
  name: string;
}
