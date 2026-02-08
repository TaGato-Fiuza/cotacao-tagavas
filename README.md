# Sistema de Automação de Cotações e Compras (Varejo)

## 📌 Sobre o Projeto
Este projeto foi desenvolvido para solucionar um gargalo operacional crítico no **Mercado Tagavas**: a ineficiência no processo de compras e cotação de preços com múltiplos fornecedores. 

O objetivo foi transformar um processo manual (sujeito a erros e lento) em um fluxo automatizado e baseado em dados, garantindo a redução de custos operacionais (Opex) e maior agilidade na reposição de estoque.

## ⚙️ Arquitetura da Solução
A solução opera como uma aplicação Full-Stack serverless, integrando ferramentas do Google Workspace:

* **Front-end:** AppSheet (Interface mobile para coleta de dados em chão de loja).
* **Back-end/Automação:** Google Apps Script (JavaScript) para regras de negócio e disparos automáticos.
* **Banco de Dados:** Google Sheets (Estruturação relacional das tabelas de produtos e fornecedores).

## 🚀 Funcionalidades Principais
1.  **Coleta Padronizada:** Interface móvel para input de preços e produtos, eliminando erros de digitação.
2.  **Algoritmo de Comparação:** Script que analisa automaticamente as cotações inseridas e destaca o menor preço por item.
3.  **Histórico de Preços:** Armazenamento de dados para análise de inflação de produtos e negociação com fornecedores.

## 🛠️ Tecnologias Utilizadas
* Google Apps Script (JavaScript)
* Google AppSheet
* Lógica de Programação e Estrutura de Dados

## 💡 Impacto
A implementação do sistema permitiu a centralização das informações de compras, reduzindo o tempo gasto em cotações e permitindo uma negociação mais assertiva baseada no histórico de preços dos fornecedores.

---
*Projeto desenvolvido por Arthur Tagavas Fiuza - Estudante de Engenharia Elétrica (POLI-USP)*
