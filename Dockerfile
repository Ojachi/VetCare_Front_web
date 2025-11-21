# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Las variables VITE_* deben estar disponibles en build time
# Dokploy las inyecta automáticamente cuando configuras Environment Variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build de producción
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]