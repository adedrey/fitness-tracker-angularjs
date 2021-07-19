import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Exercise } from '../exercise.model';
import { MatTableDataSource } from '@angular/material/table';
import { TrainingService } from '../training.service';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-past-training',
  templateUrl: './past-training.component.html',
  styleUrls: ['./past-training.component.css']
})
export class PastTrainingComponent implements OnInit, OnDestroy, AfterViewInit {
  userId = null;
  exercises = new MatTableDataSource<Exercise>();
  displayedColumns: string[] = ['date', 'name', 'duration', 'calories', 'state'];
  exerciseSubscription: Subscription
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private trainingService: TrainingService, private authService: AuthService) {
    this.authService.getUserId().subscribe(user => this.userId = user);
  }

  ngOnInit() {
    this.trainingService.fetchRunningorCompletedExercise(this.userId);
    this.exerciseSubscription = this.trainingService.finishedOrCanclledExercisesChanged.subscribe(responseData => {
      this.exercises.data = responseData;
      this.exercises.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.exercises.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.exercises.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy() {
    if (this.exerciseSubscription) {
      this.exerciseSubscription.unsubscribe();
    }
  }
}
