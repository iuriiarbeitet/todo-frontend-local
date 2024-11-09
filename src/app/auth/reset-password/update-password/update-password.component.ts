import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';


@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent implements OnInit {

  form: FormGroup; // форма с введенными пользователем данными
  isLoading = false; // идет ли загрузка в данный момент (для показа/скрытия индикатора загрузки)
  error: string; // текст ошибки (если есть)
  showPasswordForm = false; // показывать ли форму с паролями
  token: string; // токен для отправки запроса на сервер
  firstSubmitted = false; // становится true при первом нажатии (чтобы сразу не показывать ошибки полей, а только после первой попытки)
  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?


  // внедрение всех нужных объектов
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private deviceService: DeviceDetectorService, // для определения типа устройства
  ) {
  }

  ngOnInit(): void { // вызывается при инициализации компонента (до отображения внешнего вида)

    this.isMobile = this.deviceService.isMobile();


    // инициализация формы с нужными полями, начальными значениями и валидаторами
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });


    this.route.params.subscribe(params => { // т.к. params - это Observable - подписываемся и получаем значения
      this.token = params.token; // считываем токен из параметра роута
      this.showPasswordForm = true; // показываем форму с паролями только после получения token из параметра запроса
    });

  }

  // ссылка на компоненты формы (для сокращения кода, чтобы каждый раз не писать this.form.get('') )
  get passwordField(): AbstractControl  {
    return this.form.get('password');
  }

  get confirmPasswordField(): AbstractControl  {
    return this.form.get('confirmPassword');
  }

  // попытка отправки данных формы
  public submitForm(): void {

    this.firstSubmitted = true; // один раз нажали на отправку формы (можно теперь показывать ошибки)

    if (this.form.invalid) { // если есть хотя бы одна ошибка в введенных данных формы
      return; // не отправляем данные на сервер
    }


    this.isLoading = true; // показать индикатор загрузки

    // отправка запроса на сервер
    this.authService.updatePassword(this.passwordField.value, this.token).subscribe(
      result => { // запрос успешно выполнился без ошибок

        this.isLoading = false; // скрыть индикатор загрузки

        if (result) {
          this.router.navigate(['/info-page', {msg: 'Password updated successfully.'}]);
        }

      },

      () => { // от сервера пришла ошибка
        this.isLoading = false; // скрыть индикатор загрузки

        // показываем пользователю информацию на новой странице
        this.router.navigate(['/info-page', {msg: 'Error updating password. The page may have expired. Request password again.'}]);

      });

  }
}
