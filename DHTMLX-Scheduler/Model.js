model = {};

(function(){
	 var
    __Event		= model.Event 		= {},
    __methods	= __Event.methods 	= {},
    __events	= __Event.events	= {};
    
    __events.onValidate = function(){
    	switch(true){
    		case !this.start_date:
    		case !this.end_date:
    			return {
					error		: 1,
					errorMessage: 'Start and end dates can not be empty!'
				}
    			break
    	}
    }
    
    __Event.time_begin = {
    	onGet : function(){
    		var date = this.start_date;
    		if(date){
    			return date.getHours() + ' : ' + date.getMinutes() + ' : ' + date.getSeconds();
    		}
    		
    		return '';
    	}
    }
    
    __Event.time_end = {
    	onGet : function(){
    		var date = this.end_date;
    		if(date){
    			return date.getHours() + ' : ' + date.getMinutes() + ' : ' + date.getSeconds();
    		}
    		
    		return '';
    	}
    }
})()