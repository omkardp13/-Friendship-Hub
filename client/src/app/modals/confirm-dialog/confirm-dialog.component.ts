import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {

  bsModalRef=inject(BsModalRef);
  title=''
  message=''
  btnOkText=''
  btnCancelText=''
  result=false

  confirm()
  {
    this.result=true;
    this.bsModalRef.hide();
  }

  decline()
  {
    this.bsModalRef.hide();
  }
}
