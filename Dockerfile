# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Recompila los binarios de sqlite3 para la arquitectura del contenedor
RUN npm rebuild sqlite3

# Compila el proyecto TypeScript a JavaScript
RUN npm run build

# Expone el puerto que usará tu WebSocket
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]