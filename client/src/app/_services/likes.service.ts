import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class LikesService {

  private http = inject(HttpClient);

  baseUrl = environment.apiUrl;

  likesIds = signal<number[]>([]);

  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);

  toggleLike(targetId: number) {
    return this.http.post(`${this.baseUrl}likes/${targetId}`, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = setPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);

    return this.http.get<Member[]>(`${this.baseUrl}likes`, { observe: 'response', params })
      .subscribe({
        next: response => setPaginatedResponse(response, this.paginatedResult),
        error: err => console.error('Error fetching likes:', err) // Optional: Add error handling
      });
  }

  getLikeIds() {
    return this.http.get<number[]>(`${this.baseUrl}likes/list`)
      .subscribe({
        next: ids => this.likesIds.set(ids),
        error: err => console.error('Error fetching like IDs:', err) // Optional: Add error handling
      });
  }

  constructor() { }
}
