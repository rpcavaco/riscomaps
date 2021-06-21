
// ATENÇÃO - Este ficheiro inclui UI configs onde indicado com ** Config ** inclui config

function sizeWidgetsMode() {
	
	let ret, winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};

	if (parseInt(winsize.width) > 1200) {       
		ret = 4;
	} else if (parseInt(winsize.width) > 530) {  // 531 - 1200
		ret = 3;
	} else if (parseInt(winsize.width) > 430) {  // 431 - 531
		ret = 2;
	} else {       // <= 430
		ret = 1;
	}       
	
	return [ret, winsize];
}

//** Config ** inclui config
// ============================================================================
// Display dos resultados da pesquisa de endereço
// ----------------------------------------------------------------------------

function addrHighlightAnimator(p_mapctrl, p_cod_topo, p_npol, p_marker_coords) {

		this.cod_topo = p_cod_topo;
		this.npol = p_npol;
		this.MAPCTRL = p_mapctrl;
		this.linewidth = 0;
		this.finallinewidth = 22;
		this.maxwidth = 40;
		this.dir = 'out';
		this.stepout = 3;
		this.stepin = 3;
		this.marker_coords = p_marker_coords;
		this.strk_guide = "#FF3C35";
		this.strk_cline = "rgba(255,0,0,0.5)";
		this.strk_cline_trans = "rgba(255,0,0,0.4)";

		(function (p_obj) {
			p_obj.drawInCanvas = function (p_lw, p_final) {
				p_obj.MAPCTRL.clearTemporary();
				let symb;
				if (p_final) {
					symb = {
							"strokecolor": this.strk_cline,
							"linecap": "butt",
							"linewidth": parseInt(p_lw)
						};
				} else {
					symb = {
							"strokecolor": this.strk_cline_trans,
							"linecap": "butt",
							"linewidth": parseInt(p_lw)
						};
				}

				const inscreenspace = true;
				const dlayer = 'temporary';
				const do_debug = false;
	
				// Desenho do eixo de via
				p_obj.MAPCTRL.drawFromIndex('EV', 'TOPO_IX', p_obj.cod_topo, inscreenspace, dlayer,
					symb, null, false, null, do_debug);

				if (p_final) {

					let npidx = p_obj.MAPCTRL.getGlobalIndex("NP_IX");
					npprojs_fromtopo = npidx[p_obj.cod_topo];

					if (npprojs_fromtopo) {
						npproj = npprojs_fromtopo[p_obj.npol];
						if (npproj!==undefined && npproj['oid']!==undefined &&  npproj['oid'].length > 0) {

							const angle_ret=[], anchor=[];
							// Desenho da linha de projeção do num.polícia sobre o eixo de via
							let npprojfeat = p_obj.MAPCTRL.drawSingleFeature('NPOLPROJ', npproj['oid'], inscreenspace, dlayer,  
											{										
												"strokecolor": strk_guide,
												"linewidth": 4,
												"shadowcolor": "#444",
												"shadowoffsetx": 2,
												"shadowoffsety": 2,
												"shadowblur": 2
											}, false, null, do_debug);

							// Desenho do número de polícia SALIENTE
							if (npprojfeat != null) {
								geom.twoPointAngle(
										[npprojfeat.points[0], npprojfeat.points[1]], 
										[npprojfeat.points[2], npprojfeat.points[3]],
										angle_ret
								);
				
								let gc = p_obj.MAPCTRL.getGraphicController();
								if (gc) {
				
									gc.saveCtx(dlayer);
									
									gc.setFillStyle(strk_guide, dlayer);
									gc.setStrokeStyle(strk_guide, dlayer);
									gc.setFont('24px Arial', dlayer);
									
									if (angle_ret[1]==2 || angle_ret[1]==3) {
										gc.setTextAlign('left', dlayer);						
										geom.applyPolarShiftTo([npprojfeat.points[0], npprojfeat.points[1]], angle_ret[0], 6, anchor);
									} else {
										gc.setTextAlign('right', dlayer);
										geom.applyPolarShiftTo([npprojfeat.points[0], npprojfeat.points[1]], angle_ret[0], -6, anchor);
									}
									gc.setBaseline('middle', dlayer);
				
									gc.setShadowColor('#333', dlayer);
									gc.setShadowOffsetX(3, dlayer);
									gc.setShadowOffsetY(3, dlayer);
									gc.setShadowBlur(1, dlayer);
									
									gc.rotatedText(this.npol, anchor, angle_ret[0], 
									{
										"fill": true,
										"stroke": true
									},
									dlayer);				
									gc.restoreCtx(dlayer);
								}
							}
						}

					}	
				}			

			};
		})(this);

		(function (p_obj) {
			p_obj.draw = function () {

				var realsrchtol, scrrad;

				p_obj.drawInCanvas(p_obj.linewidth);
				if (p_obj.dir == 'out') {
					p_obj.linewidth += p_obj.stepout;
					if (p_obj.linewidth >= p_obj.maxwidth) {
						p_obj.dir = 'in';
					}
				} else {
					p_obj.linewidth -= p_obj.stepin;
				}
				if (p_obj.dir == 'out' || p_obj.linewidth > 2) {
					window.requestAnimationFrame(p_obj.draw);
				} else {
					// final
					p_obj.drawInCanvas(this.finallinewidth, true);

					// desenhar a cruz do ponto, se for caso disso
					if (p_obj.marker_coords) {
						drawPickMarker(MAPCTRL, PREVLOCJSONTREE, p_obj.marker_coords);
					}
				}

			};
		})(this);

		window.requestAnimationFrame(this.draw);
} 


