import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { signUpUser } from '../js/register.js';
import { loginUser } from '../js/login.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  const result = await signUpUser(nombre, correo, contrasena);
  res.json(result);
});

app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  const result = await loginUser(correo, contrasena);
  res.json(result);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});