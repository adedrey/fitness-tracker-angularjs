import { Injectable } from '@angular/core';
import { User } from './user.model';
import { AuthData } from './auth-data.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { TrainingService } from '../training/training.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UIService } from '../shared/ui.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  authChange = new BehaviorSubject<boolean>(false);
  private user: User;
  private userId = new Subject<string>();
  private isAuthenticated = false;
  constructor(
    private router: Router,
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private snackbar: MatSnackBar,
    private uiService: UIService
  ) { }

  initAuthListener() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId.next(user.uid);
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigateByUrl('/training');
      } else {
        this.trainingService.cancelSubscriptions();
        this.user = null;
        this.authChange.next(false);
        this.isAuthenticated = false;
      }
    });
  }

  getUserId() {
    return this.userId.asObservable();
  }
  registerUser(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
      .then(async (userCredential: firebase.auth.UserCredential) => {
        const user = await this.db.collection('users').doc(`${userCredential.user.uid}`).set({
          birthdate: authData.birthdate,
          agree: authData.agree
        });
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(err => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackar(err.message, null, 3000);
      });
  }

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
      .then(response => {
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(err => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackar(err.message, null, 3000);
      });
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  isAuth() {
    return this.isAuthenticated;
  }
}
