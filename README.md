# neptune-resources

Local development environment for Neptune DXP (Planet9) with PostgreSQL database.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop)
- At least 4GB of available RAM
- Ports 5432 and 8080 available on your local machine

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd neptune-resources
```

### 2. Configure Environment Variables

Navigate to the local development directory:

```bash
cd local-development
```

The `.env` file contains all configuration variables. You can modify these values as needed:

```bash
# View current configuration
cat .env

# Edit configuration (optional)
nano .env  # or use your preferred editor
```

### 3. Start the Development Environment

Start all services (PostgreSQL database and Neptune DXP):

```bash
docker-compose up -d
```

The `-d` flag runs the containers in detached mode (in the background).

### 4. Verify Services are Running

Check that both containers are up and running:

```bash
docker-compose ps
```

You should see both `postgres_db` and `neptune_dxp` containers with status "Up".

### 5. View Logs (Optional)

To monitor the application logs:

```bash
# View all logs
docker-compose logs -f

# View Neptune DXP logs only
docker-compose logs -f neptune

# View PostgreSQL logs only
docker-compose logs -f db
```

Press `Ctrl+C` to stop following logs.

## Accessing the Application

Once the services are running:

- **Neptune DXP Cockpit**: http://localhost:8080
- **PostgreSQL Database**: `localhost:5432`

### Default Credentials

**Neptune DXP Admin Login:**
- Username: `admin`
- Password: `admin123`

**PostgreSQL Database:**
- Host: `localhost`
- Port: `5432`
- Database: `Planet9`
- Username: `myuser`
- Password: `mypassword`

> ⚠️ **Security Note**: These are development credentials only. Never use these in production!

## Managing the Development Environment

**Note**: All commands below should be run from the `local-development` directory.

### Stop Services

```bash
docker-compose stop
```

This stops the containers but preserves data.

### Start Stopped Services

```bash
docker-compose start
```

### Restart Services

```bash
docker-compose restart
```

### Stop and Remove Containers

```bash
docker-compose down
```

This stops and removes containers but keeps the database volume (data persists).

### Complete Cleanup (Including Data)

```bash
docker-compose down -v
```

⚠️ **Warning**: This removes all data including the PostgreSQL database!

## Troubleshooting

### Port Already in Use

If you get an error about ports 5432 or 8080 being in use:

1. Check what's using the port:
   ```bash
   # On Linux/Mac
   lsof -i :8080
   lsof -i :5432
   
   # On Windows (PowerShell)
   netstat -ano | findstr :8080
   netstat -ano | findstr :5432
   ```

2. Stop the conflicting service or modify the port settings in `local-development/.env`:
   ```bash
   # Edit the .env file and change POSTGRES_PORT or NEPTUNE_PORT
   nano local-development/.env
   ```

### Services Won't Start

1. Check Docker is running:
   ```bash
   docker info
   ```

2. Check available disk space:
   ```bash
   docker system df
   ```

3. View detailed logs:
   ```bash
   cd local-development
   docker-compose logs
   ```

### Reset Everything

To completely reset the development environment:

```bash
cd local-development
docker-compose down -v
docker-compose up -d
```

## Project Structure

```
neptune-resources/
├── local-development/
│   ├── docker-compose.yaml   # Docker Compose configuration
│   ├── .env                   # Environment variables (not in git)
│   └── .env.example          # Environment variables template
└── README.md                  # This file
```

## Environment Variables

All configuration is managed through the `.env` file in the `local-development` directory:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `POSTGRES_USER` | PostgreSQL username | `myuser` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `mypassword` |
| `POSTGRES_DB` | PostgreSQL database name | `Planet9` |
| `POSTGRES_PORT` | PostgreSQL host port | `5432` |
| `NEPTUNE_VERSION` | Neptune DXP Docker image version | `v24.12.1` |
| `NEPTUNE_PORT` | Neptune DXP host port | `8080` |
| `NEPTUNE_ADMIN_PASSWORD` | Initial admin password for Neptune DXP | `admin123` |

To customize your environment:
1. Edit the `.env` file in the `local-development` directory
2. Restart the services: `docker-compose restart`

## Services Overview

### PostgreSQL Database (`db`)
- **Image**: `postgres:latest`
- **Container Name**: `postgres_db`
- **Port**: 5432
- **Data Persistence**: Uses Docker volume `postgres_data`

### Neptune DXP (`neptune`)
- **Image**: `neptunesoftware/planet9:v24.12.1`
- **Container Name**: `neptune_dxp`
- **Port**: 8080
- **Dependencies**: Requires PostgreSQL database to be running

## Additional Resources

- [Neptune Software Documentation](https://docs.neptune-software.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)