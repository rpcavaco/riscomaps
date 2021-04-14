var MAPCFG = {
	"mapname": "gou_pec",	
	"bgcolor": "#f9f4f9",
	"scale": 5000.0 , 
	"terrain_center": [-40094.0,164608.0],
	//"scalewidgets": ["sclval"],
	"maxscaleview": {
		"scale": 30000,
		"terrain_center": [-41200.0,166000.0]
	},
	"lang": "pt",
	"i18n_text": {
		"pt": {
			"LEG": "Legenda",
			"PEC_NAOALV": "Alvarás de obras em curso"
		}
	},
	"controlssetup": {
		"controlwidgets": "minimalLT",
		"searchtolerance_func": function (p_sclval) { 
			if (p_sclval > 2000) {
				return 5;
			} else if (p_sclval > 1000) {
				return 4;				
			} else if (p_sclval > 750) {
				return 3;				
			} else if (p_sclval > 500) {
				return 2;				
			} else if (p_sclval > 200) {
				return 1;
			} else if (p_sclval > 100) {
				return 0.5;
			} else {
				return 0.25;
			}
		},
		"tools": ["picker"],
		"coordswidgets": ["mouseposdiv"],
		"legendcfg": {
			"visibility_widget_name": "legend_container", 
			"legcell_dims": { "w": 40, "h": 20 },
			"elem_height": 27,
			"max_cols": 4
		},
		//"widgetnames_hide_during_refresh": ["legendctrl", "visctrl"],
		"toollayeractions": {
			"picker": {			
				"mousemove": {
					"pec_naoalv": "InteractionMgr.mousemove"
				},
				"mouseup": {
					"pec_naoalv": "InteractionMgr.mouseup"
				}							
			}
		}
	},
	"baseurl": "https://munisig.cm-porto.pt/riscobdtdev",
	"lnames": ["pec_naoalv", "EV"], //,"NPOLPROJ"],
	"rasternames": ["IMG16"],
	"lconfig": {
		"pec_naoalv": {
			"name": "Alvarás em curso",
			"visible": true,
			"labelkey": "PEC_NAOALV",
			"condstyle": {
				"default": {
					"strokecolor": "#ff5e32ff",  
					"linewidth": 1,	
					"fill": "rgba(204, 204, 204, 0.5)"
				},
				"perattribute": {
					"cnt": [
						{
							"f": function(testval) {
								return (testval == 1);
							},
							"style": {
								"strokecolor": "#40a3a3",
								"fill": "#75e4fa80",
								"linewidth": 1
							}
						}
					]

				}
			},						
			"label": {
			},
			"scalelimits": {
				"top": 30000
			}
		},						
		"IMG16": {
			"rasterbaseurl": "/img16",
			"filterfunc": "toGrayScaleImgFilter"
		},	
		"NPOLPROJ": {
			"name": "",
			"allowmuting": false,
			"label": {
				"attrib": "n_policia",
				"style": {
					"font": "12px Helvetica",
					"stroke": "#fff",
					"fill": "#fff",
					"baseline": "MIDDLE",
					"placementtype": "LEADER",
					"leader_arrowfillcolor": "#d1d5ff",
					"leader_textfillcolor": "#fff",
					"leader_textstrokecolor": "#000",
					"leader_textlinewidth": 0.3,
					"leader_arrowmaxscale": 1200,
					"backgroundependent": {
						"CART98": {
							"leader_textfillcolor": "#000",
							"leader_arrowfillcolor": "#2a348c"
						}
					}
				}
			},							
			"scalelimits": {
				"top": 1500
			},
			"index": {
				"name": "NP_IX",
				"keys": ["COD_TOPO","N_POLICIA"],
				"items": ["OID"]
			}
		},
		"NPOLICIA": {
			"comment": "Serve apenas dados alfanuméricos",
			"name": "Núm.polícia",
			"onlydata": true, 
			"allowmuting": false,
			"scalelimits": {
				"top": 1800
			},
			"index": {
				"name": "NP2_IX",
				"keys": ["COD_TOPO","N_POLICIA"],
				"items": ["OID","COD_FREG","DESIGNACAO","AE"]
			}
		},
		"EV": {
			"name": "Toponímia",
			"allowmuting": false,
			"label": {
				"attrib": "toponimo",
				"style": {
					"font": "16px Arial",
					"fill": "#606060",
					"placementtype": "ALONG",
					"baseline": "MIDDLE",
					"bgstyle": "rgba(255, 255, 255, 0.5)",
					"scalelimits": {
						"top": 9900
					}
				},
			},
			"index": {
				"name": "TOPO_IX",
				"keys": ["cod_topo"],
				"items": ["oid", "toponimo"]			
			}
		}


	}
};



