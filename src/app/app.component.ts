import { Component } from '@angular/core';
import { JobSearchComponent } from './components/job-search/job-search.component';
import { JobPostComponent } from './components/job-post/job-post.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span>Job Board</span>
      <div class="spacer"></div>
      <button mat-button (click)="currentPage = 'search'">Search Jobs</button>
      <button mat-button (click)="currentPage = 'post'">Post a Job</button>
    </mat-toolbar>

    <div style="padding: 20px;">
      <app-job-search *ngIf="currentPage === 'search'"></app-job-search>
      <app-job-post *ngIf="currentPage === 'post'"></app-job-post>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    mat-toolbar button {
      margin-left: 8px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    JobSearchComponent,
    JobPostComponent,
    MatButtonModule,
    MatToolbarModule
  ]
})
export class AppComponent {
  currentPage = 'search';
}
