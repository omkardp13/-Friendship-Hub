import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css']
})
export class RolesModalComponent {

  bsModalRef=inject(BsModalRef);

  title='';
  username=''
  availableRoles:string[]=[];
  selectedRoles:string[]=[];
  rolesUpdated=false;

  updateChecked(checkedValue:string)
  {
     if(this.selectedRoles.includes(checkedValue))
     {
        this.selectedRoles=this.selectedRoles.filter(r=>r !==checkedValue)
     }
     else
     {
      this.selectedRoles.push(checkedValue);
     }
  }

  onSelectRoles()
  {
    this.rolesUpdated=true;
    this.bsModalRef.hide();
  }

}
