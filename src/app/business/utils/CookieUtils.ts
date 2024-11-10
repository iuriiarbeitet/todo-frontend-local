// vorgefertigte Methoden zum Arbeiten mit Cookies – Hinzufügen, Löschen, Empfangen
// Reminder ist ein clientseitiges Cookie – daher können keine sensiblen Daten darin gespeichert werden

export class CookieUtils {

    // Cookie speichern
    public setCookie(name: string, val: string): void {
        const date = new Date();
        const value = val;

        // Set it expire in 7 days
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

        // Set it
        document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/; SameSite=Strict; Secure;';
    }

    // Cookie erhalten
    public getCookie(name: string): string {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');

        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }


    // löschen cookie
    public deleteCookie(name: string): void {
        const date = new Date();

        // Set it expire in -1 days
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

        // Set it
        document.cookie = name + '=; expires=' + date.toUTCString() + '; path=/';
    }

}




