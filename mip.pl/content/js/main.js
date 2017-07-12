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
	var url = 'http://www.mariaipawel.pl/cgi/api.php/mip_lista_prezentow';
	self.edit = function() {
		var td = $(this).parent('td');
		var id = td.attr("id");
		var reservationsource = 'temporary';
		var reservationdate = Date.now();
		var content = '{"ISFREE":0, "RESERVATIONSOURCE": "' + reservationsource
				+ '", "RESERVATIONDATE":"' + reservationdate + '"}'
		if (id !== null) {
			$.ajax({
				url : url + '/' + id,
				type : 'PUT',
				contentType : 'application/json',
				data : content,
				success : self.update
			});
		}
	};
	self.render = function(data) {
		element.html(Mustache.to_html(template.html(),
				php_crud_api_transform(data)));
	};
	self.update = function() {
		$.get(url, self.render);
	};

	element.on('click', 'button.reserve', self.edit)
	self.update();
};

$(function() {
	new GiftList($('#form-container'), $('#GiftListTemplate'));
});
