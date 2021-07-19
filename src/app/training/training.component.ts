import { Component, OnInit, OnDestroy } from '@angular/core';
import { TrainingService } from './training.service';
import { Exercise } from './exercise.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit, OnDestroy {
  exercises: Exercise[] = [];
  ongoingTraining = false;
  trainingSubscription: Subscription;
  constructor(private trainingService: TrainingService) { }

  ngOnInit() {
    this.trainingSubscription = this.trainingService.exerciseChanged.subscribe(exercise => {
      if (exercise) {
        this.ongoingTraining = true;
      } else {
        this.ongoingTraining = false;
      }
    })
  }

  ngOnDestroy() {
    if(this.trainingSubscription) {
      this.trainingSubscription.unsubscribe();
    }
  }

}
