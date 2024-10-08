import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AccountService } from './_services/account.service';
import { User } from './_models/User';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit
{
  title:string="Dating App";
 
         constructor(private http:HttpClient,private accountService:AccountService)
          {
    
          } 
          ngOnInit(): void {
            this.setCurrentUser();
           
          }
  
   setCurrentUser()
   {
    const userString=localStorage.getItem('user');
    if(!userString)
    {
       return;
    }
    else
    {
      const user:User=JSON.parse(userString);
      this.accountService.setCurrentUser(user);
    }
   }
}
