import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

 
  ngOnInit(): void
  {
    
  }

 
  registerMode=false;
  

 
 
  cancelRegisterMode(event:boolean)
  {
       this.registerMode=event;
  }

  registerToggle()
  {
    this.registerMode = !this.registerMode
  }


}
