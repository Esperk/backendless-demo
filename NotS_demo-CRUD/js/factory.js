function getRandomString() {
    return Math.random().toString(36).substr(2, 7);
}

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

$rootScope.tablesList = {
	Demos : function(obj) {
		obj = obj || new $rootScope.Classes.Demos();
		obj.datum = new Date();

		return obj;
	},
	ChatUser : function(obj) {
		obj = obj || new $rootScope.Classes.ChatUser();
		obj.name = String(Math.abs(Math.floor(Math.random()*Math.pow(10, 5) - 1)));

		return obj;
	},
	FileItem : function(obj) {
		obj = obj || new $rootScope.Classes.FileItem();
		obj.deviceId = String(Math.abs(Math.floor(Math.random()*Math.pow(10, 5) - 1)));
		obj.url = String(Math.abs(Math.floor(Math.random()*Math.pow(10, 5) - 1)));

		return obj;
	}
};

$rootScope.createInstanceOf = function(table) {
    return tablesList[table]();
};