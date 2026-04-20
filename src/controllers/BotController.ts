// src/controllers/BotController.ts

export class BotController {
  // O "Banco de Conhecimento" do nosso Bot
  private intencoes = [
    {
      nome: 'saudacao',
      palavrasChave: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'ajuda', 'ola bot'],
      respostas: [
        'Olá! Sou o assistente virtual do CR Bank. Como posso ajudar hoje?',
        'Oi! Que bom ter você aqui no CR Bank. O que você precisa?',
        'Saudações! Sou o bot do CR Bank, pronto para ajudar com Pix, Cartão ou Depósito.'
      ]
    },
    {
      nome: 'pix',
      palavrasChave: ['pix', 'transferir', 'transferencia', 'mandar dinheiro', 'enviar', 'chave'],
      respostas: [
        'Para fazer um Pix, clique em "Área Pix" no menu principal. Você pode usar a opção de Transferência por chave ou Copia e Cola!',
        'O Pix do CR Bank é instantâneo! Acesse a aba "Área Pix" para registrar suas chaves e enviar dinheiro sem taxas.'
      ]
    },
    {
      nome: 'cartao',
      palavrasChave: ['cartao', 'credito', 'limite', 'fatura', 'virtual'],
      respostas: [
        'O nosso Cartão Virtual está no forno! Em breve você terá um cartão de crédito brilhando no seu Dashboard.',
        'Ainda estamos finalizando as impressões digitais dos cartões de crédito. Fique de olho na plataforma para novidades!'
      ]
    },
    {
      nome: 'deposito',
      palavrasChave: ['deposito', 'depositar', 'adicionar dinheiro', 'colocar saldo', 'guardar'],
      respostas: [
        'Precisa adicionar saldo? É só clicar em "Depositar" no menu, digitar o valor e o dinheiro cai na mesma hora!',
        'A aba "Depositar" foi feita para isso. Simule um depósito lá e veja seu saldo subir imediatamente.'
      ]
    },
    {
      nome: 'atendente',
      palavrasChave: ['humano', 'atendente', 'falar com pessoa', 'suporte real', 'pessoa'],
      respostas: [
        'Entendi. Vou transferir você para um de nossos especialistas humanos. Por favor, aguarde um instante...',
        'Um momento, estou chamando um atendente humano para assumir nossa conversa.'
      ]
    }
  ];

  // Ferramenta que tira acentos (ex: "cartão" vira "cartao")
  private limparTexto(texto: string): string {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .toLowerCase(); // Tudo minúsculo
  }

  // O Motor Principal de Inteligência
  public processarMensagem(mensagemUsuario: string): string {
    const textoLimpo = this.limparTexto(mensagemUsuario);
    
    let melhorIntencao = null;
    let maiorPontuacao = 0;

    // O Bot analisa cada "Intenção" para ver qual combina mais
    for (const intencao of this.intencoes) {
      let pontuacao = 0;
      
      for (const palavra of intencao.palavrasChave) {
        // Se a frase do usuário contiver a palavra-chave, ele ganha pontos
        if (textoLimpo.includes(this.limparTexto(palavra))) {
          pontuacao++;
        }
      }

      // Salva a intenção com mais "match" (pontuação mais alta)
      if (pontuacao > maiorPontuacao) {
        maiorPontuacao = pontuacao;
        melhorIntencao = intencao;
      }
    }

    // Se ele achou uma intenção correspondente
    if (melhorIntencao) {
      // Pega uma resposta aleatória daquela intenção para não ser repetitivo
      const respostasPossiveis = melhorIntencao.respostas;
      const indiceAleatorio = Math.floor(Math.random() * respostasPossiveis.length);
      return `🤖 ${respostasPossiveis[indiceAleatorio]}`;
    }

    // Se a pontuação for 0 (Ele não entendeu nada)
    return '🤖 Desculpe, não entendi sua dúvida. Você pode tentar falar de outra forma? Sou treinado para falar sobre Pix, Depósitos, Cartões e Saldo.';
  }
}