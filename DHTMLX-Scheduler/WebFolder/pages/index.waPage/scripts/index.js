var events = [];
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
		
		$$('dataGrid1').insertColPicker(true , {
			colPOptions: {
				attrName  : 'color'
			}
		});
		
		ds.Event.all().toArray('description' , {
			onSuccess : function(e){
				for(var i = 0 , item ; item = e.result[i] ; i++){
					events.push({
						key : item.__KEY,
						label : item['description']
					});
				}
				
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
					initQuery	: ''
				});
			}
		});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
// @endregion
};// @endlock
