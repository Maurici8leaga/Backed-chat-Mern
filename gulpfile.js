//este archivo trabaja con ECMA5, debido a esto se debe agregar unos rules en eslintrc
const uglify = require('gulp-uglify-es').default; //"default" es la funcionalidad por default de uglify
const { src, dest } = require('gulp');

const minifyAndOfuscate = () => src('./cache/src/**/*.js').pipe(uglify()).pipe(dest('./dist')); //"pipe" es una tuberia de procesos
//este "minifyAndOfuscate" sera el que sera usado en el script para ofuscar el codigo y minificar su tamaño
// la direccion que se coloca en "src" va a depender de lo que se halla puesto en "outdir" en el tsconfig (en este caso "cache"), luego habria que crear esa carpeta
//el "dest" es una funcion como parametro que se tiene que pasar como destino a donde va a crear el folder

exports.minifyAndOfuscate = minifyAndOfuscate;
