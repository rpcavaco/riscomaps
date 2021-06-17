
function AC_checkInputTimer(p_acompleter) {
	
	p_acompleter.checkInputCnt = p_acompleter.checkInputCnt + 1;
	
	const cntlimit = p_acompleter.maxCheckInputCnt;
	
	if (p_acompleter.checkInputCnt >= cntlimit) {
		p_acompleter.checkInputCnt = 0;
		clearInterval(p_acompleter.checkInputTimerID);
		p_acompleter.checkInputTimerID = null;
		p_acompleter.prepareSend(false);
	}   
	
}

class AutoCompleter {
	constructor(p_name, p_url, p_initial_req_payload, p_widgets) {

		if (p_initial_req_payload == null) {
			throw new Error("no initial payload defined");
		}

		if (p_widgets == null) {
			throw new Error("no widgetids defined");
		}
		if (p_widgets["parentdiv"] === undefined) {
			throw new Error("no parentdiv widget");
		}
		if (p_widgets["textentry"] === undefined) {
			throw new Error("no text entry widget");
		}
		if (p_widgets["cleanbutton"] === undefined) {
			throw new Error("no cleanbutton widget");
		} 
		if (p_widgets["recordsarea"] === undefined) {
			throw new Error("no recordsarea widget");
		}

		this.name = p_name;
		this.URL = p_url,
		this.reqPayload = clone(p_initial_req_payload);
		this.recvPayload = null;
		this.widgets = clone(p_widgets);
		this.prevEnteredText = "";
		this.checkInputTimerID = null;
		this.checkInputCnt = 0;
		this.currentRecords = [];
		this.enteredtext = "";
		this.xhr = null;
		this.currentMouseClick = null;

		// replace ids by objects
		let id, w;
		for (let k in this.widgets) {
			if (typeof this.widgets[k] == 'string') {
				id = this.widgets[k];
				w = document.getElementById(id);
				if (w) {
					this.widgets[k] = w;
				} else {
					console.warn("'"+k+"' widget with id '"+id+"' was not found.");
				}
			}
		}
	}

	clearRecv() {
		this.recvPayload = null;
	}

	afterCleanSearch() {
		// para implementar			em classe estendida
	}

    cleanSearch() {

		this.activateCleanButton(false);

		this.getTextEntryWidget().style.color = 'black';        
		this.setText('');

		this.showRecordsArea(false);
		
		this.afterCleanSearch();
	}

	setCurrentMouseClick(p_mouse_pt) {
		this.currentMouseClick = p_mouse_pt;
	}

    abortPreviousSearchCall() {
    	if (this.xhr != null) {
    		this.xhr.abort();
    		this.xhr = null;
    	}
    }

	execSearch(p_inptxt) {

		if (p_inptxt.trim().length == 0) {
			return;
		}

		this.beforeExecSearch();

		this.reqPayload["curstr"] = p_inptxt;
		this.abortPreviousSearchCall();	
		(function(p_this) {	
			p_this.xhr = ajaxSender(p_this.URL, function() { 
				p_this.afterSearchExec(this); 
			}, JSON.stringify(p_this.reqPayload), p_this.xhr);
		})(this);
	}

	prepareSend(b_doforce) {
		this.enteredtext = this.enteredtext.trim();
		if (b_doforce || this.enteredtext != this.prevEnteredText) {
			if (this.checkInputTimerID) {
				clearInterval(this.checkInputTimerID);
				this.checkInputTimerID = null;
			}
			
			let inptxt = this.widgets["textentry"].value;
			if (inptxt!=null && inptxt.length>0) {
				this.execSearch (inptxt);
			}		
		}		
		this.prevEnteredText = this.enteredtext;
	}

	/*send() {
		if (this.checkInputTimerID != null) {
			clearInterval(this.checkInputTimerID);
			this.checkInputTimerID = null;
		}
		this.prepareSend(true);
	}*/

	checkInputTimer() {

		this.checkInputCnt++;

		console.log("133: "+this.checkInputCnt+" >= "+this.maxCheckInputCnt);

		if (this.checkInputCnt >= this.maxCheckInputCnt) {
			this.checkInputCnt = 0;
			clearInterval(this.checkInputTimerID);
			this.checkInputTimerID = null;
			this.prepareSend(false);
		}	
		
	}

