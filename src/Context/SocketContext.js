import React from 'react';
import socketio from 'socket.io-client';

import {ROOT_URL} from '../Server/config';

export const socket_connection = (user, roletype, location, token, ip) => {
  console.log('ROOT_URL: ', ROOT_URL);
  const socket = socketio.connect(ip == '' || ip == null ? ROOT_URL : ip, {
    auth: {
      token: token,
      user_id: user,
      role: roletype,
      location_id: location,
    },
  });

  return socket;
};

export const SocketContext = React.createContext();