//** Config ** inclui config
// ============================================================================
// Extend / customize managers
// ----------------------------------------------------------------------------

// Customização comportamento caixa de vista de registos alfa
RecordsViewMgr.show = function(p_key, p_payload) {

	// esconder msg introdutória
	const mainmsgDiv = document.getElementById("inimsg");
	if (mainmsgDiv) {
		mainmsgDiv.style.display = "none";
	}
	const qtl = document.getElementById("qrythemelbl");

	const labels = {
		"main_naolot_info": "Alvarás de obras em curso",
		"main_entrada_info": "Operações urbanísticas em curso",
		"main_lot_info": "Alvarás de loteamento em curso",
		"main_sru_info": "Alvarás de obras SRU em curso"
	};

	if (Object.keys(labels).indexOf(p_key) >= 0) {
		
		if (qtl) {
			qtl.innerText = labels[p_key];
			qtl.style.display = "block";
		}
		RecordsViewMgr.generatePanels("main", p_payload);

	}
};

// Customização "picagem" INFO e resultado de pesquisas alfa
QueryMgr.customizedExec = function(p_qrykey, p_jsonresponse, opt_adic_callback) {
	let rows;

	const keys = {
		"pec_findbydoc_qry": [null,"bydocqry"],
		"pec_naolot_info": ["pec_naolot_codsig", "main_naolot_info"],
		"pec_entrada_info": ["pec_entrada_codsig", "main_entrada_info"],
		"pec_lot_info": ["pec_lot_codsig", "main_lot_info"],
		"pec_sru_info": ["pec_sru_codsig", "main_sru_info"],
	};

	if (keys[p_qrykey] !== undefined) {

		if (keys[p_qrykey][0] != null) {

			rows = p_jsonresponse[keys[p_qrykey][0]]; 
			RecordsViewMgr.show(keys[p_qrykey][1], rows);

		} else {

			let pldkeys, lyrname=null, feat;

			pldkeys = Object.keys(p_jsonresponse);
			if (pldkeys.length == 0) {
				return;
			}
	
			switch(pldkeys[0]) {

				case "entrada":
					lyrname = "pec_entrada";
					break;
		
				case "lot":
					lyrname = "pec_lot";
					break;
		
				case "nao_lot":
					lyrname = "pec_naolot";
					break;
		
				case "sru":
					lyrname = "pec_sru";
					break;	
			}
			
			if (lyrname != null && p_jsonresponse[pldkeys[0]].features.length > 0) {
				feat = p_jsonresponse[pldkeys[0]].features[0];
				InteractionMgr.zoomToSelection(true, feat.env, lyrname, feat.oid);
			}
		}

	} else {
		console.warn("QueryMgr.customizedExec, invalid key:", p_qrykey);
	}

};

QueryMgr.clearResults = function() {

	const qtl = document.getElementById("qrythemelbl");
	if (qtl) {
		qtl.style.display = "none";
	}
	RecordsViewMgr.clear("main");

	const mainmsgDiv = document.getElementById("inimsg");
	if (mainmsgDiv) {
		mainmsgDiv.style.display = "block";
	}	
}

// Nome do 'autocomplete relacionado' para que as interações rato / toque com o mapa limpem a 
//   a respetiva 'records area' de resultados
InteractionMgr.connected_autocomplete = 'geocode';

