import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root', // Mit diesem Namen können wir uns auf die Komponente beziehen
  templateUrl: './app.component.html' // welche HTML-Datei angezeigt werden soll
})
export class AppComponent implements OnInit {

  cookieEnabled: boolean; // speichert wahr oder falsch – Cookies sind im Browser aktiviert oder deaktiviert

  // Die Methode wird automatisch aufgerufen, wenn die Komponente initialisiert wird
  ngOnInit(): void {

    this.cookieEnabled = navigator.cookieEnabled; // Überprüfen Sie, ob Cookies in Ihrem Browser aktiviert sind

    // Versuchen Sie, ein Test-Cookie zu installieren. Wenn es nicht funktioniert, funktionieren die Cookies nicht
    if (!this.cookieEnabled) { // Stellen Sie sicher, dass das Cookie nicht geschrieben werden kann
      document.cookie = 'testcookie';
      this.cookieEnabled = (document.cookie.indexOf('testcookie') !== -1); // Schreiben Sie „true“ oder „false“ in die Variable
    }

  }
}
