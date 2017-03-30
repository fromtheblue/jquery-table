/**
 * Created by wangqiong on 2017/2/28.
 *      option:
 *          {
 *              id:"id",  指定数据中的索引字段名称
 *              cls:"table table-striped table-hover", 指定表格的class
 *              headCls:"table-thead", 指定表头的class
 *              showNo:true, 是否显示行号
 *              showCheckbox:true, 是否显示复选框
 *              select:true, 行是否可以被选中
 *              singleSelect:true, 行的选中方式是否只支持单选
 *              noRowMsg:function(datas){ 当未获取到数据或者数据不为数组的时候调用的函数
 *                  return datas?"未获取到数据":"数据加载异常";
 *              },
 *              number:function(i){ 行号的格式
 *                  return i+1;
 *              },
 *              rowEvents:{} 添加事件对象,跟jquery的添加事件相同
 *              datas:[],  array填充表格的数据
 *              columns:[] 列
 *              }
 *      rowEvents{eventKey:function(rowData,idx,e)}
 *              eventKey 事件的名称,如click
 *              function
 *                      rowData 当前点击行的填充数据
 *                      idx 当前点击行所在的行数
 *                      e 事件对象
 *                      this 触发事件的行(td)的jquery对象
 *      columns[{field:string,title:string,formatter:function(value,rowData,idx)}]
 *             field  每列的字段名称
 *             title  每列的表头
 *             formatter 自定义每列的显示格式
 *                    value 填充单元格的原始数据
 *                    rowData 填充当前行的原始数据
 *                    idx 当前行所在的行数
 *     methods:
 *              getChecked 获取所有被复选框选中的数据
 *              getCheckedIDs 获取所有被复选框选中的数据的id字符串
 *              getSelected 获取所有的被选中的数据
 *              getSelectedIDs 获取所有被选中的数据的id字符串
 *              setDatas(datas) 重新渲染数据
 */
