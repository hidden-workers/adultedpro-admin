import Pusher from 'pusher-js';
import axios from 'axios';
import { store } from '../store/store';
import { PusherEvents } from '../interfaces';
import { getPusherAuthorizationUrl } from '../api/Endpoint';
import { PUSHER_CLUSTER } from '../constants';
import { handleNewMessage } from '../store/reducers/chatSlice';
const PUSHER_API_KEY = '4b73e35e53504d4a3e1e';
export class PusherClient {
  static instance = null;
  static pusher = null;
  static channel = null;
  static userId = '';

  static get getInstance() {
    if (!PusherClient.instance) {
      PusherClient.pusher = new Pusher(PUSHER_API_KEY, {
        cluster: PUSHER_CLUSTER,
        authEndpoint: getPusherAuthorizationUrl(),
        auth: {
          headers: async () => {
            const accessToken = String(localStorage.getItem('Access_Token'));
            return {
              Authorization: `Bearer ${accessToken}`,
            };
          },
        },
      });

      PusherClient.instance = new PusherClient();
    }
    return PusherClient.instance;
  }

  async connect(channelName) {
    try {
      if (!PusherClient.channel) {
        PusherClient.channel = PusherClient.pusher.subscribe(channelName);

        PusherClient.channel.bind('pusher:subscription_succeeded');

        PusherClient.channel.bind('pusher:subscription_error', (error) => {
          console.error(
            `Subscription error for channel: ${channelName}`,
            error,
          );
        });

        PusherClient.channel.bind('pusher:connection_state_change');

        PusherClient.channel.bind_global((eventName, data) =>
          this.onEvent(eventName, data),
        );
      }
    } catch (e) {
      console.error('ERROR: Pusher failed to connect', e);
    }
  }

  async disconnect(channelName) {
    try {
      if (PusherClient.channel) {
        PusherClient.channel.unbind_all();
        PusherClient.pusher.unsubscribe(channelName);
        PusherClient.channel = null;
      }
    } catch (error) {
      console.error('Error disconnecting from Pusher:', error);
    }
  }

  async onEvent(eventName, eventData) {
    try {
      const { dispatch } = store;

      switch (eventName) {
        case PusherEvents.NewMessage:
          dispatch(handleNewMessage(eventData) as never);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error handling Pusher event:', error);
    }
  }
}
