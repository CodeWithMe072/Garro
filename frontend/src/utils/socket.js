import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
