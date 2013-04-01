(function(){
	WAF.widget.Grid.prototype.insertColPicker = function insertColPicker(removeBtn , options){
		var dg = this;
		
		options = $.extend(true , {
			rowHeight	: 33,
			marginLeft	: 25,
			marginRight	: 36,
			colPOptions : {
				attrName 	: null,
				selectImg	: '/images/color.png',
				css 		: {
					
				}
			},
			remOptions: {
				image	: '/images/delete1.png',
				css 	: {
					width	: 20,
					height	: 20,
					left	: 4,
					top		: 6
				}
			}
		} , options);
		
		dg.setRowHeight(options.rowHeight);
		
		WAF.addListener(dg.id, "onRowDraw", function(event){
			var
			dataSource	= event.dataSource,
			cellNb		= 0,
			cellW		= parseInt(event.row.cells[cellNb].col.width),
			cell 		= $(event.row.cells[cellNb].dom).addClass('colorPicker'),
			content		= cell.find('.content'),
			delBtn		= $('<div>'),
			colPicker	= $('<div>'),
			skip		= false,
			remOptions	= options.remOptions,
			colPOptions	= options.colPOptions;
			
			if(!event.element){
				cell.find('.myColorPicker').remove()
				skip = true;
			}
			else if(cell.find('.myColorPicker').length){
				cell
				.find('.myColorPicker')
				.myColorPicker('setColor' , event.element.color);
				
				skip = true;
			}
			
			if(skip){
				return;
			}
			
			colPOptions = $.extend( true , {
				datasource: dataSource,
				format: 'hex',
				save:true,
				dispatch: true,
				initColor: event.element[colPOptions.attrName],
				onBeforeShow: function(){
					dataSource.select(colPicker.data('position'));
				}
			} , colPOptions)
			
			cell
			.append(colPicker);
			
			content
			.width(cellW - options.marginRight - (removeBtn?options.marginLeft:0));
			
			colPicker
			.css({
				position: 'absolute',
				top:0,
				right:0,
				width: options.marginRight,
				height: options.rowHeight
			})
			.data({
				position: event.row.rowNumber
			});
			
			if(colPOptions.attrName){
				colPicker.myColorPicker(colPOptions);
			}
			
			if(removeBtn && !cell.find('.remove').length){
				var
				img = $('<img>')
				.attr({
					width:'100%',
					height:'100%',
					src: remOptions.image || '/images/delete.png'
				});
				
				delBtn
				.addClass('remove')
				.css(remOptions.css)
				.appendTo(cell)
				.append(img)
				.data({
					position: event.row.rowNumber
				})
				.click(function(){
					var
					msg = options.confirm ? options.confirm : 'Do you want to remove this record ?';
					
					dataSource.select($(this).data('position'));
					
					if(typeof dhtmlx != "undefined" && dhtmlx.confirm){
						dhtmlx.confirm({
							type:"confirm-warning",
							text: msg,
							callback: function(resp) {
								if(resp){
									dataSource.removeCurrent();
								}
							}
						})

					}
					else if(confirm(msg)){
						dataSource.removeCurrent();
					}
				});
				
				content
				.css({
					left: options.marginLeft
				});
			}
		}, "WAF");
		
		if(removeBtn){
			var
			$col = dg
			.$domNode
			.find('.waf-dataGrid-header .waf-dataGrid-col-0 .content');
			
			$col
			.width($col.width - options.marginLeft)
			.css({
				left : options.marginLeft
			});
		}
		
		dg.redraw();
	}
	
	WAF.widget.Grid.prototype.editCell = function(row , column){
		var
		gridView = this.gridController.gridView,
		row = gridView._private.functions.getRowByRowNumber({
			gridView: gridView,
			rowNumber: row
		});
		
		gridView._private.functions.startEditCell({
			gridView: gridView,
			columnNumber: column,
			row: row,
			cell: row.cells[0]
		});
	}
})()

$(function() {
    $.widget("ui.myColorPicker", {
        options: {
            datasource	: null,
            attrName	: null,
            format		: 'hex', // hsb, hex, rgb
            selectImg	: '/images/colorpicker/select2.png',
            save		: false,
            dispatch	: false,
            initColor	: null,
            css 		: {
                position: 'absolute',
                top: 5,
                left: 0,
                width: 18,
                height: 18
            }
        },
        setColor: function(color){
            color = color ? color : 'transparent';
            this.colorDiv.css({
                'background-color': color
            });
        },
        _create: function(){
            var
            options 	= this.options,
            element 	= $(this.element).addClass('myColorPicker'),
            colorDiv	= this.colorDiv = $('<div>');
				
            if(!options.datasource || !options.attrName){
                return;
            }
				
            element
            .empty()
            .append(colorDiv)
            .addClass('nostyle');
				
            colorDiv
            .css($.extend(true , options.css , {
                background: 'url(' + options.selectImg + ') center',
                'background-color': options.initColor ? options.initColor : 'transparent'
            }));
				
            element.ColorPicker($.extend( {} , {
                onHide: function(){
                    if(options.save){
                        options.datasource.save();
                    }
                },
                onShow: function(){
                    $(this).ColorPickerSetColor(options.datasource[options.attrName]);
                },
                onChange: function (hsb, hex, rgb) {
                    var res;
                    switch(options.format){
                        case 'hsb':
                            res = 'hsl(' + hsb.h + ',' + hsb.s + '%,' + hsb.b + '%)';
                            break;
                        case 'rgb':
                            res = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
                            break;
                        default:
                            res = "#" + hex;
                            break;
                    }
                    options.datasource[options.attrName] = res;
						
                    if(options.dispatch){
                        options.datasource.dispatch('onCurrentElementChange');
                    }
						
                    colorDiv.css({
                        'background-color': res
                    });
                }
            } , options));
        }
    });
});