import {FormGroup} from '@angular/forms';

/*

Глобальная функция, которая получает 2 контрола и сравнивает их значения
Может использоваться при валидации например 2х полей с паролями (чтобы подтверждали пароль)

Взято из интернета запросом "angular must match function"

 */

export function MustMatch(controlName: string, matchingControlName: string): (formGroup: FormGroup) => null {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        // return null if controls haven't initialised yet
        if (!control || !matchingControl) {
            return null;
        }

        // return null if another validator has already found an error on the matchingControl
        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            return null;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({mustMatch: true});
        } else {
            matchingControl.setErrors(null);
        }
    };
}

