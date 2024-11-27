const dotenv = require('dotenv'); //importanto a biblioteca dotenv e armazenando em uma variavel
dotenv.config();//verificar se existe um .env 

//acesso local
const {//se ou estou na maquina do sever ele vai me retornar porta e ulr do banco de dados
    PORT,
    pgConnection
} = process.env;

//fora da maquina local
module.exports = {//mando a conexao ou mando a porta
    port: PORT,
    urlConnection: pgConnection
} 
