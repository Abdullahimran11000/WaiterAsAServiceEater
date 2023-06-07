import React from 'react';
import socketio from 'socket.io-client';

import {ROOT_URL} from '../Server/config';
import {socketEvents} from '../Utils/SocketHelper';

export const socket_connection = (user, roletype, location, token, ip) => {
  console.log('roletype: ', roletype);
  const socket = socketio.connect(ip == '' || ip == null ? ROOT_URL : ip, {
    ...(ip && {transports: ['websocket']}),
    auth: {
      token: token,
      user_id: user,
      role: roletype,
      location_id: location,
    },
  });

  socketEvents(socket);

  return socket;
};

export const SocketContext = React.createContext();
