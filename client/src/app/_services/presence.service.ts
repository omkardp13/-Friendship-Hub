import { inject, Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/User';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  hubUrl = environment.hubsUrl;
  private hubConnection?: HubConnection;
  private toastr = inject(ToastrService);
  private router=inject(Router);

  onlineUsers = signal<string[]>([]);

  // Initialize the hub connection
  createHubConnection(user: User) {
    if (!user?.token) {
      console.error('User token is required to establish SignalR connection.');
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token // Access token for the hub
      })
      .withAutomaticReconnect() // Automatically try to reconnect
      .build();

    // Start the connection
    this.hubConnection.start()
      .then(() => console.log('SignalR connection started successfully'))
      .catch(error => console.error('Error starting SignalR connection:', error));

    // Listen for 'UserIsOnline' event
    this.hubConnection.on('UserIsOnline', (username: string) => {
      this.onlineUsers.update(users=> [...users,username]);
    });

    // Listen for 'UserIsOffline' event
    this.hubConnection.on('UserIsOffline', (username: string) => {
      this.onlineUsers.update(users=>users.filter(x=>x!=username));
    });

    // Listen for 'GetOnlineUsers' event
    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      console.log('Online users:', usernames);
      this.onlineUsers.set(usernames);
    });

    this.hubConnection.on('NewMessageReceived', (username,knownAs) => {
      this.toastr.info(knownAs+' has sent you a new message! Click me to see it')
      .onTap
      .pipe(take(1))
      .subscribe(()=> this.router.navigateByUrl('/members/'+username+'?tab=Messages'))
    });
  }

  // Stop the hub connection
  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR connection stopped successfully'))
        .catch(error => console.error('Error stopping SignalR connection:', error));
    }
  }

  // Add user to online users
  private addOnlineUser(username: string) {
    const currentUsers = this.onlineUsers();
    if (!currentUsers.includes(username)) {
      this.onlineUsers.set([...currentUsers, username]);
    }
  }

  // Remove user from online users
  private removeOnlineUser(username: string) {
    const currentUsers = this.onlineUsers();
    this.onlineUsers.set(currentUsers.filter(user => user !== username));
  }
}
