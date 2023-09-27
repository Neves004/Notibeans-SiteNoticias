//Importação de bibliotecas
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

//Referenciação da Porta (3001)
const app = express();
const port = 3001;

// Configurar conexão com o banco de dados MySQL - Para cadastro e armazenamento de usuários
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'usuariosNotibeans'
});

// Configuração para caso ocorra erros ou para que o banco rode sem problemas
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados: ' + err.message);
  } else {
    console.log('Conectado ao banco de dados MySQL');
  }
});

// Configurar middleware para análise de corpo JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar middleware para servir arquivos estáticos (CSS, imagens, etc.)
app.use(express.static('public'));


// Rota para a página de registro (HTML)
app.get('/registro', (req, res) => {
  res.sendFile(__dirname + '/registro.html');
});

// Rota para a página de inical (HTML)
app.get('/inicial', (req, res) => {
  res.sendFile(__dirname + '/inicial.html');
});


// Rota para a página de hoje (HTML)
app.get('/hoje', (req, res) => {
  res.sendFile(__dirname + '/hoje.html');
});

// Rota para a página de formulario (HTML)
app.get('/formulario', (req, res) => {
  res.sendFile(__dirname + '/formulario.html');
});

// Rota para a página de sobre (HTML)
app.get('/sobre', (req, res) => {
  res.sendFile(__dirname + '/sobre.html');
});


// Rota para processar o registro do usuário
app.post('/registro', async (req, res) => {
  const { username, senha } = req.body;

  // Hash da senha antes de armazená-la no banco de dados
  const hashedSenha = await bcrypt.hash(senha, 10);

  //Referenciamento da Tabela Usuarios do Banco de Dados + mensagem de erro e mensagem de confirmação 
  const sql = 'INSERT INTO usuarios (username, senha) VALUES (?, ?)';
  db.query(sql, [username, hashedSenha], (err, result) => {
    if (err) {
      console.error('Erro ao registrar usuário: ' + err.message);
      res.status(500).send('Erro ao registrar usuário.');
    } else {
      console.log('Usuário registrado com sucesso');
      res.redirect('/login');
    }
  });
});

// Rota para a página de login (HTML)
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Rota para processar o login do usuário
app.post('/login', (req, res) => {
  const { username, senha } = req.body;

   //Referenciamento da Tabela do Banco de Dados + mensagem de erro caso o usuário não seja encontrado,
   // caso tenha erro na busca do usuáriom ou senha incorreta. E caso dê certo vá para a página inicial do site
  const sql = 'SELECT * FROM usuarios WHERE username = ?';
  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.error('Erro ao buscar usuário: ' + err.message);
      res.status(500).send('Erro ao buscar usuário.');
    } else {
      if (result.length === 0) {
        res.status(401).send('Usuário não encontrado.');
      } else {
        const match = await bcrypt.compare(senha, result[0].senha);
        if (match) {
         
          res.sendFile(__dirname + '/inicial.html');
        } else {
          res.status(401).send('Senha incorreta.');
        }
      }
    }
  });
});

//
// REFERENCIAMENTO DO FORMULARIO
//

// Configurar conexão com o banco de dados MySQL - Para envio dos dados do Formulario
const db2 = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'sugestoesNotibeans'
});

// Configuração para caso ocorra erros ou para que o banco rode sem problemas
db2.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL: ' + err);
    throw err;
  }
  console.log('Conectado ao MySQL');
});

// Rota para a página de formulario (HTML)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/formulario.html');
});

//Rota para enviar 
app.post('/enviar', (req, res) => {
  const { nome, tipo, noticia  } = req.body;
//Referenciamento da Tabela do Banco de Dados + mensagem de erro caso o usuário insira os dados incorretamente,
//E caso dê certo envie para o Banco
  const query = 'INSERT INTO formulario (nome, tipo, noticia ) VALUES (?, ?, ?)';
  db2.query(query, [nome, tipo, noticia ], (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados no MySQL: ' + err);
      return res.status(500).send('Erro ao inserir dados');
    }
    console.log('Dados inseridos com sucesso');
    res.redirect('/');
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});