// Campos a usar na operação INFO (InteractionMgr.mousechange), por layer com info ativo
InteractionMgr.info_key_fields = {
	"pec_naolot": ["cod_sig"],
	"pec_entrada": ["cod_sig"],
	"pec_lot": ["cod_sig"],
	"pec_sru": ["cod_sig"]
};

var TMPHighLight = {
	"strokecolor": "#FFE100",
	"fill": "rgba(0, 0, 0, 0)",
	"linewidth": 2,
	"shadowcolor": "#000",
	"shadowoffsetx": 2,
	"shadowoffsety": 2,
	"shadowblur": 2	
};
var TRANSHighLight = {
	"strokecolor": "#23fefe",
	"fill": "rgba(0, 0, 0, 0)",
	"linewidth": 1,
	"shadowcolor": "#eee",
	"shadowoffsetx": 1,
	"shadowoffsety": 1,
	"shadowblur": 1		
};
	
// Estilos de 'highlighting' de features ao movimentar o rato ('hover') sobre estas
InteractionMgr.highlightStyles = {
	ALL: {
		temporary: TMPHighLight,
		transient: TRANSHighLight
	}
};

// Registo de ações a exceutar previamente ao processamento de qualquer 'mouseup'
InteractionMgr.onBeforeMouseUp = function(p_map, p_x, p_y, p_layernames, p_findings) {
	QueryMgr.clearResults();
};

InteractionMgr.infoQuery = function(p_lyr, p_feat) {

	if (this.info_key_fields[p_lyr] === undefined) {
		console.warn("InteractionMgr.infoQuery, no info_key_fields defined for layer:", p_lyr);
		return;
	}
	const info_fields = this.info_key_fields[p_lyr];
	const qrykey = p_lyr + "_info";
	const info_values = [];

	if (p_feat) {
		for (let ifi=0; ifi<info_fields.length; ifi++) {
			info_values.push(p_feat.attrs[info_fields[ifi]]);
		}
		if (info_values.length < 1) {
			throw new Error("InteractionMgr.infoQuery, no values for query on layer:", p_lyr);
		}

		QueryMgr.execute(qrykey, info_values);			
	}

};

InteractionMgr.zoomToSelection = function(b_doinfo, opt_env, opt_lyr, opt_oid) {

	if (opt_lyr != null) {
		this.selection.lyr = opt_lyr;
	}
	if (opt_oid != null) {
		this.selection.oid = opt_oid;
	}

	if (opt_env != null) {
		this.selection.env = opt_env;
	}

	if (this.selection.lyr == null) {
		throw new Error("InteractionMgr.zoomToSelection - sel layer is null");
	}
	if (this.selection.oid == null) {
		throw new Error("InteractionMgr.zoomToSelection - sel oid is null");
	}
	if (this.selection.env == null) {
		throw new Error("InteractionMgr.zoomToSelection - sel env is null");
	}

	(function(p_this, p_doinfo) {
		p_this.activeMap.registerOnDrawFinish("highlight_features",
			function (the_mctrl, p_item)
			{
				if (p_item != 'normal') {
					return;
				}

				const inscreenspace = true;
				const dlayer = 'temporary';
				const do_debug = false;
				let styles;

				if (p_this.highlightStyles.hasOwnProperty(p_this.selection.lyr)) {
					styles = p_this.highlightStyles[p_this.selection.lyr];
				} else if (p_this.highlightStyles.hasOwnProperty("ALL")) {
					styles = p_this.highlightStyles["ALL"];
				} else {
					console.warn("InteractionMgr.zoomToSelection highlightStyles has no config for layer '"+p_this.selection.lyr+"' or ALL.");
					return;
				}

				the_mctrl.drawSingleFeature(p_this.selection.lyr,
					p_this.selection.oid, inscreenspace, dlayer,  
					styles.temporary, false, null, do_debug);

				if (p_doinfo) {
					const feat = the_mctrl.getFeature(p_this.selection.lyr, p_this.selection.oid);
					if (feat!=null) {
						p_this.infoQuery(p_this.selection.lyr, feat);
					}
				}

			},
			false // opt_noclobber
		);
	})(this, b_doinfo);

	if (!this.activeMap.style_visibility.isLyrTOCVisibile(this.selection.lyr)) {
		this.activeMap.style_visibility.releaseLayerVisibility(this.selection.lyr);
	}	

	const envArray = this.selection.env;
	this.activeMap.refreshFromMinMax(envArray[0], envArray[1], envArray[2], envArray[3]); 
};

