const express = require('express');

const routes = express.Router();

const obterDadosRaspberry = require("../controllers/obterDadosRaspberry.js");
const ativarModoAPComReboot = require("../controllers/ativarModoAPComReboot.js");
const solicitarTaraBalanca = require("../controllers/solicitarTaraBalanca.js");
const reiniciarRaspberry = require("../controllers/reiniciarRaspberry.js");
const conectarWifiRaspberry = require("../controllers/conectarWifiRaspberry.js");

routes.get('/dados', obterDadosRaspberry.obterDadosRaspberry);
routes.get('/modo-ap-reboot', ativarModoAPComReboot.ativarModoAPComReboot);
routes.get('/tarar-balanca', solicitarTaraBalanca.solicitarTaraBalanca);
routes.get('/reiniciar', reiniciarRaspberry.reiniciarRaspberry);
routes.post('/conectar-wifi', conectarWifiRaspberry.conectarWifiRaspberry);

module.exports = routes;
