import {Component, OnInit} from '@angular/core';
import {AboutDialogComponent} from '../../dialog/about-dialog/about-dialog.component';
import {MatDialog} from '@angular/material/dialog';


@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})

// "presentational component": отображает полученные данные
// подвал - нижняя часть страницы
export class FooterComponent implements OnInit {
    year: Date;
    site = 'iurii.rotari.1987@gmail.com';
    course = 'Author Iurii Rotari';

    blog = '';
    siteName = 'MyTasks';


    constructor(private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.year = new Date(); // текуший год

    }

    // окно "О программе"
    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent,
            {
                autoFocus: false,
                data: {
                    dialogTitle: 'About the program',
                    message: 'This application was created for demonstration at an interview. '
                },
                width: '400px'
            });

    }

}
