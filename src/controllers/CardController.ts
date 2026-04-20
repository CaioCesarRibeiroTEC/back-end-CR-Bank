import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class CardController {
  async gerarCartao(request: Request, response: Response) {
    try {
      const { conta_id, nome_titular } = request.body;

      // Verifica se já existe um cartão para esta conta
      const cartaoExistente = await prisma.card.findFirst({ where: { conta_id } });
      if (cartaoExistente) return response.status(200).json(cartaoExistente);

      // Gerador de número "fake" mas realista (16 dígitos)
      const num = () => Math.floor(1000 + Math.random() * 9000);
      const numeroGerado = `${num()} ${num()} ${num()} ${num()}`;
      const cvvGerado = Math.floor(100 + Math.random() * 899).toString();
      
      const dataAtual = new Date();
      const validade = `${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}/${(dataAtual.getFullYear() + 5).toString().substring(2)}`;

      const novoCartao = await prisma.card.create({
        data: {
          conta_id,
          nome_titular: nome_titular.toUpperCase(),
          numero: numeroGerado,
          cvv: cvvGerado,
          validade
        }
      });

      return response.status(201).json(novoCartao);
    } catch (error) {
      return response.status(500).json({ erro: 'Erro ao gerar cartão virtual.' });
    }
  }

  async buscarCartao(request: Request, response: Response) {
    const cartao = await prisma.card.findFirst({ where: { conta_id: request.params.conta_id } });
    return response.status(200).json(cartao);
  }
}