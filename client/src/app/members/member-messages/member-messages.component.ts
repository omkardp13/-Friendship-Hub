import { Component, Input, Output, EventEmitter, ViewChild, inject, AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service'; // Assuming correct import

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements AfterViewChecked {
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  @ViewChild('messageForm') messageForm?: NgForm;

  @ViewChild('scrollMe') scrollContainer?:any;
   messageService = inject(MessageService);

  @Input() username!: string;
  


  @Output() updateMessages = new EventEmitter<Message>(); // Emit new messages to parent

  messageContent = '';

  sendMessage(): void {
    // Debugging to check if messageContent is populated
   // Check if the messageContent is populated

    if (!this.messageContent.trim()) {
      console.warn('Message content is empty.');
      return; // Prevent sending empty messages
    }

    this.messageService.sendMessage(this.username, this.messageContent).then(()=>
    {
      this.messageForm?.reset();
      this.scrollToBottom();
    })
  }

  private scrollToBottom()
  {
    if(this.scrollContainer)
    {
         this.scrollContainer.nativeElement.scrollTOp=this.scrollContainer.nativeElement.scrollHeight;
    }
  }

}
