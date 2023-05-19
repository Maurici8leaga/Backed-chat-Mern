// aqui iran abstraciones de clases las cuales podran ser implementadas en otros files
// de esta forma se mantiene un arquitectura limpia
import bcrypt from 'bcryptjs';
import { config } from '@configs/configEnv';

export class Generators {
  // metodo para solo tener texto con primeras letras en mayusculaa
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }

  // metodo para tener todo el texto en minuscula
  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  // metodo para genera un numero random y este usarlo como id para un elemento
  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }

  // metodo para parsear objetos a JSON para asi poder recuperar datos y convertiros en objeto js
  static parseJson(prop: string) {
    // el type unkown se usa ya que el retorno se desconoce que tipo seraa, pero unknown lo sabra despues de resolverse la funcion
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
    return JSON.parse(prop);
  }

  // metodo para encryptar el password del user
  static hash(password: string): Promise<string> {
    return bcrypt.hash(password, Number(config.SALT_ROUND)); //se coloca la funcion "Number" ya que sin el lo toma como string y debe ser un number
    // el "hash" de bcrypt es la funcion que encrypta el password el cual necesita 2 parametros el 1ro el password y el
    // 2do es el un numero que representa los bytes extras que agregas al hashing del password, por defecto son 10 mientras mayor sea mayor sera la
    // encriptacion y  tardara mas
  }
}
