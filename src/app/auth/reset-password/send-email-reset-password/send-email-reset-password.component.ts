import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';



@Component({
  selector: 'app-send-email-reset-password',
  templateUrl: './send-email-reset-password.component.html',
  styleUrls: ['./send-email-reset-password.component.css']
})
export class SendEmailResetPasswordComponent implements OnInit {

  form: FormGroup; // форма с введенными пользователем данными
  isLoading = false; // идет ли загрузка в данный момент (для показа/скрытия индикатора загрузки)
  error: string; // текст ошибки от сервера (если есть)
  firstSubmitted = false; // становится true при первом нажатии (чтобы сразу не показывать ошибки полей, а только после первой попытки)
  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?


  // внедрение всех нужных объектов
  constructor(
    private formBuilder: FormBuilder, // для создание формы
    private route: ActivatedRoute, // текущий роут, куда уже перешли (можно считывать данные, например параметры)
    private router: Router, // для навигации, перенаправления на другие страницы
    private authService: AuthService, // сервис аутентификации
    private deviceService: DeviceDetectorService, // для определения типа устройства

  ) {
  }

  ngOnInit(): void { // вызывается при инициализации компонента (до отображения внешнего вида)

    this.isMobile = this.deviceService.isMobile();

    // инициализация формы с нужными полями, начальными значениями и валидаторами
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]] // Validators.email - проверка правильности введенного email
    });


  }

  // ссылка на компонент формы (для сокращения кода, чтобы каждый раз не писать this.form.get('') )
  get emailField(): AbstractControl {
    return this.form.get('email');
  }

  // попытка отправки данных формы
  public submitForm(): void {

    this.firstSubmitted = true; // один раз нажали на отправку формы (теперь можно показывать ошибки)

    if (this.form.invalid) { // если есть хотя бы одна ошибка в введенных данных формы
      return; // не отправляем данные на сервер
    }


    this.isLoading = true; // показать индикатор загрузки

    // отправка запроса на сервер
    this.authService.sendResetPasswordEmail(this.emailField.value).subscribe(
      () => { // запрос успешно выполнился без ошибок

        this.isLoading = false; // скрыть индикатор загрузки

        // показываем пользователю информацию на новой странице
        this.router.navigate(['/info-page', {msg: 'You have been sent a letter to reset your password, check your email in 1-2 minutes.'}]);
      },

      err => { // запрос выполнился с ошибкой (можем использовать переменную err)
        this.isLoading = false; // скрыть индикатор загрузки

        switch (err.error.exception) { // считываем тип ошибки, чтобы правильно среагировать

          case 'UsernameNotFoundException': { // пользователь или email не был найден
            this.error = `There is no user registered with this email address.`; // будет показана ошибка на странице
            break;
          }

          default: { // если любой другой тип ошибки - просто показать информацию
            this.error = `Error`; // будет показана ошибка на странице
            break;
          }

        }

      });

  }


}
