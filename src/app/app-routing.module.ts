import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {InfoPageComponent} from './auth/info-page/info-page.component';
import {ActivateAccountComponent} from './auth/activate-account/activate-account.component';
import {SendEmailResetPasswordComponent} from './auth/reset-password/send-email-reset-password/send-email-reset-password.component';
import {UpdatePasswordComponent} from './auth/reset-password/update-password/update-password.component';
import {MainComponent} from './business/views/page/main/main.component';
import {AccessDeniedComponent} from './auth/acces-denied/acces-denied.component';
import {RolesGuard} from './business/guard/roles-guard.service';



// список всех роутов и связанных компонентов (маппинг)
const routes: Routes = [

  // страницы для неавторизованных пользователей
  {path: '', component: LoginComponent}, // главная
  {path: 'logout', redirectTo: '', pathMatch: 'full'}, // главная
  {path: 'index', redirectTo: '', pathMatch: 'full'}, // главная

  {path: 'register', component: RegisterComponent}, // регистрация нового пользователя
  {path: 'reset-password', component: SendEmailResetPasswordComponent}, // отправка письма - восстановление пароля
  {path: 'info-page', component: InfoPageComponent}, // вам отправлено письмо

  // Страницы для авторизованных пользователей - для открытия страницы (и получения RESTful данных) требуется проверка ролей
  // Тут нужно описать все варианты папок/страниц с доступом по ролям
  // Все остальные ссылки будут перенаправлять на страницу 404
  {

    /* спец. объект RolesGuard будет вызываться каждый раз перед выполнение данного роутинга
      в RolesGuard считываются роли пользователя и сравниваются с allowedRoles
     */
    path: 'main', component: MainComponent, canActivate: [RolesGuard], // при переходе по ссылке - сначала отработает RolesGuard
    data: {
      allowedRoles: ['ADMIN', 'USER'] // для открытия этой страницы - у пользователя должна быть одна из этих ролей
    }
  },

  {path: 'activate-account/:uuid', component: ActivateAccountComponent}, // запрос на письмо активации аккаунта
  {path: 'update-password/:token', component: UpdatePasswordComponent}, // запрос на обновление пароля

  {path: 'access-denied', component: AccessDeniedComponent}, // страница "доступ запрещен"


  {path: '**', redirectTo: '/'}, // все остальные запросы отправлять на главную страницу

];


@NgModule({
  imports: [
    RouterModule.forRoot(routes) // без этого работать не будет - импортирует системный модуль
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
