(function ($) {
    $.fn.wrongInput = function () {
        return this.each(function () {
            var $this = $(this),
                $field = $this.is("input.txt") || $this.is("input[type=text]") ? $this : $this.find("input.txt"),
                rmWrng = function ($field) {
                    $field.removeClass('wronginput');
                };
            if ($field.hasClass('wronginput')) {
                return
            }
            $field.addClass('wronginput');
            $field.one('input', function () {
                rmWrng($field);
            });
        });
    };
})(Zepto);

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

var pointsSize, centerLong = 0, centerLat = 0, resultObject = {}, arr = {}, ids = {}, metadata = {}, category = "", markers = [], circles = [];
function GMapLoad(target){
    if($('#' + target + 'Map').html().length > 0){
        return false;
    } else {
        var cats = Backendless.Geo.getCategories();
        for(var obj in cats){
            if(target.toLowerCase().replace("category","") == cats[obj].name.toLowerCase()){
                var query = {
                    categories: cats[obj].name,
                    includeMetadata: true
                }
                var result = Backendless.Geo.find(query);
                for(var point in result.data){
                    arr[point] = new google.maps.LatLng(result.data[point].latitude.toFixed(5), result.data[point].longitude.toFixed(5));
                    ids[point] = result.data[point].objectId;
                    metadata[point] = result.data[point].metadata;
                    centerLong+=result.data[point].longitude;
                    centerLat+=result.data[point].latitude;
                }
                pointsSize = result.data.length;
            }
        }
        var initedMap = initialize(target,arr);
        resultObject.Map = initedMap.map;
        resultObject.arr = arr;
        resultObject.ids = ids;
        resultObject.metadata = metadata;
        markers = initedMap.markers;
        category = target;
        return resultObject;
    }
}

function LoadPoints(target,map){
    pointsSize = 0, centerLong = 0, centerLat = 0, resultObject = {}, arr = {}, ids = {}, metadata = {};
    var cats = Backendless.Geo.getCategories();
    for(var obj in cats){
        if(target.toLowerCase().search(cats[obj].name.toLowerCase()) > 0){
            var result = Backendless.Geo.find({categories: cats[obj].name, includeMetadata: true});
            for(var point in result.data){
                arr[point] = new google.maps.LatLng(result.data[point].latitude.toFixed(5), result.data[point].longitude.toFixed(5));
                ids[point] = result.data[point].objectId;
                metadata[point] = result.data[point].metadata;
                centerLong+=result.data[point].longitude;
                centerLat+=result.data[point].latitude;
            }
            pointsSize = result.data.length;
        }
    }
    for(var counter = 0; counter < markers.length; counter++){
        markers[counter].setMap(null);
    }
    if(circles.length != 0){
        for(var counter = 0; counter < circles.length; counter++){
            circles[counter].setMap(null);
        }
    }
    markers = [];
    var initedMap = createMarkers(arr,map,metadata);
    resultObject.arr = arr;
    markers = initedMap.markers;
    resultObject.ids = ids;
    resultObject.metadata = metadata;
    category = target;
    return resultObject;
}

function LoadNextPoints(target,map,offset){
    pointsSize = 0, centerLong = 0, centerLat = 0, resultObject = {}, arr = {}, ids = {}, metadata = {};
    var cats = Backendless.Geo.getCategories();
    for(var obj in cats){
        var newTarget = target.toLowerCase().replace("category","");
        if(newTarget == cats[obj].name){
            var query = {
                    categories: cats[obj].name,
                    includeMetadata: true,
                    offset:(cats[obj].size > offset) ? offset : cats[obj].size
                }
                var result = Backendless.Geo.find(query);
                $("#" + target + 'Points #size').text(result.totalObjects);
                $("#" + target + 'Points .epoints').text((cats[obj].size > (offset + 100)) ? offset + 100 : cats[obj].size);
                for(var point in result.data){
                    arr[point] = new google.maps.LatLng(result.data[point].latitude.toFixed(5), result.data[point].longitude.toFixed(5));
                    ids[point] = result.data[point].objectId;
                    metadata[point] = result.data[point].metadata;
                    centerLong+=result.data[point].longitude;
                    centerLat+=result.data[point].latitude;
                }
                pointsSize = result.data.length;
            }
    }
    for(var counter = 0; counter < markers.length; counter++){
        markers[counter].setMap(null);
    }
    if(circles.length != 0){
        for(var counter = 0; counter < circles.length; counter++){
            circles[counter].setMap(null);
        }
    }
    markers = [];
    var initedMap = createMarkers(arr,map,metadata);
    resultObject.arr = arr;
    markers = initedMap.markers;
    resultObject.ids = ids;
    resultObject.metadata = metadata;
    category = target;
    return resultObject;
}


