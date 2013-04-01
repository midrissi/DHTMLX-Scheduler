var events = [];
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var documentEvent = {};	// @document
// @endregion// @endlock

// eventHandlers// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock
		var
		$scheduler	= $$('container1').$domNode,
		html 		= '';
		
		html 	+= '<div class="dhx_cal_navline" height="100px">';
		html 	+= 	'<div class="dhx_cal_prev_button">&nbsp;</div>';
		html 	+= 	'<div class="dhx_cal_next_button">&nbsp;</div>';
		html 	+= 	'<div class="dhx_cal_today_button"></div>';
		html 	+= 	'<div class="dhx_cal_date" style="width: auto;right: 450px;"></div>';
		html 	+= 	'<div class="dhx_cal_tab dhx_cal_tab_first" name="day_tab" style="right: 342px;"></div>';
		html 	+= 	'<div class="dhx_cal_tab" name="week_tab" style="right:281px;"></div>';
		html 	+= 	'<div class="dhx_cal_tab dhx_cal_tab_last" name="month_tab" style="right: 220px;"></div>';
		html 	+= 	'<div class="dhx_cal_date"></div>';
		html 	+= 	'<div class="dhx_minical_icon" id="dhx_minical_icon" style="right: 410px;left:auto;">&nbsp;</div>';
		html 	+= '</div>';
		html 	+= '<div class="dhx_cal_header">';
		html 	+= '</div>';
		html 	+= 	'<div class="dhx_cal_data">';
		html 	+= '</div>';
		
		$scheduler
		.append(html)
		.addClass('waf-project-noStyle');
		
		ds.Event.all().toArray('description' , {
			onSuccess : function(e){
				for(var i = 0 , item ; item = e.result[i] ; i++){
					events.push({
						key : item.__KEY,
						label : item['description']
					});
				}
				
				initScheduler($scheduler.attr('id') , new Date(), 'month' , {
					dataSource 	: sources.event,
					fields		: {
						text			: 'description',
						rec_type 		: 'rec_type',
						end_date		: 'end_date',
						start_date		: 'start_date',
						event_pid 		: 'parent_event',
						event_length 	: 'event_length',
						color			: 'color',
						ev1				: 'ev1',
						ev2				: 'ev2',
						ev3				: 'ev3'
					},
					initQuery	: ''
				});
			}
		});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
// @endregion
};// @endlock
