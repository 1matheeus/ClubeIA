# 🤖 Guia de Integração do Modelo ONNX com o Quiz

## 📋 Resumo da Implementação

A estrutura para integrar seu modelo de IA (.onnx) já está pronta! Agora você precisa apenas colocar seu arquivo de modelo no local correto.

## 📁 Estrutura de Arquivos Criada

```
QuizInterativo/vanilla/
├── src/
│   ├── main.js (modificado - integração com IA)
│   ├── modeloIA.js (NOVO - lógica da IA)
│   └── style.css (modificado - estilos da predição)
├── public/
│   └── models/
│       └── [COLOQUE SEU modelo.onnx AQUI]
└── package.json (onnxruntime-web instalado)
```

## 🚀 Como Adicionar Seu Modelo

### Passo 1: Copiar o arquivo .onnx

Copie seu arquivo `.onnx` do Google Colab para:
```
C:\Users\Alunos\Downloads\ClubedeIA\QuizInterativo\vanilla\public\models\modelo.onnx
```

**Importante**: Renomeie seu arquivo para `modelo.onnx` ou ajuste o caminho no arquivo `modeloIA.js`.

### Passo 2: Verificar as Entradas/Saídas do Modelo

Seu modelo foi treinado com:
- **Entradas**: 10 valores (as respostas do quiz)
- **Saídas**: ? (você precisa verificar)

Para saber os nomes das entradas/saídas do seu modelo, execute o quiz e abra o Console (F12). Você verá:
```
Entradas do modelo: ["input_name"]
Saídas do modelo: ["output_name"]
```

### Passo 3: Ajustar o código (se necessário)

Abra `src/modeloIA.js` e ajuste as seguintes seções:

#### A) Se o nome da entrada for diferente de "input"
Na linha ~49, o código usa automaticamente o nome correto:
```javascript
feeds[this.session.inputNames[0]] = inputTensor;
```

#### B) Ajustar a interpretação dos resultados

Na função `interpretarResultado()` (linha ~91), ajuste conforme seu modelo:

**Se seu modelo faz CLASSIFICAÇÃO** (múltiplas categorias):
```javascript
const classes = [
  'Nome da Categoria 1',
  'Nome da Categoria 2',
  'Nome da Categoria 3',
  // ... adicione suas categorias aqui
];
```

**Se seu modelo faz REGRESSÃO** (valor numérico):
```javascript
// A função já está configurada para regressão
// Ajuste apenas a função interpretarValor() conforme necessário
```

## 🎯 Como Funciona

1. **Ao abrir o site**: O modelo é carregado automaticamente
2. **Durante o quiz**: O usuário responde as 10 perguntas
3. **Ao finalizar**: 
   - As respostas são salvas no CSV
   - A IA faz uma predição baseada nas respostas
   - O resultado aparece na tela com uma seção especial "🤖 Análise da IA"

## 🔍 Formato das Entradas para o Modelo

As respostas são enviadas como um array de 10 números:
```javascript
[Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10]
// Exemplo: [2, 4, 5, 3, 5, 4, 3, 5, 4, 5]
```

Cada valor é um número de 1 a 5 (ou 1 a 4 para Q1).

## 📊 Tipos de Saída Suportados

### Classificação (múltiplas classes)
```javascript
// Saída: [0.1, 0.7, 0.15, 0.05]
// Resultado: "Classe 2" com 70% de confiança
```

### Regressão (valor único)
```javascript
// Saída: [0.85]
// Resultado: "Alto potencial para área de tecnologia"
```

## 🎨 Personalização da Apresentação

Os resultados da IA aparecem em uma caixa destacada:
- **Nome da categoria** (para classificação)
- **Porcentagem de confiança**
- **Todas as probabilidades** (gráfico de barras)
- **Interpretação** (para regressão)

Estilos podem ser ajustados em `src/style.css` na seção `.ia-prediction`.

## 🐛 Troubleshooting

### Erro: "Cannot find module 'modelo.onnx'"
- Verifique se o arquivo está em `public/models/modelo.onnx`
- Certifique-se que o servidor está rodando

### Erro: "Input names don't match"
- Abra o Console (F12) e veja os nomes das entradas
- O código já usa automaticamente o nome correto

### Modelo não carrega
- Verifique o formato do arquivo (.onnx)
- Certifique-se que foi exportado corretamente do Google Colab
- Veja o Console para mensagens de erro

## 📝 Exemplo de Código do Google Colab para Exportar

Se você ainda não exportou o modelo, use este código no Colab:

```python
import torch
import torch.onnx

# Supondo que seu modelo se chama 'model'
dummy_input = torch.randn(1, 10)  # 1 amostra, 10 features

torch.onnx.export(
    model,
    dummy_input,
    "modelo.onnx",
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input': {0: 'batch_size'},
        'output': {0: 'batch_size'}
    }
)

print("✅ Modelo exportado para modelo.onnx")
```

Depois faça o download do arquivo e coloque na pasta `public/models/`.

## ✅ Checklist Final

- [ ] Arquivo .onnx copiado para `public/models/`
- [ ] Nome do arquivo é `modelo.onnx` (ou ajustado no código)
- [ ] Servidor backend rodando (`node server.js`)
- [ ] Servidor frontend rodando (`npm run dev`)
- [ ] Console do navegador aberto para ver logs
- [ ] Teste completo do quiz até o final

## 🎉 Resultado Final

Quando tudo estiver funcionando, ao completar o quiz você verá:
1. Pontuação tradicional
2. **🤖 Análise da IA** (nova seção)
3. Suas respostas detalhadas
4. Opção de fazer novamente

---

**Precisa de ajuda?** Abra o Console do navegador (F12) e verifique as mensagens de erro!
