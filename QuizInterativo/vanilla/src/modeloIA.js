import * as ort from 'onnxruntime-web';

class ModeloIA {
  constructor() {
    this.session = null;
    this.modelPath = '/models/modelo.onnx'; // Caminho para o seu modelo
    this.isLoaded = false;
  }

  // Carrega o modelo ONNX
  async carregarModelo(caminhoModelo = null) {
    try {
      const path = caminhoModelo || this.modelPath;
      console.log('🤖 Carregando modelo de IA...', path);
      
      this.session = await ort.InferenceSession.create(path);
      this.isLoaded = true;
      
      console.log('✅ Modelo carregado com sucesso!');
      console.log('Entradas do modelo:', this.session.inputNames);
      console.log('Saídas do modelo:', this.session.outputNames);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar modelo:', error);
      this.isLoaded = false;
      return false;
    }
  }

  // Prepara os dados de entrada para o modelo
  prepararEntrada(respostas) {
    // Assumindo que o modelo espera um array de 10 valores (float32)
    // Ajuste conforme necessário baseado no seu modelo
    
    // Converte para Float32Array
    const inputData = new Float32Array(respostas);
    
    // Cria tensor com shape [1, 10] (1 amostra, 10 features)
    const dims = [1, respostas.length];
    
    return inputData;
  }

  // Executa a predição
  async prever(respostas) {
    if (!this.isLoaded) {
      console.error('❌ Modelo não está carregado. Chame carregarModelo() primeiro.');
      return null;
    }

    try {
      console.log('🔮 Fazendo predição com:', respostas);
      
      // Prepara os dados de entrada
      const inputData = this.prepararEntrada(respostas);
      const dims = [1, respostas.length];
      
      // Cria o tensor de entrada
      // IMPORTANTE: Ajuste o nome 'input' para o nome correto da entrada do seu modelo
      const inputTensor = new ort.Tensor('float32', inputData, dims);
      
      // Cria o objeto de feeds com o nome correto da entrada
      // Você pode verificar o nome correto com: this.session.inputNames[0]
      const feeds = {};
      feeds[this.session.inputNames[0]] = inputTensor;
      
      // Executa a inferência
      const results = await this.session.run(feeds);
      
      // Pega o resultado
      // IMPORTANTE: Ajuste o nome 'output' para o nome correto da saída do seu modelo
      const outputName = this.session.outputNames[0];
      const output = results[outputName];
      
      console.log('✅ Resultado da predição:', output.data);
      
      return this.interpretarResultado(output.data);
      
    } catch (error) {
      console.error('❌ Erro ao fazer predição:', error);
      return null;
    }
  }

  // Interpreta o resultado do modelo
  interpretarResultado(outputData) {
    // AJUSTE ESTA FUNÇÃO DE ACORDO COM O SEU MODELO
    
    // Exemplo 1: Se for classificação com múltiplas classes
    if (outputData.length > 1) {
      const maxIndex = outputData.indexOf(Math.max(...outputData));
      const probabilidade = outputData[maxIndex];
      
      // Mapeamento de classes (ajuste conforme seu modelo)
      const classes = [
        'Perfil 1: Desenvolvedor Backend',
        'Perfil 2: Desenvolvedor Frontend', 
        'Perfil 3: Engenheiro de Dados',
        'Perfil 4: Administrador de Redes',
        'Perfil 5: DevOps'
      ];
      
      return {
        classe: maxIndex,
        nome: classes[maxIndex] || `Classe ${maxIndex}`,
        probabilidade: (probabilidade * 100).toFixed(2) + '%',
        todasProbabilidades: Array.from(outputData).map((prob, idx) => ({
          classe: classes[idx] || `Classe ${idx}`,
          probabilidade: (prob * 100).toFixed(2) + '%'
        }))
      };
    }
    
    // Exemplo 2: Se for regressão (valor único)
    else {
      const valor = outputData[0];
      return {
        valor: valor.toFixed(2),
        interpretacao: this.interpretarValor(valor)
      };
    }
  }

  // Interpreta um valor de regressão
  interpretarValor(valor) {
    // Ajuste conforme necessário
    if (valor >= 0.8) return 'Alto potencial para área de tecnologia';
    if (valor >= 0.6) return 'Bom potencial para área de tecnologia';
    if (valor >= 0.4) return 'Potencial moderado para área de tecnologia';
    return 'Considere explorar outras áreas';
  }

  // Informações sobre o modelo
  getInfoModelo() {
    if (!this.isLoaded) {
      return null;
    }
    
    return {
      entradas: this.session.inputNames,
      saidas: this.session.outputNames,
      carregado: this.isLoaded
    };
  }
}

// Exporta uma instância única do modelo
export const modeloIA = new ModeloIA();
