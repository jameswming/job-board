import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-job-post',
  templateUrl: './job-post.component.html',
  styleUrls: ['./job-post.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class JobPostComponent {
  jobForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      description: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (!this.jobForm.valid) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading = true;
    try {
      await this.supabaseService.createJob(this.jobForm.value);
      alert('Job posted successfully!');
      this.jobForm.reset();
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Error posting job. Please try again.');
    } finally {
      this.loading = false;
    }
  }
} 