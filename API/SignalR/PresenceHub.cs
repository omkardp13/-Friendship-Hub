using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace API.SignalR
{
    [Authorize] 
    public class PresenceHub : Hub
    {
        PresenceTracker tracker;
        public PresenceHub(PresenceTracker presenceTracker)
        {
            this.tracker = presenceTracker;
        }


        public override async Task OnConnectedAsync()
        {

            if (Context.User == null) throw new HubException("Cannot get current user claims");

            var isOnline= await tracker.UserConnected(Context.User.GetUsername(), Context.ConnectionId);

            if(isOnline)  await Clients.Others.SendAsync("UserIsOnline", Context.User?.GetUsername());

            var currentUser = await tracker.GetOnlineUsers();

            await Clients.Caller.SendAsync("GetOnlineUsers", currentUser);
        }

       
        public override async Task OnDisconnectedAsync(Exception? exception)
        {

           var isOffline= await tracker.UserDisconnected(Context.User.GetUsername(),Context.ConnectionId);

           if(isOffline) await Clients.Others.SendAsync("UserIsOffline",Context.User?.GetUsername());

            await base.OnDisconnectedAsync(exception); 
        }
    }
}
