//  ===========================================================================
//  Configuração 
//  ---------------------------------------------------------------------------

var LAYERVIZ_MODE = 'radiobutton'; // null ou 'radiobutton' -- visibilidade das FEATLAYERS é mutuamente exclusiva, ligar uma apaga  as outras

var AJAX_ENDPOINTS = {
	locqry: "https://loc.cm-porto.net/loc/c/lq",
	spec_queries: "https://munisig.cm-porto.pt/riscobdt/doget"
}

var QUERIES_CFG = {
}

var RECORD_PANELS_CFG = {
	main: {
		type: "switcher", // para já só 'switcher'
		max_attrs_per_page: 10,
		rotator_msg: "Processo {0} de {1}",
		attr_cfg: {
			
			nud_capa: ["Processo", null],
			n_processo: ["Processo", null],
			desc_tipo_proc:  ["Tipo de processo", null],
			tipo_processo: ["Tipo de processo", null],
			desc_oper_urb:  ["Operação urbanística", null],
			op_urbanistica: ["Operação urbanística", null], 
			uso: ["Uso", null], 
			num_conservatoria:  ["Registo predial", null],
			requerente: ["Requerente", null], 
			num_titulo:  ["Número de título", null],
			
			/* data_entrada:  ["Data entrada", 'epoch'], 
			aprov_arq_despacho:  ["Despacho aprovação arq.ª", null],
			aprov_arq_data_despacho:  ["Data despacho aprov.arq.ª", 'epoch'],
			entrada:  ["Em 'entrada'", null], */

			total:  ["Número total de fogos", null],
			// abc:  ["Área bruta construção (m2)", null],
			atc:  ["Área total construção (m2)", null],
			atc2:  ["Área total construção (m2)", null],
			volum_constr:  ["Volume construção", null],
			area_implant:  ["Área implantação (m2)", null],
			cercea:  ["Cércea",  null],
			pisos_abaixo_csol:  ["Pisos abaixo cot.soleira",  null],
			pisos_acima_csol:  ["Pisos acima cot.soleira", null],
			prazo:  ["Prazo (dias)", null],
			data_emissao:  ["Data emissão título", 'epoch'],
			aru: ["Área reabilitação urbana",null]
			
		},
		height_limits: [  // por numero de registos
			//até num linhas, altura
			[5, "180px"], 
			[10, "300px"], 
			[20, "380px"] 
		]		
	}
};

VIEW_SRID = 3763;

var VIEW_EXTENT = {
	xmin: -41600.0,
	ymin: 165400.0,
	xmax: -40000.0, 
	ymax: 166600.0,
	spatialReference: {
		wkid: VIEW_SRID
	}
};

var SCALE_LIMIT_FUNCS = [
	function(p_zoomval) {
		const ref  = 30000, wdg = document.getElementById("zoominmsg");
		if (wdg) {
			if (p_zoomval > ref) {
				wdg.style.display = 'block';
			} else {
				wdg.style.display = 'none';
			}
		}
	}
];

var ATTR_TEXT = "2021 CM-Porto / Dados: DM Gestão Urbanística, dev: DM Sistemas Informação / PT-TM06";
var ATTR_TEXT_MIN = "2021 CM-Porto";

//var SCALEBAR_SHOW = false;
var COORDSDISPLAY_SHOW = true;

var INITIAL_ANIM_MSECS = 2500;

var HIGHLIGHT_OPTS = {
	color: [255, 255, 0, 1],
	haloOpacity: 0.9,
	fillOpacity: 0.2
  }		

// Ao ativar as layers indicadas nas chaves deste dict,
//	 fazer-se-á zoom aos extents indicados, caso o extent
//   corrente esteja fora.
//
//	SE houver repetições / sobreposições de extents ativos para o 
//	 mesmo contexto de layers, apenas o primeiro extent é aplicado.
// 
var EXTENTS2CHK_ON_LYRVIZ_CHANGE = {
	lyr13_locSRUProcEmCurso: {
		env: {
		xmin: -41900.0,
		ymin: 163200.0,
		xmax: -39400.0, 
		ymax: 164900.0,
		spatialReference: {
			wkid: VIEW_SRID
			},
		},
		scale: 2000 
	}
}

var INTRO_MSG = "Introduza um topónimo, uma morada, um número de processo ou documento (NUP/NUD/ALV) ou número de alvará SRU.<br/><br/> Deve clicar num dos polígonos do mapa para ver os dados associados.";
var MSG_TIMEOUT_SECS = 7;
var HELP_MSG = "<b>Processos de operações urbanísticas em curso</b> referem-se aos processos que se encontram a decorrer nos serviços do Departamento Municipal de Gestão Urbanística ainda sem decisão final emitida<br/><br/><b>Alvarás de obras SRU em curso</b> - alvarás emitidos pela Porto Vivo, SRU que se encontram em fase de obra;<br/><br/><b>Alvarás de loteamento em curso</b> – esta informação agrega alvarás para novas operações de loteamento, operações de loteamento com obras de urbanização e obras de urbanização que ainda não foram concretizados;<br/><br/><b>Alvarás de obras em curso</b> - alvarás emitidos pela Câmara Municipal do Porto que se encontram em fase de obra;<br/><br/><b>Num. processos em curso / Nº alvarás em curso para o local</b> – identifica no nº de processos/alvarás que se encontram a decorrer para o local<br/><br/>(clique com o rato nesta mensagem para a fechar)";
