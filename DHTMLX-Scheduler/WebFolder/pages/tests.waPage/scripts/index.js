
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var eventEvent = {};	// @dataSource
	var documentEvent = {};	// @document
// @endregion// @endlock

// eventHandlers// @lock

	eventEvent.onCurrentElementChange = function eventEvent_onCurrentElementChange (event)// @startlock
	{// @endlock
		// Add your code here
	};// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock
		$$('dataGrid1').insertColPicker(true , {
			colPOptions: {
				attrName  : 'color'
			}
		});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("event", "onCurrentElementChange", eventEvent.onCurrentElementChange, "WAF");
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
// @endregion
};// @endlock
