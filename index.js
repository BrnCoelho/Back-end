const express = require("express");
const { Client } = require("pg");//da biblioteca pg eu so que o pedaço client{parte escolhida}
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());//saida da api
app.use(cors());//permitir conexaoes locais
app.use(bodyparser.json());//entrada da api

var conString = config.urlConnection;//eu coloco o indereço do servidor em uma variavel (config.urlconection link do arquivo ./config)

var client = new Client(conString);//conexao de usuario e senha

client.connect((err) => { //se der erro
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);//console.log msg de erro 
    }
    client.query('SELECT NOW()', (err, result) => {//select now manda para o querry do sevidor em csq
        if (err) {
            return console.error('Erro ao executar a query.', err);//se der erro
        }
        console.log(result.rows[0]);//resposta para dev/para teste
    });
});
//api vai receber requisicoes 
app.get("/", (req, res) => {//quando a alguem  requisitar no endereço raiz(req=requisição,resp=resposta)
    console.log("Response ok.");//console.log ajuda o desenvolvedor(test)
    res.send("Ok – Servidor disponível.");//res.send(send=inviar)
});

//as demais rotas aqui podemos ter retas fixas e rotas que variam


app.get("/usuarios", (req, res) => { //get para usuarios(funcao de req e resp)
    try {//tenta isso 
        client.query("SELECT * FROM Usuarios", (err, result) => {//se a pesquisa de certo(SELECT * FROM Usuarios) colocar no resultado(result)
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);//test usado par dev
            }
            res.send(result.rows);
            console.log("Rota: get usuarios");//test 
        });
    } catch (error) {
        console.log(error);//ce der outro erro
    }
});

app.get("/usuarios/:id", (req, res) => {//get para usuarios/id()
    try {//tenta fazer essa pesquisa
        console.log("Rota: usuarios/" + req.params.id);    //req.params.id array de parametros
        client.query("SELECT * FROM Usuarios WHERE id = $1", [req.params.id],//esse e a pesquisa que sera executada(SELECT * FROM Usuarios WHERE id = $1")
            (err, result) => {                         //$1 parametros em SQL   
                if (err) {
                    res.send("O dado " + req.params.id + "informado,não é valido");//se for o tipo de dado requisitado for diferente
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                if (result.rowCount == 0) {//aki quando nao ter usuario correspondente para um numero
                    res.send("Não ha usuario para esse codigo: " + req.params.id);
                } else {
                    res.send(result.rows[0]);//console.log(result);
                }


            }
        );
    } catch (error) {
        console.log(error);//se existir outro erro 
    }
});

app.delete("/usuarios/:id", (req, res) => {
    try {
        console.log("Rota: delete/" + req.params.id);//sera mostrado para o programador 
        client.query("DELETE FROM Usuarios WHERE id = $1", [req.params.id], (err, result) => {
            if (err) {
                res.send("Ocorreu um erro na pesquisa do id.");
                return console.error("Erro ao executar a qry de DELETE", err);
            } else {
                if (result.rowCount == 0) {//quando acontece isso ele nao apagou ninguem
                    res.status(404).json({ info: "Registro não encontrado." });//404-nao encontrado
                } else {
                    res.status(200).json({ info: `Registro excluído. Código: ${req.params.id}` });//sucesso 200
                }
            }

        }
        );
    } catch (error) {
        console.log(error);
    }
});
app.post("/usuarios", (req, res) => {//gravar dados//nao preciso informar o id porque
    try {
        console.log("Alguém enviou um post com os dados:", req.body);//corpo da requisição
        const { nome, email, altura, peso } = req.body;//mandano os atribitos do usuario                      //isso e um array
        client.query("INSERT INTO Usuarios (nome, email, altura, peso) VALUES ($1, $2,$3, $4) RETURNING * ", [nome, email, altura, peso],//retorna tudo
            (err, result) => {                                                  //definindo variaveis em SQL
                if (err) {
                    res.send("Ocorreu um erro na inserção do usuario" + req.body);//informando o usuario
                    return console.error("Erro ao executar a qry de INSERT", err);//informa o desenvolvedor
                }

                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
                res.send("Usuario criado com sucesso" + result.rows[0]);//confirmando o para o cliente que o usuario foi criado
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});



app.put("/usuarios/:id", (req, res) => {
    try {
        console.log("Alguém enviou um update com os dados:", req.body);
        const id = req.params.id;
        const { nome, email, altura, peso } = req.body;
        client.query(
            "UPDATE Usuarios SET nome=$1, email=$2, altura=$3, peso=$4 WHERE id =$5 ",
            [nome, email, altura, peso, id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ "identificador": id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});





app.listen(config.port, () =>//escutar a porta ./config(que e a porta do env) // o metodo listen deve o ultimo da api
    console.log("Servidor funcionando na porta " + config.port)//test
);

module.exports = app;