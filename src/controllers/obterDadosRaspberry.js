// Módulo para manipular arquivos
const fs = require('fs');

exports.obterDadosRaspberry = async (req, res, next) => {
  try {
    // Lê o arquivo /proc/cpuinfo que contém informações da CPU
    const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
    
    // Procura a linha que começa com 'Serial'
    const serialLine = cpuInfo.split('\n').find(line => line.startsWith('Serial'));

    if (serialLine) {
      // Se encontrou, responde com status 200
      return res.status(200).send({
        retorno: {
          status: 200,
          mensagem: 'Dados encontrados com sucesso!'
        },
        registros: [
          {
            cpuInfo,
            serial: serialLine.split(':')[1].trim() // Extrai o número após ":"
          }
        ]
      });
    } else {
      // Se não encontrou, responde com status 404
      return res.status(404).send({
        retorno: {
          status: 404,
          mensagem: 'Dados não encontrados, tente novamente.'
        },
        registros: []
      });
    }
  } catch (error) {
    console.error("Erro ao buscar número dados:", error);
    res.status(500).send({
      retorno: {
        status: 500,
        mensagem: "Erro ao buscar número dados, tente novamente.",
        erro: error.message
      },
      registros: []
    });
  }
};