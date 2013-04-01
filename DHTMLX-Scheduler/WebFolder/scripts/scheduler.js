function initScheduler(containerID , date, view , syncObj) {
	var
	mappingObj = _ns.Mapping.getInstance();
	
	function show_minical(){
	  if (scheduler.isCalendarVisible())
	     scheduler.destroyCalendar();
	  else
	     scheduler.renderCalendar({
	        position:"dhx_minical_icon",
	        date:scheduler._date,
	        navigation:true,
	        handler:function(date,calendar){
	           scheduler.setCurrentView(date);
	           scheduler.destroyCalendar()
	        }
	     });
	}

	$('#dhx_minical_icon').live({
		click: function(){
			show_minical();
		}
	});
	
	scheduler.xy = $.extend({} , scheduler.xy , {
		scale_height: 41,
		min_event_height: 100
	});

	scheduler.config = $.extend({} , scheduler.config , {
		full_day: false,
		repeat_date : "%m/%d/%Y",
		hour_size_px: 132,
		separate_short_events: true,
		details_on_dblclick: true,
		xml_date : "%Y-%m-%d %H:%i",
		multi_day: false,
		details_on_create: true,
		fix_tab_position: false,
		first_hour:0,
		last_hour: 24,
		drag_lightbox: true,
		show_loading: true,
		minicalendar: {
			mark_events: true
		},
		buttons_left: ["dhx_cancel_btn"],
		buttons_right: [],
		server_utc : true
	});

	scheduler.render_event_bar = function(a) {
	    var b = this._rendered_location, c = this._colsS[a._sday], d = this._colsS[a._eday];
	    d == c && (d = this._colsS[a._eday + 1]);
	    var e = this.xy.bar_height, f = a.id == this._drag_id ? 0 : a._sorder * e, g = this._colsS.heights[a._sweek] + (this._colsS.height ? this.xy.month_scale_height + 2 : 2) + f, h = document.createElement("DIV"), k = "dhx_cal_event_clear";
	    a._timed || (k = "dhx_cal_event_line", a.hasOwnProperty("_first_chunk") && a._first_chunk && (k += " dhx_cal_event_line_start"), a.hasOwnProperty("_last_chunk") && 
	    a._last_chunk && (k += " dhx_cal_event_line_end"));
	    var i = scheduler.templates.event_class(a.start_date, a.end_date, a);
	    i && (k = k + " " + i);
	    var j = a.color ? "color:" + a.color + ";" : "", m = a.textColor ? "color:" + a.textColor + ";" : "", n = '<div event_id="' + a.id + '" class="' + k + '" style="position:absolute; top:' + g + "px; left:" + c + "px; width:" + (d - c - 15) + "px;" + m + "" + j + "" + (a._text_style || "") + '">', a = scheduler.getEvent(a.id);
	    a._timed && (n += scheduler.templates.event_bar_date(a.start_date, a.end_date, a));
	    n += scheduler.templates.event_bar_text(a.start_date, 
	    a.end_date, a) + "</div>";
	    n += "</div>";
	    h.innerHTML = n;
	    this._rendered.push(h.firstChild);
	    b.appendChild(h.firstChild)
	};
	
	scheduler.config = $.extend({} , scheduler.config , {
		buttons_left: ["dhx_cancel_btn" , "dhx_delete_btn"],
		buttons_right: ["dhx_save_btn"]
	});
	
	scheduler.locale.labels = $.extend({} , scheduler.locale.labels , {
		section_ev1 : 'Event 1',
		section_ev2 : 'Event 2',
		section_ev3 : 'Event 3'
	});
	
	scheduler.config = $.extend({} , scheduler.config , {
		lightbox: {
			sections: [
				{ name: "text", height: 50, map_to: "text", type: "textarea", focus: true },
				{ name: "ev1", height: 21, map_to: "ev1", type: "select", options: events },
				{ name: "ev2", height: 21, map_to: "ev2", type: "select", options: events },
				{ name: "ev3", height: 21, map_to: "ev3", type: "select", options: events },
				{ name: "recurring", type: "recurring", map_to: "rec_type", button: "recurring"},
				{ name: "time", height: 72, type: "calendar_time", map_to: "auto" },
				{ name: "time", height: 72, type: "time", map_to: "auto"}
			]
		}
	});
	
	function refreshFromEntity(entity , event_id){
		var
		obj 	= mappingObj.getObjectFromEntity(entity),
		ev_obj 	= scheduler.getEvent(entity.getKey());
		
		if(!ev_obj){
			ev_obj 	= scheduler.getEvent(event_id);
			if(!ev_obj){
				return;
			}
		}
		
		for(var attr in obj){
			if(obj.hasOwnProperty(attr) && attr != 'id'){
				ev_obj[attr] = obj[attr];
			}
		}
		
		scheduler.updateEvent(entity.getKey());
		scheduler.changeEventId(event_id , entity.getKey());
	}
	
	function saveSource(event_id , event_object){
		var
		saved		= false;
		i 			= 0,
		nbFields	= 0,
		dc			= mappingObj.dc,
		primKey		= dc.getPrimaryKeyAttribute(),
		source		= mappingObj.source,
		curEntity 	= source.getCurrentElement(),
		obj 		= mappingObj.getObject(event_object);
		
		if(event_object._new){
			source._newElement = true;
			source.addNewElement();
			curEntity = source.getCurrentElement();
			delete event_object._new;
		}
		else if (!curEntity){
			source.selectByKey(event_id , {
				onSuccess: function(e){
					if(e.dataSource.getCurrentElement()){
						saveSource(event_id , event_object);
					}
				}
			});
			
			return false;
		}
		
		for(var attr in obj){
			if(obj.hasOwnProperty(attr) && attr != primKey){
				nbFields++;
			}
		}
		
		function save(){
			curEntity.save({
				onSuccess: function(e){
					source.serverRefresh({forceReload : true});
					refreshFromEntity(e.entity , event_id)
				}
			} , {data : event_id});
			saved = true;
		}
		
		for(var attr in obj){
			if(obj.hasOwnProperty(attr) && attr != primKey){
				if(dc[attr].related){
					if(obj[attr]){
						dc[attr].getRelatedClass().getEntity( obj[attr] , {
							onSuccess : function(e){
								curEntity[e.userData['attr']].setValue(e.entity);
								i++;
								
								if(i == nbFields && !saved){
									save();
								}
							}
						} , {attr : attr});
					}
					else{
						i++;
					}
				}
				else{
					switch(dc[attr].type){
						case 'date':
							curEntity[attr].setValue(new Date(obj[attr]));
							break;
						default:
							curEntity[attr].setValue(obj[attr]);
							break;
					}
					
					i++;
				}
			}
		}
		
		if(i == nbFields && !saved){
			save();
		}
	}
	
	scheduler.attachEvent("onEventChanged", function(event_id,event_object){
		if(event_id.toString().lastIndexOf('#') < 0){
			saveSource(event_id , event_object);
		}
  	});
  	
  	scheduler.attachEvent("onBeforeEventDelete", function(event_id,event_object){
  		if(event_object.event_pid){
			event_object.rec_type = "none";
			saveSource(event_id , event_object);
		}
		else {
			mappingObj.source.selectByKey(event_id , {
				onSuccess: function(e){
					e.dataSource.removeCurrent();
				}
			});
		}
		
		return true;
	});
  	
  	scheduler.attachEvent("onEventAdded", function(event_id,event_object){
  		event_object._new = true;
  		saveSource(event_id , event_object);
  	});
  	
  	scheduler.attachEvent("onBeforeDrag", function(event_id, mode, native_event_object){
  		switch(mode){
  			case 'move':
  			case 'resize':
  				mappingObj.select(event_id);
  				break;
  		}
  		
  		return true;
  	});
	
	scheduler.renderEvent = function(container , ev){
		var
		$cont = $(container);
	 
		var html = "<div class='dhx_event_move dhx_header event_subElement' style='width:100%'>&nbsp;</div>";
	 	
	 	html+= '<div class="dhx_event_move dhx_title event_subElement" style="height:15px;">' 
	 			+ scheduler.templates.event_date(ev.start_date) 
	 			+ ' - ' + scheduler.templates.event_date(ev.end_date) + '</div>';
	 	
		html+= '<div class="dhx_event_move dhx_body event_subElement" style="cursor:pointer;width:' + ( $cont.width() - 10) + 'px;height:' + ( $cont.height() - 32) + 'px">';
		
		html+= ev.text;
		
		html += "</div>";
	 
		// resize section
		html += "<div class='dhx_event_resize dhx_footer event_subElement' style='width:100%'></div>";
		
		$cont.append(html).find('.event_subElement').css({
			'background-color' : ev.color
		});
		
		return true;
	}
  	
  	$('#' + containerID).addClass('dhx_cal_container calendar');
	scheduler.init(containerID , date , view);
	
	return _ns.syncWithDS(syncObj);
}