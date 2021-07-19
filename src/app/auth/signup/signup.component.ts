import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthData } from '../auth-data.model';
import { Subscription } from 'rxjs';
import { UIService } from 'src/app/shared/ui.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  credentialForm: FormGroup;
  maxDate;
  isLoading = false;
  private loadingSubscription: Subscription;
  constructor(private authService: AuthService, private uiService: UIService) { }

  ngOnInit() {
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    this.init();
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(loadingState => {
      this.isLoading = loadingState;
    });
  }

  private init() {
    this.credentialForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(8)]),
      'birthdate': new FormControl(null, [Validators.required]),
      'agree': new FormControl(null, [Validators.required])
    });
  }

  onRegister() {
    if (!this.credentialForm.valid) {
      return;
    }
    const authData: AuthData = {
      email: this.credentialForm.value.email,
      password: this.credentialForm.value.password,
      birthdate: this.credentialForm.value.birthdate,
      agree: this.credentialForm.value.agree
    };
    this.authService.registerUser(authData);


  }

  ngOnDestroy() {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

}
