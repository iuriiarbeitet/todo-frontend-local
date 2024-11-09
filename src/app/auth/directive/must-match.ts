import {FormGroup} from '@angular/forms';

/**
 * Globale Funktion, die zwei Steuerelemente empfängt und deren Werte vergleicht
 * man kann zum Beispiel bei der Validierung von 2 Passwortfeldern verwendet werden (zur Bestätigung des Passworts)
 * entnommen aus dem Internet durch die Abfrage „Angular muss mit Funktion übereinstimmen“
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

