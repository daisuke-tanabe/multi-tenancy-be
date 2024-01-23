# multi-tenancy-be

## docker

```
# イメージ作成
docker build . -t multi-tenancy-be:latest

# イメージ一覧
docker image ls

# コンテナの作成と開始
docker run -it --name multi-tenancy-be -p 3001:3001 multi-tenancy-be

# コンテナ一覧
docker container ls
```

```
# 無に還す
docker system prune --volumes
docker builder prune -f
```