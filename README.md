# matcha
project Matcha 42


## Node Version
```bash
$ node -v
v20.14.0
```

## How to run in dev mode
- If the database schema changed you need to delete the db/data folder so that it's rebuilt (will be re-created). Admin rights needed (couldn't delete on school imacs)
- make clean
- then just run make up
- frontend is at localhost:4000
- to look into the database, open adminer at localhost:8080 and enter db credentials
- to check backend routes and test them, localhost:3000/docs
- to enter a container, for example frontend, run `docker exec -it matcha-frontend sh` and you'll have a shell within the container
