FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# 🔥 Crear usuario
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 🔥 Crear carpeta uploads y asignar permisos
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads
 
# 🔥 También asegurar permisos del proyecto (opcional pero recomendado)
RUN chown -R appuser:appgroup /app

# 🔥 Cambiar a usuario seguro
USER appuser

EXPOSE 3000

CMD ["node", "index.js"]