InteractionMgr.onMouseChange = function(p_map, x, y, layernames, findings, is_transient) {

	const inscreenspace = true;
	let dlayer = 'temporary';

	if (is_transient) {					
		if (AutocompleteObjMgr.recordsAreaIsVisible(this.connected_autocomplete)) {
			return;
		}
		dlayer = 'transient';
		p_map.clearTransient();
	} else {
		dlayer = 'temporary';
		p_map.clearTemporary();
		p_map.unregisterOnDrawFinish("highlighttopo");

		this.selection.lyr = null;
		this.selection.oid = null;
		this.selection.env = null;

		AutocompleteObjMgr.showRecordsArea(this.connected_autocomplete, false);
	}
	
	let feat, sty, lyr, oid, styles, qrykey, info_fields, info_values = [];
	if (Object.keys(findings).length > 0 && layernames.length > 0) {
					
		for (let i=0; i<layernames.length; i++) {
			
			lyr = layernames[i];

			oid = findings[lyr][0];
			if (oid == null) {
				continue;
			}

			feat = p_map.getFeature(lyr, oid);
			if (feat) {
				if (feat._styidx !== undefined) {
					if (!p_map.style_visibility.isLyrTOCStyleVisibile(feat._styidx)) {
						continue;
					}
				}
			}
			
			if (this.highlightStyles.hasOwnProperty(lyr)) {
				styles = this.highlightStyles[lyr];
			} else if (this.highlightStyles.hasOwnProperty("ALL")) {
				styles = this.highlightStyles["ALL"];
			} else {
				console.warn("highlightStyles has no config for layer '"+lyr+"' or ALL.");
				continue;
			}
			
			if (is_transient) {                  
				sty = styles.transient;
			} else {							
				sty = styles.temporary;
				this.infoQuery(lyr, feat);
			}

			p_map.drawSingleFeature(lyr, oid, inscreenspace, dlayer, sty, false, null, false);

			if (!is_transient) {

				this.selection.lyr = lyr;
				this.selection.oid = oid;
				
				// redesenhar sempre que houver refresh, enquanto a selecção se mantiver
				(function(p_intmgr, pp_map) {
					pp_map.registerOnDrawFinish("highlight_features",
						function (the_mapctrl, p_item) {
							if (p_item != 'normal') {
								return;
							}
							the_mapctrl.drawSingleFeature(p_intmgr.selection.lyr, p_intmgr.selection.oid, inscreenspace, dlayer, sty, false, null, false);
						},
						false // opt_noclobber
					);	
				})(this, p_map);
			}
			
			
			// uma só layer
			break;
		}
		
	}
	
	// se nada for encontrado
	if (!is_transient && this.selection.oid == null) {
		p_map.unregisterOnDrawFinish("highlight_features");
	}

	
};




// ----------------------------------------------------------------------------
// Final "extend / customize managers"
// ============================================================================



// ============================================================================
// Integração Autocomplete Localizador
// ----------------------------------------------------------------------------

//** Config ** inclui config
class Geocode_LocAutoCompleter extends LocAutoCompleter {
	constructor(
			p_url,
			p_srid,
			p_widgets
		) {
		super("geocode", p_url,
			{
				outsrid: p_srid
			}
			, p_widgets);
		this.mapctrl = null;
		this.zoom_radius = 1.0;
	}
	
	setMap(p_mapctrl) {
		this.mapctrl = p_mapctrl;
	}

	setZoomRadius(p_zoom_radius) {
		this.zoom_radius = p_zoom_radius;
	}

	beforeResponseDone(p_respobj) {
		//hideLoaderImg();
	}	

	beforeExecSearch() {
		showLoaderImg();	
	}	
	
	// Sem widgets de publicação resultados Localizador
	/*clearPublishingWidgets() {

	}*/

	clearMessagingWidgets() {
		MessagesController.hideMessage(false);
	}

