function addToDB() {

	$.ajax({
		type: 'POST',
		url: '/server/shoppy/addToDB',
		contentType: 'application/json',
		data: JSON.stringify({
			"item_name": $('#item_name').val(),
			"qty": $('#qty').val(),
			"phoneNumber": $('#phoneNumber').val()
		}),
		success: function (serverData) {

			$('#orderPlacement_Status').html(serverData);

		},
		error: function (error) {
			alert("Error received from Server :" + error);
		}
	});
}