
var QueryMgr = {
	
	xhr: null, 
	url: AJAX_ENDPOINTS.spec_queries,

    abortPreviousSearchCall: function() {
    	if (this.xhr != null) {
    		this.xhr.abort();
    		this.xhr = null;
    	}
    },
	
	execute: function(p_qrykey, p_argslist, opt_adic_callback) {

		this.abortPreviousSearchCall();
		(function(p_this, pp_qrykey) {

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

					/* TODO - else mandar para a records area do autocomplete */
				}						
			}, JSON.stringify({
						alias: pp_qrykey,
						filtervals: p_argslist, 
						lang: "pt"
					}), 
				p_this.xhr);
				
		})(this, p_qrykey);
	},
	
	// method to extend / complete
	customizedExec: function(p_qrykey, p_jsonresponse, opt_adic_callback) {
		// para implementar			em classe estendida
		throw new Error("customizedExec not implemented");	
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
				this.panels[k] = new RecordPanelSwitcher();
				this.panels[k].max_attrs_per_page = cfg["max_attrs_per_page"];
				this.panels[k].rotator_msg = cfg["rotator_msg"];
				this.panels[k].rotator_msg = cfg["rotator_msg"];
				this.panels[k].attr_cfg = cfg["attr_cfg"];
				this.panels[k].height_limits = cfg["height_limits"];
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
	generatePanels: function(p_key, p_records, p_parentdiv_id, p_heightv) {

		let heightv=null;
		let height_limits = this._get(p_key).height_limits; 
		let max_attrs_per_page = this._get(p_key).max_attrs_per_page; 
		
		let valcount = Math.min(max_attrs_per_page, this._valcount("main", p_records));
		for (let i=0; i<height_limits.length; i++) {
			if (height_limits[i][0] >= valcount) {
				heightv = height_limits[i][1];
				break;
			}
		}
		if (heightv == null) {
			// se heightv nao tiver sido definida, colocar valor mais alto
			heightv = height_limits[height_limits.length-1][1];
		}
		
		const panelSwitcher = this._get(p_key);
		panelSwitcher.clear();
		panelSwitcher.generatePanels(p_records, p_parentdiv_id, heightv);
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
		oid: null
	},
	
	highlightStyles: {},

	onBeforeMouseUp: function() {
		// para implementar
		throw new Error("show not implemented");	
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

					AutocompleteObjMgr.showRecordsArea(p_this.connected_autocomplete, false);
				}
				
				let feat, cod_sig, sty, lyr, oid, styles, qrykey, markerf;
				if (Object.keys(findings).length > 0 && layernames.length > 0) {
								
					for (let i=0; i<layernames.length; i++) {
						
						lyr = layernames[i];
						qrykey = lyr + "_info";
						oid = findings[lyr][0];
						
						if (oid == null) {
							continue;
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

							feat = p_map.getFeature(lyr, oid);
							if (feat) {
								cod_sig = feat.attrs.cod_sig;							
								QueryMgr.execute(qrykey, [cod_sig]);			
							}
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


		
		
