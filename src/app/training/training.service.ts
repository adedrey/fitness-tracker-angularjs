import { Injectable } from '@angular/core';
import { Exercise } from './exercise.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { AngularFirestore } from 'angularfire2/firestore';
import { UIService } from '../shared/ui.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  message = 'An unknown error occured. Please try again later';
  exerciseChanged = new BehaviorSubject<Exercise>(null);
  private exercisesChanged = new BehaviorSubject<Exercise[]>(null);
  finishedOrCanclledExercisesChanged = new BehaviorSubject<Exercise[]>([]);
  private fbSubscriptions: Subscription[] = [];
  private runningExercise: Exercise;
  private exercises: Exercise[] = [];
  constructor(private db: AngularFirestore, private uiService: UIService) { }

  getAvailableExercises() {
    this.uiService.loadingStateChanged.next(true);
    this.fbSubscriptions.push(this.db.collection('exercises').snapshotChanges()
      .pipe(map(responseData => {
        return responseData.map(response => {
          return {
            id: response.payload.doc.id,
            ...<Exercise>(response.payload.doc.data())
          };
        });
      })).subscribe((exercises: Exercise[]) => {
        this.uiService.loadingStateChanged.next(false);
        this.exercises = exercises;
        this.exercisesChanged.next([...this.exercises]);
      }, error => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackar(this.message, null, 3000);
        this.exercisesChanged.next(null);
      }));
  }

  getExercisesChanged() {
    return this.exercisesChanged.asObservable();
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  startExercise(selectedExerciseId: string) {
    console.log(selectedExerciseId);
    this.runningExercise = this.exercises.find(p => p.id === selectedExerciseId);
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise(userId: string) {
    this.saveCompletedOrCancelledExercise({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    }, userId);
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number, userId: string) {
    this.saveCompletedOrCancelledExercise({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    }, userId);
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  fetchRunningorCompletedExercise(userId: string) {
    this.fbSubscriptions.push(this.db.collection(`/users/${userId}/records`).valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.finishedOrCanclledExercisesChanged.next(exercises);
      }, error => {
        this.uiService.showSnackar(this.message, null, 3000);
      }));
  }

  private saveCompletedOrCancelledExercise(exercise: Exercise, userId: string) {
    this.db.collection('users').doc(`${userId}`).collection('records').add(exercise);
  }

  cancelSubscriptions() {
    this.fbSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
