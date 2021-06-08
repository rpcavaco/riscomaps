
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

var LayervizMgr = {
	mode: null,
	layerItems: {},
	set: function(p_key, p_value) {
		this.layerItems[p_key] = p_value;
	},
	changeVisibilty(p_this_layerid, p_visible, opt_do_change) {
		if (this.mode == 'radiobutton') {
			for (let lyrId in this.layerItems) {
				if (p_visible) {
					if (lyrId != p_this_layerid && this.layerItems[lyrId].visible) {

						this.layerItems[lyrId].visible = false;
						this.layerItems[lyrId].panel.open = false;
						this.layerItems[p_this_layerid].panel.open = true;

						if (typeof LayerInteractionMgr != 'undefined') {
							LayerInteractionMgr.select(p_this_layerid);
						}
					}
				}
			}
		}
		if (opt_do_change) {
			this.layerItems[p_this_layerid].visible = p_visible;
			this.layerItems[p_this_layerid].panel.open = p_visible;
		}
	},
	init: function() {		
		if (typeof LAYERVIZ_MODE != 'undefined') {
			this.mode = LAYERVIZ_MODE;
		}
	}
};

(function() {
	LayervizMgr.init();
})();

var RecordsViewMgr = {
	panels: {},
	init: function() {
		let cfg;
		for (let k in RECORD_PANELS_CFG) {
			cfg = RECORD_PANELS_CFG[k];
			if (cfg["type"] == 'switcher') {
				this.panels[k] = new RecordPanelSwitcher(cfg["the_div"]);
				this.panels[k].rotator_msg = cfg["rotator_msg"];
				this.panels[k].rotator_msg = cfg["rotator_msg"];
				this.panels[k].attr_cfg = cfg["attr_cfg"];
			}
		}
	},
	_get: function(p_key) {
		if (this.panels[p_key] === undefined) {
			throw new Error("RecordsViewMgr _get: no such key:"+p_key);
		}
		return this.panels[p_key];
	},
	clear: function(p_key) {
		this._get(p_key).clear();
	},
	_valcount: function(p_key, p_rows) {
		let maxcnt=0, valcount;
		let attr_cfg = this._get(p_key).attr_cfg; 
		for (let i=0; i<p_rows.length; i++) {  
			valcount = 0;
			for (let fld in attr_cfg) {
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

			const inscreenspace = true;
			let dlayer = 'temporary';
			
			p_this.mousechange = function(p_map, x, y, layernames, findings, is_transient) {

				if (is_transient) {					
					if (AutocompleteObjMgr.recordsAreaIsVisible(p_this.connected_autocomplete)) {
						return;
					}
					dlayer = 'transient';
					p_map.clearTransient();
				} else {
					dlayer = 'temporary';
					p_map.clearTemporary();
					p_map.unregisterOnDrawFinish("highlighttopo");

					p_this.selection.lyr = null;
					p_this.selection.oid = null;
					p_this.selection.env = null;

					AutocompleteObjMgr.showRecordsArea(p_this.connected_autocomplete, false);
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
						
						if (p_this.highlightStyles.hasOwnProperty(lyr)) {
							styles = p_this.highlightStyles[lyr];
						} else if (p_this.highlightStyles.hasOwnProperty("ALL")) {
							styles = p_this.highlightStyles["ALL"];
						} else {
							console.warn("highlightStyles has no config for layer '"+lyr+"' or ALL.");
							continue;
						}
						
						if (is_transient) {                  
							sty = styles.transient;
						} else {							
							sty = styles.temporary;
							p_this.infoQuery(lyr, feat);
						}

						p_map.drawSingleFeature(lyr, oid, inscreenspace, dlayer, sty, false, null, false);

						if (!is_transient) {

							p_this.selection.lyr = lyr;
							p_this.selection.oid = oid;
							
							// redesenhar sempre que houver refresh, enquanto a selecção se mantiver
							p_map.registerOnDrawFinish("highlight_features",
								function (the_mapctrl, p_item) {
									if (p_item != 'normal') {
										return;
									}
									the_mapctrl.drawSingleFeature(p_this.selection.lyr, p_this.selection.oid, inscreenspace, dlayer, sty, false, null, false);
								},
								false // opt_noclobber
							);	
						}
						
						
						// uma só layer
						break;
					}
					
				}
				
				// se nada for encontrado
				if (!is_transient && p_this.selection.oid == null) {
					p_map.unregisterOnDrawFinish("highlight_features");
				}

				
			};

			p_this.mouseup = function(p_map, x, y, layernames, findings) {
				p_this.onBeforeMouseUp(p_map, x, y, layernames, findings);
				p_this.mousechange(p_map, x, y, layernames, findings, false);
			};
			
			p_this.mousemove = function(p_map, x, y, layernames, findings) {
				p_this.mousechange(p_map, x, y, layernames, findings, true);						
			};
			
		})(this);
	
	}
};


(function() {
	InteractionMgr.init();
})();


/*	if (!AutocompleteObjMgr.recordsAreaIsVisible('geocode')) {	
		var oid = p_map.findNearestObject(x, y, layername);
		if (oid && layername == tema_lotes) {
			//console.log("hl oid:"+oid);
			LoteGOUHighlighter.doHighlight(oid, false);
		} else {
			if (LoteGOUHighlighter.tempHighlightIsOn()) {
				MAPCTRL.clearTransient();
			}
		}
	}
	*/


		
		
