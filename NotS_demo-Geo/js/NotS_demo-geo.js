$.holdReady(true);

$.getScript(((window.location.protocol == 'file:') ? "http:" : window.location.protocol) + "//api.backendless.com/sdk/js/latest/backendless.min.js", function() {
    $.holdReady(false);

$(function(){
    //Backendless: defaults

    var APPLICATION_ID = '15C508DC-9719-9288-FF64-67672CCB9700';
    var SECRET_KEY = '8208A170-3073-5B2D-FF7A-5C388513E800';
    var VERSION = 'v1';
    Backendless.serverURL = 'https://api.backendless.com';

    if (!APPLICATION_ID || !SECRET_KEY || !VERSION)
        alert("Missing application ID and secret key arguments. Login to Backendless Console, select your app and get the ID and key from the Manage > App Settings screen. Copy/paste the values into the Backendless.initApp call located in UserExample.js");

    init();
    function init() {
        Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);
    }

    var loadedCats = "";

    var cats = Backendless.Geo.getCategories();
    if(cats.length > 0){
        for(var obj in cats){
            if(cats[obj].size > 0){
                loadedCats += '<div class="block category' + cats[obj].name + ' ' + cats[obj].name.toLowerCase() + '">'+ cats[obj].name+'</div>';
            } else {
                loadedCats += '<div class="noPoints category' + cats[obj].name + ' ' + cats[obj].name.toLowerCase() + '">'+ cats[obj].name+'</div>';
            }
        }
        $('.index .tables').html(loadedCats);
    } else {
        $('.index .tables').html("<div class='noPointsBlock'>No Geo categories in your Application. Go to Backnedless Console to Add Category</div>");
    };

    $('.noPoints').each(function(){
        $(this).off('click');
        $(this).click(function(){
            createPopup('No points in ' + $(this).text() + ' category', 'error');
        });
    });


    var currentTarget, pointsArr, boundArr  = [], lines = "";

    function showCategoryScreen(hide, show){
        $(hide).hide();
        $(show).show();
    }

    function changeRadiusParams(){
        var $editor = $("#editor4");
        $editor.next().find('.latitude').text(pointsArr.Map.getCenter().lat());
        $editor.next().find('.longitude').text(getCenterOfCircle(pointsArr.Map.getCenter().lng()));
        $editor.next().find('.radius').text($('input[type=text]').val());
        $editor.next().find('.units').text($('select option:selected').val());
        $editor.next().find('.cat').text($("#" + currentTarget).attr('class').split(" ")[2]);
        (lines == "") ? $('#editor4').next().find('.cond').text("") : $('#editor4').next().find('.cond').text("condition : [\"" + lines + "\"]");
        ace.edit("editor4").setValue($('#editor4').next().text());
        ace.edit("editor4").session.selection.clearSelection();
    }

    function changeRectParams(){
        var $editor = $("#editor3");
        $editor.next().find('.rect').text(pointsArr.Map.getBounds().getNorthEast().lat()+', '+pointsArr.Map.getBounds().getSouthWest().lng()+', '+ pointsArr.Map.getBounds().getSouthWest().lat()+', '+pointsArr.Map.getBounds().getNorthEast().lng());
        $editor.next().find('.cat').text($("#" + currentTarget).attr('class').split(" ")[2]);
        (lines == "") ? $('#editor3').next().find('.cond').text("") : $('#editor3').next().find('.cond').text("condition : [\"" + lines + "\"]");
        ace.edit("editor3").setValue($('#editor3').next().text());
        ace.edit("editor3").session.selection.clearSelection();
    }

    function changeSelectedBoundaries(){
        if($('#' + currentTarget + 'Filter input[name=search]:checked').attr('id') == 'boundaries'){
            $('#' + currentTarget + 'Filter input#radius').next().find('input').attr('disabled',true);
            $('#' + currentTarget + 'Filter input#radius').next().find('select').attr('disabled',true);
        } else {
            $('#' + currentTarget + 'Filter input#radius').next().find('input').attr('disabled',false);
            $('#' + currentTarget + 'Filter input#radius').next().find('select').attr('disabled',false);
        }
    }

    function toggleClassToRemovePoints(){
        $('#' + currentTarget + 'Points .remove').each(function(){
            $(this).click(function(){
                if($(this).find('input').is(':checked')){
                    $(this).addClass('removed');
                } else {
                    $(this).removeClass('removed');
                }
            });
        });
    }

    function showInfo(parent, child){
        $(parent).hide("2000");
        $("#" + child).show("2000");
        if($('#' + currentTarget + 'Map').html().length == 0){
            pointsArr = GMapLoad(currentTarget);
        } else {
            var newArr = LoadPoints(currentTarget,pointsArr.Map);
            pointsArr.arr = newArr.arr;
            changeRectParams();
            changeRadiusParams();
        }
        google.maps.event.addListener(pointsArr.Map, 'bounds_changed', function() {
            changeRectParams();
            changeRadiusParams();
        });
        $('.' + currentTarget + 'Points').on('click',function(){
            var cats = Backendless.Geo.getCategories();
            for(var obj in cats){
                var newTarget = currentTarget.toLowerCase().replace("category","");
                if(newTarget == cats[obj].name){
                    var query = {
                        categories: cats[obj].name,
                        offset:(cats[obj].size > 100) ? 100 : cats[obj].size
                    }
                    var result = Backendless.Geo.find(query);
                    $("#" + currentTarget + 'Points #size').text(result.totalObjects);
                }
            }
            var pointsContent = "";
            for(var key in pointsArr.arr){
                pointsContent+= "<div class='block p" + key + " remove'><input type='checkbox' style='float:left'/><div style='padding-left:30px'>" + (Number(key) + 1) + '. Latitude: ' + pointsArr.arr[key].lat().toFixed(6) + ' and Longitude: ' + pointsArr.arr[key].lng().toFixed(6) + "</div></div>";
            }
            $("#" + child + 'Points .tables').html(pointsContent);
            if($('.remove').size() < 100){
                $("#" + child + 'Points .paginator').hide();
            }
            toggleClassToRemovePoints();
            showCategoryScreen("#" + child, "#" + child + 'Points');
            var counter = 100;
            $("#" + child + 'Points .nextArr').click(function(){
                $("#" + child + 'Points .tables .remove').each(function(){
                    $(this).on('click',function(){
                        $(this).toggleClass('removed');
                    });
                });
                if(parseInt($("#" + currentTarget + 'Points #size').text()) < counter){
                    createPopup("You cant see more points than maximum!", 'error');
                    return false;
                } else {
                    if(counter + 100 > parseInt($("#" + currentTarget + 'Points #size').text(),10)){
                        $("#" + child + 'Points .nextArr').hide();
                    } else {
                        $("#" + child + 'Points .nextArr').show();
                        $("#" + child + 'Points .prevArr').show();
                    }
                    $("#" + currentTarget + 'Points .spoints').text(counter + 1);
                    $("#" + currentTarget + 'Points .epoints').text(counter + 100);
                    var newArr = LoadNextPoints(currentTarget,pointsArr.Map,counter);
                    pointsArr.arr = newArr.arr;
                    changeRectParams();
                    changeRadiusParams();
                    var pointsContent = "";
                    for(var key in pointsArr.arr){
                        pointsContent+= "<div class='block p" + key + " remove'><input type='checkbox' style='float:left'/><div style='padding-left:30px'>" + (Number(key) + 1) + '. Latitude: ' + pointsArr.arr[key].lat().toFixed(6) + ' and Longitude: ' + pointsArr.arr[key].lng().toFixed(6) + "</div></div>";
                    }
                    $("#" + child + 'Points .tables').html(pointsContent);
                    toggleClassToRemovePoints();
                    counter +=100;
                }
            });
            $("#" + child + 'Points .prevArr').click(function(){
                if(counter - 101 < 0){
                    createPopup("You cant see less than 0 points!", 'error');
                    return false;
                } else {
                    if(counter - 201 < 0){
                        $("#" + child + 'Points .prevArr').hide();
                    } else {
                        $("#" + child + 'Points .prevArr').show();
                        $("#" + child + 'Points .nextArr').show();
                    }
                    counter -= 200;
                    var newArr = LoadNextPoints(currentTarget,pointsArr.Map,counter);
                    pointsArr.arr = newArr.arr;
                    changeRectParams();
                    changeRadiusParams();
                    var pointsContent = "";
                    for(var key in pointsArr.arr){
                        pointsContent+= "<div class='block p" + key + " remove'><input type='checkbox' style='float:left'/><div style='padding-left:30px'>" + (Number(key) + 1) + '. Latitude: ' + pointsArr.arr[key].lat().toFixed(6) + ' and Longitude: ' + pointsArr.arr[key].lng().toFixed(6) + "</div></div>";
                    }
                    $("#" + child + 'Points .tables').html(pointsContent);
                    toggleClassToRemovePoints();
                    $("#" + currentTarget + 'Points .spoints').text(counter+1);
                    $("#" + currentTarget + 'Points .epoints').text(counter+100);
                    counter += 100;
                }
            });
        });
        var $removePoints = $("#" + child + 'Points .removePoints');
        $removePoints.off("click");
        $removePoints.on('click',function(){
            var $removed = $("#" + child + 'Points .removed');
            if($removed.size() == 0){
                createPopup("No points selected!", 'error');
            } else {
                $removed.each(function(){
                    $(this).fadeOut();
                    for(var key in pointsArr.arr){
                        if(key == $(this).attr('class').split(" ")[1].replace(/p/,"")){
                            try{
                                Backendless.Geo.deletePoint(pointsArr.ids[key]);
                            } catch(e){
                                createPopup(e.message);
                            }
                            delete pointsArr.arr[key];
                            delete pointsArr.ids[key];
                        }
                    }
                });
                var $total = $("#" + child + 'Points #size');
                $total.html($total.text() - $removed.size());
                newArr = LoadPoints(currentTarget,pointsArr.Map);
                pointsArr.arr = newArr.arr;
                pointsArr.ids = newArr.ids;
                changeRectParams();
                changeRadiusParams();
                var pointsContent = "";
                for(var key in pointsArr.arr){
                    pointsContent+= "<div class='block p" + key + " remove'><input type='checkbox' style='float:left'/><div style='padding-left:30px'>" + (Number(key) + 1) + '. Latitude: ' + pointsArr.arr[key].lat().toFixed(6) + ' and Longitude: ' + pointsArr.arr[key].lng().toFixed(6) + "</div></div>";
                }
                $("#" + child + 'Points .tables').html(pointsContent);
                toggleClassToRemovePoints();
            }
        });
        $('.' + currentTarget + 'Filter').on('click',function(){
            $("#" + child).hide("4000");
            showCategoryScreen("#" + child + 'Points', "#" + child + 'Filter');
        });

        $('#' + child + 'Map').on('click',function(){
            var boundArr  = [];
            if($('input[name=search]:checked').attr('id') == "boundaries"){
                if(lines == ""){
                    boundArr = GMapBoundaries(pointsArr.Map);
                } else{
                    boundArr = GMapBoundaries(pointsArr.Map,lines);
                }
            } else {
                if(lines == ""){
                    boundArr = GMapRadius(pointsArr.Map, $('select option:selected').val(),$('input[type=text]').val(),currentTarget);
                } else {
                    boundArr = GMapRadius(pointsArr.Map, $('select option:selected').val(),$('input[type=text]').val(),currentTarget, lines);
                }
            }
            pointsArr.arr = [];
            for(var key in boundArr.data){
                pointsArr.arr[key] = new google.maps.LatLng(boundArr.data[key].latitude, boundArr.data[key].longitude);
            }
        });


        $('#' + currentTarget + 'Filter input[name=search]').on('change',function(){
            changeSelectedBoundaries();
        });

        $('#' + currentTarget + 'Filter .apply').on('click',function(){
            lines = "";
            $("#" + child + 'Filter .editor .ace_text-layer .ace_line').each(function(){
                lines+= $(this).text().trim();
            });
            var boundArr  = [];
            if($('#' + currentTarget + 'Filter input[name=search]:checked').attr('id') == "boundaries"){
                $('#' + currentTarget + ' .codeBoundary').show();
                $('#' + currentTarget + ' .codeRadius').hide();
                if(lines == ""){
                    boundArr = GMapBoundaries(pointsArr.Map);
                } else{
                    boundArr = GMapBoundaries(pointsArr.Map,lines);
                }
                changeRectParams();
            } else {
                $('#' + currentTarget + ' .codeBoundary').hide();
                $('#' + currentTarget + ' .codeRadius').show();
                if(lines == ""){
                    boundArr = GMapRadius(pointsArr.Map, $('#' + currentTarget + 'Filter select option:selected').val(),$('#' + currentTarget + 'Filter input[type=text]').val(),currentTarget);
                } else {
                    boundArr = GMapRadius(pointsArr.Map, $('#' + currentTarget + 'Filter select option:selected').val(),$('#' + currentTarget + 'Filter input[type=text]').val(),currentTarget, lines);
                }
                if($('#' + currentTarget + 'Filter input[type=text]').val() < 1){
                    createPopup("Radius cannot be less than 1!", 'error');
                    return false;
                } else if(($('#' + currentTarget + 'Filter input[type=text]').val() > 3963) && ($('#' + currentTarget + 'Filter select option:selected').val() == 'MILES')){
                    createPopup("Radius cannot be more than 3963 miles!", 'error');
                    return false;
                } else if(($('#' + currentTarget + 'Filter input[type=text]').val() > 6378) && ($('#' + currentTarget + 'Filter select option:selected').val() == 'KILOMETERS')){
                    createPopup("Radius cannot be more than 6378 kilometres!", 'error');
                    return false;
                }
                changeRadiusParams();
            }
            pointsArr.arr = [];
            for(var key in boundArr.data){
                pointsArr.arr[key] = new google.maps.LatLng(boundArr.data[key].latitude, boundArr.data[key].longitude);
            }
            $("#" + child + 'Filter').hide("2000");
            $("#" + child).show("2000");
        });
        google.maps.event.addListener(pointsArr.Map, 'zoom_changed', function() {
            var boundArr  = [];
            if($('input[name=search]:checked').attr('id') == "boundaries"){
                if(lines == ""){
                    boundArr = GMapBoundaries(pointsArr.Map);
                } else{
                    boundArr = GMapBoundaries(pointsArr.Map,lines);
                }
            } else {
                if($('input[type=text]').val() > ((pointsArr.Map.getBounds().getNorthEast().lat() - pointsArr.Map.getCenter().lat())*69)){
                    createPopup("Your Radius is bigger than Map Bounds! You cant see all available markers!", 'warn');
                }
                if(lines == ""){
                    boundArr = GMapRadius(pointsArr.Map, $('select option:selected').val(),$('input[type=text]').val(),currentTarget);
                } else {
                    boundArr = GMapRadius(pointsArr.Map, $('select option:selected').val(),$('input[type=text]').val(),currentTarget, lines);
                }
            }
            pointsArr.arr = [];
            for(var key in boundArr.data){
                pointsArr.arr[key] = new google.maps.LatLng(boundArr.data[key].latitude, boundArr.data[key].longitude);
            }
        });
        $("#" + child + 'Edit .save').on('click',function(){
            var newCode = $("#" + child + 'Edit .canEdit').html();
            $("#" + child + 'Filter .editor').html(newCode);
            createPopup("Saved successfully!", 'successPopup');
        });
        goBack("#" + child + 'Filter', "#" + child + 'Edit');
        $('#' + currentTarget + ' .mapBack').on('click',function(){
            $('#' + currentTarget).hide();
            $('.index').show();
        });
        goBack("#" + child, "#" + child + 'Points');
    }

    function goBack(show, hide){
        $(hide).find('.back').on('click',function(){
            $(hide).hide("2000");
            $(show).show("2000");
        });
    }

    function showInfoForEach(parent){
        $(parent + ' .block').each(function(){
            var classAttr = $(this).attr("class").split(" ")[1];
            var catName = $(this).attr("class").split(" ")[2];
            $(this).click(function(){
                currentTarget = classAttr;
                $('.category').attr('id',currentTarget).attr('class','item category ' + catName);
                $('.cat').text(catName);
                $('.points').attr('class','points ' + currentTarget + 'Points');
                $('.filter').attr('class','filter ' + currentTarget + 'Filter');
                $('.map').children().attr('id', currentTarget + 'Map');
                $('.pointsContainer').attr('id',currentTarget + 'Points');
                $('.marker').attr('class','marker back ' + currentTarget + 'Points');
                $('.goToFilter').attr('class','goToFilter ' + currentTarget + 'Filter');
                $('.filterContainer').eq(0).attr('id',currentTarget + 'Filter');
                $('.filterContainer').eq(1).attr('id',currentTarget + 'Edit');
                if($('input:checked').attr('id') == 'radius'){
                    var search = $('.search').html();
                    $('.search').html("");
                    $('.search').html(search);
                }
                if(pointsArr){
                    lines="";
                }
                ace.edit("editor").setValue("");
                showInfo(parent, classAttr);
                changeSelectedBoundaries();
            });
        });
    }

    showInfoForEach('.index');

});
});