(function($){
    if($.fn.table){
        return;
    }
    var setMethods={
        setDatas:setDatas
    };
    var getMethods={
        getChecked:getChecked,
        getCheckedIDs:getCheckedIDs,
        getSelected:getSelected,
        getSelectedIDs:getSelectedIDs
    };
    $.fn.table=function(){
        var args=arguments,params,method;
        if(!args.length|| typeof args[0] == 'object'){
            return this.each(function(idx){
                var $self=$(this);
                $self.data('table',$.extend(true,{},$.fn.table.default,args[0]));
                params=$self.data('table');
                _init.call( $self,params);
                _render.call($self);
            });
        }else{
            if(!$(this).data('table')){
                throw new Error('You has not init table!');
            }
            params=Array.prototype.slice.call(args,1);
            if (setMethods.hasOwnProperty(args[0])){
                method=setMethods[args[0]];
                return this.each(function(idx){
                    var $self=$(this);
                    method.apply($self,params);
                    _render.call($self);
                });
            }else if(getMethods.hasOwnProperty(args[0])){
                method=getMethods[args[0]];
                return method.apply(this,params);
            }else{
                throw new Error('There is no such method');
            }
        }
    }
    $.fn.table.default={
        id:"id",
        cls:"table table-striped table-hover",
        headCls:"table-thead",
        showNo:false,
        showCheckbox:true,
        select:false,
        singleSelect:false,
        noRowMsg:function(datas){
            return datas?"未获取到数据":"数据加载异常";
        },
        number:function(i){
            return i+1;
        },
        datas:[],
        columns:[],
        rowEvents:{}
    }
    function _init(params){
        /*初始化的时候不要展示无数据的消息*/
        params._showNoRowMsg=false;
        if(params.datas&&params.datas instanceof Array){
            params._datas=params.datas.map(function(data){
                return {
                    data:data
                }
            });
        }
        return this;
    }
    function setDatas(datas){
        var $self=this,
            params=this.data('table'),
            id=params.id,
             _datas=params._datas,
            _newDatas;
            params.datas=datas,
            /*set数据的时候可以显示无数据的消息*/
            params._showNoRowMsg=true;
        if(datas){
            _newDatas=datas.map(function(data){
                var _newData={};
                _datas.forEach(function(_data){
                   if(_data.data[id]===data[id]){
                       _newData=_data;
                   }
                });
                _newData.data=data;
                 return _newData;
            });
            params._datas=_newDatas;
        }else{
            params._datas=datas;
        }
    }
    function getChecked(){
        return this.data("table")._datas.filter(function(_data){
            return _data.checked;
        }).map(function(_data){
            return _data.data;
        })
    }
    function getCheckedIDs(){
        var $self=this,id=$self.data("table").id;
        return getChecked.call(this).map(function(data){
            return data[id];
        }).join(",");
    }
    function getSelected(){
        return this.data("table")._datas.filter(function(_data){
            return _data.selected;
        }).map(function(_data){
            return _data.data;
        })
    }
    function getSelectedIDs(){
        var $self=this,id=$self.data("table").id;
        return getSelected.call(this).map(function(data){
            return data[id];
        }).join(",");
    }
    function _render(){
        var $self=this;
        var params=$self.data("table");
        var _columns=params.columns.reduce(function(target,column){
            target[column.field]=column;
            return target;
        },{});
        this.addClass(params.cls).html([
            $("<thead/>",{
                "class":params.headCls
            }).append(
                $("<tr/>").append(
                    function(){
                        if(params.showNo){
                            return $("<th/>",{
                                "class":"table-no"
                            }).append(
                                document.createTextNode("序号")
                            )
                        }
                    }(),
                    function(){
                        if(params.showCheckbox){
                            return $("<th/>",{
                                "class":"table-checkbox"
                            }).append(
                                $("<label/>").append(
                                    $("<label/>",{
                                        "class":"table-right-checkbox"
                                    }).append(
                                        function(){
                                            var checkbox=document.createElement("input");
                                            checkbox.type="checkbox";
                                            if(params._datas){
                                                if(params._datas.length||params._showNoRowMsg){
                                                    checkbox.checked=params._datas.every(function(_data){
                                                        return _data.checked;
                                                    });
                                                }
                                            }
                                            checkbox.addEventListener("change",function(){
                                                params._datas.forEach(function(_data){
                                                    _data.checked=checkbox.checked;
                                                });
                                                _render.call($self);
                                            });
                                            return [
                                                checkbox,
                                                $("<span/>",{
                                                    "class":"table-checkbox-container"
                                                })
                                            ]
                                        }()
                                    ),
                                    document.createTextNode(" 选择")
                                )
                            )
                        }
                    }(),
                    params.columns.map(function(column){
                        return $("<th/>").append(
                            document.createTextNode(column.title)
                        )
                    })
                )
            ),
            $("<tbody/>").append(
                function(){
                    if((!params._datas||!params._datas.length)&&params._showNoRowMsg){
                        return $("<tr/>").append(
                            $("<td/>",{
                                "colspan":function(){
                                    return params.columns.length+params.showNo+params.showCheckbox;
                                }
                            }).append(
                                params.noRowMsg(params._datas)
                            )
                        )
                    }
                    return params._datas.map(function(_data,idx){
                        var data=_data.data;
                        var row = $("<tr/>",{
                            "click":function(event){
                                var selected;
                                if(params.select){
                                    if($(event.target).closest(".table-right-checkbox").length){
                                        _data.checked=!_data.checked;
                                    }
                                    selected=!!_data.selected;
                                    if(params.singleSelect){
                                        params._datas.forEach(function(_data){
                                            _data.selected=false;
                                        });
                                    }
                                    _data.selected=!selected;
                                    _render.call($self);
                                }
                            }
                        }).toggleClass("selected",!!_data.selected).append(
                            function(){
                                if(params.showNo){
                                    return $("<td/>").append(
                                        document.createTextNode(params.number(idx))
                                    )
                                }
                            }(),
                            function(){
                                if(params.showCheckbox){
                                    return $("<td/>").append(
                                        $("<label/>",{
                                            "class":"table-right-checkbox"
                                        }).append(
                                            function(){
                                                var checkbox=document.createElement("input");
                                                checkbox.type="checkbox";
                                                checkbox.checked=!!_data.checked;
                                                checkbox.addEventListener("change",function(){
                                                    _data.checked=this.checked;
                                                    _render.call($self);
                                                });
                                                return [
                                                    checkbox,
                                                    $("<span/>",{
                                                        "class":"table-checkbox-container"
                                                    })
                                                ]
                                            }()
                                        )
                                    )
                                }
                            }(),
                            Object.keys(_columns).map(function(field){
                                return $("<td/>",{
                                    html:function(){
                                        var formatter=_columns[field].formatter;
                                        if(_columns[field].formatter){
                                            return formatter(data[field],data,idx);
                                        }
                                        return data[field];
                                    }
                                })
                            })
                        )
                        row.on(Object.keys(params.rowEvents).reduce(function(target,key){
                            target[key]=params.rowEvents[key].bind(row,data,idx);
                            return target;
                        },{}));
                        return row;
                    })
                }

            )
        ]);
    }
})(jQuery);