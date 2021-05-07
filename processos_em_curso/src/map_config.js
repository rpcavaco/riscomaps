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
			"PEC_NAOLOT": "Alvarás de obras em curso",
			"PEC_ALV_FMT": ["1 alvará", "{0} alvarás"],
			"PEC_ALV_GT": "3 alvarás ou mais",
			"PEC_ENT": "Operações urbanísticas em curso",
			"PEC_ENT_FMT": ["1 processo", "{0} processos"],
			"PEC_ENT_GT": "3 processos ou mais",
			"PEC_LOT": "Alvarás de loteamento em curso",
			"PEC_SRU": "Alvarás de obras SRU em curso",
			"PEC_SRU_GT": ["", "{0} alvarás ou mais"],
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
					"pec_naolot": "InteractionMgr.mousemove"
				},
				"mouseup": {
					"pec_naolot": "InteractionMgr.mouseup"
				}							
			}
		}
	},
	"baseurl": "https://munisig.cm-porto.pt/riscobdtdev",
	// "lnames": ["pec_naolot", "pec_entrada", "pec_lot", "pec_sru", "EV"], //,"NPOLPROJ"],
	"lnames": ["pec_naolot", "pec_lot", "pec_sru"], //,"NPOLPROJ"],
	"rasternames": ["IMG16"],
	"lconfig": {
		"pec_naolot": {
			"name": "Alvarás em curso",
			"labelkey": "PEC_NAOLOT",
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
								"labelkey": "PEC_ALV_FMT",
								"labelvalue": 1,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.ora_green.d,	
								"fillopacity": 0.7,
								"linewidth": 1
							}
						},
						{
							"f": function(testval) {
								return (testval == 2);
							},
							"style": {
								"labelkey": "PEC_ALV_FMT",
								"labelvalue": 2,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.ora_green.c,
								"linewidth": 1
							}
						},
						{
							"f": function(testval) {
								return (testval == 3);
							},
							"style": {
								"labelkey": "PEC_ALV_FMT",
								"labelvalue": 3,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.ora_green.b,
								"linewidth": 1
							}
						},
						{
							"f": function(testval) {
								return (testval > 3);
							},
							"style": {
								"labelkey": "PEC_ALV_GT",
								"fill": COLORRAMPS.RAMPS4X4.ora_green.a,
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
		"pec_entrada": {
			"name": "Operações em curso",
			"visible": false,
			"labelkey": "PEC_ENT",
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
								"labelkey": "PEC_ENT_FMT",
								"labelvalue": 1,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.mag_ora.d,	
								"fillopacity": 0.7,
								"linewidth": 1
							}
						},
						{
							"f": function(testval) {
								return (testval == 2);
							},
							"style": {
								"labelkey": "PEC_ENT_FMT",
								"labelvalue": 2,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.mag_ora.c,
								"linewidth": 1
							}
						},
						{
							"f": function(testval) {
								return (testval == 3);
							},
							"style": {
								"labelkey": "PEC_ENT_FMT",
								"labelvalue": 3,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.mag_ora.b,
								"linewidth": 1
							}
						},
						{
							"f": function(testval) {
								return (testval > 3);
							},
							"style": {
								"labelkey": "PEC_ENT_GT",
								"fill": COLORRAMPS.RAMPS4X4.mag_ora.a,
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
		"pec_lot": {
			"name": "Alv. loteamento em curso",
			"visible": false,
			"labelkey": "PEC_LOT",
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
								"labelkey": "PEC_ALV_FMT",
								"labelvalue": 1,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.blue_mag.d,	
								"fillopacity": 0.7,
								"linewidth": 1
							}
						},
						{
							"f": function(testval) {
								return (testval > 1);
							},
							"style": {
								"labelkey": "PEC_ALV_FMT",
								"labelvalue": 2,
								"strokecolor": "#40a3a3",
								"fill": COLORRAMPS.RAMPS4X4.blue_mag.a,
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
		"pec_sru": {
			"name": "Alv. SRU em curso",
			"visible": true,
			"labelkey": "PEC_SRU",
			"markerfunction": "sru_markers",	
			"aoi": [ -41900.0, 163200.0, -39400.0, 164900.0 ],
			"condstyle": {
				"perattribute": {
					"cnt": [
						{
							"f": function(testval) {
								return (testval == 1);
							},
							"style": {
								"labelkey": "PEC_ALV_FMT",
								"labelvalue": 1,
								"tocscale": 15000,
								"tocattrs": { "cnt": 1 }
							}	
						},
						{
							"f": function(testval) {
								return (testval > 1);
							},
							"style": {
								"labelkey": "PEC_SRU_GT",
								"labelvalue": 2,
								"tocscale": 15000,
								"tocattrs": { "cnt": 2 }
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
						"top": 39900
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