	activateCleanButton(do_enable) {
		//console.log('activateCleanWidgetDisplay '+name+' enable:'+do_enable);
	    if (this.widgets["textentry"]!=null) {
			if (do_enable) {
				this.widgets["textentry"].style.backgroundImage = 'none';
			} else {
				this.widgets["textentry"].style.backgroundImage = '';
			}
		}
		
	    if (this.widgets["cleanbutton"]) {
			if (this.widgets["cleanbutton"].tagName.toLowerCase() == 'div') {
				if (do_enable) {
					this.widgets["cleanbutton"].style.visibility = 'visible';
				} else {
					this.widgets["cleanbutton"].style.visibility = 'hidden';
				}			
			} else {
				this.widgets["cleanbutton"].disabled = !do_enable;
			}
	    }
	}

	getTextEntryWidget() {
		return this.widgets["textentry"];
	}	

	showRecordsArea(do_show) {
		let wd, sty2, w;
		if (do_show) 
		{
			if (this.widgets["recordsarea"] != null && 
					this.currentRecords.length > 0)
			{
				
				this.widgets["recordsarea"].style.display = '';
				const sty = window.getComputedStyle(this.widgets["textentry"]);

				wd = findSiblingsByTagName(this.widgets["recordsarea"], 'table', true);
				if (wd) {
					wd.style.width = sty.width;
					sty2 = window.getComputedStyle(wd);
					w = parseInt(sty2.width);
					if (w > 420) {
						wd.style.fontSize = '16px';
					} else if (w > 300) {
						wd.style.fontSize = '14px';
					} else if (w > 190) {
						wd.style.fontSize = '12px';
					}
				}
				this.activateCleanButton(true);
			}	
		}			
		else
		{
			if (this.widgets["recordsarea"] != null) {
				this.widgets["recordsarea"].style.display = 'none';
			}
		}
	}

	recordsAreaIsVisible() {
		let ret = null;
		if (this.widgets["recordsarea"] != null) {
			ret = (this.widgets["recordsarea"].style.display != 'none');
		}
		return ret;
	}

	getRecord(p_idx) {
		let ret = null;
		if (this.currentRecords.length > 0) {
			ret = this.currentRecords[p_idx];
		}
		return ret;
	}

	setCurrentRecords(p_in_recs, opt_collect_mousepoint) {

		// Create results HTML table
		const table = document.createElement('table');
		table.setAttribute('id', this.name + "_recstable");
		
		let the_elem = this.widgets["recordsarea"];	
		while (the_elem.firstChild) {
			the_elem.removeChild(the_elem.firstChild);
		}
		this.widgets["recordsarea"].appendChild(table);

		function markLocation() {
		
			this.clearRecv();	
			// TODO - adaptar obj ESRI, deixando a porta aberta para um outro mais genérico
			/*
			this.recvPayload = {
				out: {
					loc: this.currentMouseClick
				}
			}
			*/

	
			this.showRecordsArea(false);
			this.activateCleanButton(true);
	
			/*
			TODO
		
			Desenho 

			NPolHighlighter.clear();
			NPolHighlighter.clearMarked();
			MAPCTRL.clearTransient();
			MAPCTRL.clearTemporary();
			
			
			drawPickMarker(MAPCTRL, markr_coords, true, true);	
			*/
		}

		if (opt_collect_mousepoint) {
			
			const tr = document.createElement('tr');
			setClass(tr, 'hovering');
			table.appendChild(tr);
			
			td = document.createElement('td');
			tr.appendChild(td);	
			
			td.insertAdjacentHTML('afterbegin',this.useMousePosMsg);

			(function(p_tr, p_func) {
				attEventHandler(p_tr, 'click', function(e) {
					p_func();
				});
			})(tr, markLocation);
		}

		let tr;
		for (let i=0; i<p_in_recs.length; i++) {
			
			tr = document.createElement('tr');
			setClass(tr, 'hovering');
			if (p_in_recs[i]["notfound"] !== undefined && p_in_recs[i]["notfound"]) {
				setClass(tr, 'nostep');
			}
			table.appendChild(tr);
			
			(function(p_this, p_tr, p_rec) {
				
				attEventHandler(p_tr, 'click', function(e) {
					
					if (p_rec.lbl.substring(0,3) === '...') {
						return;
					}						
					p_this.showRecordsArea(false);					
					if 	(p_rec.cont !== undefined) {
						p_this.setText(p_rec.cont, false);
					}													
					p_this.getTextEntryWidget().focus();
					
					// método estendido
					p_this.recSelectionEvt(p_rec);
				});
			})(this, tr, p_in_recs[i]);

			// método estendido
			this.setRecRowAndHoveringEvts(tr, p_in_recs[i]);
		}

		if (p_in_recs.length < 1 && opt_collect_mousepoint) {
			// apreceria apenas a indicaÃ§Ã£o se 'usar a posiÃ§Ã£o do rato', pelo que podemos avanÃ§ar para a marcaÃ§Ã£o final e exposiÃ§Ã£o dos dados recolhidoss
			markLocation();
		} else {
			this.currentRecords = p_in_recs;
			this.showRecordsArea(true);
		}
		
	}

