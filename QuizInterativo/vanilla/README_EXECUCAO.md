# Quiz Interativo - PROJETE 2025

## 🚀 Como Executar o Projeto

### Opção 1: Executar tudo junto (Recomendado)
```bash
npm start
```
Este comando irá:
- Iniciar o servidor Vite (frontend) na porta 5174
- Iniciar o servidor Node.js (backend) na porta 3000

### Opção 2: Executar separadamente

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

## 📝 Como Funciona

1. Acesse o quiz em `http://localhost:5174`
2. Responda todas as 10 perguntas
3. Ao finalizar o quiz, clique em "💾 Salvar Respostas (CSV)"
4. As respostas serão salvas automaticamente no arquivo **RespostasTeste.csv** no diretório do projeto

## 📊 Formato do Arquivo CSV

O arquivo `RespostasTeste.csv` será criado com o seguinte formato:

```csv
Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10
4,5,2,3,5,4,5,3,4,5
3,4,1,5,4,3,4,5,5,4
```

- **Primeira linha**: Cabeçalhos (Q1, Q2, Q3...)
- **Linhas seguintes**: Respostas de cada pessoa (uma linha por resposta completa)

## ⚠️ Importante

- O servidor backend **DEVE** estar rodando na porta 3000 para que o salvamento funcione
- O arquivo será criado automaticamente na primeira execução
- Novas respostas serão **adicionadas** ao arquivo existente (não sobrescreve)

## 🛠️ Tecnologias

- **Frontend**: Vite + Vanilla JavaScript
- **Backend**: Node.js + Express
- **Armazenamento**: CSV (RespostasTeste.csv)
