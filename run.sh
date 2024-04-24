#!/usr/bin/env bash
set -Ee

export COMPOSE_PROJECT_NAME="ffxiv-company"

case $1 in
    start )
        echo "Starting containers..."
        docker compose up -d --build --force-recreate $2
        if [ -z "$2" ]; then
            ./run.sh attach
        fi
        ;;
    stop )
        echo "Stopping and removing containers..."
        docker compose down $2
        ;;
    restart )
        echo "Restarting containers..."
        docker compose restart $2
        ;;
    restage )
        echo "Restaging containers..."
        ./run.sh stop $2 && ./run.sh start $2
        ;;
    attach )
        echo "Attaching to Docker stack..."
        docker-compose logs -f --tail 1000
        ;;
    clean )
        echo "Cleaning Docker environment..."
        docker system prune -af --volumes
    ;;
    * )
        echo "Invalid option provided."
        exit 1
    ;;
esac