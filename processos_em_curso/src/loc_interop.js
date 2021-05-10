
/*
var NPolHighlighter = {
	
	currentFoundFeature: {
		"layer": null,
		"oid": null,
		"np": null,
		"areaespecial": null,
		"freg": null,
		"cod_freg": null,
		"cod_postal3": null,
		"cod_postal4": null,
		"codtopo": null,
		"toponimo": null,
		"notas": null,
		"frac": null,
		"loc": [],
		"is_final": false
	},
	
	hlLayer: null,
	
	markedFeature: {
		"layer": null,
		"oid": null,
		"np": null
	},
	debugStr: function() {
		return "NPolHighlighter final:"+this.currentFoundFeature.is_final + " lyr:"+this.currentFoundFeature.layer + " oid:"+this.currentFoundFeature.oid + " MARKED -- lyr: "+this.markedFeature.layer + " oid:"+this.markedFeature.oid;
	},

	clearMarked: function() {
		//console.log("    NPolHighlighter clear");
		this.markedFeature.layer = null;
		this.markedFeature.oid = null;
		this.markedFeature.np = null;
	},
	
	setMarked: function() {
		if (this.currentFoundFeature.is_final) {
			this.markedFeature.layer = this.currentFoundFeature.layer;
			this.markedFeature.oid = this.currentFoundFeature.oid;
			this.markedFeature.np = this.currentFoundFeature.np;
		}
	},
	
	clear: function() {
		this.currentFoundFeature.layer = null;
		this.currentFoundFeature.oid = null;
		this.currentFoundFeature.np = null;
		this.currentFoundFeature.areaespecial = null;
		this.currentFoundFeature.freg = null;
		this.currentFoundFeature.cod_freg = null;
		this.currentFoundFeature.cod_postal3 = null;
		this.currentFoundFeature.cod_postal4 = null;
		this.currentFoundFeature.codtopo = null;
		this.currentFoundFeature.toponimo = null;
		this.currentFoundFeature.notas = null;
		this.currentFoundFeature.frac = null;
		this.currentFoundFeature.loc = [];
		this.currentFoundFeature.is_final = false;
	},
	
	transientLayerCleared: function() {
		if (!this.currentFoundFeature.is_final) {
			this.clear();
		}
	},
	

	tempHighlightIsOn: function() {
		return (!this.currentFoundFeature.is_final && (this.currentFoundFeature.layer != null || this.currentFoundFeature.gid != null));
	},

	doHighlight: function(layername, oid, p_is_final, opt_dodebug) 
	{
		if (!MAPCTRL.checkLayerVisibility(layername)) {
			return;
		}

		var topovals, dlayer, angle_ret=[], anchor=[], npol, strk_guide, stroke_centerline, basecolor_rgbtriplet;
		var inscreenspace = true;
		
		if (p_is_final)
		{
			dlayer = 'temporary';
			basecolor_rgbtriplet = [255,0,0];
			this.currentFoundFeature.is_final = true;
			MAPCTRL.unregisterOnDrawFinish("highlighttopo");
		}
		else
		{
			dlayer = 'transient';
			basecolor_rgbtriplet = [255,200,35];
			this.currentFoundFeature.is_final = false;
		}
		
		if (p_is_final || (layername != this.currentFoundFeature.layer || oid != this.currentFoundFeature.oid))
		{
			MAPCTRL.clearTransient();

			this.currentFoundFeature.layer = layername;
			this.currentFoundFeature.oid = oid;
			
			if (basecolor_rgbtriplet && basecolor_rgbtriplet.length>0) {
				strk_guide = String.format(
						"rgba({0},{1},{2},1)", 
						basecolor_rgbtriplet[0], basecolor_rgbtriplet[1], 
						basecolor_rgbtriplet[2]
					);
				stroke_centerline = String.format(
						"rgba({0},{1},{2},0.5)", 
						basecolor_rgbtriplet[0], basecolor_rgbtriplet[1], 
						basecolor_rgbtriplet[2]
					);
				
			} else {
				strk_guide = "rgba(255,200,35,1)";
				stroke_centerline = "rgba(255,200,35,0.5)";				
			}
			
			var idx, npprojs_fromtopo, npproj, npprojfeat=null, topovals, npfeat = MAPCTRL.getFeature(layername, oid);
			var outpts = [];

			if (npfeat) 
			{
				this.currentFoundFeature.np = npfeat.attrs["n_policia"];
				this.currentFoundFeature.codtopo = npfeat.attrs["cod_topo"];		

				
				if (npfeat.points.length > 1) {
					 MAPCTRL.getTerrainPt([npfeat.points[0],npfeat.points[1]], outpts)
					this.currentFoundFeature.loc = [outpts[0],outpts[1]];
				}
				
				idx = MAPCTRL.getGlobalIndex("NP_IX");
				npprojs_fromtopo = idx[this.currentFoundFeature.codtopo];
				if (npprojs_fromtopo) {
					npproj = npprojs_fromtopo[this.currentFoundFeature.np];
					if (npproj!==undefined && npproj['oid']!==undefined &&  npproj['oid'].length > 0) {
						npprojfeat = MAPCTRL.drawSingleFeature(MapsMgr.hlLayer, npproj['oid'], inscreenspace, dlayer,  
										{										
											"strokecolor": strk_guide,
											"linewidth": 3,
											"shadowcolor": "#444",
											"shadowoffsetx": 2,
											"shadowoffsety": 2,
											"shadowblur": 2
										});
					}
				}
							
				topovals = MAPCTRL.getValueFromGlobalIndex("TOPO_IX", this.currentFoundFeature.codtopo, "toponimo");
				if (topovals != null && topovals.length > 0) {
					this.currentFoundFeature.toponimo = topovals[0];
				}

				// marcar eixos de via do arruamento
				if (!this.currentFoundFeature.codtopo) {
					console.log(JSON.stringify(feat));
					console.log(JSON.stringify(this.currentFoundFeature));
					throw new Error("null codtopo lyr:"+layername+", oid;"+oid);
				}

				MAPCTRL.drawFromIndex('EV','TOPO_IX', this.currentFoundFeature.codtopo, inscreenspace, dlayer,
						opt_dodebug, {
							"strokecolor": stroke_centerline,
							"linewidth": 14
						});				
			}		
				
			if (npprojfeat != null) 
			{
				geom.twoPointAngle(
						[npprojfeat.points[0], npprojfeat.points[1]], 
						[npprojfeat.points[2], npprojfeat.points[3]],
						angle_ret
				);

				let gc = MAPCTRL.getGraphicController();
				if (gc) {

					gc.saveCtx(dlayer);
					
					gc.setFillStyle(strk_guide, dlayer);
					gc.setFont('24px Arial', dlayer);
					
					if (angle_ret[1]==2 || angle_ret[1]==3) {
						gc.setTextAlign('left', dlayer);						
						geom.applyPolarShiftTo([npprojfeat.points[0], npprojfeat.points[1]], angle_ret[0], 6, anchor);
					} else {
						gc.setTextAlign('right', dlayer);
						geom.applyPolarShiftTo([npprojfeat.points[0], npprojfeat.points[1]], angle_ret[0], -6, anchor);
					}
					gc.setBaseline('middle', dlayer);

					gc.setShadowColor('#444', dlayer);
					gc.setShadowOffsetX(2, dlayer);
					gc.setShadowOffsetY(2, dlayer);
					gc.setShadowBlur(2, dlayer);
					
	//this.rotatedText = function (p_txt, p_pt, p_angle, p_fillstroke, opt_displaylayer, 
		//					opt_p_chheight, opt_p_chhwid, opt_p_isfirst, opt_p_islast) 

					gc.rotatedText(this.currentFoundFeature.np, anchor, angle_ret[0], 
					{
						"fill": true,
						"stroke": false
					},
					dlayer);

					gc.restoreCtx(dlayer);
				}
			}
			
			if (p_is_final) {
				this.setMarked();
			}
		}
		
	},


	doHighlightMarked: function() 
	{
		if (this.markedFeature.layer != null && this.markedFeature.oid != null) {
			if (MAPCTRL.checkLayerVisibility(this.markedFeature.layer)) {
				this.doHighlight(this.markedFeature.layer, this.markedFeature.oid, true);
			}
		}
		
	}


};

*/

