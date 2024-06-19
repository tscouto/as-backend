import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import siteRouter from './routes/site';
import adminRouters from './routes/admin';
import { requestIntercepter } from './utils/requestintercepter';
import fs from 'fs';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminRouters);
app.use('/', siteRouter);

app.all('*', requestIntercepter);

const runServer = (port: Number, server: http.Server) => {
  server.listen(port, () => {
    console.log(`Runnning at Port ${port}`);
  });
};

const regularServer = http.createServer(app);

if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY as string),
    cert: fs.readFileSync(process.env.SSL_CERT as string),
  };
  const secServer = https.createServer(options, app);
  runServer(80, regularServer);
  runServer(443, secServer);
  //TODO: configurar SSL
  //TODO : rodar server na 80 e na 443
} else {
  const serverPort: number = process.env.PORT
    ? parseInt(process.env.PORT)
    : 9000;
  runServer(serverPort, regularServer);
}