function GMapBoundaries(map,condition){
    for(var i = 0; i < circles.length; i++){
        circles[i].setMap(null);
    }
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    for(var counter = 0; counter < markers.length; counter++){
        ((markers[counter].position.lng() > ne.lng()) || (markers[counter].position.lng() < sw.lng())) ? markers[counter].setMap(null) : markers[counter].setMap(map);
    }
    var geoQuery =
    {
        searchRectangle: [ne.lat(), sw.lng(), sw.lat(), ne.lng()],
        categories: [$('.' + category)[0].className.split(" ")[2]]
    }
    if(condition){
        geoQuery.condition = [condition];
    }
    var result = GMapTryCatch(geoQuery);
    if(!condition){
        return result;
    } else {
        if(result.data.length == 0){
            for(var counter = 0 ; counter < markers.length; counter++){
                markers[counter].setMap(null);
            }
        } else {
            for(var counter = 0 ; counter < markers.length; counter++){
                markers[counter].setMap(null);
            }
            for(var i = 0; i < result.data.length; i++){
                for(var p = 0; p < markers.length;p++){
                    var lat = markers[p].position.lat(),
                        lng = markers[p].position.lng();
                    if((lat == result.data[i].latitude) && (lng.toFixed(6) == result.data[i].longitude)){
                        markers[p].setMap(map);
                    }
                }
            }
        }

        return result;
    }
}

function getCenterOfCircle(centerLng){
    var resultLng = 0;
    var centerLngFull = Math.abs(parseInt(centerLng / 360));
    var centerLngHalf = Math.abs(parseInt(centerLng / 180));
    var trigger = centerLngFull / centerLngHalf;
    if(centerLng > 180){
        if(centerLngHalf < 2){
            resultLng = centerLng - 360;
        } else {
            if(trigger < 0.5){
                resultLng = - (180 - (centerLng - 180*centerLngHalf));
            } else {
                resultLng = centerLng - 180*centerLngHalf;
            }
        }
    } else if(centerLng < -180){
        if(Math.abs(trigger) == 0){
            resultLng = 180 + (180 + centerLng);
        } else if(trigger == 0.5){
            resultLng= 180*centerLngHalf + centerLng;
        } else {
            resultLng = 180 + (180*centerLngHalf + centerLng);
        }
    } else {
        resultLng = centerLng;
    }
    return resultLng;
}

function GMapTryCatch(geoQuery){
        try{
            var result = Backendless.Geo.find(geoQuery);
            return result;
        } catch(e){
            if(!geoQuery.condition){
                createPopup("Unable to retrieve geo points.", 'error');
            } else {
                createPopup("Unable to retrieve geo points. Check the query syntax.", 'error');
            }
        }
}

