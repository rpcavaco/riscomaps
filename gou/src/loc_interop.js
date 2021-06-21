
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
			(function(p_this, p_tr, p_rec) {
				attEventHandler(p_tr, 'mouseover', function(e) {	
					if (p_rec.env !== undefined) {
						p_this.selAddress(p_rec.cod_topo, p_rec.npol, p_rec.env, p_rec.pt);
					} else {
						p_this.selAddress(p_rec.cod_topo, p_rec.npol, null, p_rec.pt)
					}
						
				});
			})(this, p_tr, p_rec);
		}	
	}

	recSelectionEvt(p_rec) {
		if (p_rec.cod_topo === undefined || p_rec.cod_topo == null) {
			return;
		}
		if 	(p_rec.npol === undefined || p_rec.npol == null) {	
				// aumentar o enve
				this.selAddress(p_rec.cod_topo, null, p_rec.env);
		} else {
			this.selAddress(p_rec.cod_topo, p_rec.npol, p_rec.env);
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
								'npol': ot.npol,
								'lbl': ot.toponym,
								'cont': ot.toponym
								});
					
				}

				if (recs.length > 0) {
					this.setCurrentRecords(recs, false);	
				}

				if (ot['errornp'] === undefined && recs.length == 1) {
					this.selAddress(recs[0].cod_topo, recs[0].npol, ot.ext, ot.loc);
				}
				
			} else {
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
				// o toponimo 'oficial' assoicado a este número pode ser outro ...
				if (ot.npoldata.cod_topo_np !== undefined)	{
					cod_topo = ot.npoldata.cod_topo_np;
				}	

				this.selAddress(ot.cod_topo, ot.npol, ot.ext, ot.loc);
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
				
				if (p_rec.env !== undefined) {
					this.selAddress(p_rec.cod_topo, p_rec.npol, p_rec.env, loc);
				} else {
					this.selAddress(p_rec.cod_topo, p_rec.npol, null, loc)
				}
				this.showRecordsArea(false);
			}
			ret = true;
		}
		return ret;
	}

	selAddress(p_codtopo, p_npol, p_ext, opt_p_loc) {
		// para implementar		em classe estendida	
		throw new Error("selAddress not implemented");	
	}
}

LocAutoCompleter.prototype.tipoLabel = "tipo";
LocAutoCompleter.prototype.notFoundLabel = "não-encontrado";