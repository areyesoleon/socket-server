import { Socket } from "socket.io";
import { UsuariosLista } from "../classes/usuario-lista";
import { Usuario } from "../classes/usuario";
import { mapa } from "../routes/router";

export const usuariosConectados = new UsuariosLista();

export const conectarCliente = (cliente: Socket, io: SocketIO.Server) => {
  const usuario = new Usuario(cliente.id);
  usuariosConectados.agregar(usuario);
}

export const desconectar = (cliente: Socket, io: SocketIO.Server) => {
  cliente.on('disconnect', () => {
    console.log('Cliente desconectado');
    usuariosConectados.borrarUsuario(cliente.id);
    io.emit('usuarios-activos', usuariosConectados.getlista());
  });
}

// Escuchar mensajes
export const mensaje = (cliente: Socket, io: SocketIO.Server) => {
  cliente.on('mensaje', (payload: { de: string, cuerpo: string }) => {
    console.log('mensaje recibido: ' + payload.cuerpo);
    io.emit('mensaje-nuevo', payload);
  });
}

//Configurar usuario
export const configurarUsuario = (cliente: Socket, io: SocketIO.Server) => {
  cliente.on('configurar-usuario', (payload: { nombre: string }, callback) => {
    usuariosConectados.actualizarNombre(cliente.id, payload.nombre);
    io.emit('usuarios-activos', usuariosConectados.getlista());
    callback({
      ok: true,
      usuario: 'Usuario' + payload.nombre + 'Configurado'
    })
    // io.emit('configurar-usuario', payload)
  })
}

// Obtener usuarios
export const obtenerUsuarios = (cliente: Socket, io: SocketIO.Server) => {
  cliente.on('obtener-usuarios', () => {
    io.to(cliente.id).emit('usuarios-activos', usuariosConectados.getlista());
  });
}

// Mapas
export const marcadorNuevo = (cliente: Socket, io: SocketIO.Server) => {
  cliente.on('marcador-nuevo', (marcador) => {
    mapa.agregarMarcador(marcador);
    // io.emit('marcador-nuevo', marcador);
    cliente.broadcast.emit('marcador-nuevo', marcador);
  });
}

export const marcadorBorrar = (cliente: Socket, io: SocketIO.Server) => {
  cliente.on('marcador-borrar', (id: string) => {
    mapa.borrarMarcador(id);
    // io.emit('marcador-nuevo', marcador);
    cliente.broadcast.emit('marcador-borrar', id);
  });
}

export const marcadorMover = (cliente: Socket, io: SocketIO.Server) => {
  cliente.on('marcador-mover', (marcador) => {
    mapa.moverMarcador(marcador);
    // io.emit('marcador-nuevo', marcador);
    cliente.broadcast.emit('marcador-mover', marcador);
  });
}

