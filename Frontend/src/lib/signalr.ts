import * as signalR from '@microsoft/signalr';

class SignalRService {
  public connection: signalR.HubConnection | null = null;
  private url = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/hubs/playhub';

  public startConnection = async (token: string) => {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.url, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setTimeout(() => this.startConnection(token), 5000);
    }
  };

  public stopConnection = async () => {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
