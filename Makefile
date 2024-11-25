### Docker commands ###
build:
	docker-compose build

build-prod:
	docker-compose -f docker-compose-prod.yml build

build-no-cache:
	docker-compose build --no-cache

up:
	docker-compose up --build

up-prod:
	docker-compose -f docker-compose-prod.yml up --build

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
	docker stop $(docker ps -aq)

clean: clear-containers clear-images clean-volumes

clear-containers:
	-@sudo docker rm $(sudo docker container ls -aq)

clear-images:
	-@sudo docker rmi $(sudo docker image ls -aq)

clean-volumes:
	-@sudo docker volume rm $(sudo docker volume ls -q)