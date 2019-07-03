import { Router, Request, Response } from 'express';
import Server from '../classes/server';
import { Socket } from 'socket.io';
import { usuariosConectados } from '../sockets/sockets';
import { GraficaData } from '../classes/grafica';
import { Mapa } from '../classes/mapa';

const router = Router();
const grafica = new GraficaData();
export const mapa = new Mapa();
const lugares =  [
  {
    id: '1',
    nombre: 'Udemy',
    lat: 37.784679,
    lng: -122.395936
  },
  {
    id: '2',
    nombre: 'Bahía de San Francisco',
    lat: 37.798933,
    lng: -122.377732
  },
  {
    id: '3',
    nombre: 'The Palace Hotel',
    lat: 37.788578,
    lng: -122.401745
  }
];

mapa.marcadores.push(...lugares);

router.get('/mensajes', (req: Request, res: Response) => {
  res.json({
    ok: true,
    mensaje: 'Todo bien'
  });
});

router.post('/mensajes', (req: Request, res: Response) => {
  const cuerpo = req.body.cuerpo;
  const de = req.body.de;
  const server = Server.instance;
  const payload = {
    cuerpo, de
  }
  server.io.emit('mensaje-nuevo', payload);
  res.json({
    ok: true,
    cuerpo,
    de
  });
});

router.post('/mensajes/:id', (req: Request, res: Response) => {
  const cuerpo = req.body.cuerpo;
  const de = req.body.de;
  const id = req.params.id;
  const payload = {
    de,
    cuerpo
  }
  const server = Server.instance;
  server.io.in(id).emit('mensaje-privado', payload)
  res.json({
    ok: true,
    cuerpo,
    de,
    id
  });
});

//Servicio para obtener los id de los usuarios
router.get('/usuarios', (req: Request, res: Response) => {
  const server = Server.instance;
  server.io.clients((err: any, clientes: string[]) => {
    if (err) {
      return res.json({
        ok: false,
        err: err
      })
    }
    res.json({
      ok: true,
      clientes
    })
  });
});

// obtener usuarios y sus nombre
router.get('/usuarios/detalle', (req: Request, res: Response) => {
  res.json({
    ok: true,
    clientes: usuariosConectados.getlista()
  })
});

router.get('/grafica', (req: Request, res: Response) => {
  res.json(grafica.getDataGrafica());
});

router.post('/grafica', (req: Request, res: Response) => {
  const mes = req.body.mes;
  const unidades = Number(req.body.unidades);

  grafica.incrementarValor(mes, unidades);

  const server = Server.instance;
  server.io.emit('cambio-grafica',grafica.getDataGrafica());
  res.json(grafica.getDataGrafica());
});

// mapas
router.get('/mapas', (req: Request, res: Response) => {
  res.json(mapa.getMarcadores());
});



export default router;
