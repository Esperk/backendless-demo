$(function() {
    function createPopup(text, type) {
        var $popup = $("<div class='popup'></div>"),
            $body = $('body');
        if (type) {
            $popup.addClass(type);
        }
        $popup.text(text);
        if ($body.find('.popup').length) {
            $('.popup').remove();
        }
        $body.append($popup);
        $popup.animate({
            right: '20px',
            opacity: 0.8
        }, 500);
        setTimeout(function () {
            $popup.animate({
                right: '-' + $popup.width() + 'px',
                opacity: 0
            }, 500);
            setTimeout(function () {
                $popup.remove();
            }, 500);
        }, 3000);
    }

    $rootScope.goToOperationMenu = function(e) {
        $rootScope.table = e;
        $rootScope.showHide('.operations', '.index');
    };

    $rootScope.cudOperation = function (type) {
        $rootScope.showHide('#cudOperation', '.operations');
        $rootScope.type = type;
        $rootScope.changeCUDEditorText();
    };

    $rootScope.changeCUDEditorText = function () {
        var $editor = $('#editor');
        $editor.find('pre').removeClass('activePre');
        if ($rootScope.type == 'Create') {
            $editor = $editor.next();
        } else if ($rootScope.type == 'Update') {
            $editor = $editor.next().next();
        } else if ($rootScope.type == 'Delete') {
            $editor = $editor.next().next().next();
        }
        $editor.find('.table').text($rootScope.table);
        $editor.addClass('activePre');
        ace.edit("editor").setValue($editor.text());
        ace.edit("editor").session.selection.clearSelection();
        $rootScope.emailBodyToSend = 'cud';
    };

    $rootScope.changeFINDEditortext = function () {
        var $editor = $('#editor2').next();
        $editor.find('.method').text($rootScope.findType);
        $editor.find('.table').text($rootScope.table);
        ace.edit("editor2").setValue($editor.text());
        ace.edit("editor2").session.selection.clearSelection();
        $rootScope.emailBodyToSend = 'simpleFind';
    };

    $rootScope.changeCFINDEditortext = function () {
        var $editor = $('#editor3').next();
        $editor.find('.complexType').text($rootScope.complexFindType);
        $editor.find('.table').text($rootScope.table);
        ace.edit("editor3").setValue($editor.text());
        ace.edit("editor3").session.selection.clearSelection();
        $rootScope.emailBodyToSend = 'complexFind';
    };

    $rootScope.dataParse = function (dataToParse, sort) {
        if(sort){
            for(var key in dataToParse){
                for(var key2 = 0, klen = dataToParse._private_relations.length; key2 < klen; key2++){
                    if(dataToParse._private_relations[key2] == key){
                        delete dataToParse[key];
                    }
                }
            }
        }
        for(var key in dataToParse){
            var value = dataToParse[key];
            if(key != '___class' && key != '__meta' && key != '_private_relations' && key != '_private_dates' && key != '_private_geoRelations') {
                if(value) {
                    if (value.toString().search(/function \(/) == -1 && value.toString().search(/function\(/) == -1) {
                        $rootScope.parsedData[key] = value;
                    }
                } else {
                    if(value === false){
                        $rootScope.parsedData[key] = 'false';
                    } else {
                        $rootScope.parsedData[key] = 'null';
                    }
                }
            }
        }
    };

    $rootScope.dataParseForFind = function (dataToParse) {
        var obj = {};
        for(var key in dataToParse) {
            var value = dataToParse[key];
            if (key != '___class' && key != '__meta' && key != '_private_relations' && key != '_private_dates' && key != '_private_geoRelations') {
                if (value && value.toString().search(/function \(/) == -1 && value.toString().search(/function\(/) == -1) {
                    obj[key] = value;
                } else {
                    if (value === false) {
                        obj[key] = 'false';
                    } else {
                        obj[key] = 'null';
                    }
                }
            }
        }
        return obj;
    };

    $rootScope.showHide = function (show, hide) {
        $(show).show("2000");
        $(hide).hide("2000");
        if(show == '#sendByMail'){
            var $center = $('#sendByMail .center');
            if($rootScope.emailBodyToSend == 'cud') {
                $center.eq(0).show();
            } else
            if($rootScope.emailBodyToSend == 'simpleFind') {
                $center.eq(1).show();
            } else
            if($rootScope.emailBodyToSend == 'complexFind') {
                $center.eq(2).show();
            }
        }
    };

    $rootScope.simpleFind = function (findType) {
        $rootScope.showHide('#simpleFind', '.retrieve');
        $rootScope.findType = findType;
        $rootScope.changeFINDEditortext();
    };

    $rootScope.complexFind = function (findType) {
        $rootScope.showHide('#complexFindCheck', '.retrieve');
        $rootScope.complexFindType = findType;
        $rootScope.showCheckTable();
        $rootScope.changeCFINDEditortext();
    };

    $rootScope.sendMail = function () {
        var emailBody;
        if ($rootScope.emailBodyToSend == 'cud') {
            emailBody = $('#cudOperation .activePre').text();
        } else if ($rootScope.emailBodyToSend == 'simpleFind') {
            emailBody = $('.simpleFind pre').text();
        } else if ($rootScope.emailBodyToSend == 'complexFind') {
            emailBody = $('.complexFind pre').text();
        }
        var bodyParts = new Bodyparts({textmessage: emailBody, htmlmessage: "Code Example"});
        var email = $('#email').val();
        if (!email) {
            createPopup("Please enter email", 'error');
        } else {
            try {
                Backendless.Messaging.sendEmail($rootScope.table, bodyParts, [email], false);
                createPopup('Email sent', 'successPopup');
            } catch(e){
                createPopup(e.message, 'error');
            }
        }
    };

    function successCallshowHide(){
        $rootScope.showHide('#info', '#cudOperation');
        $('#info').find("#action").html($rootScope.type.toLowerCase() + "d");
    }

    function createInstance(){
        var obj = $rootScope.createInstanceOf($rootScope.table);

        var describedProps = obj._private_describeClass();
        for (var prop = 0, proplen = describedProps.length; prop < proplen; prop++) {
            if (describedProps[prop].relatedTable && describedProps[prop].isPrimaryKey) {
                var relObj = new $rootScope.Classes[describedProps[prop].relatedTable];
                delete relObj._private_relations;
                obj[describedProps[prop].name] = relObj;
            }
        }
        try{
            obj.save();
            successCallshowHide();
        } catch(e){
            createPopup(e.message, 'error');
        }
    }

    $rootScope.runCode = function(){
        if($rootScope.type == 'Update'){
            try {
                var data = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).findFirst();
				var updatedData = $rootScope.tablesList[$rootScope.table](data);
                updatedData.save();
                successCallshowHide();
            } catch(e){
                createPopup(e.message, 'error')
            }
        } else if($rootScope.type == 'Create') {
            createInstance();
        } else if($rootScope.type == 'Delete'){
            var obj = {};
            try {
                obj = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).findFirst();
                try {
                    obj.remove();
                    successCallshowHide();
                } catch(e) {
                    createPopup(e.message, 'error');
                }
            } catch(e) {
                createPopup(e.message, 'error');
            }
        }
    };

    function parsingArrays(html, value){
        if(value.length > 0) {
            var arrHtml = "<h3>" + value[0].___class + "</h3>";
            for (var j = 0, jlen = value.length; j < jlen; j++) {
                if(value[j]) {
                    arrHtml += "<br />";
                    var valueNew = $rootScope.dataParseForFind(value[j]);
                    var arr = [];
                    for (var jj in valueNew) {
                        if(Backendless.Utils.isObject(valueNew[jj])){
                            arr.push(jj + ": relatedObjects");
                        } else {
                            arr.push(jj + ":" + valueNew[jj]);
                        }
                    }
                    arrHtml += arr.join("<br />");
                } else {
                    arrHtml += 'null';
                }
            }
            html += '<div class="attr">' + arrHtml + '<br /><br /></div>';
        } else {
            html += '<div class="attr">null</div>';
        }

        return html;
    }

    function parsingObject(value, key, html){
        if(value){
            if(Backendless.Utils.isObject(value)){
                html += '<div class="attr">' + key + ': relatedObjects</div>';
            } else {
                var arrHtml = key + ":<b>" + value.___class + "</b> {<br />";
                var valueNew = $rootScope.dataParseForFind( value );
                for( var keyIn in valueNew )
                {
                    arrHtml += keyIn + ": " + value[keyIn] + '<br />';
                }
                html += '<div class="attr">' + arrHtml + '}</div>';
            }
        } else {
            html += '<div class="attr">null</div>';
        }

        return html;
    }

    function parsingGeoArrays(html, key, value){
        if(value.length > 0) {
            var arrHtml = "<h3>" + key + ": " + "GeoPoints</h3>";
            for (var j = 0, jlen = value.length; j < jlen; j++) {
                if(value[j]) {
                    arrHtml += "<br />";
                    var code = "";
                    code += parsingGeoObject(value[j], j, code);
                    arrHtml += code;
                } else {
                    arrHtml += 'null';
                }
            }
            html += '<div class="attr">' + arrHtml + '<br /><br /></div>';
        } else {
            html += '<div class="attr">' + key + ': ' + 'null</div>';
        }

        return html;
    }

    function parsingGeoObject(value, key, html){
        if(value != 'null'){
            var arrHtml = key + ":<b>GeoPoint</b> {<br />";
            var valueNew = $rootScope.dataParseForFind( value );
            for( var keyIn in valueNew )
            {
                if(keyIn == 'categories'){
                    arrHtml += keyIn + ": " + value[keyIn].join(",") + '<br />';
                } else if(keyIn == 'metadata'){
                    arrHtml += keyIn + ":" + parseMetadata(value[keyIn]) + '<br />';
                } else {
                    arrHtml += keyIn + ": " + value[keyIn] + '<br />';
                }
            }
            html += '<div class="attr">' + arrHtml + '}</div>';
        } else {
            html += '<div class="attr">' + key + ': ' + 'null</div>';
        }

        return html;
    }

    function parseMetadata(value){
        var result = " { ";
        for(var key in value){
            var val = value[key];
            if(Backendless.Utils.isObject(val)){
                result += key + ": related DataObjects";
            } else {
                result += key + ":" + val;
            }
        }
        result += " }";
        return result;
    }

    function resultCallback(response){
        $rootScope.data = response;
        $rootScope.parsedData = {};
        $rootScope.dataParse($rootScope.data);
        var html = "";
        for(var key in $rootScope.parsedData) {
            var value = $rootScope.parsedData[key];
            if(response._private_geoRelations.indexOf(key) != -1){
                if(Backendless.Utils.isArray(value)){
                    html = parsingGeoArrays(html, key, value);
                } else {
                    html = parsingGeoObject(value, key, html);
                }
            } else {
                if (Backendless.Utils.isObject(value)) {
                    if(Backendless.Utils.isArray(value)){
                        html = parsingArrays(html, value);
                    } else {
                        html = parsingObject(value, key, html);
                    }
                } else {
                    var obj = new $rootScope.Classes[$rootScope.table](),
                        str;
                    for(var j = 0, jlen = obj._private_dates.length; j < jlen; j++){
                        if(obj._private_dates[j] == key){
                            value = (value != 'null') ? new Date(value): 'null';
                        }
                    }
                    html += '<div class="attr">' + key + ": " + value + '</div>';
                }
            }
        }
        var $center = $('#uniqueAttrContainer .center');
        $('#uniqueAttrContainer .attrs').html(html);
        $center.hide();
        $center.eq(1).show();
        $rootScope.showHide('#uniqueAttrContainer', '#simpleFind');
    }

    $rootScope.runSimpleFindCode = function(){
        var response = {};
        if($rootScope.findType == 'find') {
            try {
                response = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).find();
                $rootScope.showHide('#attrContainer', '#simpleFind');
                $rootScope.data = response.data;
                $rootScope.props = response.data[0];
                $rootScope.parsedData = {};
                $rootScope.dataParse($rootScope.props);
                var html = "";
                for(var key in $rootScope.parsedData){
                    html += '<div class="block" onclick="showValues(\'' + key + '\')">' + key + '</div>';
                }
                $('.simpleFindHTML').html(html);
            } catch (error) {
                createPopup(error.message, 'error')
            }
        } else if($rootScope.findType == 'findFirst') {
            try{
                response = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).findFirst();
                resultCallback(response);
            } catch(error) {
                createPopup(error.message, 'error')
            }
        } else if($rootScope.findType == 'findLast') {
            try{
                response = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).findLast();
                resultCallback(response);
            } catch(error) {
                createPopup(error.message, 'error')
            }
        }
    };

    $rootScope.showValues = function(key){
        var html = "";
        for(var i = 0, len = $rootScope.data.length; i < len; i++){
            for(var k in $rootScope.data[i]){
                var value = $rootScope.data[i][k];
                if(k == key){
                    if(Backendless.Utils.isObject(value)){
                        if(Backendless.Utils.isArray(value)){
                            html = parsingArrays(html, value);
                        } else {
                            html = parsingObject(value, key, html);
                        }
                    } else {
                        var obj = new $rootScope.Classes[$rootScope.table](),
                            str;
                        for(var j = 0, jlen = obj._private_dates.length; j < jlen; j++){
                            if(obj._private_dates[j] == k){
                                $rootScope.data[i][k] = ($rootScope.data[i][k] != 'null') ? new Date($rootScope.data[i][k]) : 'null';
                            }
                        }
                        html += '<div class="attr">' + $rootScope.data[i][k] + '</div>';
                    }
                }
            }
        }
        var $center = $('#uniqueAttrContainer .center');
        $('#uniqueAttrContainer .attrs').html(html);
        $center.hide();
        $center.eq(0).show();
        $rootScope.showHide('#uniqueAttrContainer', '#attrContainer');
    };

    $rootScope.showCheckTable = function(){
        function showParsed(){
            var html = "";
            for(var key in $rootScope.parsedData){
                html += '<div class="attr" onclick="checkProperty(this)">' + key + '</div>';
            }
            $('#complexFindCheck .attrs').html(html);
        }
        if($rootScope.complexFindType == 'findSort') {
            try {
                $rootScope.propsToCheck = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).findFirst();
                $rootScope.checked = {};
                $rootScope.parsedData = {};
                $rootScope.dataParse($rootScope.propsToCheck, 'sort');
                showParsed();
            } catch(error) {
                createPopup(error.message, 'error');
            }
        } else if($rootScope.complexFindType == 'findRel') {
            $rootScope.parsedData = {};
            var newObj = new $rootScope.Classes[$rootScope.table];
            for(var key in newObj){
                var value = newObj[key];
                for(var rel = 0, rellen = newObj._private_relations.length; rel < rellen; rel++){
                    if(key = newObj._private_relations[rel])
                        $rootScope.parsedData[newObj._private_relations[rel]] = value;
                }
                for(var rel = 0, rellen = newObj._private_geoRelations.length; rel < rellen; rel++){
                    if(key = newObj._private_geoRelations[rel])
                        $rootScope.parsedData[newObj._private_geoRelations[rel]] = value;
                }
            }
            showParsed();
        }
    };

    $rootScope.checkProperty = function(e){
        var $block = $(e);
        ($block.hasClass("checkedProp")) ? $block.removeClass("checkedProp") : $block.addClass("checkedProp");
    };

    $rootScope.showExampleSort = function(){
        $rootScope.checked = [];
        $.each($('#complexFindCheck .attrs div'), function(index, value){
            if($(value).hasClass("checkedProp")){
                $rootScope.checked.push($(value).text().trim());
            }
        });
        $rootScope.showHide('#complexFind', '#complexFindCheck');
    };

    $rootScope.runComplexFindCode = function(){
        var dataQuery = {};
        if($rootScope.complexFindType == 'findSort') {
            dataQuery = {
                options: {sortBy: $rootScope.checked}
            };
            try {
                $rootScope.sortData = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).find(dataQuery).data;
                $rootScope.sortDataFirst = $rootScope.sortData[0];
                $rootScope.parsedData = {};
                $rootScope.dataParse($rootScope.sortDataFirst);
                var html = "";
                for(var key in $rootScope.parsedData){
                    html += '<div class="block" onclick="showValuesAfterSort(\'' + key + '\')">' + key + '</div>';
                }
                $('#attrContainerSort .attrs').html(html);
                $rootScope.showHide('#attrContainerSort', '#complexFind');
            } catch(error){
                createPopup(error.message, 'error');
            }
        } else {
            dataQuery = {
                relations: $rootScope.checked
            };
            try {
                $rootScope.relatedData = Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).find(dataQuery).data;
                $rootScope.relatedDataToShow = {};
                $rootScope.relatedDataToShowParsed = [];
                for(var key in $rootScope.relatedData){
                    var value = $rootScope.relatedData[key];
                    Backendless.Persistence.of($rootScope.Classes[$rootScope.table]).loadRelations(value, ['*']);
                    var prop = value;
                    for(var propKey in prop){
                        $.each($rootScope.checked, function (key , checkedRel) {
                            if ($rootScope.relatedDataToShow[checkedRel]) {
                                return;
                            }
                            if (checkedRel == propKey) {
                                if (Backendless.Utils.isArray(prop[propKey])) {
                                    if (prop[propKey].length > 0) {
                                        $rootScope.relatedDataToShow[checkedRel] = prop[propKey][0];
                                    }
                                } else if (prop) {
                                    $rootScope.relatedDataToShow[checkedRel] = prop[propKey];
                                }
                            }
                        });
                    }
                }
                var html = "";
                for(var obj in $rootScope.relatedDataToShow){
                    html += '<h3>' + obj + '</h3>';
                    var value = $rootScope.relatedDataToShow[obj];
                    for(var key in $rootScope.relatedDataToShow[obj]){
                        if (value && value.toString().search(/function \(/) == -1 && value.toString().search(/function\(/) == -1 && key != '___class' && key != '__meta')
                            html += '<div class="block" onclick="showValuesAfterSort(\'' + key + '\', \'' + obj + '\')">' + key + '</div>';
                    }
                }
                $('#attrContainerRel .attrsCont').html(html);
                $rootScope.showHide('#attrContainerRel', '#complexFind');
            } catch(error){
                createPopup(error.message, 'error');
            }
        }
    };

    $rootScope.showValuesAfterSort = function(key, relation){
        if($rootScope.complexFindType == 'findSort') {
            var html = "";
            for(var i = 0, len = $rootScope.sortData.length; i < len; i++){
                for(var k in $rootScope.sortData[i]){
                    if(k == key){
                        if(Backendless.Utils.isArray($rootScope.sortData[i][key])){
                            $rootScope.sortData[i][key] = parsingArrays(html, $rootScope.sortData[i][key]);
                        } else if(Backendless.Utils.isObject($rootScope.sortData[i][key])){
                            $rootScope.sortData[i][key] = parsingObject(html, key, $rootScope.sortData[i][key])
                        } else {
                            if(!$rootScope.sortData[i][key]) {
                                if ($rootScope.sortData[i][key] === false) {
                                    $rootScope.sortData[i][key] = "false";
                                } else {
                                    $rootScope.sortData[i][key] = 'null';
                                }
                            }
                        }
                        var obj = new $rootScope.Classes[$rootScope.table]();
                        for(var j = 0, jlen = obj._private_dates.length; j < jlen; j++){
                            if(obj._private_dates[j] == key){
                                $rootScope.sortData[i][key] = ($rootScope.sortData[i][key] != 'null') ? new Date($rootScope.sortData[i][key]) : 'null';
                            }
                        }
                        html += '<div class="attr">' + $rootScope.sortData[i][key] + '</div>';
                    }
                }
            }
            var $center = $('#sortAttrContainer .center');
            $('#sortAttrContainer .attrs').html(html);
            $center.hide();
            $center.eq(0).show();
            $rootScope.showHide('#sortAttrContainer', '#attrContainerSort');
        } else if($rootScope.complexFindType == 'findRel') {
            $rootScope.showRelated = [];
            for(var objKey in $rootScope.relatedData){
                var obj = $rootScope.relatedData[objKey];
                if(obj[relation]) {
                    if(Backendless.Utils.isArray(obj[relation])){
                        if(obj[relation].length > 0) {
                            $.each(obj[relation], function (index, value) {
                                if (value[key]) {
                                    $rootScope.showRelated.push(value[key]);
                                } else {
                                    $rootScope.showRelated.push('null');
                                }
                            });
                        }
                    } else {
                        if(obj[relation][key]){
                            $rootScope.showRelated.push(obj[relation][key]);
                        } else {
                            $rootScope.showRelated.push('null');
                        }
                    }
                }
            }
            var html = "";
            for(var i = 0,len = $rootScope.showRelated.length; i < len; i++){
                if(Backendless.Utils.isArray($rootScope.showRelated[i])){
                    $rootScope.showRelated[i] = parsingArrays(html, $rootScope.showRelated[i]);
                    html += '<div>' + $rootScope.showRelated[i] + '</div>';
                } else if(Backendless.Utils.isObject($rootScope.showRelated[i])){
                    $rootScope.showRelated[i] = parsingObject(html, i, $rootScope.showRelated[i]);
                    html += '<div class="attr">' + $rootScope.showRelated[i] + '</div>';
                } else {
                    html += '<div class="attr">' + $rootScope.showRelated[i] + '</div>';
                }
            }
            var $center = $('#sortAttrContainer .center');
            $('#sortAttrContainer .attrs').html(html);
            $center.hide();
            $center.eq(1).show();
            $rootScope.showHide('#sortAttrContainer', '#attrContainerRel');
        }
    }
});
