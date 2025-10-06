import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import * as ort from 'onnxruntime-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Carrega o modelo ONNX
let session = null;
const modelPath = path.join(__dirname, 'random_forest_top10_model.onnx');

async function carregarModelo() {
  try {
    console.log('🤖 Carregando modelo de IA:', modelPath);
    
    // Opções para o modelo ONNX Runtime
    const sessionOptions = {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all',
      enableCpuMemArena: true,
      enableMemPattern: true,
      executionMode: 'sequential'
    };
    
    session = await ort.InferenceSession.create(modelPath, sessionOptions);
    console.log('✅ Modelo carregado com sucesso!');
    console.log('Entradas:', session.inputNames);
    console.log('Saídas:', session.outputNames);
    return true;
  } catch (error) {
    console.error('❌ Erro ao carregar modelo:', error.message);
    return false;
  }
}

// Carrega o modelo ao iniciar o servidor
carregarModelo();

// Endpoint para salvar as respostas
app.post('/salvar-respostas', (req, res) => {
  try {
    const { answers } = req.body;
    
    // Criar cabeçalho CSV
    const headers = answers.map((_, index) => `Q${index + 1}`);
    
    // Criar linha com as respostas
    const row = answers.join(',');
    
    // Caminho do arquivo
    const filePath = path.join(__dirname, 'RespostasTeste.csv');
    
    // Verificar se o arquivo já existe
    let csvContent = '';
    
    if (fs.existsSync(filePath)) {
      // Arquivo existe, apenas adicionar nova linha
      csvContent = row + '\n';
      fs.appendFileSync(filePath, csvContent, 'utf8');
    } else {
      // Arquivo não existe, criar com cabeçalho
      csvContent = headers.join(',') + '\n' + row + '\n';
      fs.writeFileSync(filePath, csvContent, 'utf8');
    }
    
    res.json({ 
      success: true, 
      message: 'Respostas salvas com sucesso!',
      path: filePath
    });
  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao salvar respostas',
      error: error.message
    });
  }
});

// Endpoint para processar o CSV e fazer predições
app.get('/processar-csv', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'RespostasTeste.csv');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo CSV não encontrado. Complete o quiz primeiro.'
      });
    }
    
    // Verificar se o modelo está carregado
    if (!session) {
      return res.status(500).json({
        success: false,
        message: 'Modelo de IA não está carregado.'
      });
    }
    
    // Ler o arquivo CSV
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Ignorar o cabeçalho
    const headers = lines[0].split(',');
    const dataLines = lines.slice(1);
    
    console.log(`📊 Processando ${dataLines.length} respostas...`);
    
    // Processar cada linha e fazer predição
    const resultados = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const values = dataLines[i].split(',').map(v => parseFloat(v.trim()));
      
      if (values.length !== 10) {
        console.warn(`⚠️ Linha ${i + 1} tem ${values.length} valores ao invés de 10. Pulando...`);
        continue;
      }
      
      try {
        // O modelo espera 32 features, mas temos apenas 10 do quiz
        // Vamos preencher as outras 22 com zeros (ou valores padrão)
        const paddedValues = new Array(32).fill(0);
        
        // Copiar as 10 respostas do quiz para as primeiras 10 posições
        for (let j = 0; j < values.length && j < 10; j++) {
          paddedValues[j] = values[j];
        }
        
        // Preparar entrada para o modelo Random Forest com 32 features
        const inputData = new Float32Array(paddedValues);
        const dims = [1, 32]; // 32 features
        const inputTensor = new ort.Tensor('float32', inputData, dims);
        
        // Criar feeds com o nome correto da entrada
        const feeds = {};
        feeds[session.inputNames[0]] = inputTensor; // 'float_input'
        
        console.log(`📊 Processando linha ${i + 1}...`);
        console.log('Entrada (10 primeiras):', values);
        console.log('Entrada completa (32 features):', paddedValues);
        
        // Executar predição usando o modelo Random Forest do arquivo .onnx
        const output = await session.run(feeds);
        
        console.log('Saídas do modelo:', Object.keys(output));
        
        // Pegar a saída 'output_label' que contém a classe predita (31-34)
        const outputLabel = output['output_label'];
        const outputProb = output['output_probability'];
        
        console.log('Tipo de outputLabel:', outputLabel.type);
        console.log('Dados do outputLabel:', outputLabel.data);
        console.log('Tipo de outputProb:', outputProb ? outputProb.type : 'N/A');
        
        // Extrair o valor da classe predita (deve ser 31, 32, 33 ou 34)
        let classePredita = Array.from(outputLabel.data)[0];
        
        // Se outputLabel for do tipo int64, pode retornar um BigInt
        if (typeof classePredita === 'bigint') {
          classePredita = Number(classePredita);
        }
        
        console.log('Classe predita:', classePredita, typeof classePredita);
        
        // Extrair as probabilidades (para cada uma das 4 classes)
        let probabilidades = [];
        if (outputProb) {
          probabilidades = Array.from(outputProb.data);
          console.log('Probabilidades brutas:', probabilidades);
        } else {
          // Se não tem probabilidades, criar valores uniformes
          probabilidades = [0.25, 0.25, 0.25, 0.25];
        }
        
        // Mapear as classes (31, 32, 33, 34) para nomes descritivos
        const nomesClasses = {
          31: 'Desenvolvimento de Sistemas',
          32: 'Administração',
          33: 'Mecatrônica',
          34: 'Informática para Internet'
        };
        
        // Se a classe não está no range 31-34, ajustar (pode ser índice 0-3)
        if (classePredita < 31) {
          classePredita = classePredita + 31;
        }
        
        const resultado = {
          linha: i + 1,
          respostas: values,
          predicao: classePredita, // Número entre 31 e 34
          nomeCurso: nomesClasses[classePredita] || `Curso ${classePredita}`,
          probabilidades: [31, 32, 33, 34].map((curso, idx) => ({
            curso: curso,
            nome: nomesClasses[curso],
            probabilidade: (probabilidades[idx] * 100).toFixed(2)
          })),
          confianca: (Math.max(...probabilidades) * 100).toFixed(2)
        };
        
        resultados.push(resultado);
        console.log(`✅ Linha ${i + 1} processada: Predição = Curso ${classePredita} (${resultado.confianca}% confiança)`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar linha ${i + 1}:`, error.message);
        resultados.push({
          linha: i + 1,
          respostas: values,
          erro: error.message
        });
      }
    }
    
    res.json({
      success: true,
      totalLinhas: dataLines.length,
      processadas: resultados.length,
      resultados: resultados
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar CSV',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Arquivo será salvo em: ${path.join(__dirname, 'RespostasTeste.csv')}`);
});
