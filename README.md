# TCC - BackEnd

# Instalar dependencias
Execute o comando `npm i` na raiz do projeto

# Executar

## Desenvolvimento
1. Execute `npm run start` para iniciar a API na porta 3000
2. Use o postman ou o imsonia para executar requisições para o endereço "http://localhost:3000"

# Endpoints

## Users

| Endpoint | Method |
| --- | --- |
| getUsers | GET |
| getUser/:userId | GET |
| listaUsers | GET | 
| addUser | POST |
| deleteUser/:userId | PUT |
| editUser/:userId | PUT |

## Acessos

| Endpoint | Method |
| --- | --- |
| getAcessos | GET |
| editAcesso/:userId | GET |
| editAcesso/:userId | PUT | 
| listaAcessos | GET |
| addAcesso | POST |

## Reconhecimento (Faces)

| Endpoint | Method |
| --- | --- |
| train | POST |
| recognize | POST |
| save | POST | 
| getAll | GET |
	