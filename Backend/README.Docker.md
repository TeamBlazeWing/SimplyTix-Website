# SimplyTix Backend - Docker Setup

This repository contains the backend API for SimplyTix, a ticket management system built with Node.js, Express, and MongoDB.

## Prerequisites

- Docker
- Docker Compose

## Quick Start with Docker

1. **Clone the repository** (if not already done)

2. **Create environment file**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration values.

3. **Build and run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Backend API: http://localhost:3000
   - Database: MongoDB Atlas (cloud-hosted)

## Docker Commands

### Development

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
docker-compose down -v
```

### Production

```bash
# Build for production
docker build -t simplytix-backend .

# Run production container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGO_URI=your-mongo-uri \
  -e JWT_SECRET=your-jwt-secret \
  simplytix-backend
```

## Environment Variables

| Variable                | Description                          | Required |
| ----------------------- | ------------------------------------ | -------- |
| `NODE_ENV`              | Environment (development/production) | Yes      |
| `PORT`                  | Server port                          | Yes      |
| `MONGO_URI`             | MongoDB Atlas connection string      | Yes      |
| `JWT_SECRET`            | JWT signing secret                   | Yes      |
| `MSPACE_APP_ID`         | MSpace payment gateway app ID        | No       |
| `MSPACE_PASSWORD`       | MSpace payment gateway password      | No       |
| `MSPACE_API_BASE`       | MSpace API base URL                  | No       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                | No       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                   | No       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                | No       |
| `CLOUDINARY_URL`        | Cloudinary complete URL              | No       |

## Database

This application uses **MongoDB Atlas** (cloud-hosted MongoDB):

- No local database setup required
- Configure your MongoDB Atlas connection string in the `.env` file
- Ensure your Atlas cluster allows connections from your deployment IP

## File Storage

The `uploads` directory is mounted as a volume to persist uploaded files between container restarts.

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000

   # Change port in docker-compose.yml or stop the conflicting service
   ```

2. **Database connection issues**

   ```bash
   # Check backend container logs
   docker-compose logs backend

   # Verify MongoDB Atlas connection string in .env file
   # Ensure your IP is whitelisted in MongoDB Atlas
   ```

3. **Permission issues with uploads**
   ```bash
   # Fix upload directory permissions
   sudo chown -R 1001:1001 uploads/
   ```

### Reset Everything

```bash
# Stop all containers
docker-compose down

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:3000/api-docs

## Development

For local development without Docker:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Deployment

For production deployment, consider:

1. Using environment-specific configuration
2. Setting up proper logging
3. Implementing health checks
4. Using a reverse proxy (nginx)
5. Setting up SSL/TLS certificates
