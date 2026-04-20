// src/controllers/TransacaoController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { io } from '../server'; // <-- Importamos o 'io' para mandar as notificações!

export class TransacaoController {
  
  // 1. Lógica do PIX (Transferência Inteligente)
  async transferir(request: Request, response: Response) {
    try {
      const { conta_origem_id, chave_destino, valor } = request.body;

      if (valor <= 0) return response.status(400).json({ erro: 'O valor deve ser maior que zero.' });

      const contaOrigem = await prisma.account.findUnique({ where: { id: conta_origem_id } });
      if (!contaOrigem) return response.status(404).json({ erro: 'Conta de origem não encontrada.' });
      if (Number(contaOrigem.saldo) < valor) return response.status(400).json({ erro: 'Saldo insuficiente.' });

      const chaveEncontrada = await prisma.chavePix.findUnique({
        where: { chave: chave_destino }, include: { conta: true }
      });

      let contaDestinoId = null;

      if (chaveEncontrada) {
        contaDestinoId = chaveEncontrada.conta.id;
      } else {
        const usuarioDestino = await prisma.user.findUnique({
          where: { email: chave_destino }, include: { accounts: true }
        });
        if (usuarioDestino && usuarioDestino.accounts.length > 0) {
          contaDestinoId = usuarioDestino.accounts[0].id;
        }
      }

      if (!contaDestinoId) return response.status(404).json({ erro: 'Chave Pix não encontrada no sistema.' });
      if (contaOrigem.id === contaDestinoId) return response.status(400).json({ erro: 'Não pode transferir para si mesmo usando esta chave.' });

      const [contaOrigemAtualizada, contaDestinoAtualizada, comprovante] = await prisma.$transaction([
        prisma.account.update({ where: { id: contaOrigem.id }, data: { saldo: { decrement: valor } } }),
        prisma.account.update({ where: { id: contaDestinoId }, data: { saldo: { increment: valor } } }),
        prisma.transaction.create({
          data: { conta_origem_id: contaOrigem.id, conta_destino_id: contaDestinoId, tipo: 'TRANSFERENCIA', valor: valor }
        })
      ]);

      // Dispara a notificação EM TEMPO REAL
      io.to(contaDestinoId).emit('notificacao_pix', {
        titulo: 'Transferência Recebida! 🎉',
        mensagem: `Você acabou de receber um Pix no valor de R$ ${Number(valor).toFixed(2).replace('.', ',')}.`
      });

      return response.status(200).json({ mensagem: 'Pix realizado com sucesso!', transacao_id: comprovante.id, seu_novo_saldo: contaOrigemAtualizada.saldo });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ erro: 'Erro interno ao processar a transferência.' });
    }
  }

  // 2. Lógica do DEPÓSITO
  async depositar(request: Request, response: Response) {
    try {
      const { conta_destino_id, valor } = request.body;

      if (valor <= 0) return response.status(400).json({ erro: 'O valor do depósito deve ser maior que zero.' });

      const conta = await prisma.account.findUnique({ where: { id: conta_destino_id } });
      if (!conta) return response.status(404).json({ erro: 'Conta bancária não encontrada.' });

      const [comprovante, contaAtualizada] = await prisma.$transaction([
        prisma.transaction.create({ data: { conta_destino_id: conta.id, tipo: 'DEPOSITO', valor: valor } }),
        prisma.account.update({ where: { id: conta.id }, data: { saldo: { increment: valor } } })
      ]);

      io.to(conta_destino_id).emit('notificacao_pix', {
        titulo: 'Depósito Recebido! 📥',
        mensagem: `O seu aporte de R$ ${Number(valor).toFixed(2).replace('.', ',')} foi creditado.`
      });
      
      return response.status(200).json({ mensagem: 'Depósito realizado com sucesso!', transacao_id: comprovante.id, novo_saldo: contaAtualizada.saldo });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ erro: 'Erro interno ao processar o depósito.' });
    }
  }

  // 3. Lógica do EXTRATO
  async extrato(request: Request, response: Response) {
    try {
      const { numero_conta } = request.params;

      const conta = await prisma.account.findUnique({ where: { numero_conta: String(numero_conta) } });
      if (!conta) return response.status(404).json({ erro: 'Conta bancária não encontrada.' });

      const transacoes = await prisma.transaction.findMany({
        where: { OR: [{ conta_origem_id: conta.id }, { conta_destino_id: conta.id }] },
        orderBy: { criado_em: 'desc' }
      });

      const historicoDetalhado = await Promise.all(transacoes.map(async (t) => {
        let contraparteId = t.conta_origem_id === conta.id ? t.conta_destino_id : t.conta_origem_id;
        let detalhesContraparte = null;

        if (contraparteId) {
          const contaContraparte = await prisma.account.findUnique({ where: { id: contraparteId }, include: { user: true } });
          if (contaContraparte) {
            detalhesContraparte = { nome: contaContraparte.user.nome, cpf: contaContraparte.user.cpf, numero_conta: contaContraparte.numero_conta };
          }
        }
        return { ...t, contraparte: detalhesContraparte };
      }));

      return response.status(200).json({ numero_conta: conta.numero_conta, saldo_atual: conta.saldo, historico: historicoDetalhado });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ erro: 'Erro interno ao buscar o extrato.' });
    }
  }
}