import { API_BASE } from '../config/api';
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
        socket = io(API_BASE, {
      auth: { token: localStorage.getItem('token') }
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
