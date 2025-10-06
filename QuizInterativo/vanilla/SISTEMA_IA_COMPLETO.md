# 🎯 Sistema de Análise com IA - PROJETE 2025

## ✅ Implementação Completa!

O sistema está funcionando perfeitamente! A IA Random Forest está carregada e pronta para processar as respostas.

## 📊 Informações do Modelo

- **Arquivo**: `random_forest_top10_model.onnx`
- **Localização**: `C:\Users\Alunos\Downloads\ClubedeIA\QuizInterativo\vanilla\`
- **Status**: ✅ Carregado com sucesso!
- **Entrada**: `float_input` (array com 10 valores)
- **Saídas**: 
  - `output_label` - Classe predita
  - `output_probability` - Probabilidades de cada classe

## 🚀 Como Usar o Sistema

### 1. Iniciar os Servidores

**Terminal 1 - Backend (já está rodando!):**
```bash
cd C:\Users\Alunos\Downloads\ClubedeIA\QuizInterativo\vanilla
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 2. Fluxo Completo

1. **Acesse o quiz**: `http://localhost:5174`
2. **Responda as 10 perguntas**
3. **Finalize o quiz** - As respostas são salvas automaticamente em `RespostasTeste.csv`
4. **Clique em "🤖 Ver Análise da IA"**
5. **Nova aba abre** com a página `resultados-ia.html`
6. **Veja os resultados**: Predições da IA para cada resposta no CSV

## 📁 Estrutura do Sistema

```
QuizInterativo/vanilla/
├── server.js (modificado)
│   ├── Carrega o modelo ONNX
│   ├── Endpoint: /salvar-respostas
│   └── Endpoint: /processar-csv (NOVO!)
│
├── src/
│   └── main.js (modificado)
│       └── Botão "Ver Análise da IA"
│
├── resultados-ia.html (NOVO!)
│   └── Página de resultados da IA
│
├── RespostasTeste.csv
│   └── Arquivo com todas as respostas
│
└── random_forest_top10_model.onnx
    └── Modelo de IA Random Forest
```

## 🔄 Fluxo de Dados

```
1. Quiz → Respostas → RespostasTeste.csv
                ↓
2. CSV → Servidor → Modelo ONNX
                ↓
3. Predições → JSON → resultados-ia.html
                ↓
4. Visualização com gráficos e estatísticas
```

## 📊 Formato do CSV

```csv
Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10
2,4,5,3,5,4,3,5,4,5
1,3,5,4,4,5,5,5,5,5
4,5,2,3,5,4,5,3,4,5
```

Cada linha representa uma resposta completa do quiz.

## 🤖 O que a IA Faz

A IA processa cada linha do CSV e retorna:

1. **Classe Predita** - Qual categoria/perfil foi identificado
2. **Confiança** - Porcentagem de certeza da predição
3. **Probabilidades** - Distribuição de probabilidade para todas as classes
4. **Visualização** - Gráficos de barras com as probabilidades

## 🎨 Tela de Resultados da IA

A página `resultados-ia.html` mostra:

- **Estatísticas Gerais**:
  - Total de respostas processadas
  - Número de predições bem-sucedidas

- **Para Cada Resposta**:
  - Número da linha no CSV
  - Todas as 10 respostas (Q1 a Q10)
  - Classe predita com badge colorido
  - Confiança da predição
  - Gráfico de barras com todas as probabilidades

## 📝 Exemplo de Saída

```
Resposta #1
┌──────────────────────────────┐
│ Q1: 2 | Q2: 4 | Q3: 5 | ...  │
└──────────────────────────────┘

🎯 Predição: Classe 2
Confiança: 78.45%

Probabilidades por Classe:
Classe 0: ▓▓░░░░░░░░ 12.34%
Classe 1: ▓▓░░░░░░░░ 9.21%
Classe 2: ▓▓▓▓▓▓▓▓░░ 78.45%
```

## 🔧 Endpoints da API

### POST /salvar-respostas
Salva uma nova resposta no CSV.

**Body:**
```json
{
  "answers": [2, 4, 5, 3, 5, 4, 3, 5, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Respostas salvas com sucesso!",
  "path": "C:\\...\\RespostasTeste.csv"
}
```

### GET /processar-csv
Processa todo o CSV com a IA e retorna predições.

**Response:**
```json
{
  "success": true,
  "totalLinhas": 3,
  "processadas": 3,
  "resultados": [
    {
      "linha": 1,
      "respostas": [2, 4, 5, 3, 5, 4, 3, 5, 4, 5],
      "predicao": 2,
      "confianca": "78.45",
      "probabilidades": [
        { "classe": 0, "probabilidade": "12.34" },
        { "classe": 1, "probabilidade": "9.21" },
        { "classe": 2, "probabilidade": "78.45" }
      ]
    }
  ]
}
```

## 🎯 Funcionalidades

✅ **Salvamento Automático**: Respostas salvas no CSV ao finalizar
✅ **Processamento em Lote**: Todas as respostas são processadas de uma vez
✅ **Visualização Rica**: Gráficos e estatísticas detalhadas
✅ **Tempo Real**: Resultados aparecem instantaneamente
✅ **Responsivo**: Funciona em desktop e mobile
✅ **Error Handling**: Tratamento de erros robusto

## 🐛 Troubleshooting

### Erro: "Arquivo CSV não encontrado"
- Complete o quiz primeiro para gerar o arquivo
- Verifique se `RespostasTeste.csv` existe na pasta do projeto

### Erro: "Modelo de IA não está carregado"
- Reinicie o servidor (`node server.js`)
- Verifique se o arquivo `.onnx` está no local correto
- Veja os logs do servidor para mensagens de erro

### Página de resultados em branco
- Abra o Console do navegador (F12) para ver erros
- Verifique se o servidor está rodando
- Confirme que a URL está correta: `http://localhost:3000/processar-csv`

### Predições estranhas
- Verifique se o CSV tem 10 colunas
- Confirme que os valores são números de 1 a 5
- Veja os logs do servidor para erros de processamento

## 📈 Próximos Passos Possíveis

- [ ] Adicionar nomes descritivos para as classes
- [ ] Criar gráficos interativos com Chart.js
- [ ] Exportar resultados da IA em PDF
- [ ] Adicionar histórico de predições
- [ ] Comparar resultados entre diferentes usuários
- [ ] Adicionar filtros e ordenação na tela de resultados

## ✅ Status Atual

- ✅ Servidor backend rodando na porta 3000
- ✅ Modelo ONNX carregado com sucesso
- ✅ CSV sendo gerado corretamente
- ✅ Endpoint de processamento funcionando
- ✅ Página de resultados criada
- ✅ Botão de acesso integrado no quiz
- ✅ Visualização completa e responsiva

**🎉 Sistema 100% funcional e pronto para uso!**

---

**Para testar agora:**
1. Abra `http://localhost:5174`
2. Complete o quiz
3. Clique em "🤖 Ver Análise da IA"
4. Veja as predições em ação!
