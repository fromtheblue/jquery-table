/**
 * Created by wangqiong on 2017/2/28.
 *      option:
 *          {
 *              id:"id",  指定数据中的索引字段名称
 *              cls:"table table-striped table-hover", 指定表格的class
 *              headCls:"table-thead", 指定表头的class
 *              expandCls:"expandCls", 指定详情行的class
 *              singleExpand:true, 详情行是否每次只能展示一个
 *              showNo:false, 是否显示行号
 *              showCheckbox:true, 是否显示复选框
 *              select:false, 行是否可以被选中
 *              singleSelect:true, 行的选中方式是否只支持单选
 *              showRadio:true, 是否显示单选框(当显示复选框时将不展示)
 *              noRowMsg:function(datas){ 当未获取到数据或者数据不为数组的时候调用的函数
 *                  return datas?"未获取到数据":"数据加载异常";
 *              },
 *              number:function(i){ 行号的格式
 *                  return i+1;
 *              },
 *              rowEvents:{} 添加事件对象,跟jquery的添加事件相同
 *              onChecked:function(rowData){} 被选中事件
 *              onUnchecked:function(rowData){} 取消被选中事件
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
 *      columns[{field:string,cls:string,title:string,expand:boolean,formatter:function(value,rowData,idx,field),columns:[field:string...]}]
 *             field  每列的字段名称
 *             cls 每个表头的class
 *             title  每列的表头
 *                    string or function(field,column)
 *                    当值为string时,直接将值渲染到表头,
 *                    当值为function的时候,function 返回值作为表头
 *             cellCls 每列的单元格样式
 *             cellTitle boolean 是否显示单元格的title属性,默认为true
 *             expand 该行为详情行,详情行只能设置一个且设置为详情行以后title将失效
 *             formatter 自定义每列的显示格式
 *                    value 填充单元格的原始数据
 *                    rowData 填充当前行的原始数据
 *                    idx 当前行所在的行数
 *                    field 字段名
 *                    row 当前数据所在的行(tr)的jquery对象
 *            columns 子表头，子表头可以无限嵌套，当使用子表头以后，上层表头的的field字段将失去作用  
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
 *              disableToggleChecked(ids) 让数据成为不可改变选中状态
 *                      ids 要选中的原始数据的id集合,只能是数字,字符串和数组类型
 */