	emptyCurrentRecords() { 
		this.currentRecords.length = 0;
		this.showRecordsArea(false);
	}

	setText(p_textvalue, dontdeleteall) {
		
	    let dodelhandler = false;		
		if (!dontdeleteall) {			
			if (this.enteredtext.trim().length > p_textvalue.trim().length && p_textvalue.trim().length > 0) {	
				dodelhandler = true;
			}
		}
		
		if (dodelhandler) {
			this.deleteHandler();
		}

		this.enteredtext = p_textvalue;
		this.widgets["textentry"].value = p_textvalue;
		
		return this.enteredtext.length;
	}

	getText() {
		return this.widgets["textentry"].value;
	}

	deleteHandler() {
		// para implementar		em classe estendida	
		throw new Error("deleteHandler not implemented");	
	}

	enterHandler(p_record) {
		// para implementar			em classe estendida
		throw new Error("afterSearchExec not implemented");	
	}
	
	altQueriesHandler(p_trimmed_qrystr) {
		// para implementar			em classe estendida
		throw new Error("altQueriesHandler not implemented");	
	}

	bindEventHandlers() {

		/*
		p_this.widgets["parentdiv"]
		p_this.widgets["textentry"]
		p_this.widgets["cleanbutton"]
		p_this.widgets["recordsarea"]*/

		// remover sensibilidade ao rato
		attEventHandler(this.widgets["parentdiv"], 'mousemove', function(evt) { finishEvent(evt); });

		// delete
		(function(p_this) {
			attEventHandler(p_this.widgets["cleanbutton"], 'click', 
				function(evt) {
					//console.log('DEL-related event, name:'+name);
					p_this.deleteHandler();
				}
			);
		})(this);

		// text entry
		(function(p_this) {		
			let rec0, prev_listidx = -1, list_idx = -1;
			attEventHandler(p_this.widgets["textentry"], 'keyup', 
				function(evt) {
					let kc, len, enterpressed = false, target = getTarget(evt);
					if (!target) return;

					if (evt.ctrlKey && evt.key != 'Control')  {				
						return true;
					}

					if (evt["key"] !== undefined) {
						kc = evt.key;
					} else {
						kc = evt.keyCode;
					}

					if (kc == 'Enter') 
					{
						if (list_idx < 0) {
							list_idx = 0;
						}
						rec0 = p_this.getRecord(list_idx);
						if (rec0 != null) {
							p_this.enterHandler(rec0);
							list_idx = -1;
							finishEvent(evt);
							return false;
						} else {
							enterpressed = true;
						}
					} else if (kc == 'ArrowDown') {
						let tbl, trs, list_wid = p_this.widgets["recordsarea"];
						if (list_wid) {
							tbl = findSiblingsByTagName(list_wid, 'table', true);
							if (tbl) {
								trs = findSiblingsByTagName(list_wid, 'tr', false);
								if (trs) {
									if (list_idx >= (trs.length-1)) {
										return;
									} 
									if (prev_listidx >= 0) {
										trs[prev_listidx].style.backgroundColor = '#fff';
									}
									if (getClass(trs[list_idx+1]).indexOf("nostep") >= 0) {
										if (list_idx < (trs.length-2)) {
											list_idx = list_idx+2;
										} else {
											return;
										}
									} else {
										list_idx++;
									}
									trs[list_idx].style.backgroundColor = '#eee';
									prev_listidx = list_idx;
								}
							}
						}
					} else if (kc == 'ArrowUp') {
						if (list_idx <= 0) {
							return;
						} 
						let tbl, trs, list_wid = p_this.widgets["recordsarea"];
						if (list_wid) {
							tbl = findSiblingsByTagName(list_wid, 'table', true);
							if (tbl) {
								trs = findSiblingsByTagName(list_wid, 'tr', false);
								if (trs) {
									if (prev_listidx >= 0) {
										trs[prev_listidx].style.backgroundColor = '#fff';
									}
									if (getClass(trs[list_idx-1]).indexOf("nostep") >= 0) {
										if (list_idx > 1) {
											list_idx = list_idx-2;
										} else {
											list_idx = -1;
											return;
										}
									} else {
										list_idx--;
									}
									trs[list_idx].style.backgroundColor = '#eee';
									prev_listidx = list_idx;
								}
							}
						}
					} else {
						list_idx = -1;
					}
					
					let usabletxt = target.value.replace(/[ ]+/g, ' ');
					len = p_this.setText(usabletxt);
					if (len > 0) {
						p_this.activateCleanButton(true);
					} else {
						p_this.deleteHandler();
					}	

					if (p_this.checkInputTimerID != null) {
						clearInterval(p_this.checkInputTimerID);
						p_this.checkInputTimerID = null;
						p_this.checkInputCnt = 0;
					}
					
					const trimmed = usabletxt.trim();
					if (!enterpressed && p_this.prevEnteredText == trimmed) {
						finishEvent(evt);
						return false;
					}

					// Outras pesquisas ----------------------------
					const isNotAltQuery = p_this.altQueriesHandler(trimmed);
					/*if (!p_this.altQueriesHandler(trimmed)) {
						finishEvent(evt);
						return false;
					}*/
					// Final outras pesquisas ----------------------
					console.log("isNotAltQuery:", isNotAltQuery);

					if (isNotAltQuery) {
						p_this.clearMessagingWidgets();
						(function(pp_this) {
							pp_this.checkInputTimerID = setInterval(
								function() { AC_checkInputTimer(pp_this); },
								pp_this.inputTimerIntervalValue
							);
						})(p_this);
					}

					console.assert(p_this.checkInputTimerID!=null, "this.checkInputTimerID NULO!");

					finishEvent(evt);
					return false;
					
				}
			);
		})(this);			
		
	}

