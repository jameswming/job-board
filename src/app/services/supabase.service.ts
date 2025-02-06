import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Job } from '../models/job.interface';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  private async getCoordinates(city: string, state: string, zipCode: string): Promise<{latitude: number, longitude: number}> {
    // Using OpenStreetMap Nominatim API for geocoding
    const address = `${city}, ${state} ${zipCode}, USA`;
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`);
    const data = await response.json();
    
    if (data && data[0]) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    throw new Error('Location not found');
  }

  async searchJobs(searchParams: {
    latitude?: number;
    longitude?: number;
    distance?: number;
    city?: string;
    state?: string;
    zipCode?: string;
  }) {
    const { latitude, longitude, distance, city, state, zipCode } = searchParams;
    
    // Get all jobs first
    const { data: allJobs, error } = await this.supabase
      .from('jobs')
      .select('*');
    
    if (error) throw error;

    // If using direct coordinates (from current location)
    if (latitude && longitude) {
      const jobsWithDistance = allJobs.map((job: Job) => ({
        ...job,
        distance: this.calculateDistance(latitude, longitude, job.latitude, job.longitude)
      }));

      // 如果选择了 "All Jobs"，返回所有工作并按距离排序
      if (distance === Infinity) {
        return jobsWithDistance.sort((a, b) => a.distance - b.distance);
      }

      return jobsWithDistance
        .filter(job => job.distance <= (distance || Infinity))
        .sort((a, b) => a.distance - b.distance);
    }
    
    // If using city/state/zip, convert to coordinates first
    if (city && state && zipCode) {
      try {
        const coords = await this.getCoordinates(city, state, zipCode);
        const jobsWithDistance = allJobs.map((job: Job) => ({
          ...job,
          distance: this.calculateDistance(coords.latitude, coords.longitude, job.latitude, job.longitude)
        }));

        // 如果选择了 "All Jobs"，返回所有工作并按距离排序
        if (distance === Infinity) {
          return jobsWithDistance.sort((a, b) => a.distance - b.distance);
        }

        return jobsWithDistance
          .filter(job => job.distance <= (distance || Infinity))
          .sort((a, b) => a.distance - b.distance);
      } catch (error) {
        console.error('Error getting coordinates:', error);
        return [];
      }
    }

    return allJobs;
  }

  async createJob(jobData: {
    title: string;
    company: string;
    description: string;
    city: string;
    state: string;
    zipCode: string;
  }) {
    // First get coordinates for the location
    const coords = await this.getCoordinates(jobData.city, jobData.state, jobData.zipCode);
    
    const { data, error } = await this.supabase
      .from('jobs')
      .insert([{
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        city: jobData.city,
        state: jobData.state,
        zip_code: jobData.zipCode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return data;
  }
} 