
var QueryMgr = {
	
	xhr: null, 
	url: AJAX_ENDPOINTS.spec_queries,
	maps: [],
	activeMap: null,

	addMap: function(p_map) {
		this.maps.push(p_map);
		this.activeMap = this.maps[this.maps.length-1];
	},

	activateMap: function(p_idx) {
		if (p_idx < 0 || p_idx >= this.maps.length) {
			throw new Error("QueryMgr.activateMap, invalid index:", p_idx);
		}
		this.activeMap = this.maps[p_idx];
	},

    abortPreviousSearchCall: function() {
    	if (this.xhr != null) {
    		this.xhr.abort();
    		this.xhr = null;
    	}
    },
	
	execute: function(p_qrykey, p_valueslist, opt_pbufferdist, opt_adic_callback) {

		if (opt_pbufferdist) {
			pbfdist = opt_pbufferdist;
		} else {
			pbfdist = 0;
		}	

		this.abortPreviousSearchCall();
		(function(p_this, pp_qrykey, pp_valueslist, pp_pbfdist) {

			p_this.xhr = ajaxSender(p_this.url, function() { 
				if (this.readyState === this.DONE) {
					if (this.status == 200) {
						
						if (this.responseText.length < 1) {
							MessagesController.setMessage("Não encontrado (sem resposta)", true, true);
							return;
						}
						let jresp;
						try {
							jresp = JSON.parse(this.responseText);
							if (Object.keys(jresp).length == 0) {
								MessagesController.setMessage("Não encontrado", true, true);
								return;
							}
						} catch(e) {
							console.log(this.responseText);
							console.error(e);
							return;
						}
						
						p_this.customizedExec(pp_qrykey, jresp, opt_adic_callback);
							
					} else {
						MessagesController.setMessage("Erro no serviço web", true, true);
					}

				}						
			}, JSON.stringify({
						alias: pp_qrykey,
						filtervals: pp_valueslist, 
						pbuffer: pp_pbfdist,
						lang: "pt"
					}), 
				p_this.xhr);
				
		})(this, p_qrykey, p_valueslist, pbfdist);
	},
	
	// method to extend / complete
	customizedExec: function(p_qrykey, p_jsonresponse, opt_adic_callback) {
		// para implementar			em classe estendida
		throw new Error("customizedExec not implemented");	
	},
	
	// method to extend / complete
	clearResults: function() {
		// para implementar			em classe estendida
		throw new Error("clearResults not implemented");	
	}
		
};

var RecordsViewMgr = {
	panels: {},
	the_divname: null,
	init: function() {
		let cfg;
		for (let k in RECORD_PANELS_CFG) {
			cfg = RECORD_PANELS_CFG[k];
			if (cfg["type"] == 'switcher') {
				this.panels[k] = new RecordPanelSwitcher(cfg["the_div"]);
				this.panels[k].rotator_msg = cfg["rotator_msg"];
				this.panels[k].attr_cfg = cfg["attr_cfg"];
			}
		}
		this.the_divname = cfg["the_div"];
	},
	_get: function(p_key) {
		if (this.panels[p_key] === undefined) {
			throw new Error("RecordsViewMgr _get: no such key:"+p_key);
		}
		return this.panels[p_key];
	},
	clear: function(p_key) {
		this._get(p_key).clear();
		const wdg = document.getElementById(this.the_divname);
		if (wdg!=null && wdg.parentNode!=null) {
			wdg.parentNode.style.removeProperty("height");
		}
	},
	_valcount: function(p_key, p_rows) {
		let maxcnt=0, valcount;
		let attr_cfg = this._get(p_key).attr_cfg; 
		for (let i=0; i<p_rows.length; i++) {  
			valcount = 0;
			for (let fld in attr_cfg) {
				if (!attr_cfg.hasOwnProperty(fld)) {
					continue;
				}
				let preval = p_rows[i][fld];
				if (preval == null || preval.length==0) {
					continue;
				}
				valcount++;
			}
			if (valcount > maxcnt) {
				maxcnt = valcount;
			}
		}   
		return maxcnt;
	},	
	generatePanels: function(p_key, p_records) {
		const dims =  bodyCanvasDims();
		const heightv = dims[1] - 320 - 80; // legenda + folga (cabeçalho e rodapé da )

		const panelSwitcher = this._get(p_key);
		panelSwitcher.clear();
		panelSwitcher.generatePanels(p_records, heightv);
	},
	show: function(p_records) {
		// para implementar			em classe estendida
		throw new Error("show not implemented");	
	}
	

};

(function() {
	RecordsViewMgr.init();
})();


var InteractionMgr = {
	
	connected_autocomplete: null,
	mouseup: null,
	selection: {
		lyr: null,
		oid: null,
		env: null
	},
	maps: [],
	activeMap: null,
	highlightStyles: {},
	info_key_fields: {},

	onBeforeMouseUp: function() {
		// para implementar
		throw new Error("InteractionMgr.onBeforeMouseUp not implemented");	
	},

	onMouseChange: function() {
		// para implementar
		throw new Error("InteractionMgr.onMouseChange not implemented");	
	},

	zoomToSelection: function(opt_env, opt_lyr, opt_oid) {
		// para implementar
		throw new Error("InteractionMgr.zoomToSelection not implemented");	
	},

	addMap: function(p_map) {
		this.maps.push(p_map);
		this.activeMap = this.maps[this.maps.length-1];
	},

	activateMap: function(p_idx) {
		if (p_idx < 0 || p_idx >= this.maps.length) {
			throw new Error("InteractionMgr.activateMap, invalid index:", p_idx);
		}
		this.activeMap = this.maps[p_idx];
	},

	infoQuery: function(p_lyr, p_feat) {
		// para implementar
		throw new Error("InteractionMgr.infoQuery not implemented");	
	},

	init: function() {		
		(function(p_this) {

			p_this.mouseup = function(p_map, x, y, layernames, findings) {
				p_this.onBeforeMouseUp(p_map, x, y, layernames, findings);
				p_this.onMouseChange(p_map, x, y, layernames, findings, false);
			};
			
			p_this.mousemove = function(p_map, x, y, layernames, findings) {
				p_this.onMouseChange(p_map, x, y, layernames, findings, true);						
			};
			
		})(this);
	
	}
};


(function() {
	InteractionMgr.init();
})();


		
		
