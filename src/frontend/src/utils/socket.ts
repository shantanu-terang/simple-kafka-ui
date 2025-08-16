import { io } from 'socket.io-client';

const backendUrl = window.location.origin;


const socket = io(backendUrl, {
  transports: ["websocket"],
})


export default socket;