(function ($) {
    if ($.fn.table) {
        return;
    }
    var setMethods = {
        "setDatas": setDatas,
        "check": check,
        "disableToggleChecked": disableToggleChecked,
        "expand": expand,
        "unexpand": unexpand,
        "toggleExpand": toggleExpand,
        "refresh": refresh
    };
    var getMethods = {
        getChecked: getChecked,
        getCheckedIDs: getCheckedIDs,
        getSelected: getSelected,
        getSelectedIDs: getSelectedIDs
    };
    $.fn.table = function () {
        var args = arguments, params, method;
        if (!args.length || typeof args[0] == 'object') {
            return this.each(function (idx) {
                var $self = $(this);
                $self.data('table', $.extend(true, {}, $.fn.table.default, args[0]));
                params = $self.data('table');
                _init.call($self, params);
                _render.call($self);
            });
        } else {
            if (!$(this).data('table')) {
                throw new Error('You has not init table!');
            }
            params = Array.prototype.slice.call(args, 1);
            if (setMethods.hasOwnProperty(args[0])) {
                method = setMethods[args[0]];
                return this.each(function (idx) {
                    var $self = $(this);
                    method.apply($self, params);
                    _render.call($self);
                });
            } else if (getMethods.hasOwnProperty(args[0])) {
                method = getMethods[args[0]];
                return method.apply(this, params);
            } else {
                throw new Error('There is no such method');
            }
        }
    }
    $.fn.table.default = {
        id: "id",
        cls: "table table-striped table-hover table-bordered",
        headCls: "table-thead",
        expandCls: "expandCls",
        singleExpand: true,
        showNo: false,
        showCheckbox: true,
        select: false,
        singleSelect: false,
        showRadio: true,
        noRowMsg: function (datas) {
            return datas ? "未获取到数据" : "数据加载异常";
        },
        number: function (i) {
            return i + 1;
        },
        datas: [],
        columns: [],
        rowEvents: {},
        onChecked: function (rowData) { },
        onUnchecked: function (rowData) { },
        footer: function () {

        }
    }
    function _init(params) {
        /*初始化的时候不要展示无数据的消息*/
        params._showNoRowMsg = false;
        params._datas = params.datas.map(function (data) {
            return {
                data: data
            }
        });
        return this;
    }
    /*function setDatas(datas) {
        var $self = this,
            params = this.data('table'),
            id = params.id,
            _datas = params._datas;
        params.datas = datas;
        /!*set数据的时候可以显示无数据的消息*!/
        params._showNoRowMsg = true;
        _datas.reduceRight(function (privous, _data, idx) {
            if (datas.every(function (data) {
                return data[id] != _data.data[id];
            })) {
                _datas.splice(idx, 1);
            }
        }, {});
        datas.forEach(function (data) {
            if (_datas.every(function (_data) {
                return data[id] != _data.data[id];
            })) {
                _datas.push({ data: data });
            }
        })
    }*/
    function setDatas(datas){
        var $self=this,
            params=this.data('table'),
            id=params.id,
            _datas=params._datas,
            _newDatas,
            datas=datas||[];
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
    function check(ids) {
        var $self = this,
            params = this.data('table'),
            onChecked = params.onChecked,
            onUnchecked = params.onUnchecked,
            id = params.id,
            _datas = params._datas;
        if (typeof ids == "number") {
            ids = "" + ids;
        }
        if (typeof ids == "string") {
            ids = ids.split(",");
        }
        if (!(ids instanceof Array)) {
            throw new Error('The params must be Array or Number or String');
        }
        _datas.forEach(function (_data) {
            /*
             *判断当前数据的id是否是在传入的ids中，若当前数据的id是在传入的ids中则选中，
             *当id不在ids中，则当前数据的选中状态仍保留原值
             * */
            _data.checked = ids.some(function (idx) {
                if (idx == _data.data[id]) {
                    /* 触发选中事件 */
                    onChecked(_data.data);
                    return true;
                }
                return false;
            }) || _data.checked;
        })
    }
    function disableToggleChecked(ids) {
        var $self = this,
            params = this.data('table'),
            id = params.id,
            _datas = params._datas;
        if (typeof ids == "number") {
            ids = "" + ids;
        }
        if (typeof ids == "string") {
            ids = ids.split(",");
        }
        if (!(ids instanceof Array)) {
            throw new Error('The params must be Array or Number or String');
        }
        _datas.forEach(function (_data) {
            _data.disableToggleChecked = ids.some(function (idx) {
                return idx == _data.data[id];
            });
        })
    }
    function expand(idx) {
        var $self = this,
            params = $self.data('table'),
            id = params.id,
            _datas = params._datas;
        if (params.singleExpand) {
            _datas.forEach(function (_data) {
                _data.expand = false;
            })
        }
        _datas.forEach(function (_data) {
            var data = _data.data;
            if (data[id] == idx) {
                _data.expand = true;
            }
        })
    }
    function unexpand(idx) {
        var $self = this,
            params = $self.data('table'),
            id = params.id,
            _datas = params._datas;
        _datas.forEach(function (_data) {
            var data = _data.data;
            if (data[id] == idx) {
                _data.expand = false;
            }
        })
    }
    function toggleExpand(idx) {
        var $self = this,
            params = $self.data('table'),
            id = params.id,
            _datas = params._datas;
        if (params.singleExpand) {
            _datas.forEach(function (_data) {
                _data.expand = false;
            })
        }
        _datas.forEach(function (_data) {
            var data = _data.data;
            if (data[id] == idx) {
                _data.expand = !_data.expand;
            }
        })
    }
    function refresh() {

    }
    function getChecked() {
        return this.data("table")._datas.filter(function (_data) {
            return _data.checked;
        }).map(function (_data) {
            return _data.data;
        })
    }
    function getCheckedIDs() {
        var $self = this, id = $self.data("table").id;
        return getChecked.call(this).map(function (data) {
            return data[id];
        }).join(",");
    }
    function getSelected() {
        return this.data("table")._datas.filter(function (_data) {
            return _data.selected;
        }).map(function (_data) {
            return _data.data;
        })
    }
    function getSelectedIDs() {
        var $self = this, id = $self.data("table").id;
        return getSelected.call(this).map(function (data) {
            return data[id];
        }).join(",");
    }
    function _getColumns(columns) {
        var cols = [];
        getCols(columns);
        return cols.reduce(function (target, column) {
            if (column.type !== "expand") {
                target.push(column);
            }
            return target;
        }, []);
        function getCols(columns) {
            columns.forEach(function (column) {
                if (column.columns && column.columns.length) {
                    getCols(column.columns);
                } else {
                    cols.push(column);
                }
            })
        }
    }
    function _getHeader(columns) {
        var headers = [];
        var i = 0;
        /* 获取扁平化表头数据 */
        var flats = [];
        columns.forEach(function (column) {
            getDeep(column);
            getLevel(column);
            getColspan(column);
            getFlats(column);
        });
        var maxDeep = flats.reduce(function (maxDeep, current) {
            return Math.max(maxDeep, current._deep);
        }, 0) + 1;
        headers.deep = maxDeep;
        flats.forEach(function (column) {
            column._rowspan = column._deep ? 1 : maxDeep - column._level;
        });
        flats = flats.filter(function (column) {
            return column.type !== "expand";
        });
        while (flats.length) {
            var cols = [];
            flats.reduceRight(function (prev, current, idx) {
                if (current._level == i) {
                    [].push.apply(cols, flats.splice(idx, 1));
                }
            }, null);
            i++;
            cols.reverse();
            headers.push(cols);
        }
        return headers;
        function getDeep(column) {
            var maxDeep = 0;
            if (column.columns && column.columns.length) {
                column.columns.forEach(function (column) {
                    maxDeep = Math.max(maxDeep, getDeep(column) + 1);
                });
            }
            column._deep = maxDeep;
            return maxDeep;
        }
        function getLevel(column) {
            var _column = column;
            _column._level = _column._level || 0;
            if (_column.columns && _column.columns.length) {
                _column.columns.forEach(function (column) {
                    column._level = (_column._level || 0) + 1;
                    getLevel(column);
                });
            }
        }
        function getColspan(column) {
            var colspan = 1;
            if (column.columns && column.columns.length) {
                colspan = column.columns.reduce(function (colspan, column) {
                    return colspan + getColspan(column);
                }, 0);
            }
            column._colspan = colspan;
            return colspan;
        }
        function getFlats(column) {
            flats.push(column);
            if (column.columns && column.columns.length) {
                column.columns.forEach(function (column) {
                    getFlats(column);
                });
            }
        }
    }
    function _getColumnLength(columns) {
        return columns.reduce(function (length, column) {
            if (column.columns && column.columns.length) {
                return length + _getColumnLength(column.columns);
            } else if (column.type === "expand") {
                return length;
            } else {
                return length + 1;
            }
        }, 0);
    }
    /*防止xss攻击，进行字符转换*/
    function safeStr(str){
        if(typeof str !== 'string') return str;
        if(!str) return '';
        return str.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    /*反向转译字符*/
    function unSafeStr(str){
        if(typeof str !== 'string') return str;
        if(!str) return '';
        return str.replace(/&lt;/g,'\<').replace(/&gt;/g,'\>').replace(/&quot;/g, '\"').replace(/&#039;/g, "\'");
    }
    function _render() {
        var $self = this;
        var params = $self.data("table");
        var onChecked = params.onChecked;
        var onUnchecked = params.onUnchecked;
        var _expandColumn;
        var expandCls = params.expandCls;
        var footer = params.footer;
        var datas = params.datas;
        var _columns = _getColumns(params.columns);
        var headers = _getHeader(params.columns);
        var columnLength = _getColumnLength(params.columns) + (params.showNo ? 1 : 0) + (params.showCheckbox ? 1 : 0);
        params.columns.forEach(function (column) {
            if (column.type === "expand") {
                _expandColumn = column;
            }
        });
        this.addClass(params.cls).html([
            $("<thead/>", {
                "class": params.headCls
            }).append(
                function () {
                    return [$("<tr/>").append(
                        function () {
                            if (params.showNo) {
                                return $("<th/>", {
                                    "class": "table-no",
                                    "rowspan": headers.deep
                                }).append(
                                    document.createTextNode("序号")
                                    )
                            }
                        }(),
                        function () {
                            if (params.showRadio) {
                                return $("<th/>", {
                                    "class": "table-head-radio",
                                    "rowspan": headers.deep
                                }).append(
                                    document.createTextNode("选择")
                                    )
                            } else if (params.showCheckbox) {
                                return $("<th/>", {
                                    "class": "table-checkbox",
                                    "rowspan": headers.deep
                                }).append(
                                    $("<label/>").append(
                                        $("<label/>", {
                                            "class": "table-right-checkbox"
                                        }).append(
                                            function () {
                                                var checkbox = document.createElement("input");
                                                checkbox.type = "checkbox";
                                                if (params._datas) {
                                                    if (params._datas.length || params._showNoRowMsg) {
                                                        checkbox.checked = params._datas.filter(function (_data) {
                                                            /* 排除掉不可修改状态的数据 */
                                                            return !_data.disableToggleChecked;
                                                        }).every(function (_data) {
                                                            return _data.checked;
                                                        });
                                                    }
                                                }
                                                checkbox.addEventListener("change", function () {
                                                    params._datas.forEach(function (_data) {
                                                        /* 如果该数据是不可修改选中状态，那么保持不变 */
                                                        if (_data.disableToggleChecked) {
                                                            return;
                                                        }
                                                        _data.checked = checkbox.checked;
                                                        /* 触发被选中事件或被取消选中事件 */
                                                        checkbox.checked ? onChecked(_data.data) : onUnchecked(_data.data);
                                                    });
                                                    _render.call($self);
                                                });
                                                return [
                                                    checkbox,
                                                    $("<span/>", {
                                                        "class": "table-checkbox-container"
                                                    })
                                                ]
                                            }()
                                            ),
                                        document.createTextNode(" 选择")
                                    )
                                    )
                            }
                        }(),
                        headers[0].map(function (column) {
                            return $("<th/>", {
                                "class": column.cls || "",
                                "rowspan": column._rowspan,
                                "colspan": column._colspan
                            }).append(
                                function () {
                                    if (typeof column.title === "function") {
                                        return column.title.call($self, column.field, column);
                                    }
                                    return document.createTextNode(column.title)
                                }
                                )
                        })
                    )]
                }()
                ).append(
                function () {
                    return headers.slice(1).map(function (columns) {
                        return $("<tr/>").append(
                            columns.map(function (column) {
                                return $("<th/>", {
                                    "class": column.cls || "",
                                    "rowspan": column._rowspan,
                                    "colspan": column._colspan
                                }).append(
                                    function () {
                                        if (typeof column.title === "function") {
                                            return column.title.call($self, column.field, column);
                                        }
                                        return document.createTextNode(column.title)
                                    }
                                    )
                            })
                        )
                    })
                }()
                ),
            $("<tbody/>").append(
                function () {
                    if ((!params._datas || !params._datas.length) && params._showNoRowMsg) {
                        return $("<tr/>").append(
                            $("<td/>", {
                                "colspan": function () {
                                    return params.columns.length + params.showNo + params.showCheckbox + params.showRadio;
                                }
                            }).append(
                                params.noRowMsg(params._datas)
                                )
                        )
                    }
                    return params._datas.reduce(function (_target, _data, idx) {
                        var data = _data.data;
                        var row = $("<tr/>", {
                            "click": function (event) {
                                var selected;
                                if (params.select) {
                                    if ($(event.target).closest(".table-right-checkbox").length) {
                                        _data.checked = !_data.checked;
                                    }
                                    selected = !!_data.selected;
                                    if (params.singleSelect) {
                                        params._datas.forEach(function (_data) {
                                            _data.selected = false;
                                        });
                                    }
                                    _data.selected = !selected;
                                    _render.call($self);
                                }
                            }
                        }).toggleClass("selected", !!_data.selected);
                        row.append(
                            function () {
                                if (params.showNo) {
                                    return $("<td/>").append(
                                        document.createTextNode(params.number(idx))
                                    )
                                }
                            }(),
                            function () {
                                if (params.showRadio) {
                                    return $("<td/>").append(
                                        $("<label/>", {
                                            "class": function () {
                                                var cls = "table-radio";
                                                if (_data.disableToggleChecked) {
                                                    cls += " disabled"
                                                }
                                                return cls;
                                            }
                                        }).append(
                                            function(){
                                                var radio=document.createElement("input");
                                                radio.type="radio";
                                                radio.checked=!!_data.checked;
                                                /* 不可修改选中状态的数据的复选框(单选框)变为不可用状态 */
                                                radio.disabled=_data.disableToggleChecked;
                                                radio.addEventListener("change",function(){
                                                    params._datas.forEach(function(item){
                                                        item.checked=false;
                                                    })
                                                    _data.checked=this.checked;
                                                    /* 触发被选中事件或被取消选中事件 */
                                                    this.checked?onChecked(_data.data):onUnchecked(_data.data);
                                                    _render.call($self);
                                                });
                                                return radio;
                                            }()
                                            )
                                    )
                                }else if (params.showCheckbox) {
                                    return $("<td/>").append(
                                        $("<label/>", {
                                            "class": function () {
                                                var cls = "table-right-checkbox";
                                                if (_data.disableToggleChecked) {
                                                    cls += " disabled";
                                                }
                                                return cls;
                                            }
                                        }).append(
                                            function () {
                                                var checkbox = document.createElement("input");
                                                checkbox.type = "checkbox";
                                                checkbox.checked = !!_data.checked;
                                                /* 不可修改选中状态的数据的复选框(单选框)变为不可用状态 */
                                                checkbox.disabled = _data.disableToggleChecked;
                                                checkbox.addEventListener("change", function () {
                                                    _data.checked = this.checked;
                                                    /* 触发被选中事件或被取消选中事件 */
                                                    this.checked ? onChecked(_data.data) : onUnchecked(_data.data);
                                                    _render.call($self);
                                                });
                                                return [
                                                    checkbox,
                                                    $("<span/>", {
                                                        "class": "table-checkbox-container"
                                                    })
                                                ]
                                            }()
                                            )
                                    )
                                }
                            }(),
                            _columns.map(function (_column) {
                                return $("<td/>", {
                                    html: function () {
                                        var formatter = _column.formatter;
                                        if (formatter) {
                                            return formatter.call($self, data[_column.field], data, idx, _column.field,row);
                                        }
                                        return safeStr(data[_column.field])||"";
                                    },
                                    "class":_column.cellCls||"",
                                    title:function(){
                                        if(_column.cellTitle!==false){
                                            return unSafeStr(this.innerHTML);
                                        }else{
                                            return "";
                                        }
                                    }
                                })
                            })
                            );
                        row.on(Object.keys(params.rowEvents).reduce(function (target, key) {
                            target[key] = params.rowEvents[key].bind(row, data, idx);
                            return target;
                        }, {}));
                        _target.push(row);
                        if (_expandColumn) {
                            _target.push($("<tr/>", {
                                "class": function () {
                                    return expandCls + (_data.expand ? "" : " hidden");
                                }
                            }).append(
                                $("<td/>", {
                                    "colspan": columnLength,
                                    html: function () {
                                        var field = _expandColumn.field;
                                        var formatter = _expandColumn.formatter;
                                        if (formatter) {
                                            return formatter.call($self, data[field], data, idx, field);
                                        }
                                        return data[field];
                                    }
                                })
                                ), $("<tr/>", {
                                    "class": "hidden"
                                }));
                        }
                        return _target;
                    }, [])
                }()
            ),
            function () {
                var footContent = footer.call($self, datas, columnLength);
                if (footContent) {
                    return $("<tfoot/>").append(
                        $("<tr/>").append(footContent)
                    )
                }
            }()
        ]);
    }
})(jQuery);