	beforeResponseDone(p_respobj) {
		// para implementar	em classe estendida
		throw new Error("beforeResponseDone not implemented");	
	}		

	beforeExecSearch() {
		// para implementar	em classe estendida
		throw new Error("beforeExecSearch not implemented");	
	}		

	recvPayloadProcessing(p_payload) {
		// para implementar	em classe estendida
		throw new Error("recvPayloadProcessing not implemented");	
	}		

	setContent(p_obj) {
		this.recvPayload = clone(p_obj);
		return this.recvPayload;
	}

	clearPublishingWidgets() {
		// para implementar	em classe estendida
		throw new Error("clearPublishingWidgets not implemented");	
	}

	clearMessagingWidgets() {
		// para implementar	em classe estendida
		throw new Error("clearMessagingWidgets not implemented");	
	}

	afterSearchExec(p_respobj) {
		
		if (p_respobj.readyState === p_respobj.DONE) {
			this.beforeResponseDone(p_respobj);
			this.xhr = null;

			if (p_respobj.status == 200) {
				let json_resp;
				try {
					json_resp = JSON.parse(p_respobj.responseText);
				} catch(e) {
					console.log(p_respobj.responseText);
					console.error(e);
					return;
				}

				this.emptyCurrentRecords();

				this.setContent(json_resp);
				this.recvPayloadProcessing(p_respobj.responseText);
			}
		}
	}	

}

AutoCompleter.prototype.maxCheckInputCnt = 10;
AutoCompleter.prototype.inputTimerIntervalValue = 40;
AutoCompleter.prototype.useMousePosMsg = '<i>(usar apenas a <b>posição indicada</b> com o rato)</i>';

var AutocompleteObjMgr = {

	test_mode: false,
	auto_completers: {},

	add: function(p_ac) {
		this.auto_completers[p_ac.name] = p_ac;
		return this.auto_completers[p_ac.name];
	},

	get: function(p_name) {
		if (Object.keys(this.auto_completers).indexOf(p_name) < 0 ) {
			throw new Error("AutocompleteObjMgr, no '"+p_name+"' autocomplete");
		}
		return this.auto_completers[p_name];
	},

	setCurrentMouseClick: function(p_mouse_pt) {
		for (let k in this.auto_completers) {
			this.auto_completers[k].setCurrentMouseClick(p_mouse_pt);
		}
	},

	bindEventHandlers: function() {
		for (let k in this.auto_completers) {
			this.auto_completers[k].bindEventHandlers();
		}
	},
	
	showRecordsArea: function(p_name, p_do_show) {
		const ac = this.get(p_name);
		ac.showRecordsArea(p_do_show);
	},
	
	recordsAreaIsVisible: function(p_name) {
		const ac = this.get(p_name);
		return ac.recordsAreaIsVisible();
	}

};


