import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Habilito CORS para desarrollo
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  notifyTaskCreated(task: any) {
    this.server.emit('task-created', task);
  }

  notifyTaskUpdated(task: any) {
    this.server.emit('task-updated', task);
  }

  notifyTaskDeleted(taskId: number) {
    this.server.emit('task-deleted', { id: taskId });
  }

  notifyTaskArchived(task: any) {
    this.server.emit('task-archived', task);
  }
}
