# Backend Char MERN

This is the back of a social network which consists of users being able to share everything about them such as; where they are, where they studied, their thoughts etc. They can also connect with other users, meet people and talk with them. The purpose of this project is educational.

##Get Started

The first thing to do is open the terminal of your code editor of your choice and once there you will have to make sure to enter the folder called "backend-chat-mern", to enter it you must write "cd backend-chat-mern".

```sh
   cd ..
   cd backend-chat-mern
```

## Available Scripts

In the project directory, you can run:

### `yarn run dev`

In this folder is our Backend, once we enter and execute the following command it will only run the code on the side of the BackEnd. To get started in the user interface section, you will need to type the following command;

### `yarn run lint:check`

This command will review all files with a ".ts" extension in the project and provide you with information about any errors, style issues, or problematic patterns it finds in the TypeScript code.

### `yarn run lint:fix`

This command will walk through all the files in the project and apply automatic fixes to styling issues and lint errors that it can fix based on configured rules. This helps keep your code consistent and free of styling issues, saving you time by not having to manually fix every issue detected by ESLint.

### `yarn run prettier:check`

This command will run Prettier will check the format of the TypeScript files in the "src" folder and its subfolders. If it finds any file that does not meet the set format rules, it will display an error message on the console.

### `yarn run prettier:fix`

This command will automatically format the TypeScript files in the "src" folder and its subfolders, applying the established formatting rules. Prettier will make changes directly to existing files to ensure they conform to the correct format. This allows you to maintain a uniform and consistent code style in your project without having to manually make formatting changes.

### `yarn run test`

This command will run Jest with the specified options and settings. It will run tests, generate a coverage report, monitor open handles, and be in continuous watch mode to automatically detect and run tests when there are changes.

### `yarn run build`

The TypeScript compiler "ttsc" will compile the TypeScript files to JavaScript based on the settings set in the "tsconfig.json" file. This will allow you to generate a compiled, production-ready version of your project in JavaScript, which can be executed in production environments.

### `yarn run clean`

This command will safely remove the "cache" and "dist" directories. This is useful for cleaning up and removing any content that is no longer needed, such as pre-generated files or caching directories.

### `yarn run build:pro`

This command will perform the following actions in order:

- The "clean" script will be executed to remove any unwanted content.
- The "build" script will be executed to compile your project in a production environment.
- The "minifyAndOfuscate" task will be executed using Gulp to apply minify and obfuscate actions on your source files.

This will allow you to generate an optimized and safe version of your project in a production environment.

### `yarn run prod`

Node.js will be used to run the "app.js" file located in the "dist" folder. This is part of the deployment process of the application in a production environment. Make sure you have the "app.js" file generated in the "dist" folder before running this script.

### ABOUT

This project was built with bull-board/express, sendgrid/mail, bcryptjs, bull, bullmq, socket.io/redis-adapter, bunyan, cloudinary, compression, cookie-session, cors, dotenv, ejs, express, express-async-errors, helmet, hpp, http-status-codes, ip, joi, jsonwebtoken, lodash, moment, mongoose, nodemailer, redis, socket.io .

Additionally, it should be noted that for the structure of this project was implemented Onion architecture with design patterns and SOLID principles. Which are;

| Design patterns          |              SOLID principles              |
| :----------------------- | :----------------------------------------: |
| Chains of responsability | Interface SegregationInterface Segregation |
| Doble token security     |             Liskov Sustitution             |
| Prototype                |                Open / close                |
| Mediator                 |           Single responsability            |
