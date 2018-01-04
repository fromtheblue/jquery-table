/**
 * Created by wangqiong on 2017/2/28.
 *      option:
 *          {
 *              id:"id",  指定数据中的索引字段名称
 *              cls:"table table-striped table-hover", 指定表格的class
 *              headCls:"table-thead", 指定表头的class
 *              expandCls:"expandCls", 指定详情行的class
 *              singleExpand:true, 详情行是否每次只能展示一个
 *              showNo:true, 是否显示行号
 *              showCheckbox:true, 是否显示复选框
 *              select:true, 行是否可以被选中
 *              singleSelect:true, 行的选中方式是否只支持单选
 *              showRadio:true, 是否显示单选框(当显示复选框时将不展示)
 *              number:function(i){ 行号的格式
 *                  return i+1;
 *              },
 *              rowEvents:{} 添加事件对象,跟jquery的添加事件相同
 *              datas:[], 填充表格的数据
 *              columns:[] 列
 *              }
 *      rowEvents{eventKey:function(rowData,idx,e)}
 *              eventKey 事件的名称,如click
 *              function
 *                      rowData 当前点击行的填充数据
 *                      idx 当前点击行所在的行数
 *                      e 事件对象
 *                      this 触发事件的行(td)的jquery对象
 *      columns[{field:string,cls:string,title:string,expand:boolean,formatter:function(value,rowData,idx,field)}]
 *             field  每列的字段名称
 *             cls 每个表头的class
 *             title  每列的表头
 *                    string or function(field,column)
 *                    当值为string时,直接将值渲染到表头,
 *                    当值为function的时候,function 返回值作为表头
 *             expand 该行为详情行,详情行只能设置一个且设置为详情行以后title将失效
 *             formatter 自定义每列的显示格式
 *                    value 填充单元格的原始数据
 *                    rowData 填充当前行的原始数据
 *                    idx 当前行所在的行数
 *                    field 字段名
 *     footer:function(datas,columnLength)
 *            生成表格底部的格式化函数,返回值将作为表格的tfoot下面的tr下面的内容
 *                    datas是生成表格的数据,
 *                    columnLength是表格的列数
 *     methods:
 *              getChecked 获取所有被复选框选中的数据
 *              getCheckedIDs 获取所有被复选框选中的数据的id字符串
 *              getSelected 获取所有的被选中的数据
 *              getSelectedIDs 获取所有被选中的数据的id字符串
 *              setDatas(datas) 重新渲染数据
 *              check(ids) 选中表格数据（复选框被选中）
 *                      ids 要选中的原始数据的id集合,只能是数字,字符串和数组类型
 *              expand(id) 将该条数据的详情行展示出来
 *                      id 要展示详情行的数据的id
 *              unexpand(id) 将该条数据的详情行隐藏起来
 *                      id 要隐藏详情行的数据的id
 *              toggleExpand(id) 切换该条数据的详情行的显示隐藏
 *                      id 要切换显示隐藏详情行的数据的id
 *              refresh 刷新表格
 */
