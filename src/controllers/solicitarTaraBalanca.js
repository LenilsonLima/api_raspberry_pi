const axios = require('axios');

exports.solicitarTaraBalanca = async (req, res) => {
  try {
    const urlBalanca = 'http://127.0.0.1:5001/tarar-balanca'; // IP DO RASPBERRY

    const response = await axios.get(urlBalanca, { timeout: 7000 });

    return res.status(200).json({
      retorno: response.data.retorno ||
      {
        status: 200,
        mensagem: 'Solicitação enviada, tara iniciada...'
      },
      registros: []
    });
  } catch (error) {
    console.error('Erro ao chamar balança:', error);

    return res.status(500).json({
      retorno: error.response?.data.retorno ||
      {
        status: 500,
        mensagem: 'Erro ao solicitar tara, tente novamente.',
      },
      registros: []
    });
  }
};