
    var APPLICATION_ID = '15C508DC-9719-9288-FF64-67672CCB9700';
    var SECRET_KEY = '8208A170-3073-5B2D-FF7A-5C388513E800';
    var VERSION = 'v1';
    Backendless.serverURL = "https://api.backendless.com";
    Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);

    function cleanPrivateRelations(data) {
        function isObject(obj) {
            return obj !== null && typeof obj === 'object';
        }

        if (data.hasOwnProperty('_private_relations') && data['_private_relations'].length > 0) {
                data['_private_relations'].forEach(function(relation) {
                    if (data.hasOwnProperty(relation) && isObject(data[relation])) {
                        if (Array.isArray(data[relation])) {
                            data[relation].forEach(function(elem) {
                                if (isObject(elem)) {
                                    cleanPrivateRelations(elem);
                                }
                            });
                        } else {
                            cleanPrivateRelations(data[relation]);
                    }
                }
            });
        }

        if (isObject(data)) {
            delete data['_private_relations'];
            delete data['_private_geoRelations'];
            delete data['_private_dates'];
        }
    }

    $rootScope.Classes = {
    Demos: function Demos( args ){
        args = args || {};
        this._private_relations = [];
        this._private_geoRelations = [];
        this._private_dates = [
            "datum",
            "created",
            "updated"];
        this.___class = "Demos";

        
        var storage = Backendless.Persistence.of( Demos );
        this.save = function ( async ) {
            cleanPrivateRelations(this);
            storage.save( this, async );
        };
        this._private_describeClass = function(){
            return Backendless.Persistence.describe(this.___class);
        };
        this.remove = function ( async ) {
            var result = storage.remove( this, async );
            this.objectId = null;
            return result;
        };
        
       },ChatUser: function ChatUser( args ){
        args = args || {};
        this._private_relations = [];
        this._private_geoRelations = [];
        this._private_dates = [
            "created",
            "updated"];
        this.___class = "ChatUser";

        
        var storage = Backendless.Persistence.of( ChatUser );
        this.save = function ( async ) {
            cleanPrivateRelations(this);
            storage.save( this, async );
        };
        this._private_describeClass = function(){
            return Backendless.Persistence.describe(this.___class);
        };
        this.remove = function ( async ) {
            var result = storage.remove( this, async );
            this.objectId = null;
            return result;
        };
        
       },FileItem: function FileItem( args ){
        args = args || {};
        this._private_relations = [];
        this._private_geoRelations = [];
        this._private_dates = [
            "updated",
            "created"];
        this.___class = "FileItem";

        
        var storage = Backendless.Persistence.of( FileItem );
        this.save = function ( async ) {
            cleanPrivateRelations(this);
            storage.save( this, async );
        };
        this._private_describeClass = function(){
            return Backendless.Persistence.describe(this.___class);
        };
        this.remove = function ( async ) {
            var result = storage.remove( this, async );
            this.objectId = null;
            return result;
        };
        
       }
    }
                            