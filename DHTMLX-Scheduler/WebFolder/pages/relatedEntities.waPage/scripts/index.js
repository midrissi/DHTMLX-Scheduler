		
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var eventEvent = {};	// @dataSource
	var documentEvent = {};	// @document
// @endregion// @endlock

// eventHandlers// @lock

	eventEvent.onCollectionChange = function eventEvent_onCollectionChange (event)// @startlock
	{// @endlock
		this.toArray('description' , {
			onSuccess: function(e){
				var
				res = [];
				
				for(var i = 0 , item ; item = e.result[i] ; i++){
					res.push({
						key	: item.__KEY,
						label : item.description
					});
				}
				
				scheduler.updateCollection("ev1", res);
				scheduler.updateCollection("ev2", res);
				scheduler.updateCollection("ev3", res);
			}
		})
	};// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock
		var
		$scheduler	= $$('container1').$domNode;
		
		$scheduler
		.addClass('waf-project-noStyle');
		
		
		scheduler.locale.labels = $.extend({} , scheduler.locale.labels , {
			section_ev1 : 'Event 1',
			section_ev2 : 'Event 2',
			section_ev3 : 'Event 3',
			section_text: 'Description'
		});	
		
		scheduler.config = $.extend({} , scheduler.config , {
			lightbox: {
				sections: [
					{ name: "time", height: 72, type: "time", map_to: "auto"},
					{ name: "text", height: 50, map_to: "text", type: "textarea", focus: true },
					{ name: "ev1", height: 21, map_to: "ev1", type: "select", options: scheduler.serverList("ev1", []) },
					{ name: "ev2", height: 21, map_to: "ev2", type: "select", options: scheduler.serverList("ev2", []) },
					{ name: "ev3", height: 21, map_to: "ev3", type: "select", options: scheduler.serverList("ev3", []) },
					{ name: "recurring", type: "recurring", map_to: "rec_type", button: "recurring"}
				]
			}
		});
		
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
			},
			cacheSize	: 80
		});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("event", "onCollectionChange", eventEvent.onCollectionChange, "WAF");
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
// @endregion
};// @endlock
