docker build -t nahid08/multi-client:latest  -t nahid08/multi-client:$SHA  -f ./client/Dockerfile ./client
docker build -t nahid08/multi-server:latest  -t nahid08/multi-server:$SHA  -f  ./server/Dockerfile ./server
docker build -t nahid08/multi-worker:latest  -t  nahid08/multi-worker:$SHA -f  ./worker/Dockerfile ./worker

docker push nahid08/multi-client:latest
docker push nahid08/multi-server:latest
docker push nahid08/multi-worker:latest

docker push nahid08/multi-client:$SHA
docker push nahid08/multi-server:$SHA
docker push nahid08/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/client-deployment server=nahid08/multi-client:$SHA
kubectl set image deployments/server-deployment server=nahid08/multi-server:$SHA
kubectl set image deployments/worker-deployment server=nahid08/multi-worker:$SHA