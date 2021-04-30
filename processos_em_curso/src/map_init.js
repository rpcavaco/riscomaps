
var MapsMgr = {
	
	//*** CONFIG ***
	general_logging_on: false,
	calls_sequence_logging_on: true,
	layer_notviz_image_params: ["media/not_viz_grey.png", 10, 0],
	hlLayer: "NPOLPROJ",
	
	maps: {},
	active: null,
	addMap: function(p_key, p_domid, p_cfgdict) {
		if (this.maps[p_key] === undefined) {
			this.maps[p_key] = new MapController(p_domid, p_cfgdict, this.calls_sequence_logging_on);
			if (this.active == null) {
				this.active = p_key;
			}
			this.maps[p_key].layer_notviz_image_params = this.layer_notviz_image_params;
		}
		return this.maps[p_key];
	},
	get: function(p_key) {
		if (this.maps[p_key] === undefined) {
			throw new Error("MapsMgr.get: no map key like "+p_key);
		}
		return this.maps[p_key];
	},
	getActive: function() {
		return this.get(this.active);
	},
	setActive: function(p_key) {
		if (this.maps[p_key] === undefined) {
			throw new Error("MapsMgr.setActive: no map key like "+p_key);
		}
		this.active = p_key;
	},
	registerOnDrawFinish: function(p_mapkey, p_registrationkey, p_func, opt_noclobber) {
		let map, klist;
		if (p_mapkey == "all") {
			klist = Object.keys(this.maps);
		} else {
			klist = [p_mapkey];
		}
		for (let i=0; i<klist.length; i++) {
			map = this.get(klist[i]);
			map.registerOnDrawFinish(p_registrationkey, p_func, opt_noclobber);
		}
	},
	registerOnClearTransientLayer: function(p_mapkey, p_func) {
		let map, klist;
		if (p_mapkey == "all") {
			klist = Object.keys(this.maps);
		} else {
			klist = [p_mapkey];
		}
		for (let i=0; i<klist.length; i++) {
			map = this.get(klist[i]);
			map.registerOnClearTransientLayer(p_func);
		}
	}
};

function check_oktopick(p_map) 
{									
	var sclv = p_map.getScale();
	
	if (sclv < PICKLOCATION_SCALELIMITS.min || sclv > PICKLOCATION_SCALELIMITS.max)
	{
		if (sclv < PICKLOCATION_SCALELIMITS.min) {
			MessagesController.setMessage(MsgCtrl.getMsg("ZOOMMINSCL")+PICKLOCATION_SCALELIMITS.min, "INFO");
		}

		if (sclv > PICKLOCATION_SCALELIMITS.max) {
			MessagesController.setMessage(MsgCtrl.getMsg("ZOOMMAXSCL")+PICKLOCATION_SCALELIMITS.max, "INFO");
		}

		return false;
	}

	return true;
}

