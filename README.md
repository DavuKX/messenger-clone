

# Messenger Clone Application

This is a messenger clone application built using Laravel for the backend, React for the frontend, and Laravel Echo for real-time messaging. The application is containerized using Docker, making it easy to set up and run.

## Features

- Real-time messaging
- User authentication
- Dockerized for easy deployment

## Prerequisites

Make sure you have the following installed on your machine:

- Docker
- Docker Compose

## Getting Started

Follow these steps to set up and run the application:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/messenger-clone.git
cd messenger-clone
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory of the project and configure the database and other necessary environment variables. You can copy the example environment file and modify it:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials and other configuration settings.

### 3. Build and Run the Docker Containers

Run the following command to build and start the Docker containers:

```bash
docker-compose up -d
```

This command will start all the necessary services including the app, nginx, mysql, and npm.

### 4. Install PHP Dependencies

Get into the app container and install the PHP dependencies using Composer:

```bash
docker exec -it messenger_clone_app_container bash
composer install
exit
```

### 5. Run Database Migrations

Run the migrations to set up the database schema:

```bash
docker exec -it messenger_clone_app_container bash
php artisan migrate
exit
```

### 6. Access the Application

The application will be accessible at `http://localhost` on port 80.

### 7. Access the React Development Server

The React development server will be accessible at `http://localhost:3000`.

## Directory Structure

- **/app**: Laravel backend application
- **/resources**: Frontend resources including React components
- **/docker**: Docker configuration files
- **/public**: Public directory served by nginx

## Additional Commands

### Stop the Containers

To stop the running containers, use:

```bash
docker-compose down
```

### Rebuild the Containers

If you make changes to the Docker configuration or Dockerfile, rebuild the containers using:

```bash
docker-compose up -d --build
```
