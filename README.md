# multi-tenancy-be

## docker

```
# イメージ作成
docker build . -t multi-tenancy-be:latest

# イメージ一覧
docker image ls

# コンテナの作成と開始
docker run -it --name multi-tenancy-be -p 8080:8080 multi-tenancy-be

# コンテナ一覧
docker container ls

# 無に還す
docker system prune --volumes
docker builder prune -f
```

## ECRへのプッシュ手順

SSO_PROFILE: `~/.aws/config`に記載されているSSOプロフィール

```
// AWS CLI で Dockerクライントを認証する
aws ecr get-login-password --profile ${SSO_PROFILE} --region ap-northeast-1 | docker login --username AWS --password-stdin {ECR_REPOSITORY_URI}

// プッシュするイメージをビルドする
docker build --platform=linux/amd64 . -t multi-tenancy-be:latest

// ECRへプッシュするためにイメージにタグをつける
docker tag multi-tenancy-be:latest {ECR_REPOSITORY_URI}:latest

// ECRへイメージをプッシュする
docker push {ECR_REPOSITORY_URI}:latest
```
