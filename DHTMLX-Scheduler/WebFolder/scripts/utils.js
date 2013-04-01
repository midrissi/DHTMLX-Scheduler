var _ns = {};

(function(){
	function Mapping(){
		var
		source				= null;
		
		this.dc				= null;
		this.map 			= {};
		this.defaultColor 	= '#1796b0';
		this.types 			= {};
		
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
	
	Mapping.prototype.select = function(key){
		if(this.source){
			var curElem = this.source.getCurrentElement();
  		
	  		if(!curElem || (curElem && curElem.getKey() != key)){
	  			this.source.selectByKey(key);
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
				if(typeof this.map[attr] == 'object' && this.map[attr].attrName){
					res[this.map[attr].attrName] = obj[attr];
				}
				
				else if(this.dc.getAttributeByName(this.map[attr]).type == 'date'){
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

	Mapping.prototype.getReverseObject = function(obj){
		var res = {};
			
		for(var attr in this._reverse){
			if(typeof obj[attr] == "object" 
					&& typeof this.map[this._reverse[attr]] == 'object'){
				
				if(!this.map[this._reverse[attr]].keyAttr){
					this.map[this._reverse[attr]].keyAttr = 'ID';
				}
				
				res[this._reverse[attr]] = obj[attr][this.map[this._reverse[attr]].keyAttr];
			}
			
			else if(obj[attr]){
				if(this.types[this._reverse[attr]]){
					res[this._reverse[attr]] = this.fixType(this._reverse[attr] , obj[attr]);
				}
				else{
					res[this._reverse[attr]] = obj[attr];
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
						value = {
							attrName 	: dcAttr.name,
							related		: true,
							keyAttr		: dcAttr.getRelatedClass().getPrimaryKeyAttribute()
						}
						break;
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
			readonly	: false
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
		
		WAF.addListener(config.dataSource.getID() , "onCollectionChange", function(e){
			if(e.dataSource._newElement){
				delete e.dataSource._newElement;
				return false;
			}
			if(!this._time ||  new Date().getTime() > this._time.getTime() + config.time){
				var
				recieved	= 0,
				arr 		= [],
				cacheSize	= 20;
				
				for(var i = 0 ; i<this.length ; i++){
					this.getElement(i , {
						onSuccess: function(e){
							var
							dc		= e.dataSource.getDataClass(),
							primKey	= dc.getPrimaryKeyAttribute(),
							element = e.element,
							item	= mappingObj.getReverseObject(element , true);
							
							item['id'] = element[primKey];
							arr.push(item);
							recieved++;
							
							if(arr.length == cacheSize || recieved == e.dataSource.length){
								scheduler.parse(arr , 'json');
								arr = [];
							}
						}
					})
				}
			}
			
			this._time = new Date();
		}, "WAF");
		
		WAF.addListener(config.dataSource.getID() , "onElementSaved", function(e){
			console.log(e);
		}, "WAF")
		
		config.dataSource.query(config.initQuery ? config.initQuery : '');
		
		return mappingObj;
	}
	
	WAF.DataClass.prototype.getPrimaryKeyAttribute = function(){
		return this._private.primaryKey;
	}
	
	_ns.Mapping 			= Mapping;
	_ns.syncWithDS			= syncWithDS;
})();