(function($){
    if($.fn.table){
        return;
    }
    var setMethods={
        "setDatas":setDatas,
        "check":check,
        "expand":expand,
        "unexpand":unexpand,
        "toggleExpand":toggleExpand,
        "refresh":refresh
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
        expandCls:"expandCls",
        singleExpand:true,
        showNo:true,
        showCheckbox:true,
        select:true,
        singleSelect:true,
        showRadio:true,
        number:function(i){
            return i+1;
        },
        datas:[],
        columns:[],
        rowEvents:{},
        footer:function(){

        }
    }
    function _init(params){
        params._datas=params.datas.map(function(data){
            return {
                data:data
            }
        });
        return this;
    }
    function setDatas(datas){
        var $self=this,
            params=this.data('table'),
            id=params.id,
             _datas=params._datas;
            params.datas=datas;
        _datas.reduceRight(function(privous,_data,idx){
            if(datas.every(function(data){
                    return data[id]!=_data.data[id];
                })){
                _datas.splice(idx,1);
            }
        },{});
        datas.forEach(function(data){
            if(_datas.every(function(_data){
                    return data[id]!=_data.data[id];
                })){
                _datas.push({data:data});
            }
        })
    }
    function check(ids) {
        var $self = this,
            params = this.data('table'),
            id = params.id,
            _datas = params._datas;
        if(typeof ids == "number"){
            ids = ""+ids;
        }
        if(typeof ids == "string"){
            ids = ids.split(",");
        }
        if(!(ids instanceof Array)){
            throw new Error('The params must be Array or Number or String');
        }
        _datas.forEach(function (_data) {
            /*
             *判断当前数据的id是否是在传入的ids中，若当前数据的id是在传入的ids中则选中，
             *当id不在ids中，则当前数据的选中状态仍保留原值
             * */
            _data.checked=ids.some(function(idx){
                    return idx==_data.data[id];
                })||_data.checked;
        })
    }
    function expand(idx){
        var $self = this,
            params = $self.data('table'),
            id = params.id,
            _datas = params._datas;
        if(params.singleExpand){
            _datas.forEach(function(_data){
                _data.expand=false;
            })
        }
        _datas.forEach(function(_data){
            var data=_data.data;
            if(data[id]==idx){
                _data.expand=true;
            }
        })
    }
    function unexpand(idx){
        var $self = this,
            params = $self.data('table'),
            id = params.id,
            _datas = params._datas;
        _datas.forEach(function(_data){
            var data=_data.data;
            if(data[id]==idx){
                _data.expand=false;
            }
        })
    }
    function toggleExpand(idx){
        var $self = this,
            params = $self.data('table'),
            id = params.id,
            _datas = params._datas;
        if(params.singleExpand){
            _datas.forEach(function(_data){
                _data.expand=false;
            })
        }
        _datas.forEach(function(_data){
            var data=_data.data;
            if(data[id]==idx){
                _data.expand=!_data.expand;
            }
        })
    }
    function refresh(){

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
        var _expandColumn;
        var expandCls=params.expandCls;
        var footer=params.footer;
        var datas=params.datas;
        var _columns=params.columns.reduce(function(target,column){
            if(column.type!=="expand"){
                target.push(column);
            }else{
                _expandColumn=column;
            }
            return target;
        },[]);
        var headers=params.columns.filter(function(column){
           return column.type!=="expand";
        });
        var columnLength=headers.length+(params.showNo?1:0)+(params.showCheckbox?1:0);
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
                                            checkbox.checked=params._datas.every(function(_data){
                                                return _data.checked;
                                            });
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
                        }else if(params.showRadio){
                            return $("<th/>",{
                                "class":"table-head-radio"
                            }).append(
                                document.createTextNode("选择")
                            )
                        }
                    }(),
                    headers.map(function(column){
                        return $("<th/>",{
                            "class":column.cls||""
                        }).append(
                            function(){
                                if(typeof column.title === "function"){
                                    return column.title.call($self,column.field,column);
                                }
                                return document.createTextNode(column.title)
                            }
                        )
                    })
                )
            ),
            $("<tbody/>").append(
                params._datas.reduce(function(_target,_data,idx){
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
                            }else if(params.showRadio){
                                return $("<td/>").append(
                                    $("<label/>",{
                                        "class":"table-radio"
                                    }).append(
                                        function(){
                                           /* 如果是单选框,当所有数据都未选中时,选中表格中的第一个 */
                                            if(!idx){
                                                if(params._datas.every(function(item){
                                                    return !item.checked;
                                                })){
                                                    _data.checked=true;
                                                }
                                            }
                                            var radio=document.createElement("input");
                                            radio.type="radio";
                                            radio.checked=!!_data.checked;
                                            radio.addEventListener("change",function(){
                                                params._datas.forEach(function(item){
                                                    item.checked=false;
                                                })
                                                _data.checked=this.checked;
                                                _render.call($self);
                                            });
                                            return [
                                                radio,
                                                $("<span/>",{
                                                    "class":"table-radio-container"
                                                })
                                            ]
                                        }()
                                    )
                                )
                            }
                        }(),
                        _columns.map(function(_column){
                            return $("<td/>",{
                                html:function(){
                                    var formatter=_column.formatter;
                                    if(formatter){
                                        return formatter.call($self,data[_column.field],data,idx,_column.field);
                                    }
                                    return data[_column.field];
                                }
                            })
                        })
                    );
                    row.on(Object.keys(params.rowEvents).reduce(function(target,key){
                        target[key]=params.rowEvents[key].bind(row,data,idx);
                        return target;
                    },{}));
                    _target.push(row);
                    if(_expandColumn){
                        _target.push($("<tr/>",{
                            "class":function(){
                                return expandCls+(_data.expand?"":" hidden");
                            }
                        }).append(
                            $("<td/>",{
                                "colspan":columnLength,
                                html:function(){
                                    var field=_expandColumn.field;
                                    var formatter=_expandColumn.formatter;
                                    if(formatter){
                                        return formatter.call($self,data[field],data,idx,field);
                                    }
                                    return data[field];
                                }
                            })
                        ),$("<tr/>",{
                            "class":"hidden"
                        }));
                    }
                    return _target;
                },[])
            ),
            function(){
                var footContent=footer.call($self,datas,columnLength);
                if(footContent){
                    return $("<tfoot/>").append(
                        $("<tr/>").append(footContent)
                    )
                }
            }()
        ]);
    }
})(jQuery);