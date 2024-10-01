import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/User';
import { Group } from '../_models/Group';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubsUrl;

  paginatedResult = signal<PaginatedResult<Message[]> | null>(null);
  messageThread = signal<Message[]>([]);

  hubConnection?: HubConnection;

  constructor(private http: HttpClient) {}

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}message?user=${otherUsername}`, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log('Error starting connection:', error));

    // Receiving message thread
    this.hubConnection.on('ReceiveMessageThread', (messages: Message[]) => {
      this.messageThread.set(messages); // Update the message thread using signal
    });

    // Listening for new messages
    this.hubConnection.on('NewMessage', (message: Message) => {
      this.messageThread.update(messages => [...messages, message]); // Append new message to the current thread
    });

    // Handling updated group (marking messages as read)
    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if (group.connections.some(x => x.username === otherUsername)) {
        this.messageThread.update(messages => {
          return messages.map(message => {
            if (!message.dataRead) {
              message.dataRead = new Date(); // Mark messages as read
            }
            return message;
          });
        });
      }
    });
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log('Error stopping connection:', error));
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params: HttpParams = setPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);

    return this.http.get<Message[]>(`${this.baseUrl}messages`, { observe: 'response', params })
      .pipe(
        catchError(error => {
          console.error('Error fetching messages:', error);
          return of(null); // Return null in case of error to avoid breaking the app
        })
      )
      .subscribe({
        next: response => {
          if (response?.body) {
            setPaginatedResponse(response, this.paginatedResult);
          }
        }
      });
  }

  async sendMessage(username: string, content: string) {
    try {
      // Invoke the 'SendMessage' method on the SignalR hub
      return await this.hubConnection?.invoke('SendMessage', { recipientUsername: username, content });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(`${this.baseUrl}messages/thread/${username}`);
  }

  deleteMessage(id: number) {
    return this.http.delete(`${this.baseUrl}messages/${id}`);
  }
}
