import { io } from 'socket.io-client';

// Conectamos al gateway WebSocket en NestJS
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

// Conexión exitosa
socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket:', socket.id);
});

// Eventos de tareas
socket.on('task-created', (data) => {
  console.log('Tarea creada:', data);
});

socket.on('task-updated', (data) => {
  console.log('Tarea actualizada:', data);
});

socket.on('task-deleted', (data) => {
  console.log('Tarea eliminada:', data);
});

// Desconexión
socket.on('disconnect', () => {
  console.log('Desconectado del servidor WebSocket');
});
