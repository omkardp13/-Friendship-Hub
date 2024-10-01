import { Component } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  model:any={}

 
  constructor(public accountService:AccountService,private router:Router,private toastr:ToastrService)
  {
        
  }

  ngOnInit():void
  {
    
  }

  login()
  {
    //we will specify ,subscribe and then we get our observer object back from this and we'll open curly brackets for the first part of this what do we want to do next with this obervable?
    //so we're going to say next ,we're going take our respose and we'll call it response and the we'll open up curly brackets this time because little allow us to put multiple statements inside what we want to do with this respose .
    //and if there a problem with the user logged in ,then we're going to do something with the error 
    
    this.accountService.login(this.model).subscribe({
      next:_  => {
        this.router.navigateByUrl('/members')
        
      },
      error:error => this.toastr.error(error.error)
      
    });
  }
  
  
  logout()
  {
    this.accountService.logout();
    this.router.navigateByUrl('/')
  }

}
