import * as signalR from '@microsoft/signalr';

class SignalRService {
  public connection: signalR.HubConnection | null = null;
  private url = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/hubs/playhub';

  public startConnection = async () => {
    if (this.connection && 
        this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connection) {
      await this.stopConnection();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.url, {
        withCredentials: true
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setTimeout(() => this.startConnection(), 5000);
    }
  };

  public stopConnection = async () => {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR Disconnected');
      } catch (err) {
        console.error('Error stopping SignalR: ', err);
      } finally {
        this.connection = null;
      }
    }
  }
}

export const signalRService = new SignalRService();
