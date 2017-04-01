var attributeObj = function attributeObj(label, name, value, type) {
    this.label = label;
    this.name = name;
    this.value = value;
    this.type = type;
}

var MyExtension = (function () {
    var Xrm = window.opener.Xrm;
    var infoData, attributeData, filteredList;
    var FORM_TYPES = {
        0: "Undefined",
        1: "Create",
        2: "Update",
        3: "Read Only",
        4: "Disabled",
        5: "Quick Create (Deprecated)",
        6: "Bulk Edit",
        11: "Read Optimized (Deprecated)"
    };
    var timer;
    /*======================== START: PRIVATE FUNCTIONS ========================*/

    var _tabChanged = function (el) {
        var links = $(el).parents('ul').find('a');
        if (links.length > 0) {
            for (var i = 0; i < links.length; i++) {
                links[i].className = links[i].className.replace("pure-button-primary", "").trim();
            }
            el.classList.add("pure-button-primary");
        }
    }

    var _showHideTab = function (isShowInfo, isShowAttribute, isShowOthers) {
        if (isShowInfo == true)
            document.getElementById("tbInfo").removeAttribute("hidden");
        else
            document.getElementById("tbInfo").setAttribute("hidden", "hidden");

        if (isShowAttribute == true)
            document.getElementById("tbAttribute").removeAttribute("hidden");
        else
            document.getElementById("tbAttribute").setAttribute("hidden", "hidden");

        if (isShowOthers == true)
            document.getElementById("tbOthers").removeAttribute("hidden");
        else
            document.getElementById("tbOthers").setAttribute("hidden", "hidden");
    }

    var _parseLookupInfo = function (attrValue) {
        if (attrValue == null) return "";

        var item = attrValue[0];
        var html = ["Name: <b class='text-blue'>", item.name, "</b><br/>",
                    "ID: <b class='text-blue'>", item.id.replace('{', '').replace('}', ''), "</b><br/>",
                    "Entity: <b class='text-blue'>", item.entityType, "</b>"].join('');

        return html;
    }

    var _parseOptionSetInfo = function (attr) {
        if (attr == null || attr.getValue() == null) return "";

        var html = ["Text: <b class='text-blue'>", attr.getText(), "</b><br/>",
                    "Value: <b class='text-blue'>", attr.getValue(), "</b>"].join('');
        return html;
    }

    var _getAttributeActions = function (attrName) {
        try {
            var html = "<div class='pure-g'>";
            var ctl = Xrm.Page.getControl(attrName);
            // Get/Set Disable
            // Notes: some fields cannot be disabled via setDisable function (e.g. Originating Lead field in Contact)
            html += "<div class='pure-u-1-2'>";
            if (ctl && typeof ctl.getDisabled === "function") {
                var elLock = "<img id='lock-" + attrName + "' class='pure-img' style='cursor: pointer' src='../ex_imgs/{lock}.png' onclick=\"MyExtension.setDisable('" + attrName + "')\"/>";
                elLock = elLock.replace("{lock}", (ctl.getDisabled() == true) ? "lock16" : "unlock16");
                html += elLock;
            }
            html += "</div>";

            // TODO: Get/Set Visible
            html += "<div class='pure-u-1-2'>";
            if (ctl && typeof ctl.getVisible === "function") {
                var elVisible = "<img id='display-" + attrName + "' class='pure-img' style='cursor: pointer' src='../ex_imgs/{visible}.png' onclick=\"MyExtension.setVisible('" + attrName + "')\"/>";
                elVisible = elVisible.replace("{visible}", (ctl.getVisible() == true) ? "visible16" : "invisible16");
                html += elVisible;
            }
            html += "</div>";

            html += "</div>";
            return html;
        } catch (ex) {
            console.error(ex.message);
            return null;
        }
    }

    var _sortAttributeLabel = function (ascending, colName) {

        return function (a, b) {
            var col = colName;
            if (!col || col == null)
                col = "label";

            if (a[col] == null || a[col] == "") {
                return 1;
            }
            else if (b[col] == null || b[col] == "") {
                return -1;
            }
            else if (a[col] === b[col]) {
                return 0;
            }
            else if (ascending) {
                return a[col] < b[col] ? -1 : 1;
            }
            else if (!ascending) {
                return a[col] < b[col] ? 1 : -1;
            }
        };
    }

    var _searchAttribute = function (attr, index, arr) {
        var text = this.text;
        if (text.length <= 2)
            return true;

        if (attr.label.toLowerCase().indexOf(text.toLowerCase()) > -1)
            return true;
        else if (attr.name.toLowerCase().indexOf(text.toLowerCase()) > -1)
            return true;

        return false;
    }

    var _createInfoRow = function (tBody, info) {
        for (var i = 0; i < info.length; i++) {
            var tr = document.createElement("tr");
            var item = info[i];
            for (var key in item) {
                var td = document.createElement("td");
                td.innerHTML = item[key];
                if (key == "name")
                    td.style.wordBreak = "break-all";
                tr.appendChild(td);
            }
            tBody.appendChild(tr);
        }
    }

    /*======================== END: PRIVATE FUNCTIONS ========================*/

    /*======================== START: PUBLIC FUNCTIONS ========================*/

    var tabInfo_Clicked = function (el) {
        _tabChanged(el);
        _showHideTab(true, false, false);
        if (infoData)
            return;
        var tBody = document.getElementById("tbInfo").tBodies[0];
        $(tBody).empty();

        var info = [];
        var entityName = Xrm.Page.data.entity.getEntityName();
        var entityId = Xrm.Page.data.entity.getId().replace("{", "").replace("}", "");;
        var clientUrl = Xrm.Page.context.getClientUrl();
        var entityUrl = clientUrl + "/main.aspx?etn=" + entityName + "&pagetype=entityrecord&id=%7B" + entityId + "%7D";
        info.push({ name: "Entity Name", value: entityName });
        info.push({ name: "Form Type", value: FORM_TYPES[Xrm.Page.ui.getFormType()] });
        info.push({ name: "Record Url", value: "<a href='" + entityUrl + "' target='_blank'>" + entityUrl + "</a>" });
        info.push({ name: "User ID", value: Xrm.Page.context.getUserId().replace("{", "").replace("}", "") });
        info.push({ name: "User Name", value: Xrm.Page.context.getUserName() });

        var arrUserRoles = Xrm.Page.context.getUserRoles();
        var filter = "";
        var userRoles = "";
        for (var i in arrUserRoles) {
            filter += "RoleId eq guid'" + arrUserRoles[i] + "' or ";
        }
        filter = filter.substr(0, filter.length - 3);
        var odataSelect = clientUrl + "/XRMServices/2011/OrganizationData.svc" + "/" + "RoleSet?$select=RoleId,Name&$filter=" + filter;
        $.ajax(
        {
            type: "GET",
            async: false,
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: odataSelect,
            beforeSend: function (XMLHttpRequest) { XMLHttpRequest.setRequestHeader("Accept", "application/json"); },
            success: function (data, textStatus, XmlHttpRequest) {
                for (var k in data.d.results) {
                    userRoles += "<b>" + data.d.results[k].Name + "</b>" + " {" + data.d.results[k].RoleId + "}<br/>";
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) { console.error('Cannot receive role info: ' + errorThrown); }
        });

        info.push({ name: "User Roles", value: userRoles });
        infoData = info;

        _createInfoRow(tBody, info);

    }

    var tabAttribute_Clicked = function (el) {
        _tabChanged(el);
        _showHideTab(false, true, false);
        if (attributeData)
            return;

        var tBody = document.getElementById("tbAttribute").tBodies[0];
        $(tBody).empty();

        var attributes = [];
        var attributeType;
        var attrName, attrValue, label;
        var listAttr = Xrm.Page.data.entity.attributes.getAll();

        // #region Add attributes into attribute list        
        for (var i in listAttr) {
            var attr = listAttr[i];
            attrName = attr.getName();
            var ctl = Xrm.Page.getControl(attrName);
            if (ctl != null && typeof ctl.getLabel === "function")
                label = ctl.getLabel();
            else
                label = "";
            attributeType = attr.getAttributeType();
            switch (attributeType.toLowerCase()) {
                case "optionset":
                    attrValue = _parseOptionSetInfo(attr);
                    break;
                case "lookup":
                    attrValue = _parseLookupInfo(attr.getValue());
                    break;
                default:
                    attrValue = attr.getValue();
                    break;
            }
            var obj = new attributeObj(label, attrName, attrValue, attributeType);
            obj.actions = _getAttributeActions(attrName);
            attributes.push(obj);
        }
        attributes.sort(_sortAttributeLabel(true));
        attributeData = attributes;
        // #endregion

        _createInfoRow(tBody, attributes);
    }

    var tabOthers_Clicked = function (el) {
        _tabChanged(el);
        _showHideTab(false, false, true);
    }

    var btnSearch_Clicked = function () {
        // NOT IN USE

    }

    var searchText_Changed = function (val) {
        // Prevent user keying fast
        clearTimeout(timer);
        timer = setTimeout(function () {
            var filteredAttributes;
            if (!attributeData)
                return;

            filteredAttributes = attributeData.filter(_searchAttribute, { text: val.trim() });
            var tBody = document.getElementById("tbAttribute").tBodies[0];
            $(tBody).empty();
            _createInfoRow(tBody, filteredAttributes);
            filteredList = filteredAttributes;
        }, 500);

    }

    var setDisable = function (attrName) {
        var ctl = Xrm.Page.getControl(attrName);
        var disable = !ctl.getDisabled();
        ctl.setDisabled(disable);
        var el = document.getElementById("lock-" + attrName);
        var imgName = (disable == true) ? "lock16" : "unlock16";
        el.setAttribute("src", "../ex_imgs/" + imgName + ".png");
    }

    var setVisible = function (attrName) {
        var ctl = Xrm.Page.getControl(attrName);
        var visible = !ctl.getVisible();
        ctl.setVisible(visible);
        var el = document.getElementById("display-" + attrName);
        var imgName = (visible == true) ? "visible16" : "invisible16";
        el.setAttribute("src", "../ex_imgs/" + imgName + ".png");
    }

    var doSorting = function (el) {
        console.log(el);

        var colName = el.getAttribute("col-data");
        var sortType = el.getAttribute("sort");
        //var isSorting = el.getAttribute("sorting");
        if (colName == null || sortType == null || !attributeData)
            return;

        var tBody = document.getElementById("tbAttribute").tBodies[0];
        var sortedList;
        if (filteredList && filteredList != null)
            sortedList = filteredList;
        else
            sortedList = attributeData;
        sortedList = sortedList.sort(_sortAttributeLabel(sortType.trim().toLowerCase() == "desc", colName));
        $(tBody).empty();
        _createInfoRow(tBody, sortedList);
        el.setAttribute("sort", sortType.trim().toLowerCase() == "asc" ? "desc" : "asc");
    }

    /*======================== END: PUBLIC FUNCTIONS ========================*/

    /*======================== RETURNS ========================*/

    return {
        tabInfo_Clicked: tabInfo_Clicked,
        tabAttribute_Clicked: tabAttribute_Clicked,
        tabOthers_Clicked: tabOthers_Clicked,
        btnSearch_Clicked: btnSearch_Clicked,
        searchText_Changed: searchText_Changed,
        setDisable: setDisable,
        setVisible: setVisible,
        doSorting: doSorting
    }
})();