	deleteHandler() {

		MessagesController.hideMessage(false);
		this.cleanSearch();

		if (typeof QueryMgr != 'undefined') {
			QueryMgr.clearResults();
		}

        if (MapsMgr) {
			// em todos os mapas
			let the_map;
			for (let k in MapsMgr.maps) {
				the_map = MapsMgr.get(k);
				the_map.unregisterOnDrawFinish("highlighttopo");
				the_map.clearTransient();
				the_map.clearTemporary();
			}
        }
	}

//** Config ** inclui config
	altQueriesHandler(p_trimmed_qrystr) {
	
		const notTopoRegEx = new RegExp("(nud|nup|p|alv|\\d+)\/", 'i');
		const nupRegEx = new RegExp("^(nud|nup|p)\/\\d{3,8}\/\\d{2,4}", 'i');
		const alvCMPEx = new RegExp("^alv\/\\d{1,8}\/\\d{2,4}\/(dmu|cmp)", 'i');
		const alvSRUEx = new RegExp("^\\d{3,8}\/\\d{2,4}\/sru", 'i');

		const pt_buffer_dist = 50;

		if (notTopoRegEx.test(p_trimmed_qrystr)) {
			this.emptyCurrentRecords();
			if (nupRegEx.test(p_trimmed_qrystr)) {
				QueryMgr.execute("pec_findbydoc_qry", [ p_trimmed_qrystr ], pt_buffer_dist);
			} else if (alvCMPEx.test(p_trimmed_qrystr)) {
				QueryMgr.execute("pec_findbydoc_qry", [ p_trimmed_qrystr ], pt_buffer_dist);
			} else if (alvSRUEx.test(p_trimmed_qrystr)) {
				QueryMgr.execute("pec_findbydoc_qry", [ p_trimmed_qrystr ], pt_buffer_dist);
			}
			return false;
			
		}
		return true;		
	}

	zoomToAddr(p_env, hl_codtopo, hl_npol, marker_coords) {
		//console.trace();

		(function(p_mapctrl, p_hl_codtopo, p_hl_npol, p_marker_coords) {
			if (p_hl_codtopo) {
				p_mapctrl.registerOnDrawFinish("highlighttopo",
					function (the_mctrl, p_item)
					{
						if (p_item != 'normal') {
							return;
						}
						addrHighlightAnimator(the_mctrl, p_hl_codtopo, p_hl_npol, p_marker_coords);
					},
					false // opt_noclobber
				);
			}
		})(this.mapctrl, hl_codtopo, hl_npol, marker_coords);

		const envArray = p_env.getArray();
		this.mapctrl.refreshFromMinMax(envArray[0], envArray[1], envArray[2], envArray[3]); //, new LayerFilter("EV","cod_topo",hl_codtopo, true));
	}

	selAddress(p_codtopo, p_npol, p_ext, opt_p_loc) {

		let env = new Envelope2D(), ret = false;

		if (p_ext) {
			env.setMinsMaxs(p_ext[0], p_ext[1], p_ext[2], p_ext[3]);
			env.expand(1.2);
			this.zoomToAddr(env, p_codtopo, p_npol);
			ret = true;
		} else if (opt_p_loc && opt_p_loc.length > 0) {
			env.setAround(opt_p_loc, this.zoom_radius);		
			this.zoomToAddr(env, p_codtopo, p_npol);
			ret = true;
		}

		return ret;
	}

}

// ----------------------------------------------------------------------------
// Final da integração Autocomplete Localizador
// ============================================================================



// ============================================================================
// Utilidades User interface
//	 1. Mostrar / esconder "wait gif" - 'showLoaderImg' e 'hideLoaderImg'
//	 2. Adaptação UI a diferentes display / "responsividade" -- 'sizeWidgets'
//   3. Animação inicial
//   4. Controlador de mensagens de diálogo com o utilizador
//   5. Controles de toggling para "encolher":
//       a) a legenda -- 'viz' e 'viz_toggle'
// ----------------------------------------------------------------------------

// NÃO ALTERAR ESTE NOME- É PADRÃO REFERENCIADO EM RISCOJS
function showLoaderImg() {
	document.getElementById("loading").style.display = "block";
}

// NÃO ALTERAR ESTE NOME- É PADRÃO REFERENCIADO EM RISCOJS
function hideLoaderImg() {
	document.getElementById("loading").style.display = "none";	
}

