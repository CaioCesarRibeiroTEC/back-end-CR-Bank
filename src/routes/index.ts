// src/routes/index.ts
import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { PixController } from '../controllers/PixController';
import { TransacaoController } from '../controllers/TransacaoController';
import { CardController } from '../controllers/CardController';


const routes = Router();

// Instanciamos os nossos controllers
const usuarioController = new UsuarioController();
const pixController = new PixController();
const transacaoController = new TransacaoController();

// =======================
// ROTAS DE USUÁRIO
// =======================
routes.post('/usuarios', usuarioController.cadastrar);
routes.post('/login', usuarioController.login);
routes.put('/usuarios/:id', usuarioController.atualizar);

// =======================
// ROTAS DE CHAVES PIX
// =======================
routes.post('/chaves', pixController.registrarChave);
routes.get('/contas/:conta_id/chaves', pixController.listarChaves);

// =======================
// ROTAS DE TRANSAÇÕES
// =======================
routes.post('/transacoes', transacaoController.transferir);
routes.post('/transacoes/deposito', transacaoController.depositar);
routes.get('/contas/:numero_conta/extrato', transacaoController.extrato);

// =======================
// ROTAS cartão
// =======================
const cardController = new CardController();
routes.post('/cartoes', cardController.gerarCartao);
routes.get('/cartoes/:conta_id', cardController.buscarCartao);

export { routes };