// src/controllers/UsuarioController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Função auxiliar para gerar número de conta
function gerarNumeroConta() {
  const numero = Math.floor(100000 + Math.random() * 900000);
  const digito = Math.floor(Math.random() * 10);
  return `${numero}-${digito}`;
}

export class UsuarioController {
  
  // Lógica de Cadastro
  async cadastrar(request: Request, response: Response) {
    try {
      const { nome, email, senha, cpf } = request.body; 
      
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      const numeroContaGerado = gerarNumeroConta();

      const novoUsuario = await prisma.user.create({
        data: {
          nome, email, cpf, senha_hash: senhaCriptografada,
          accounts: {
            create: {
              agencia: "0001", numero_conta: numeroContaGerado, saldo: 500,
              transacoes_recebidas: { create: { tipo: 'DEPOSITO', valor: 500 } }
            }
          }
        },
        include: { accounts: true }
      });

      const token = jwt.sign({ id: novoUsuario.id, email: novoUsuario.email }, process.env.JWT_SECRET || 'chave_super_secreta', { expiresIn: '1d' });
      const { senha_hash: _, ...usuarioSemSenha } = novoUsuario;

      return response.status(201).json({ mensagem: 'Usuário criado com sucesso!', token, usuario: usuarioSemSenha });
    } catch (error) {
      return response.status(400).json({ erro: 'Erro ao cadastrar. Verifique se o E-mail ou CPF já existem.' });
    }
  }

  // Lógica de Login
  async login(request: Request, response: Response) {
    try {
      const { email, senha } = request.body;

      const usuario = await prisma.user.findUnique({ where: { email }, include: { accounts: true } });
      if (!usuario) return response.status(401).json({ erro: 'E-mail ou senha incorretos.' });

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaValida) return response.status(401).json({ erro: 'E-mail ou senha incorretos.' });

      const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET || 'chave_super_secreta', { expiresIn: '1d' });
      const { senha_hash: _, ...usuarioSemSenha } = usuario;

      return response.status(200).json({ mensagem: 'Login aprovado!', token, usuario: usuarioSemSenha });
    } catch (error) {
      return response.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }


  // Novo método para Atualizar o Perfil
  async atualizar(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { nome, email, avatar } = request.body;

      // Atualiza os dados do usuário no banco
      const usuarioAtualizado = await prisma.user.update({
        where: { id: String(id) },
        data: { nome, email, avatar },
        include: { accounts: true }
      });

      // Remove a senha antes de devolver para o frontend
      const { senha_hash: _, ...usuarioSemSenha } = usuarioAtualizado;

      return response.status(200).json({
        mensagem: 'Perfil atualizado com sucesso!',
        usuario: usuarioSemSenha
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ erro: 'Erro ao atualizar o perfil. Verifique se o e-mail já está em uso.' });
    }
  }

}