//** Config ** inclui config
function sizeWidgets() {
	
	const modeobj = sizeWidgetsMode();
	const mode = modeobj[0];
	const winsize = modeobj[1];

	let wdg = document.getElementById("loc_inputbox");
	let wdg3, wdg2 = document.getElementById("loc_resultlistarea");
	wdg3 = document.getElementById("loc_content");

	if (wdg!=null && wdg2!=null) {       
		let mcw, w;
		if (mode == 4) {       
			w = '450px';
			mcw = '480';
		} else if (mode == 3) {       
			w = '350px';
			mcw = '400';
		} else if (mode == 2) {       
			w = '280px';
			mcw = '280';
		} else {       
			w = '270px';
			mcw = '250';
		}  
		wdg.style.width = w;
		wdg2.style.width = w;
		MessagesController.width = mcw;
	} 

	let v;
	if (mode > 2) {
		v = 192;
		LegendViz.changeVizFlag(true);
	} else {
		v = 55;

		// esconder legenda
	}
	MessagesController.left = v;
	wdg3.style.left = v + "px";

	MessagesController.reshape();

	wdg = document.getElementById("loc_cleansearchbtn");	
	if (wdg) {
		if (mode > 2) {
			wdg.style.fontSize = '14px';
			wdg.style.width = '90px';
		} else {
			wdg.style.fontSize = '12px';
			wdg.style.width = '46px';	
		}				
	}
	
	wdg = document.getElementById("logo");	
	if (wdg)  {
		if (mode > 2) {
			wdg.style.display = 'block';
		} else {
			wdg.style.display = 'none';
		}				
	}
	
	wdg = document.getElementById("gridDiv"); 
	if (wdg) {
		if (mode > 2) {
			wdg.style.width = '485px';
		} else {
			wdg.style.width = '270px';
		} 
	}
	
	wdg = document.getElementById("msgsdiv"); 
	if (wdg) {
		if (winsize.height >= 740) {
			wdg.style.removeProperty("height");
		} else {
			wdg.style.height = (winsize.height - 140) + 'px';
		} 
		if (winsize.width >= 800) {
			wdg.style.width = '480px';
		} else {
			if (mode > 2) {
				wdg.style.width = (winsize.width - 200) + 'px';
			} else {
				wdg.style.width = (winsize.width - 100) + 'px';
			}
		} 

	}	
	
	wdg = document.getElementById("sourcetag"); 
	if (wdg) {
		if (mode > 1) {
			wdg.innerText = ATTR_TEXT;
		} else {
			wdg.innerText = ATTR_TEXT_MIN;
		}				
	}
	
}

