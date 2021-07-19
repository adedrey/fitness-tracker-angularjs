import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Exercise } from '../exercise.model';
import { TrainingService } from '../training.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UIService } from 'src/app/shared/ui.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercises: Exercise[] = [];
  isLoading = false;
  exerciseForm: FormGroup;
  private exerciseSubscription: Subscription;
  private authSubscription: Subscription;
  constructor(private trainingService: TrainingService, private uiService: UIService) { }

  ngOnInit() {
    this.init();
    this.authSubscription = this.uiService.loadingStateChanged.subscribe(loadingState => {
      this.isLoading = loadingState;
    });
    this.fetchTrainings();
    this.exerciseSubscription = this.trainingService.getExercisesChanged().subscribe(
      exercises => {
        this.exercises = exercises;
      });
  }
  onSelectTraining() {
    const selectedExercise = this.exerciseForm.value.exercise;
    this.trainingService.startExercise(selectedExercise);
  }

  fetchTrainings() {
    this.trainingService.getAvailableExercises();
  }

  private init() {
    this.exerciseForm = new FormGroup({
      'exercise': new FormControl(null, [Validators.required])
    });
  }

  ngOnDestroy() {
    if (this.exerciseSubscription || this.authSubscription) {
      this.exerciseSubscription.unsubscribe();
      this.authSubscription.unsubscribe();
    }
  }
}
