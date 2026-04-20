// src/server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { routes } from './routes'; 
import { BotController } from './controllers/BotController';

const app = express();

// Configurações básicas
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3333;;
const server = http.createServer(app);


// Exportamos o 'io' para que possa ser usado dentro dos Controllers (como no TransacaoController)
export const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});

// motor da "IA" Caseira
const botController = new BotController();


app.use(routes);

// ==========================================
// 4. CHAT AO VIVO E NOTIFICAÇÕES (SOCKET.IO)
// ==========================================

io.on('connection', (socket) => {
  console.log(`🔌 Novo dispositivo conectado! ID: ${socket.id}`);

  // O utilizador entra numa "sala" privada com o ID da própria conta para receber avisos de saldo
  socket.on('registrar_conta', (conta_id) => {
    socket.join(conta_id);
    console.log(`Conta ${conta_id} registada para receber notificações em tempo real.`);
  });

  // Lógica do Chatbot com o nosso Motor de Intenções
  socket.on('enviar_mensagem', (dadosDaMensagem) => {
    
    // 1. O servidor ecoa a mensagem para o utilizador que a enviou
    socket.emit('nova_mensagem', {
      autor_id: socket.id,
      texto: dadosDaMensagem.texto,
      horario: new Date().toISOString()
    });

    // 2. O Motor do Bot processa o texto e escolhe a melhor resposta
    const respostaDoBot = botController.processarMensagem(dadosDaMensagem.texto);

    // 3. Simula um pequeno atraso para parecer uma interação humana
    setTimeout(() => {
      socket.emit('nova_mensagem', {
        autor_id: 'bot_crbank',
        texto: respostaDoBot,
        horario: new Date().toISOString()
      });
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Dispositivo desconectado: ${socket.id}`);
  });
});

// Inicialização do Servidor
server.listen(PORT, () => {
  console.log(`Servidor CR Bank rodando com arquitetura limpa na porta ${PORT} 🚀`);
});