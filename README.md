# Neptune DXP - Open Edition Resources

This repository contains the required development resources and setup process.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop)
- Extract the licence

## Start Local Development Environment 

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

The `.env` file contains all configuration variables. You can modify these values as needed.

### 3. Start the Development Environment

Start all services (PostgreSQL database and Neptune DXP):

```bash
docker compose up -d
```

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

### Accessing the Application

Once the services are running:

- **Neptune DXP Cockpit**: http://localhost:8080
- **PostgreSQL Database**: `localhost:5432`


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


## Additional Resources

- [Neptune Software Documentation](https://docs.neptune-software.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
