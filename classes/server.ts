import express from 'express';
import { SERVER_PORT } from '../global/environment';
import socketIO from 'socket.io';
import http from 'http';
import * as socket from '../sockets/sockets';

export default class Server {
  private static _instance: Server;
  public app: express.Application;
  public port: number;

  public io: socketIO.Server;
  private httpserver: http.Server;

  private constructor() {
    this.app = express();
    this.port = SERVER_PORT;
    this.httpserver = new http.Server(this.app);
    this.io = socketIO(this.httpserver);
    this.escucharSockets();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private escucharSockets() {
    //Coneccion
    this.io.on('connection', (cliente) => {
      //Conectar Cliente
      socket.conectarCliente(cliente, this.io);
      //configurar usuario
      socket.configurarUsuario(cliente, this.io);
      //obtener usuarios activos
      socket.obtenerUsuarios(cliente, this.io);
      //mensajes
      socket.mensaje(cliente, this.io);
      //marcadores
      socket.marcadorNuevo(cliente, this.io);
      // borrar marcadores
      socket.marcadorBorrar(cliente, this.io);
      //mover marcador
      socket.marcadorMover(cliente, this.io);
      //desconectar
      socket.desconectar(cliente, this.io);
    });
  }

  start(callback: any) {
    this.httpserver.listen(this.port, callback);
  }
}