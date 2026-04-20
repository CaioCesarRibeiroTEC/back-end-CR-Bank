// src/controllers/PixController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class PixController {
  
  async registrarChave(request: Request, response: Response) {
    try {
      const { conta_id, chave, tipo } = request.body;
      
      const chaveExistente = await prisma.chavePix.findUnique({ where: { chave } });
      if (chaveExistente) {
        return response.status(400).json({ erro: 'Esta chave já está registrada em outra conta.' });
      }

      const novaChave = await prisma.chavePix.create({
        data: { conta_id, chave, tipo }
      });
      
      return response.status(201).json(novaChave);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ erro: 'Erro ao registrar chave.' });
    }
  }

  async listarChaves(request: Request, response: Response) {
    try {
      const chaves = await prisma.chavePix.findMany({
        where: { conta_id: String(request.params.conta_id)}
      });
      return response.status(200).json(chaves);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ erro: 'Erro ao buscar chaves.' });
    }
  }
}