### Docker commands ###
build:
	docker-compose build

build-no-cache:
	docker-compose build --no-cache

up:
	docker-compose up --build

updetached:
	docker-compose up --build -d

down:
	docker-compose down

stop:
	docker-compose stop

list:
	docker-compose ps

### Clean up commands ###
stop-docker:
	docker stop $$(docker ps -aq)

clear-images:
	docker rmi $$(docker image ls -aq)

clear-containers:
	docker rm $$(docker ps -aq)

clean: stop-docker clear-containers clear-images
