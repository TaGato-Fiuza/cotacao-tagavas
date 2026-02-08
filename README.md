🛒 Cotação Tagavas

O Cotação Tagavas é uma aplicação web moderna desenvolvida para simplificar e automatizar o processo de cotação de preços entre mercados e fornecedores.

O sistema elimina a necessidade de planilhas complexas enviadas por e-mail. O comprador cria uma lista, compartilha um link/código com os fornecedores e o sistema compara os preços automaticamente em tempo real, destacando os vencedores e facilitando o pedido via WhatsApp.

🚀 Funcionalidades

👑 Para o Comprador (Administrador)

Gestão de Cotações: Criação, edição, clonagem e exclusão de listas de compras.

Importação Inteligente:

Importação de itens via planilha Excel (.xlsx).

Leitura de código de barras usando a câmera do dispositivo.

Busca automática de nomes de produtos via API (Cosmos/OpenFoodFacts).

Comparativo em Tempo Real:

Tabela dinâmica que destaca automaticamente o menor preço.

Detecção visual de Empates.

Cálculo de totais por fornecedor (considerando apenas os itens vencidos).

Gestão de Pedidos:

Filtros avançados (Ver apenas vencedores ou todos os itens).

Modal de Pedido: Seleção manual de itens antes de enviar o pedido.

Geração automática de mensagem de pedido para o WhatsApp.

Exportação de relatório em texto (.txt).

Capacidade de invalidar/apagar preços incorretos de fornecedores.

🚚 Para o Fornecedor

Acesso Simplificado: Não requer cadastro complexo (Login via Código da Cotação + Senha simples).

Interface Mobile-First: Design otimizado para preenchimento rápido pelo celular.

Preenchimento Ágil: Foco total nos campos de preço.

Observações: Campo para adicionar notas ou condições especiais por item.

🛠️ Tecnologias Utilizadas

Frontend: React.js

Estilização: Tailwind CSS

Backend & Banco de Dados: Firebase (Authentication & Cloud Firestore)

Ícones: Lucide React

Utilitários:

xlsx: Para manipulação de planilhas Excel.

html5-qrcode: Para leitura de códigos de barras.

📦 Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente:

1. Pré-requisitos

Certifique-se de ter o Node.js instalado em sua máquina.

2. Clonar o Repositório

git clone [https://github.com/seu-usuario/cotacao-tagavas.git](https://github.com/seu-usuario/cotacao-tagavas.git)
cd cotacao-tagavas


3. Instalar Dependências

npm install
# ou
yarn install


4. Configurar o Firebase

Crie um projeto no Firebase Console.

Habilite o Authentication (Login Anônimo).

Crie um banco de dados no Cloud Firestore.

No arquivo App.jsx (ou em um arquivo .env), substitua a variável firebaseConfig pelas credenciais do seu projeto:

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};


5. Regras de Segurança (Firestore)

Para garantir que o app funcione e seja seguro, configure as regras do Firestore para permitir acesso apenas a usuários autenticados (o app faz login anônimo automaticamente):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}


6. Rodar o Projeto

npm start


O aplicativo abrirá em http://localhost:3000.

📱 Como Usar

Login Admin: Acesse a área do dono (Credenciais configuradas no código: ADMIN_USER_HASH e ADMIN_PASS_HASH).

Criar Cotação: Adicione itens manualmente, por código de barras ou importando um Excel.

Compartilhar: Copie o código da cotação e envie para os fornecedores junto com o link do app.

Acompanhar: Veja na aba "Ver Resultados" os preços chegando em tempo real.

Finalizar: Use o botão de WhatsApp nos cards de totais para enviar o pedido final para cada fornecedor vencedor.

📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar e modificar.

Desenvolvido com 💙 para o Mercado Tagavas.