function generic_mouseup(p_map, x, y, layername, prevcall_state) 
{										
	var manageFloats = true;
	AutocompleteObjMgr.showRecordsArea('geocode',false);		

	//LoteGOUHighlighter.clear();
		
	/* var wdg = document.getElementById('popup');
	if (wdg) {
		wdg.style.visibility = 'hidden';
	}			
	wdg = document.getElementById('popup');
	if (wdg) {
		wdg.style.visibility = 'hidden';
	}	*/		

	//LoteGOUHighlighter.clearMarked();
	
	p_map.clearTransient();
	p_map.clearTemporary();
	
	console.log(p_map, x, y, layername, prevcall_state);
	
	if (!check_oktopick(p_map)) {
		return;
	}
	
	FloatersAndSelectionsManager.setLastPickPos(x, y);
	
	/*if (prevcall_state.findings === undefined || Object.keys(prevcall_state.findings).length >= 2)  {
		prevcall_state.findings = {};
	}
	prevcall_state.findings[layername] = p_map.findNearestObject(x, y, layername);
	if (Object.keys(prevcall_state.findings).length < prevcall_state.lnames.length) {
		return;
	}

	var idlote = prevcall_state.findings[tema_lotes];
	//console.log(idlote);
	var overid = prevcall_state.findings["GOU_OVER"];
	if (overid == null) {
		if (idlote != null) {
			LoteGOUHighlighter.doHighlight(idlote, true);
			manageFloats = false;
		}
	} else {
		var gofeat, gidsplits, ix, oversids=[];
		gofeat = MAPCTRL.getFeature("GOU_OVER", overid);
		if (gofeat) {
			if (gofeat.attrs.gids !== undefined) {
				gidsplits = gofeat.attrs.gids.split('_');
				if (gidsplits.length >= 0) {
					ix = MAPCTRL.getGlobalIndex("LGOU_IX");
					for (var gsi=0; gsi<gidsplits.length; gsi++) {
						if (ix[gidsplits[gsi]]!=null && ix[gidsplits[gsi]].oid!=null && ix[gidsplits[gsi]].oid.length > 0) {
							oversids.push(ix[gidsplits[gsi]].oid[0]);
						}
					}
					if (oversids.length >= 0) {
						popupFillAndShow(gofeat.attrs.reltype, oversids);
						manageFloats = false;
					}
				}
			}
		}
	}
	*/
	
	if (manageFloats) {		
		FloatersAndSelectionsManager.manage();
	}
						
}
// requer NPolHighlighter, definido em loc_interop.js
(function() {

	//** Config **
	let map = MapsMgr.addMap("main", 'viewDiv', MAPCFG);
	let ac = AutocompleteObjMgr.get("geocode");
	ac.setMap(map);
	// raio para fazer fit a circulo em volta de local seleccionado, quando não existe retângulo da área seleccionada.
	ac.setZoomRadius(120);

	MapsMgr.registerOnDrawFinish("main", "default_drawfinish",
		function (the_mctrl, p_item) {
			if (p_item == 'normal') {
				//NPolHighlighter.doHighlightMarked();
			}
			if (p_item != 'localdraw' && MapsMgr.general_logging_on) {
				console.log('+-'+p_item+'----------------- Map: main -----------');
				console.log(the_mctrl);
				console.log('+---------------------------------------------');
			}
		},
		false // opt_noclobber
	);

	/*MapsMgr.registerOnClearTransientLayer("main", 
		function (the_mctrl, p_item) {
			NPolHighlighter.transientLayerCleared();
		}
	);*/
	
	let the_map;
	for (let k in MapsMgr.maps) {
		the_map = MapsMgr.get(k);
	   
	    // TODO - verificar se está mesmo a ser usado
		the_map.setMessenger(
			function(p_msg) {
				MessagesController.setMessage(p_msg, true, false);
			}
		);
		the_map.setWarner(
			function(p_msg) {
				MessagesController.setMessage(p_msg, true, true);
			}
		);

		// um só mapa base raster
		the_map.setBackgroundRasterLyrName("IMG16");
		
		the_map.registerOnPanZoom(
			function () {
				// esconder form de dados e esconder a mensagem flutuante
				AutocompleteObjMgr.showRecordsArea('geocode', false);
				MessagesController.hideMessage();
				
				var cen = [];
				the_map.getCenter(cen);
				
				var scl = the_map.getScale();
				
				// TODO - verificar que funciona
				
				// marcar centro em cookie
				setCookie("terrain_center", cen[0] + "_" + cen[1] + "; max-age=259200");
				setCookie("mapscale", scl + "; max-age=259200");			
			}
		);

		the_map.registerOnDrawing_FeatureTransform(	
			function(p_layername, storedfeatdata) {
				
				let HC_pt=[];
				let HC_ret=[];
				
				// TODO - para que serve ? 
				if (p_layername == MapsMgr.hlLayer) 
				{
					if (storedfeatdata.path_levels > 1) {
						throw new Error("valor de path_levels inesperado ("+storedfeatdata.path_levels+") para NPOLPROJD no evento onDrwaing_FeatureTransform");
					}
					geom.twoPointAngle([storedfeatdata.points[0], storedfeatdata.points[1]], 
									[storedfeatdata.points[2], storedfeatdata.points[3]], 
									HC_ret);
					if (HC_ret[1] == 2 || HC_ret[1] == 3) {
						geom.applyPolarShiftTo([storedfeatdata.points[0], storedfeatdata.points[1]], HC_ret[0], 6, HC_pt);
						storedfeatdata.points.unshift(parseInt(Math.round(HC_pt[1])));
						storedfeatdata.points.unshift(parseInt(Math.round(HC_pt[0])));
					} else {
						geom.applyPolarShiftTo([storedfeatdata.points[0], storedfeatdata.points[1]], HC_ret[0]+Math.PI, 6, HC_pt);
						storedfeatdata.points.unshift(parseInt(Math.round(HC_pt[1])));
						storedfeatdata.points.unshift(parseInt(Math.round(HC_pt[0])));
					}
				}	
			}
		);

		// Primeiro display do mapa
		the_map.refresh();

	}
	
	
	//init();
	
})();

function sru_mrk_sizes(p_scale) {
	
	ret = 2;
	
	if (p_scale > 8000) {  // maior q 3k
		ret = 6; 
	} else if (p_scale > 5000) {  // 2000-3000
		ret = 8;
	} else if (p_scale > 3000) {  // 2000-3000
		ret = 10;
	} else if (p_scale > 2000) {  // 2000-3000
		ret = 12;
	} else if (p_scale > 1000) {  // 1000-2000
		ret = 14;
	} else if (p_scale > 500) {  // 600-1000
		ret = 16;
	} else { 
		ret = 18;    // < 600
	}
	return ret;
}

function sru_markers(p_ctx, p_pt, p_scale, p_oid, p_featattrs) {

	const sz = sru_mrk_sizes(p_scale);	
	
	p_ctx.save();

	p_ctx.strokeStyle = "#40a3a3";
	
	if (p_featattrs.cnt > 1) {
		p_ctx.fillStyle = COLORRAMPS.RAMPS4X4.green_blue.b;
	} else {
		p_ctx.fillStyle = COLORRAMPS.RAMPS4X4.green_blue.c;
	}
	p_ctx.lineWidth = 3;

	p_ctx.beginPath();
	p_ctx.arc(p_pt[0], p_pt[1], sz, 0, 2*Math.PI);
 
	p_ctx.stroke();
	p_ctx.fill();	
	
	p_ctx.restore();
	
}