function sel_num(p_codtopo, p_toponimo, p_npol, p_areaespecial, p_freg, p_codfreg, p_onhover, p_loc, p_showreturnedvalues) {

	if (!p_onhover)
	{
		AutocompleteObjMgr.showListArea('geocode',false);

		TRANSMIT_OBJECT.npol = p_npol;

		if (p_areaespecial) {
			TRANSMIT_OBJECT.areaespecial = p_areaespecial;
		} else {
			TRANSMIT_OBJECT.areaespecial = '';
		}
		
		if (p_freg) {
			TRANSMIT_OBJECT.freg = p_freg;
			TRANSMIT_OBJECT.cod_freg = p_codfreg;
		} else {
			TRANSMIT_OBJECT.freg = '';
			TRANSMIT_OBJECT.cod_freg = '';
		}

		if (p_codtopo && p_codtopo.length>0) {
			TRANSMIT_OBJECT.codtopo = p_codtopo;
			TRANSMIT_OBJECT.toponimo = p_toponimo;
		}

		var fractxt = '';
		if (TRANSMIT_OBJECT.frac !== undefined && TRANSMIT_OBJECT.frac != null) {
			fractxt = TRANSMIT_OBJECT.frac;
		}

		var newtext;
		if (fractxt!=null && fractxt.length > 0) {
			newtext = TRANSMIT_OBJECT.toponimo + ', '+ TRANSMIT_OBJECT.npol + ' ' + TRANSMIT_OBJECT.frac;
		} else {
			newtext = TRANSMIT_OBJECT.toponimo + ', '+ TRANSMIT_OBJECT.npol;
		}

		var sn_dontdeleteall = true;
		AutocompleteObjMgr.setText('geocode', newtext, sn_dontdeleteall);
		
		if (p_loc) {
			TRANSMIT_OBJECT.loc = p_loc;
		} else if (p_loc !== undefined && p_loc != null) {
			TRANSMIT_OBJECT.loc = p_loc;
		}

	}
	  
	MAPCTRL.clearTransient();
	MAPCTRL.clearTemporary();

	var alllow_saving = true;
	/*
	if (!p_onhover) {
		showRetValues(null, alllow_saving);
	}
	* */
	
	var highlightIsFinal = true;
	if (p_onhover) {
		highlightIsFinal = false;
	}
	
	highlighting(
				p_codtopo,
				p_npol,
				p_loc,
				highlightIsFinal
			);	
}

