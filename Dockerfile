# Usa una imagen oficial de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto (por defecto NestJS usa 3000)
EXPOSE 3000

# Comando para correr la app
CMD ["npm", "run", "start:prod"]
