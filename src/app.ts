import express, { Express } from 'express';
import { ChatServer } from '@bootstrap/setupServer.bootstrap';
import databaseConnection from '@bootstrap/setupDatabase.bootstrap';
// "databaseConnection" Es el nombre que se le coloca a la funcion anonima
import { config } from '@configs/configEnv';

class Application {
  public initialize(): void {
    // llamamos el metodo privado para que cuando se ejecute "initialize" este sea ejecutado
    this.loadConfig();
    // llamamos la funcion de arranque del db
    databaseConnection();
    const app: Express = express(); //aqui se le otorga a "app" los metodos de express
    const server: ChatServer = new ChatServer(app); //se crea una instancia de la clase ChatServer
    server.start(); //se usa el metodo start de la clase ChatServer para iniciar los metodos
  }

  // este es un metodo privado para que ejecute metodos al iniciar la app
  private loadConfig(): void {
    config.validateConfig(); //metodo para verificacion de la variables de entorno
    config.cloudinaryConfig(); //metodo para el levantamiento de credenciales de cloudinary
  }
}

// se crea la instancia del class
const application: Application = new Application();
// hacemos llamado del metodo "initialize"
application.initialize();