function sel_full(json_rec) {
	
	var geotxt, topo, npol, frac;
	
	if (TRANSMIT_OBJECT['complloc'] === undefined) 
	{
		if (TRANSMIT_OBJECT.npol !== undefined && TRANSMIT_OBJECT.npol != null) {
			return;
			//sel_num(json_rec, false);
		} 
		else if (TRANSMIT_OBJECT.toponimo !== undefined && TRANSMIT_OBJECT.toponimo != null) {
			return;
			//sel_toponimo(json_rec, null);
		}
		return;
	}
	
	AutocompleteObjMgr.showListArea('geocode',false);

	if (typeof TRANSMIT_OBJECT.toponimo == 'undefined') {
		topo = '';
	} else {
		topo = TRANSMIT_OBJECT.toponimo;
	}

	if (typeof TRANSMIT_OBJECT.npol == 'undefined') {
		npol = '';
	} else {
		npol = TRANSMIT_OBJECT.npol;
	}

	if (typeof TRANSMIT_OBJECT.frac == 'undefined') {
		frac = '';
	} else {
		frac = TRANSMIT_OBJECT.frac;
	}

	if (typeof json_rec['areaespecial'] != 'undefined') {
		TRANSMIT_OBJECT.areaespecial = json_rec['areaespecial'];
	} else {
		TRANSMIT_OBJECT.areaespecial = '';
	}
	if (typeof json_rec['freg'] != 'undefined') {
		TRANSMIT_OBJECT.freg = json_rec['freg'];
		TRANSMIT_OBJECT.cod_freg = json_rec['cod_freg'];
	} else {
		TRANSMIT_OBJECT.freg = '';
		TRANSMIT_OBJECT.cod_freg = '';
	}

	var newtext = topo + ', '+ npol + ' ' + frac;
	newtext = newtext.trim();
	AutocompleteObjMgr.setText('geocode', newtext, true);

	deActivateUsePosBtn();
	deActivateSaveBtn();

	xval = TRANSMIT_OBJECT['complloc'][0];
	yval = TRANSMIT_OBJECT['complloc'][1];
	TRANSMIT_OBJECT.loc = [xval, yval];

	var alllow_saving = true;
	// showRetValues(null, alllow_saving);

	var highlightIsFinal = true;
	if (npol!=null && npol !== undefined && npol.length>0)
	{
		highlighting(
			TRANSMIT_OBJECT.codtopo,
			npol,
			[xval, yval],
			highlightIsFinal
		);
	}
	else
	{
	    console.log('-----------     809 Condição ausência npol em sel_full   ---------------');
	    console.log('       TRANSMIT_OBJECT:');
	    console.log(TRANSMIT_OBJECT);
	    console.log('       json_rec:');
	    console.log(json_rec);
	    console.log('------------------------------------------------------------------------');
	}
}

class LocAutoCompleter extends AutoCompleter {

