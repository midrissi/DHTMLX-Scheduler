var _ns = {};

(function(){
	function Mapping(){
		var
		source				= null;
		
		this.dc				= null;
		this.map 			= {};
		this.defaultColor 	= '#1796b0';
		this.types 			= {};
		this.removedItems	= [];
		
		Object.defineProperty(this, "source", {
			configurable	: true,
			set 			: function(value){
				if(value instanceof WAF.DataSourceEm){
					this.dc = value.getDataClass();
					source	= value;
				}
				else{
					throw 'Invalide datasource !';
				}
			},
			get : function(){
				return source;
			}
		});
		
		Object.defineProperty(this, "fields", {
			configurable	: true,
			set 			: function(value){
				this._initMapObj(value);
				this._setReverse();
			}
		});
		
		Object.defineProperty(this, "nbFields", {
			configurable	: true,
			get 			: function(){
				var res = 0;
				
				for(var i in this.map){
					res ++;
				}
				
				return res;
			}
		});
		
		if ( Mapping.caller != Mapping.getInstance ) {  
			throw new Error("This object cannot be instanciated");  
		}
	}
	
	Mapping.instance = null;
	
	Mapping.getInstance = function() {  
	  if (this.instance == null) {
	      this.instance = new Mapping();
	  }  
	  
	  return this.instance;
	}
	
	Mapping.prototype.init = function(fields , source){
		this.source	= source;
		this.fields = fields;
	}
	
	Mapping.prototype.getRealPosition = function(position){
		for(var i = this.removedItems.length - 1 , rmPos ; rmPos = this.removedItems[i] ; i--){
			if(position > rmPos){
				position--;
			}
		}
		return position;
	}
	
	Mapping.prototype.getPositionWithOffset = function(position){
		for(var i = this.removedItems.length - 1 , rmPos ; rmPos = this.removedItems[i] ; i--){
			if(position > rmPos){
				position++;
			}
		}
		return position;
	}
	
	Mapping.prototype.select = function(event_object){
		if(!event_object){
			return;
		}
		
		if(this.source){
			this.source._dont_refresh = true;
			var curElem = this.source.getCurrentElement();
  		
	  		if(!curElem || (curElem && curElem.getKey() != event_object.id)){
	  			if(event_object._position){
	  				this.source.select(this.getRealPosition(event_object._position));
	  			}else{
	  				this.source.selectByKey(event_object.id);
	  			}
	  		}
		}
	}

	Mapping.prototype.fixType = function(attrName , attrValue){
		switch(this.types[attrName]){
			case 'date':
				var d = new Date(attrValue)
				return d.getFullYear() + '-' + (d.getMonth() + 1 ) + '-' + 
							d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() +
							':' + d.getSeconds();
			default:
				return attrValue;
		}
	}

	Mapping.prototype.getObject = function(obj){
		var res = {};
		for(var attr in obj){
			if(this.map.hasOwnProperty(attr)){
				if(this.dc.getAttributeByName(this.map[attr]).type == 'date'){
					res[this.map[attr]] = obj[attr].toString();
				}
				
				else if(typeof this.map[attr] == 'string'){
					res[this.map[attr]] = obj[attr];
				}
			}
		}
		
		return res;
	}

	Mapping.prototype._setReverse = function(){
		if(!this._reverse){
			var reverse = this._reverse = {};
			
			for(var attr in this.map){
				if(typeof this.map[attr] == "string"){
					reverse[this.map[attr]] = attr;
				}
				else if(typeof this.map[attr] == 'object' && this.map[attr].attrName){
					reverse[this.map[attr].attrName] = attr;
				}
			}
		}
	}

	Mapping.prototype.getReverseObject = function(obj , _dont_fix){
		var res = {};
			
		for(var attr in this._reverse){
			var item = obj[attr];
			
			if(item && item.__deferred){
				res[this._reverse[attr]] = item.__deferred.__KEY;
			}
			else if(item){
				if(this.types[this._reverse[attr]] && !_dont_fix){
					res[this._reverse[attr]] = this.fixType(this._reverse[attr] , item);
				}
				else{
					res[this._reverse[attr]] = item;
				}
			}
		}
		
		return res;
	}

	Mapping.prototype._getReverseAttr = function(attrName){
		return this._reverse[attrName];
	}
	
	Mapping.prototype._initMapObj = function(fields){
		if(!this.dc){
			return;
		}
		
		for(var attr in fields){
			if(fields.hasOwnProperty(attr)){
				var
				value = fields[attr],
				dcAttr= this.dc[value];
				
				if(!dcAttr){
					continue;
				}
				
				switch(dcAttr.kind){
					case 'relatedEntity':
					case "calculated":
					case "storage":
						value = dcAttr.name;
						break;
				}
				
				this.map[attr] = value;
				
				if(dcAttr.type == 'date'){
					this.types[attr] = dcAttr.type;
				}
			}
		}
		
		if(!this.map['id']){
			this.map['id'] = this.dc.getPrimaryKeyAttribute();
		}
	}

	Mapping.prototype.getObjectFromEntity = function(entity){
		var dc;
		if(entity.getDataClass){
			dc = entity.getDataClass();
		}
		
		if(!dc){
			return null;
		}
		
		var
		attrs	= dc.getAttributes(),
		obj 	= {};
		
		for(var i = 0 , attr ; attr = attrs[i] ; i++){
			var revAttr = this._getReverseAttr(attr.name);
			if(!revAttr){
				continue;
			}
			switch(attr.kind){
				case 'storage':
				case 'calculated':
					obj[revAttr] = entity[attr.name].getValue();
					break;
				case 'relatedEntity':
					var related = entity[attr.name].getValue();
					if(related){
						obj[revAttr] = related.getKey();
					}
					else{
						obj[revAttr] = entity[attr.name].relKey;
					}
					break;
			}
		}
		
		return obj;
	}
	
	Mapping.prototype.refreshFromEntity = function refreshFromEntity(entity , event_id){
		var
		obj 	= this.getObjectFromEntity(entity),
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
	
	Mapping.prototype.selectEvent = function refreshFromEntity(event_id){
		var
		$node,
		ev 			= scheduler.getEvent(event_id),
		$dataArea 	= $('.dhx_cal_data');
		
		if(ev){
			scheduler.setCurrentView(ev.start_date);
			
			$node = $(scheduler.getRenderedEvent(ev.id));
			$dataArea.scrollTop(parseInt($node.css('top')) - $dataArea.height()/2 + $node.height()/2);
			
			$node.click();
		}
	}
	
	Mapping.prototype.clear = function clear(){
		scheduler.clearAll();
		this.removedItems = [];
	}
	
	Mapping.prototype.saveSource = function saveSource(event_id , event_object){
		var
		that		= this,
		saved		= false;
		i 			= 0,
		nbFields	= 0,
		dc			= this.dc,
		primKey		= dc.getPrimaryKeyAttribute(),
		source		= this.source,
		curEntity 	= source.getCurrentElement(),
		obj 		= this.getObject(event_object);
		
		if(event_object._new){
			source._newElement = true;
			source.addNewElement();
			curEntity = source.getCurrentElement();
			delete event_object._new;
		}
		else if (!curEntity){
			var opts = {
				onSuccess: function(e){
					if(e.dataSource.getCurrentElement()){
						saveSource(event_id , event_object);
					}
				}
			};
			
			if(event_object._position){
				source.select(this.getRealPosition(event_object._position) , opts);
			}else {
				source.selectByKey(event_id , opts);
			}
			
			return false;
		}
		
		for(var attr in obj){
			if(obj.hasOwnProperty(attr) && attr != primKey){
				nbFields++;
			}
		}
		
		function save(){
			if(event_object._to_save){
				delete event_object._to_save;
				return false;
			}
			
			event_object._to_save = true;
			curEntity.save({
				onSuccess: function(e){
					delete event_object._to_save;
					source._dont_refresh = true;
					source.serverRefresh({forceReload : true});
					that.refreshFromEntity(e.entity , event_id)
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
	
	function syncWithDS(config){
		var
		dc,
		fields,
		mappingObj,
		fieldsStr		= '',
		defaultConfig 	= {
			fields 		: {},
			time   		: 1000,
			dataSource	: null,
			readonly	: false,
			cacheSize	: 40,
			initQuery	: false
		};
		
		config 		= $.extend({} , defaultConfig , config);
		
		if(!config.dataSource || !config.dataSource.getDataClass){
			return;
		}
		
		fields 		= config.fields;
		mappingObj	= _ns.Mapping.getInstance();
		mappingObj.init(fields , config.dataSource);
		
		for(var attr in fields){
			if(fields.hasOwnProperty(attr)){
				if(fieldsStr){
					fieldsStr += ', ';
				}
				
				fieldsStr += fields[attr];
			}
		}
		
		/************** TO MODIFY [JUST A HUCK] **************/
		config.dataSource.removeCurrent = function(options , userData){
			var entity = this.getCurrentElement();
			
			if(!entity){
				return false;
			}
			
			options = $.extend({} , {
				userData : {
					_removed 	: true,
					_key		: entity.getKey(),
					_position	: this.getPosition()
				}
			} , options );
			console.log(this.getPosition())
			
			WAF.DataSourceEm.removeCurrent.call(this , options , userData);
		}
		/******************** [END HACK] *********************/
		
		WAF.addListener(config.dataSource.getID() , "onCollectionChange", function(e){
			if(e.dataSource._newElement){
				delete e.dataSource._newElement;
				return false;
			}
			else if(e.dataSource._removeElement){
				delete e.dataSource._removeElement;
				return false;
			}
			else if(e.dataSource.isNewElement()){
				return false;
			}
			else if(e.eventData){
				var
				evData	= e.eventData;
				
				if(evData._removed){
					var ev = scheduler.getEvent(evData._key);
					
					if(ev){
						mappingObj.removedItems.push(evData._position);
						ev._dont_save = true;
						scheduler.deleteEvent(ev.id);
					}
				}
				return false
			}
			
			if(!this._time ||  new Date().getTime() > this._time.getTime() + config.time){
				var
				that		= this,
				col			= this.getEntityCollection(),
				dc			= this.getDataClass(),
				primKey		=  dc.getPrimaryKeyAttribute(),
				cache		= dc.getCache(),
				recieved	= 0,
				arr 		= [];
				
				mappingObj.clear();
				col._private.pageSize = config.cacheSize;
				
				function draw(){
					if(arr.length == config.cacheSize || recieved == that.length){
						scheduler.parse(arr , 'json');
						arr = [];
					}
				}
				
				function push(element , position){
					var
					res	= mappingObj.getReverseObject(element);
					
					res['id'] 			= element[primKey];
					res['_position'] 	= position;
					
					arr.push(res);
					recieved++;
					
					draw();
					getElement(position + 1);
				}
				
				function getElement(position){
					if(typeof position != "number" || recieved == col.length){
						return;
					}
					
					var
					key		= col._private.getKeyByPos(position),
					element = cache.getCacheInfo(key);
					
					if(element){
						push(element.rawEntity , position);
					}
					else{
						that.getElement(position , {
							onSuccess: function(e){
								if(e.element){
									push(e.element , e.position);
								}
							}
						});
					}
				}
				
				getElement(0);
			}
			
			this._time = new Date();
		}, "WAF");
		
		WAF.addListener(config.dataSource.getID() , "onElementSaved", function(e){
			if(!e.entity.getKey()){
				e.dataSource.removeCurrent();
				return;
			}
			
			if(e.dataSource.isNewElement()){
				var
				dc		= e.dataSource.getDataClass(),
				primKey	= dc.getPrimaryKeyAttribute(),
				element = e.element,
				item	= mappingObj.getReverseObject(element , true);
				
				item['id'] 			= element[primKey];
				item['_position'] 	= mappingObj.getPositionWithOffset(e.position);
				item['_dont_save'] 	= true;
				
				scheduler.addEvent(item);
			
				mappingObj.selectEvent(item['id']);
			}
			else{
				var
				entity = e.entity;
				
				mappingObj.refreshFromEntity(entity , entity.getKey());
			}
		}, "WAF")
		
		WAF.addListener(config.dataSource.getID() , "onCurrentElementChange", function(e){
			if(e.eventKind == "onCurrentElementChange"){
				var
				current = e.dataSource.getCurrentElement();
				
				if(current){
					if(e.dataSource._dont_refresh){
						delete e.dataSource._dont_refresh;
						return;
					}
					
					mappingObj.selectEvent(current.getKey());
				}
			}
		}, "WAF")
		
		if(config.initQuery){
			config.dataSource.query(config.initQuery);
		}
		
		return mappingObj;
	}
	
	WAF.DataClass.prototype.getPrimaryKeyAttribute = function(){
		return this._private.primaryKey;
	}
	
	_ns.Mapping 			= Mapping;
	_ns.syncWithDS			= syncWithDS;
})();