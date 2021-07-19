import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  loadingStateChanged = new BehaviorSubject<boolean>(false);
  constructor(private matSnackbar: MatSnackBar) { }

  showSnackar(message, action, duration: number) {
    this.matSnackbar.open(message, action, {
      duration: duration
    });
  }
}