function GMapRadius(map,units,radius,target,condition){
    for(var i = 0; i < circles.length; i++){
        circles[i].setMap(null);
    }
    var circleOptions = {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        editable:true,
        map: map,
        center: (circles.length != 0) ? circles[circles.length - 1].center : map.getCenter(),
        radius: (units == "MILES") ? parseInt(radius, 10)*1600 : parseInt(radius, 10)*1000
    };

    var cityCircle = new google.maps.Circle(circleOptions);
    circles.push(cityCircle);
    google.maps.event.addListener(cityCircle, 'radius_changed', function(){
        for(var counter = 0; counter < markers.length; counter++){
            ((markers[counter].position.lng() > ne.lng()) || (markers[counter].position.lng() < sw.lng())) ? markers[counter].setMap(null) : markers[counter].setMap(map);
        }
        var newRadius = (units == "MILES") ? parseInt(cityCircle.radius, 10)/1600 : parseInt(cityCircle.radius, 10)/1000;
        $("#editor4").next().find('.latitude').text(cityCircle.center.lat());
        $("#editor4").next().find('.longitude').text(getCenterOfCircle(cityCircle.center.lng()));
        $("#editor4").next().find('.radius').text(newRadius);
        $("#editor4").next().find('.units').text($('select option:selected').val());
        $('#editor4').next().find('.cat').text($("#" + target).attr('class').split(" ")[2]);
        ace.edit("editor4").setValue($('#editor4').next().text());
        ace.edit("editor4").session.selection.clearSelection();
        $('input[type=text]').val(newRadius);
        geoQuery.radius = newRadius;
        geoQuery.latitude = cityCircle.center.lat();
        geoQuery.longitude = getCenterOfCircle(cityCircle.center.lng());
        geoQuery.center = (circles.length != 0) ? circles[circles.length - 1].center : map.getCenter();
        if(!condition){
            var result = GMapTryCatch(geoQuery);
        } else {
            geoQuery.condition = [condition];
            var result = GMapTryCatch(geoQuery);
        }
        if(result.data.length == 0){
            for(var counter = 0 ; counter < markers.length; counter++){
                markers[counter].setMap(null);
            }
        } else {
            for(var counter = 0 ; counter < markers.length; counter++){
                markers[counter].setMap(null);
            }
            for(var i = 0; i < result.data.length; i++){
                for(var p = 0; p < markers.length;p++){
                    if((markers[p].position.lat() == result.data[i].latitude) && (markers[p].position.lng().toFixed(6) == result.data[i].longitude)){
                        markers[p].setMap(map);
                    }
                }
            }
        }
    });
    google.maps.event.addListener(cityCircle, 'center_changed', function()    {
        var newRadius = (units == "MILES") ? parseInt(cityCircle.radius, 10)/1600 : parseInt(cityCircle.radius, 10)/1000;
        for(var counter = 0; counter < markers.length; counter++){
            ((markers[counter].position.lat() > ne.lat()) || (markers[counter].position.lat() < sw.lat())) ? markers[counter].setMap(null) : markers[counter].setMap(map);
        }
        $("#editor4").next().find('.latitude').text(cityCircle.center.lat());
        $("#editor4").next().find('.longitude').text(cityCircle.center.lng());
        $("#editor4").next().find('.radius').text(newRadius);
        $("#editor4").next().find('.units').text($('select option:selected').val());
        $('#editor4').next().find('.cat').text($("#" + target).attr('class').split(" ")[2]);
        ace.edit("editor4").setValue($('#editor4').next().text());
        ace.edit("editor4").session.selection.clearSelection();
        geoQuery.latitude = cityCircle.center.lat();
        geoQuery.longitude = getCenterOfCircle( cityCircle.center.lng());
        if(!condition){
            var result = GMapTryCatch(geoQuery);
        } else {
            geoQuery.condition = [condition];
            var result = GMapTryCatch(geoQuery);
        }
        if(result.data.length == 0){
            for(var counter = 0 ; counter < markers.length; counter++){
                markers[counter].setMap(null);
            }
        } else {
            for(var counter = 0 ; counter < markers.length; counter++){
                markers[counter].setMap(null);
            }
            for(var i = 0; i < result.data.length; i++){
                for(var p = 0; p < markers.length;p++){
                    var lat = markers[p].position.lat(),
                        lng = markers[p].position.lng();
                    if((lat == result.data[i].latitude) && (lng.toFixed(6) == result.data[i].longitude)){
                        markers[p].setMap(map);
                    }
                }
            }
        }
    });
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    for(var counter = 0; counter < markers.length; counter++){
        ((markers[counter].position.lat() > ne.lat()) || (markers[counter].position.lat() < sw.lat())) ? markers[counter].setMap(null) : markers[counter].setMap(map);
    }
    var geoQuery =
    {
        latitude: cityCircle.center.lat(),
        longitude: getCenterOfCircle(cityCircle.center.lng()),
        radius:radius,
        units: units,
        categories: [$('.' + category)[0].className.split(" ")[2]]
    }
    if(condition){
        geoQuery.condition = [condition]
    }
    var result = GMapTryCatch(geoQuery);
    if(result.data.length == 0){
        for(var counter = 0 ; counter < markers.length; counter++){
            markers[counter].setMap(null);
        }
    } else {
        for(var counter = 0 ; counter < markers.length; counter++){
            markers[counter].setMap(null);
        }
        for(var i = 0; i < result.data.length; i++){
            for(var p = 0; p < markers.length;p++){
                if((markers[p].position.lat() == result.data[i].latitude) && (markers[p].position.lng().toFixed(6) == result.data[i].longitude)){
                    markers[p].setMap(map);
                }
            }
        }
    }
    return result;
}