	constructor(p_name,  p_url, p_initial_req_payload, p_widgets) {
		super(p_name,  p_url, p_initial_req_payload, p_widgets);
		this.test_mode = false;
	}

	setRecRowAndHoveringEvts(p_tr, p_rec) {

		let td = document.createElement('td');
		p_tr.appendChild(td);				
		td.insertAdjacentHTML('afterbegin',p_rec.lbl);

		// hovering
		if (p_rec.npol !== undefined && p_rec.lbl.substring(0,3) !== '...') {
			(function(p_tr, p_rec) {
				attEventHandler(p_tr, 'mouseover', function(e) {	
					
					//QueriesMgr.executeQuery("numPol", [p_rec.cod_topo, p_rec.npol], false);
					console.log("p_rec:", p_rec);

					sel_num(p_rec.cod_topo, p_rec.toponimo, p_rec.npol, p_rec.npoldata.areaespecial, 
						p_rec.npoldata.freguesia, p_rec.npoldata.cod_freg, true, p_rec.pt, false);
					
				});
			})(p_tr, p_rec);
		}	
	}

	recSelectionEvt(p_rec) {
		if 	(p_rec.npol === undefined) {	
			// WORKING	
			if (p_rec.cod_topo !== undefined) {
				// aumentar o enve
				this.selToponym(p_rec.cod_topo, p_rec.env, []);
				//QueriesMgr.executeQuery("eixosVia", [p_rec.cod_topo], false);
			}
		} else {
			//QueriesMgr.executeQuery("numPol", [p_rec.cod_topo, p_rec.npol], false);
			sel_num(p_rec.cod_topo, p_rec.toponimo, p_rec.npol, p_rec.npoldata.areaespecial, p_rec.npoldata.freguesia, p_rec.npoldata.cod_freg, false, p_rec.pt, true);
		}
	}