//** Config ** inclui config
function initialAnimation () {
	
	/*this.winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};*/
	
	this.init_offset_x = 0.3;
	this.hinge = {
			x: 0.7, y: 0.98
		};
	this.m1 = - (1 - this.hinge.y) / (this.hinge.x - this.init_offset_x);
	this.m2 = - this.hinge.y / (1 - this.hinge.x),
	this.b1 = 1 - (m1 * this.init_offset_x), 
	this.b2 = this.hinge.y - (m2 * this.hinge.x)
	
	this.rnd = function(p_val) {
		return p_val; // Math.round(p_val * 100) / 100;
	}
	
	this.stepperq = function(p_elapsedq) {
		let ret = this.rnd(this.b1 + this.m1 * p_elapsedq);
		if (ret <= this.hinge.y) {
			ret =  this.rnd(this.b2 + this.m2 * p_elapsedq);
		}
		return ret;
	};
	
	this.topfunc = function(p_elapsedq) {

		const modeobj = sizeWidgetsMode();
		const winsize = modeobj[1];

		const maxv = (winsize.height - (winsize.height / 4)) / 2.0;
		const minv = 12;
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};
		
	this.widfunc = function(p_elapsedq) {

		const modeobj = sizeWidgetsMode();
		const winsize = modeobj[1];

		const maxw = winsize.width / 6;
		const minw = 130;
		
		let ret = minw + (maxw-minw) * this.stepperq(p_elapsedq);
		return (ret < minw ? minw : ret).toString() + "px";		
	};

	this.leftfunc = function(p_elapsedq) {

		const modeobj = sizeWidgetsMode();
		const mode = modeobj[0];
		const winsize = modeobj[1];
	
		let maxv, minv;
		if (mode > 2) {
			maxv = (winsize.width - (winsize.width / 4)) / 2.0;
			minv = 52;
		} else {
			maxv = 70;
			minv = 52;
		}
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};

	this.fntszfunc = function(p_elapsedq) {
		let maxv;
		const minv = 22;

		const modeobj = sizeWidgetsMode();
		const mode = modeobj[0];
		
		if (mode > 2) {
			maxv = 42;
		} else {
			maxv = 34;
		}
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};

	/* this.clrfunc = function(p_elapsedq) {
		const clr1 = "#fff";
		const clr2 = "#c3c9d8";
		const clr3 = "#8c9cc3";
		
		if (this.stepperq(p_elapsedq) < 0.5) {
			return clr3;
		} else if (this.stepperq(p_elapsedq) < 0.8) {
			return clr2;
		} else {
			return clr1;
		}
	}; */

	this.animItems = {
		"logofloater": {
			"top": function(p_elapsedq) {
				return this.topfunc(p_elapsedq);
			},
			"left": function(p_elapsedq) {
				return this.leftfunc(p_elapsedq);
			},
			"font-size": function(p_elapsedq) {
				return this.fntszfunc(p_elapsedq);
			}
			
		},
		"logo": {
			/* "top": function(p_elapsedq) {
				return this.topfunc(p_elapsedq);
			},
			"left": function(p_elapsedq) {
				return this.leftfunc(p_elapsedq);
			}, */
			"width": function(p_elapsedq) {
				return this.widfunc(p_elapsedq);
			}
			
		}
		/*"logotxt": {
			"color": function(p_elapsedq) {
				return this.clrfunc(p_elapsedq);
			}
			
		}, */

	};
		
	
	this.run = function() {
		
		let start = null;
		const p_timeextent = INITIAL_ANIM_MSECS;

		function execanimstep(p_elapsedq) {		
			let f, wdg;
			for (let k in this.animItems) {
				wdg = document.getElementById(k);
				if (wdg == null) {
					break;
				}
				for (let prop in this.animItems[k]) {
					f = this.animItems[k][prop];
					wdg.style[prop] = f(p_elapsedq);
				}
			}
		}
		
		function finalstep() {
			execanimstep(1);
			const l = [
				["logotxt", false],
				//["legendctrl", true],
				//["legDivCloser", true],
				["gridDivContainer", true],
				["gridDivCloser", true],
				["loading", true],
				["loc_inputbox", true]
			];
			for (let w,i=0; i<l.length; i++) {
				w = document.getElementById(l[i][0]); 
				if (w) {
					w.style.visibility = l[i][1] ? "visible" : "hidden";
				}
			}
			
			MessagesController.setMessage(INTRO_MSG, true);
		}
		
		function animstep(timestamp) {
			if (start==null) {
				start = timestamp;
			}
			const elapsed = timestamp - start;
			let elapsedq = elapsed / p_timeextent;
			
			elapsedq = (elapsedq <= 1 ? elapsedq : 1);		
			execanimstep(elapsedq);

			if (elapsed <= p_timeextent) { 
				window.requestAnimationFrame(animstep);
			} else {
				finalstep();
			}	

		}
		
		const wdg = document.getElementById("logofloater");
		if (wdg) {
			wdg.style.removeProperty('visibility');
		}
		
		window.requestAnimationFrame(animstep);
	};
	
	this.run();

	
}

//** Config ** inclui config
var MessagesController = {
	
	// Constantes
	elemid: "msgsdiv",
	minwidth: 300,
	maxwidth: 550,
	messageTimeout: MSG_TIMEOUT_SECS * 1000,
	shortMessageTimeout: MSG_TIMEOUT_SECS * 500,
	charwidth: 10,
	padding: 26,
	rowheight: 28,
	
	messageText: "",
	lines: 0,
	width: 0,
	height: 0,
	isvisible: false,
	timer: null,
	
	reshape: function() {
		
		if (!this.isvisible) {
			return;
		}
		
		var msgsdiv = document.getElementById(this.elemid);

		// this.height = msgsdiv.clientHeight;

		msgsdiv.style.width = this.width + 'px';
		//msgsdiv.style.height = this.height + 'px';
		//msgsdiv.style.top = this.top + 'px';
		msgsdiv.style.left = this.left + 'px';
	},
	
	
	setMessage: function(p_msg_txt, p_is_timed, p_is_warning) {
		this.messageText = p_msg_txt;
		var iconimg=null, msgsdiv = document.getElementById(this.elemid);
		if (this.timer != null) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (msgsdiv!=null) {

			while (msgsdiv.firstChild) {
				msgsdiv.removeChild(msgsdiv.firstChild);
			}			
			iconimg = document.createElement("img");
			if (p_is_warning) {
				iconimg.src = "media/warning-5-32.png";
			} else {
				iconimg.src = "media/info-3-32.png";
			}

			msgsdiv.appendChild(iconimg);
			
			var p = document.createElement("p");
			p.insertAdjacentHTML('afterBegin', this.messageText);
			msgsdiv.appendChild(p);
			
			msgsdiv.style.display = '';
			msgsdiv.style.opacity = 1;
			this.isvisible = true;
		}
		this.reshape();

		let tmo;
		if (p_is_timed) {			
			if (p_is_warning) {
				tmo = this.shortMessageTimeout;
			} else {
				tmo = this.messageTimeout;
			}
			this.timer = setTimeout(function() { MessagesController.hideMessage(true); }, tmo);
		}
	},
	
	hideMessage: function(do_fadeout) {
		if (!this.isvisible) {
			return;
		}
		this.timer = null;
		var msgsdiv = document.getElementById(this.elemid);
		this.isvisible = false;
		if (do_fadeout) 
		{
			fadeout(msgsdiv);
		} 
		else 
		{
			if (msgsdiv!=null) {
				msgsdiv.style.display = 'none';
			}
		}
	}  	
}

