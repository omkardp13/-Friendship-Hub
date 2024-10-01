import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/User';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl=environment.apiUrl;
  private http=inject(HttpClient);

  getUserWithRole()
  {
    return this.http.get<User[]>(this.baseUrl+'admin/users-with-roles');
  }

  updateUserRole(username:string,roles:string[])
  {
    console.log("Hi admin");
    return this.http.post<string[]>(this.baseUrl+'admin/edit-roles/' + username +'?roles='+roles,{});
  }
}