	recvPayloadProcessing(p_resptxt) {

		let curstr, recs = [], cont = this.recvPayload;

		if (cont["error"] !== undefined || cont["out"] === undefined) {
			console.error('response:'+p_resptxt);
			return;
		}

		let ot = cont["out"];

		if (this.test_mode && console!=null) {
			console.log('response:'+p_resptxt);
			console.log('tiporesp:'+ot["tiporesp"]);
			console.log('curstr:'+cont["curstr"]);
		}

		if (cont["out"]["tiporesp"] == 'partial') {
			if (cont["typeparse"] !== undefined && 
					cont["typeparse"]["suggestions"] !== undefined &&
					cont["typeparse"]["suggestions"].length > 0) {
				for (let i=0; i<cont["typeparse"]["suggestions"].length; i++) {
					recs.push({
							'istipo': true,
							'cont': cont["typeparse"]["suggestions"][i],
							'lbl': '<i>'+this.tipoLabel+'</i> <b>' + cont["typeparse"]["suggestions"][i] +  '</b>'});
				}
			};
			
			if (cont["toponyms"] !== undefined && cont["toponyms"]["list"] !== undefined && cont["toponyms"]["list"].length > 0) {
				
				for (var i=0; i<cont["toponyms"]["list"].length; i++) {
					recs.push({'cod_topo': cont["toponyms"]["list"][i].cod_topo,
							'lbl': cont["toponyms"]["list"][i].toponimo,
							'cont': cont["toponyms"]["list"][i].toponimo,
							'env': cont["toponyms"]["list"][i].env
							});
				}
				if (cont["toponyms"]["rowcount"] > cont["toponyms"]["list"].length) {
					recs.push({
							'lbl': '... mais ...'
							});
				}
				
			} else if (ot["str"] !== undefined) {
				
				curstr = this.getText().toLowerCase();
				if (curstr.indexOf(ot.str.toLowerCase()) < 0) {				
					recs = [{
							'lbl': ot.str, 
							'cont': ot.str 
							}];
				}
			}

			this.setCurrentRecords(recs, false);
		
		} else if (ot["tiporesp"] == 'pick') {

			clearPublishingWidgets();
			
			if (cont["numbers"]) {
				for (var i=0; i<cont["numbers"].length; i++) {
					rec = cont["numbers"][i];
					recs.push({
							'cod_topo': rec.cod_topo,
							'toponimo': rec.toponym,
							'npol': rec.npol,
							'npoldata': rec.npoldata,
							'pt': rec.pt,
							'lbl': rec.toponym + ' ' +rec.npol,
							'cont': rec.toponym + ' ' +rec.npol
							});
				}
			}
			
			this.setCurrentRecords(recs, true);						

			this.getTextEntryWidget().style.color = 'black';
			this.setText('geocode', '', true);

		} else if (ot['tiporesp'] == 'topo' || ot['tiporesp'] == 'npol' || ot['tiporesp'] == 'full') {

			recs = [];
			let nprec;
			
			if (ot['tiporesp'] == 'topo') {
				
				if (ot['errornp'] !== undefined) {
					recs.push({
							'notfound': true,
							'lbl': '<i>'+this.notFoundLabel+'</i> ' + ot.toponym + ' <b><s>' +ot.errornp + '</s></b>'
						});
				}
				
				if (cont["numbers"]) {
					for (var i=0; i<cont["numbers"].length; i++) {
						nprec = cont["numbers"][i];
						recs.push({
								'cod_topo': ot.cod_topo,
								'toponimo': ot.toponym,
								'npol': nprec.npol,
								'npoldata': nprec.npoldata,
								'pt': nprec.pt,
								'lbl': ot.toponym + ' <b>' +nprec.npol + '</b>',
								'cont': ot.toponym + ' ' +nprec.npol
								});
					}
				} else {
						recs.push({
								'cod_topo': ot.cod_topo,
								'toponimo': ot.toponym,
								'lbl': ot.toponym,
								'cont': ot.toponym
								});
					
				}

				if (recs.length > 0) {
					this.setCurrentRecords(recs, false);	
				}

				if (recs.length == 1) {
					this.selToponym(ot.cod_topo, ot.ext, ot.loc);
				}
				
			} else {

				console.log(cont);


				recs.push({
						'cod_topo': ot.cod_topo,
						'toponimo': ot.toponym,
						'npol': ot.npol,
						'npoldata': ot.npoldata,
						'pt': ot.loc,
						'lbl': ot.toponym + ' <b>' +ot.npol + '</b>',
						'cont': ot.toponym + ' ' +ot.npol
						});
						
				//copyToClipboard(ot.cod_topo + ' ' + ot.toponym + ' ' +ot.npol);

				this.setCurrentRecords(recs, false);	
				
				let cod_topo = ot.cod_topo;
				// o toponimo 'oficial' assoicado a este número é outro ...
				if (ot.npoldata.cod_topo_np !== undefined)	{
					cod_topo = ot.npoldata.cod_topo_np;
				}	

/*				
				QueriesMgr.executeQuery("eixosVia", [cod_topo], false);
				QueriesMgr.executeQuery("numPol", [cod_topo, ot.npol], false);
				*/

				console.log(ot);

				//this.selAddress(ot.cod_topo, ot.ext, ot.loc);

				//sel_num(cod_topo, ot.toponym, ot.npol, ot.npoldata.areaespecial, ot.npoldata.freguesia, ot.npoldata.cod_freg, false, ot.loc, true);
			}
		}		
	}	
	
	enterHandler(p_rec) {
		let len, ret = false;
		if (p_rec) {
			if (p_rec.cont !== undefined) {
				len = this.setText(p_rec.cont);
				if (len > 0) {
					this.activateCleanButton(true);
				} else {
					this.deleteHandler();
				}	
			}
			if (p_rec.cod_topo !== undefined) {
				// aumentar o enve
				let loc = [];
				if (p_rec.pt !== undefined) {
					loc.push(p_rec.pt[0]);
					loc.push(p_rec.pt[1]);
				}
				
				//QueriesMgr.executeQuery("eixosVia", [p_rec.cod_topo], false);
				//console.log("cod_topo:", p_rec.cod_topo);

				if (p_rec.env !== undefined) {
					
					/*
					let env = new Envelope2D();
					env.setMinsMaxs(p_rec.env[0], p_rec.env[1], p_rec.env[2], p_rec.env[3]);
					env.expand(1.2);
					sel_toponimo(p_rec.cont, p_rec.cod_topo, "", env.getArray(), loc, false);
					*/
					
					this.selToponym(p_rec.cod_topo, p_rec.env, loc)
				} else {
					//sel_toponimo(p_rec.cont, p_rec.cod_topo, "", null, loc, false);
					this.selToponym(p_rec.cod_topo, null, loc)
				}
				this.showRecordsArea(false);
			}
			ret = true;
		}
		return ret;
	}

	selToponym(p_codtopo, p_ext, p_loc) {
		// para implementar		em classe estendida	
		throw new Error("selToponym not implemented");	
	}
}

LocAutoCompleter.prototype.tipoLabel = "tipo";
LocAutoCompleter.prototype.notFoundLabel = "não-encontrado";