//  ===========================================================================
//  Configuração básica
//  ----------------- ----------------------------------------------------------


var AJAX_ENDPOINTS = {
	locqry: "https://loc.cm-porto.net/loc/c/lq",
	spec_queries: "https://munisig.cm-porto.pt/riscobdt/doget"
}

var RECORD_PANELS_CFG = {
	main: {
		the_div: "queryResults", 
		type: "switcher", // para já só 'switcher'
		rotator_msg: "Processo {0} de {1}",
		attr_cfg: {
			
			nud_capa: ["Processo", null],
			n_processo: ["Processo", null],
			data_registo: ["Data entrada", null],
			desc_tipo_proc:  ["Tipo de processo", null],
			tipo_processo: ["Tipo de processo", null],
			requerente: ["Requerente", null], 
			desc_oper_urb:  ["Operação urbanística", null],
			op_urbanistica: ["Operação urbanística", null], 
			num_titulo:  ["Número de título", null],
			alvara:  ["Número de título", null],
			data_emissao:  ["Data emissão título", null],
			data_alvara:  ["Data emissão título", null],
			desc_tipo_uso:  ["Tipo de uso", null],
			uso:  ["Tipo de uso", null],
			num_conservatoria:  ["Registo predial", null],
			freguesia: ["Freguesia", null],
			data_despacho:  ["Data despacho", null],

			
			/* data_entrada:  ["Data entrada", 'epoch'], 
			aprov_arq_despacho:  ["Despacho aprovação arq.ª", null],
			aprov_arq_data_despacho:  ["Data despacho aprov.arq.ª", 'epoch'],
			entrada:  ["Em 'entrada'", null], */

			att:  ["Área do prédio a lotear (m2)", 'localized'],
			n_lotes:  ["Número de lotes", null],
			atc:  ["Área total construção (m2)", 'localized'],
			abc:  ["Área bruta construção (m2)", 'localized'],
			vtc:  ["Volume construção", 'localized'],
			volum_constr: ["Volume construção", 'localized'],
			atimpl:  ["Área implantação (m2)", 'localized'],
			area_implant:  ["Área implantação (m2)", 'localized'],
			cercea:  ["Cércea",  'localized'],
			pisos_abaixo_csol:  ["Pisos abaixo cot.soleira",  null],
			pisos_acima_csol:  ["Pisos acima cot.soleira", null],



			total:  ["Número total de fogos", 'localized'],
			atimpl:  ["Área implantação (m2)", 'localized'],

			prazo:  ["Prazo (dias)", 'localized'],
			aru: ["Área reabilitação urbana",null],

			atc2:  ["Área total construção (m2)", 'localized']
			
			
		}
	}
};

var ATTR_TEXT = "2021 CM-Porto / Dados: DM Gestão Urbanística, dev: DM Sistemas Informação / Orto 2018 DGT PT-TM06";
var ATTR_TEXT_MIN = "2021 CM-Porto";

var INITIAL_ANIM_MSECS = 2500;

	

var INTRO_MSG = "Introduza um topónimo, uma morada, um número de processo ou documento (NUP/NUD/ALV) ou número de alvará SRU.<br/><br/> Deve clicar num dos polígonos do mapa para ver os dados associados.";
var MSG_TIMEOUT_SECS = 7;
var HELP_MSG = "<b>Processos de operações urbanísticas em curso</b> referem-se aos processos que se encontram a decorrer nos serviços do Departamento Municipal de Gestão Urbanística ainda sem decisão final emitida<br/><br/><b>Alvarás de obras SRU em curso</b> - alvarás emitidos pela Porto Vivo, SRU que se encontram em fase de obra;<br/><br/><b>Alvarás de loteamento em curso</b> – esta informação agrega alvarás para novas operações de loteamento, operações de loteamento com obras de urbanização e obras de urbanização que ainda não foram concretizados;<br/><br/><b>Alvarás de obras em curso</b> - alvarás emitidos pela Câmara Municipal do Porto que se encontram em fase de obra;<br/><br/><b>Num. processos em curso / Nº alvarás em curso para o local</b> – identifica no nº de processos/alvarás que se encontram a decorrer para o local<br/><br/>Na <b>caixa de pesquisas</b>, pode procurar um topónimo ou morada ou por um número de documento (NUP/NUD/ALV) ou número de alvará SRU. Não é possível pesquisar n.os de documento parciais.<br/><br/>(clique com o rato nesta mensagem para a fechar)";