function createMarkers(arr,map,metadata){
    var result = {};
    var metadataString = "";
    for(var key in arr){
        if(metadata != {}){
            for(var hey in metadata[key]){
                metadataString += '<b><i>' + hey + '</i></b>' + ' : ' + metadata[key][hey] + '<br />';
            }
        }
        var marker = new google.maps.Marker({
            position: arr[key],
            map: map
        });
        var content = metadataString + '<br /><b>Latitude</b>: ' + arr[key].lat() + '; <b>Longitude</b>: ' + arr[key].lng();
        attachTooltip(marker, content , arr[key]);
        markers.push(marker);
        metadataString = "";
    }
    function attachTooltip(marker, content, value) {
        var coordInfoWindow = new google.maps.InfoWindow();
        coordInfoWindow.setContent("<div class='cont'>" + content + "</div>");
        coordInfoWindow.setPosition(value);
        google.maps.event.addListener(marker, 'click', function() {
            coordInfoWindow.open(marker.get('map'), marker);
        });
        google.maps.event.addListener(coordInfoWindow, 'click', function() {
            marker.title = "";
            coordInfoWindow.close();
        });
    }
    result.markers = markers;
    return result;
}

function initialize(target,arr){
    var result = {};
    var metadataString = "";
    var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(centerLat/pointsSize,centerLong/pointsSize),
        panControl: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    var map = new google.maps.Map(document.getElementById(target + 'Map'), mapOptions);
    google.maps.event.addListenerOnce(map, 'idle', function(){
        google.maps.event.trigger(map, 'resize');
        map.setCenter(mapOptions.center);
    });
    for(var key in arr){
        if(metadata != {}){
            for(var hey in metadata[key]){
                metadataString += '<b><i>' + hey + '</i></b>' + ' : ' + metadata[key][hey] + '<br />';
            }
        }
        var marker = new google.maps.Marker({
            position: arr[key],
            map: map
        });
        var content = metadataString + '<br /><b>Latitude</b>: ' + arr[key].lat() + '; <b>Longitude</b>: ' + arr[key].lng();
        attachTooltip(marker, content , arr[key]);
        markers.push(marker);
        metadataString = "";
    }

    function attachTooltip(marker, content, value) {
        var coordInfoWindow = new google.maps.InfoWindow();
        coordInfoWindow.setContent("<div class='cont'>" + content + "</div>");
        coordInfoWindow.setPosition(value);
        google.maps.event.addListener(marker, 'click', function() {
            coordInfoWindow.open(marker.get('map'), marker);
        });
        google.maps.event.addListener(coordInfoWindow, 'click', function() {
            marker.title = "";
            coordInfoWindow.close();
        });
    }
        result.map =  map;
        result.markers = markers;
        return result;
}