var LegendViz = {

	visible: false,
	blurred: false,

	changeVizFlag: function(p_viz) {
		this.visible = p_viz;
	},

	viz: function(p_doshow) {
		this.visible = p_doshow;
		this.enforce();
	},

	blur: function(p_doblur) {
		this.blurred = p_doblur;
		const w2 = document.getElementById("legendctrl");
		if (this.blurred) {
			w2.style.opacity = 0.5;
		} else {
			this.enforce();
		}		
	},

	enforce: function() {
		const w1 = document.getElementById("legDivCloser");
		const w2 = document.getElementById("legendctrl");
		if (w1!=null && w2!=null) {
			if (this.visible) {
				w1.classList.remove("closed");
				w1.classList.add("opened");
				w2.style.visibility = "visible";
			} else {
				w1.classList.remove("opened");
				w1.classList.add("closed");
				w2.style.visibility = "hidden";
			}
			if (this.blurred) {
				w2.style.opacity = 0.5;
			} else {
				w2.style.opacity = 1;
			}		
		}
	},

	viz_toggle: function(p_this_elem) {
		const doshow = ! p_this_elem.classList.contains("opened"); 
		this.viz(doshow);
	}
}

var gridDivViz = {

	visible: true,

	changeVizFlag: function(p_viz) {
		this.visible = p_viz;
	},

	viz: function(p_doshow) {
		this.visible = p_doshow;
		this.enforce();
	},

	enforce: function() {
		const w1 = document.getElementById("gridDivCloser");
		const w2 = document.getElementById("gridDivContainer");
		if (w1!=null && w2!=null) {
			if (this.visible) {
				w1.classList.remove("closed");
				w1.classList.add("opened");
				w2.style.visibility = "visible";
			} else {
				w1.classList.remove("opened");
				w1.classList.add("closed");
				w2.style.visibility = "hidden";
			}
		}
	},

	viz_toggle: function(p_this_elem) {
		const doshow = ! p_this_elem.classList.contains("opened"); 
		this.viz(doshow);
	}
}

// ----------------------------------------------------------------------------
// Final Utilidades User interface
// ============================================================================



// ============================================================================
// INIT User interface
// ----------------------------------------------------------------------------

function init_ui() {

	// ** CONFIG **
	const srid = 3763; // Necessária esta config aqui, porque o SRID do mapa é definido em base de dados
	AutocompleteObjMgr.add(new Geocode_LocAutoCompleter(AJAX_ENDPOINTS.locqry, srid, 
		{
			parentdiv: "loc_content",
			textentry: "loc_inputbox",
			cleanbutton: "loc_cleansearchbtn",
			recordsarea: "loc_resultlistarea"
		}
	));

	AutocompleteObjMgr.bindEventHandlers();

	// mouse click sobre a mensagem flutuante fecha-a
	attEventHandler('msgsdiv', 'click',
		function(evt) {
			MessagesController.hideMessage(true);
		}
	);

	attEventHandler('help_icon', 'click',
		function(evt) {
			MessagesController.setMessage(HELP_MSG, false);
		}
	);

	attEventHandler('legDivCloser', 'click',
		function(evt) {
			LegendViz.viz_toggle(this); 
		}
	);

	attEventHandler('gridDivCloser', 'click',
		function(evt) {
			gridDivViz.viz_toggle(this); 
		}
	);


	// ajustar ao tamanho disponível 
	sizeWidgets();

	initialAnimation();
	
}

(function() {
	init_ui();
})();

