var MAPCFG = {
	"mapname": "gou",	
	"bgcolor": "#f9f4f9",
	"scale": 5000.0 , 
	"terrain_center": [-40094.0,164608.0],
	"maxscaleview": {
		"scale": 30000,
		"terrain_center": [-41200.0,166000.0]
	},
	"scalewidgets": ["sclval"],
	"lang": "pt",
	"i18n_text": {
		"pt": {
			"LEG": "Legenda",
			"OVERLAP": "Sobreposição",
			"GAP": "Lacuna",
			"TOPOERRORS": "Anomalias topologia",
			"LOTESGOU": "Lotes GOU",
			"GOU": "Processos",
			"ALV_SRU": "Alvarás SRU",
			"PEC_ALV_FMT": ["1 alvará", "{0} alvarás"],
			"PEC_SRU_GT": ["", "{0} alvarás ou mais"]
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
		"widget_hiding_during_refresh_mgr": "LegendViz",
		"toollayeractions": {
			"picker": {
				"mousemove": {
					"VG_LOTESGOU": "InteractionMgr.mousemove",
					"ALV_SRU": "InteractionMgr.mousemove"
				},
				"mouseup": {
					"GOU_OVER": "InteractionMgr.mouseup",
					"VG_LOTESGOU": "InteractionMgr.mouseup",
					"ALV_SRU": "InteractionMgr.mouseup"
				}							
			}
		}
	},
	"baseurl": "https://marselha.cm-porto.net/riscosrv_v2bdt_dev",
	"baseraster": "DGT_2018",
	"lnames": [ "ALV_SRU", "GOU_OVER",  "VG_LOTESGOU", "EV","NPOLPROJ"],
	"rasternames": [],
	"lconfig": {
		"VG_LOTESGOU": {
			"name": "View GOU",
			"visible": true,
			"labelkey": "GOU",
			/* "thematic_control": "thematic_widget", */
			"condstyle": {
				"default": {
					"strokecolor": "#ff5e32ff",  
					"linewidth": 2,	
					"fill": "rgba(204, 204, 204, 0.5)",
				},
				/*"perattribute": {
					"_#ALL#_": [
						{
							"f": thematicsymb_GOU
						}
					]
				}*/
			},						
			"label": {
				"attrib": "cod_sig",
				"style": {
					"font": "15px Arial",
					"placementtype": "CENTER",
					"baseline": "MIDDLE",
					"scalelimits": {
						"top": 2000
					},
					"fill": "#ffa68e",
					"shadowcolor": "#000",
					"shadowoffsetx": 2,
					"shadowoffsety": 2,
					"shadowblur": 2,
					"backgroundependent": {
						"CART98": {
							"shadowoffsetx": 1,
							"shadowoffsety": 1,
							"shadowblur": 1,
							"fill": "#e2613fff"
						}
					}

				}
			},
			"scalelimits": {
				"top": 10000
			},
			"index": {
				"name": "LGOU_IX",
				"keys": ["GID"],
				"items": ["OID"]
			}
		},
		"GOU_OVER": {
			"name": "Anomalias topologia",
			"visible": true,
			"labelkey": "TOPOERRORS",
			"condstyle": {
				"default": {
					"strokecolor": "green",
					"linewidth": 2,					
					"fill": "rgba(0, 0, 255, 0.5)"
				},
				"perattribute": {
					"reltype": [
						{
							"f": function(testval) {
									return (testval.toLowerCase() == "overlap");
								},
							"style": {
								"labelkey": "OVERLAP",
								"strokecolor": "#00a8e6ff",
								"fill": "#fff5e080",
								"linewidth": 3
							}
						},
						{
							"f": function(testval) {
									return (testval.toLowerCase() == "gap");
								},
							"style": {
								"labelkey": "GAP",
								"strokecolor": "#ffc44f",
								"fill": "#00a8e680",
								"linewidth": 3
							}
						}
					]
				}
			},						
			"scalelimits": {
				"top": 10000
			}						
		},	
		"ALV_SRU": {
			"name": "Alv. SRU em curso",
			"visible": true,
			"labelkey": "ALV_SRU",
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
				"top": 10000
			}
		},			
		"IMG16": {
			"rasterbaseurl": "/img16",
			"filterfunc": "toGrayScaleImgFilter"
		},	
		"DGT_2018": {
			"rasterbaseurl": "/orto2018",
			"filterfunc": "toGrayScaleImgFilter"
		},	
		"NPOLPROJ": {
			"name": "",
			"allowmuting": false,
			"label": {
				"attrib": "n_policia",
				"style": {
					"font": "14px Helvetica",
					"stroke": "#fff",
					"fill": "#fff",
					"baseline": "MIDDLE",
					"placementtype": "LEADER",
					"leader_arrowfillcolor": "#d1d5ff",
					"leader_textfillcolor": "#fff",
					"leader_textstrokecolor": "#fff",
					"leader_textlinewidth": 0.3,
					"leader_arrowmaxscale": 1200
					/*"backgroundependent": {
						"CART98": {
							"leader_textfillcolor": "#000",
							"leader_arrowfillcolor": "#2a348c"
						}
					} */
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
					"fill": "#3A3A3A",
					"stroke": "#3A3A3A", 
					"placementtype": "ALONG",
					"baseline": "MIDDLE",
					"bgstyle": "rgba(255, 255, 255, 0.5)"
				},
			},
			"scalelimits": {
				"top": 10000
			},
			"index": {
				"name": "TOPO_IX",
				"keys": ["cod_topo"],
				"items": ["oid", "toponimo"]			
			}
		}


	}
};



