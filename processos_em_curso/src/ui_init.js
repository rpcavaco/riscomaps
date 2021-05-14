
// ATENÇÃO - Este ficheiro inclui UI configs onde indicado com ** Config ** inclui config

function sizeWidgetsMode() {
	
	let ret, winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};

	if (parseInt(winsize.width) > 1200) {       
		ret = 4;
	} else if (parseInt(winsize.width) > 530) {       
		ret = 3;
	} else if (parseInt(winsize.width) > 430) {       
		ret = 2;
	} else {       
		ret = 1;
	}       
	
	return ret;
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
RecordsViewMgr.show = function(p_key, p_records) {
	
	if (p_key == "main") {
	// esconder msg introdutória
		const mainmsgDiv = document.getElementById("mainmsg");
		if (mainmsgDiv) {
			mainmsgDiv.style.display = "none"
        }
	
		const spEmLoteam = document.getElementById("sp-emloteam");
		if (spEmLoteam) {
			/* if (LayerInteractionMgr.selectedLayerId.indexOf("_loteam") > 1) {
				spEmLoteam.style.visibility = 'visible';
			} else {
				spEmLoteam.style.visibility = 'hidden';
			} */
			spEmLoteam.style.visibility = 'hidden';
		}
	}
				
	RecordsViewMgr.generatePanels(p_key, p_records, "queryResults");	
};

//"lnames": ["pec_naolot", "pec_entrada", "pec_lot", "pec_sru", "EV","NPOLPROJ"],

// Customização "picagem" INFO
QueryMgr.customizedExec = function(p_qrykey, p_jsonresponse, opt_adic_callback) {
	let rows;
	switch(p_qrykey) {

		case "pec_naolot_info": // "find" alias
			rows = p_jsonresponse["pec_naolot_codsig"]; // "tableview" alias
			RecordsViewMgr.show("main", rows);
			break;

		case "pec_entrada_info": 
			rows = p_jsonresponse["pec_entrada_codsig"]; 
			RecordsViewMgr.show("main", rows);
			break;

		case "pec_lot_info": 
			rows = p_jsonresponse["pec_lot_codsig"]; 
			RecordsViewMgr.show("main", rows);
			break;
			
		case "pec_sru_info": // "find" alias
			rows = p_jsonresponse["pec_sru_codsig"]; 
			RecordsViewMgr.show("main", rows);
			break;
	} 
};

// Nome do 'autocomplete relacionado' para que as interações rato / toque com o mapa limpem a 
//   a respetiva 'records area' de resultados
InteractionMgr.connected_autocomplete = 'geocode';

var TMPHighLight = {
	"strokecolor": "#ff4822",
	"fill": "rgba(0, 0, 0, 0)",
	"linewidth": 2,
	"shadowcolor": "#000",
	"shadowoffsetx": 2,
	"shadowoffsety": 2,
	"shadowblur": 2	
};
var TRANSHighLight = {
	"strokecolor": "#8ff",
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
	RecordsViewMgr.clear("main");
}

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
		hideLoaderImg();
	}	

	beforeExecSearch() {
		showLoaderImg();	
	}	
	
	// Sem widgets de publicação resultados Localizador
	/*clearPublishingWidgets() {

	}*/

	deleteHandler() {

		this.cleanSearch();

		if (typeof QueriesMgr != 'undefined') {
			QueriesMgr.clearResults();
		}

		// TODO -- avaliar a necessidade de manter este vindo da app AGS
		/*
		if (typeof LayerInteractionMgr != 'undefined') {
			LayerInteractionMgr.clearFunc();
		}
		*/

        //NPolHighlighter.clear();
        //NPolHighlighter.clearMarked();
       
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
		if (notTopoRegEx.test(p_trimmed_qrystr)) {
			this.emptyCurrentRecords();
			if (nupRegEx.test(p_trimmed_qrystr)) {
				QueriesMgr.executeQuery("byDoc", [ p_trimmed_qrystr ], true);
			}
			if (alvCMPEx.test(p_trimmed_qrystr)) {
				QueriesMgr.executeQuery("byDoc", [ p_trimmed_qrystr ], true);
			}
			if (alvSRUEx.test(p_trimmed_qrystr)) {
				QueriesMgr.executeQuery("byDoc", [ p_trimmed_qrystr ], true);
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
//       a) a legenda -- 'legend_viz' e 'legend_viz_toggle'
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
	
	let mode = sizeWidgetsMode();

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
		v = 200;
	} else {
		v = 55;
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
}

//** Config ** inclui config
function initialAnimation () {
	
	this.winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};
	
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
		const maxv = (this.winsize.height - (this.winsize.height / 4)) / 2.0;
		const minv = 12;
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};
		
	this.widfunc = function(p_elapsedq) {
		const maxw = this.winsize.width / 6;
		const minw = 130;
		
		let ret = minw + (maxw-minw) * this.stepperq(p_elapsedq);
		return (ret < minw ? minw : ret).toString() + "px";		
	};

	this.leftfunc = function(p_elapsedq) {
		let mode = sizeWidgetsMode();
		let maxv, minv;
		if (mode > 2) {
			maxv = (this.winsize.width - (this.winsize.width / 4)) / 2.0;
			minv = 60;
		} else {
			maxv = 70;
			minv = 60;
		}
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};

	this.fntszfunc = function(p_elapsedq) {
		let maxv;
		const minv = 22;
		
		let mode = sizeWidgetsMode();
		if (mode > 2) {
			maxv = 42;
		} else {
			maxv = 34;
		}
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};

	this.clrfunc = function(p_elapsedq) {
		const clr1 = "#fff";
		const clr2 = "#6b80b5";
		const clr3 = "#0f2f7e";
		
		if (this.stepperq(p_elapsedq) < 0.5) {
			return clr3;
		} else if (this.stepperq(p_elapsedq) < 0.8) {
			return clr2;
		} else {
			return clr1;
		}
	};

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
			
		},
		"logotxt": {
			"color": function(p_elapsedq) {
				return this.clrfunc(p_elapsedq);
			}
			
		},

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
				["legDivCloser", true],
				["gridDivContainer", true],
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
			//var cont = document.createTextNode(this.messageText);
			//p.appendChild(cont);
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

function legend_viz(p_doshow) {
	const w1 = document.getElementById("legDivCloser");
	const w2 = document.getElementById("legDiv");
	if (w1!=null && w2!=null) {
		if (p_doshow) {
			w1.classList.remove("closed");
			w1.classList.add("opened");
			w2.style.visibility = "visible";
		} else {
			w1.classList.remove("opened");
			w1.classList.add("closed");
			w2.style.visibility = "hidden";
		}
	}
}

function legend_viz_toggle(p_this_elem) {
	const doshow = ! p_this_elem.classList.contains("opened"); 
	legend_viz(doshow);
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
			legend_viz_toggle(this); 
		}
	);


	// ajustar ao tamanho disponível 
	sizeWidgets();

	initialAnimation();
	
}

(function() {
	init_ui();
})();

