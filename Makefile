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

### Clean up commands ###
stop-docker:
	docker stop $$(docker ps -aq)

clear-images:
	docker rmi $$(docker images -aq)

clear-containers:
	docker rm $$(docker ps -aq)

clean: stop-docker clear-containers clear-images