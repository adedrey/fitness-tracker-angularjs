import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StopTrainingComponent } from './stop-training/stop-training.component';
import { TrainingService } from '../training.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-current-training',
  templateUrl: './current-training.component.html',
  styleUrls: ['./current-training.component.css']
})
export class CurrentTrainingComponent implements OnInit, OnDestroy {
  status = "Stop";
  progress = 0;
  timer: any;
  userId = null;
  private authSubscription: Subscription;
  constructor(
    private dialog: MatDialog,
    private trainingService: TrainingService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authSubscription = this.authService.getUserId().subscribe(userId => this.userId = userId);
    this.startOrResumeTraining();
  }

  startOrResumeTraining() {
    const step = this.trainingService.getRunningExercise().duration / 100 * 1000;
    this.timer = setInterval(() => {
      this.progress = this.progress + 1;
      if (this.progress == 100) {
        this.status = "Finish";
        this.trainingService.completeExercise(this.userId);
        clearInterval(this.timer);
        this.router.navigateByUrl('/training');
      }
    }, step);
  }

  onStop() {
    if (this.status !== "Finish") {
      clearInterval(this.timer);
      const dialogRef = this.dialog.open(StopTrainingComponent, {
        data: {
          progress: this.progress
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.trainingService.cancelExercise(this.progress, this.userId);
        } else {
          this.startOrResumeTraining();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
