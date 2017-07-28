function php_crud_api_transform(tables) {
	var array_flip = function(trans) {
		var key, tmp_ar = {};
		for (key in trans) {
			tmp_ar[trans[key]] = key;
		}
		return tmp_ar;
	};
	var get_objects = function(tables, table_name, where_index, match_value) {
		var objects = [];
		for ( var record in tables[table_name]['records']) {
			record = tables[table_name]['records'][record];
			if (!where_index || record[where_index] == match_value) {
				var object = {};
				for ( var index in tables[table_name]['columns']) {
					var column = tables[table_name]['columns'][index];
					object[column] = record[index];
					for ( var relation in tables) {
						var reltable = tables[relation];
						for ( var key in reltable['relations']) {
							var target = reltable['relations'][key];
							if (target == table_name + '.' + column) {
								column_indices = array_flip(reltable['columns']);
								object[relation] = get_objects(tables,
										relation, column_indices[key],
										record[index]);
							}
						}
					}
				}
				objects.push(object);
			}
		}
		return objects;
	};
	tree = {};
	for ( var name in tables) {
		var table = tables[name];
		if (!table['relations']) {
			tree[name] = get_objects(tables, name);
			if (table['results']) {
				tree['_results'] = table['results'];
			}
		}
	}
	return tree;
}

function GiftList(element, template) {
	var self = this;
	var url = '../cgi/api.php/mip_lista_prezentow';
	self.reserve = function() {
		if (isCookieSet() == false) {
			var div = $(this).parent('div');
			var id = div.attr("id");
			var reservationsource = 'temporary';
			var reservationdate = Date.now();
			var content = '{"ISFREE":0, "RESERVATIONSOURCE": "'
					+ reservationsource + '", "RESERVATIONDATE":"'
					+ reservationdate + '"}'
			if (id !== null) {
				$.ajax({
					url : url + '/' + id,
					type : 'PUT',
					contentType : 'application/json',
					data : content,
					success : self.update
				});
				setCookie(id);
			}
		} else {
			alert("Można zarezerwować jeden prezent")
		}
	};
	self.unreserve = function() {
		var div = $(this).parent('div');
		var id = div.attr("id");
		var check_id = getCookie("mip_cookie");
		if (check_id == id) {
			var content = '{"ISFREE":1, "RESERVATIONSOURCE": "", "RESERVATIONDATE":""}'
			if (id !== null) {
				$.ajax({
					url : url + '/' + id,
					type : 'PUT',
					contentType : 'application/json',
					data : content,
					success : self.update
				});
				unsetCookie(id);
			}
		} else {
			alert("Można usunąć tylko swoją rezerwację")
		}
	};
	self.render = function(data) {
		element.html(Mustache.to_html(template.html(),
				php_crud_api_transform(data)));

		var id = getCookie("mip_cookie");
		var elems = document.getElementsByClassName("unreserve");
		for (var i = 0; i < elems.length; i++) {
			var parent = $(elems[i]).parent('div');
			if (parent.attr("id") != id)
				elems[i].disabled = true;
		}
		var elems = document.getElementsByClassName("reserve");
		for (var i = 0; i < elems.length; i++) {
			if (isCookieSet() == true)
				elems[i].disabled = true;
		}
	};
	self.update = function() {
		$.get(url, self.render);
	};

	element.on('click', 'button.reserve', self.reserve)
	element.on('click', 'button.unreserve', self.unreserve)
	self.update();
};

$(function() {
	new GiftList($('#form-container'), $('#GiftListTemplate'));
});

function setCookie(cvalue) {
	var d = new Date(2017, 9, 30, 14, 0, 0, 0);
	var expires = "expires=" + d.toUTCString();
	document.cookie = "mip_cookie=" + cvalue + ";" + expires + ";path=/";
}
function unsetCookie(cvalue) {
	var d = new Date(2016, 1, 1, 0, 0, 0, 0);
	var expires = "expires=" + d.toUTCString();
	document.cookie = "mip_cookie=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function isCookieSet() {
	if (getCookie("mip_cookie") == "") {
		return false;
	}
	return true;
}