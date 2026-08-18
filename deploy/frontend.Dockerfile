# Frontend SPA — apps/frontend (Vite build, served as static files)
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_BACKEND_URL=http://localhost:6000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
ENV PORT=5000
EXPOSE 5000
CMD ["sh", "-c", "npx --yes serve -s dist -l ${PORT}"]
