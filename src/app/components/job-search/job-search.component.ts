import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Job } from '../../models/job.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-job-search',
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatSelectModule
  ]
})
export class JobSearchComponent {
  searchForm: FormGroup;
  jobs: Job[] = [];
  loading = false;

  distances = [
    { value: 10, label: '10 miles' },
    { value: 20, label: '20 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' },
    { value: 500, label: '500 miles' },
    { value: Infinity, label: 'All Jobs' }
  ];

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {
    this.searchForm = this.fb.group({
      keyword: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      distance: [20],
      useCurrentLocation: [false]
    });

    this.searchForm.get('useCurrentLocation')?.valueChanges.subscribe(useLocation => {
      const cityControl = this.searchForm.get('city');
      const stateControl = this.searchForm.get('state');
      const zipControl = this.searchForm.get('zipCode');

      if (useLocation) {
        cityControl?.clearValidators();
        stateControl?.clearValidators();
        zipControl?.clearValidators();
      } else {
        cityControl?.setValidators([Validators.required]);
        stateControl?.setValidators([Validators.required]);
        zipControl?.setValidators([Validators.required]);
      }

      cityControl?.updateValueAndValidity();
      stateControl?.updateValueAndValidity();
      zipControl?.updateValueAndValidity();
    });
  }

  async onSearch() {
    if (!this.searchForm.get('useCurrentLocation')?.value && !this.searchForm.valid) {
      alert('Please fill in all location fields (City, State, and Zip Code) or use current location');
      return;
    }

    this.loading = true;
    try {
      const formValues = this.searchForm.value;
      
      let searchParams: any = {
        keyword: formValues.keyword,
        city: formValues.city,
        state: formValues.state,
        zipCode: formValues.zipCode,
        distance: formValues.distance
      };

      if (formValues.useCurrentLocation) {
        const position = await this.getCurrentPosition();
        searchParams.latitude = position.coords.latitude;
        searchParams.longitude = position.coords.longitude;
      }

      this.jobs = await this.supabaseService.searchJobs(searchParams);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      this.loading = false;
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
} 