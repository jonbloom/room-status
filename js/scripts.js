jQuery(document).on('ready',init);
	var dataa = {};
function init(){
	var seconds = 1000;
	var minutes = seconds * 60;
	var roomID = 7678;

	updateEventsByEmsID(roomID);
	updateTime();

	setInterval(updateEventsByEmsID(roomID), 5 * minutes);
	setInterval(updateTime,10 * seconds);

}

function updateTime(){
    var now = moment();
    $date = $("#date");
    $time = $("#time");
    $date.html(now.format("MMMM D"));
    $time.html(now.format("h:mm A"));
}

function updateEventsByEmsID(id){
	var cacheBuster = new Date().getTime();

	jQuery.ajax({
		url: 'room-status.php',
		method: 'POST',
		dataType: 'json',
		data: {
			data: 'events',
			id: id,
			cacheBuster: cacheBuster
		},
		success: processData

	})
	function processData(data){
		var inFormat = "HH:mm:ss";
	    var outFormat = "h:mm A";
	    var template = jQuery('#event-template').html();
	    var eventsList = jQuery('#events ul');
	    eventsList.find("li").remove();
	    Mustache.parse(template);
		data = data.Data //api's root element is "Data", and we want everything in there
		var events = []
		if (Object.prototype.toString.call(data) !== "[object Array]"){ // one reservation, we'll have to coerce it into a list
			events[0] = data;
		} else {
			events = data;
		}
		console.log(events);
		for (var i = 0; i < events.length; i++){
			var ev = events[i];
			if (moment().isAfter(moment(ev.TimeEventEnd))){ //event has already happened
				continue;
			}
	        ev.TimeEventStart = moment(ev.TimeEventStart).format(outFormat);
	        ev.TimeEventEnd = moment(ev.TimeEventEnd).format(outFormat);
	        var renderedTemplate = Mustache.render(template,ev);
	        eventsList.append(renderedTemplate);
		}


	}
	
}