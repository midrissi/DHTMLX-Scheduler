
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var documentEvent = {};	// @document
// @endregion// @endlock

// eventHandlers// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock
		var
		$scheduler	= $$('container1').$domNode;
		
		$scheduler
		.addClass('waf-project-noStyle');
		
		/*
		
				{ name: "ev1", height: 21, map_to: "ev1", type: "select", options: events },
				{ name: "ev2", height: 21, map_to: "ev2", type: "select", options: events },
				{ name: "ev3", height: 21, map_to: "ev3", type: "select", options: events },
				*/
		
		initScheduler($scheduler.attr('id') , new Date(), 'week' , {
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
			}
		});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
// @endregion
};// @endlock
