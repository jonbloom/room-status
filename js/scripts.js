jQuery(document).on('ready',init);

function init(){
	var seconds = 1000;
	var minutes = seconds * 60;

	var emsID = 7681;
	var dbID = 2;

	updateEventsByEmsID(emsID);
	updateTime();
	getTrafficByDatabaseID(dbID);

	setInterval(updateEventsByEmsID(emsID), 5 * minutes);
	setInterval(updateTime,10 * seconds);

	String.prototype.toProperCase = function () {
		return this.replace(/\w\S*/g, function(txt){
			return txt.charAt(0).toUpperCase() + txt.substr(1);
		});
};

}

function updateTime(){
    var now = moment();
    $date = jQuery("#date");
    $time = jQuery("#time");
    $date.html(now.format("MMMM D"));
    $time.html(now.format("h:mm A"));
}

function getTrafficByDatabaseID(id){
	var cacheBuster = new Date().getTime();
	jQuery.ajax({
		url: 'room-status.php',
		method: 'POST',
		dataType: 'json',
		data: {
			data: 'traffic',
			id: id,
			cacheBuster: cacheBuster
		},
		success: processData
	});

	function processData(data){
		var css, label, level = parseInt(data[id]);
		switch(level) {
			case 1:
				label = 'Full';
				css = 'full';
				break;
			case 2:
				label = 'High traffic';
				css = 'high';
				break;
			case 3:
				label = 'Medium traffic';
				css = 'medium';
				break;
			case 4:
				label = 'Low traffic';
				css = 'low';
				break;
			case 5:
				label = 'Empty';
				css = 'low';
				break;
			case 6:
				label = 'Event';
				css = 'full';
				break;
		}
		jQuery('#traffic-level').addClass(css).html(label);

	}
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

	});
	function processData(data){
		var inFormat = "HH:mm:ss";
	    var outFormat = "h:mm A";
	    var template = jQuery('#event-template').html();
	    var eventsList = jQuery('#events-container ul');
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
	        ev.EventName = ev.EventName.toProperCase();
	        var renderedTemplate = Mustache.render(template,ev);
	        eventsList.append(renderedTemplate);
		}
		sortEventsList(eventsList);
	}
	function sortEventsList(eventsList){
		var toCompare = eventsList.find('li');
		toCompare.sort(sort);
		function sort(a,b){
			a = jQuery(a);
			b = jQuery(b);
			var aStart = a.find('div.times span').get(0).innerHTML;
			var bStart = b.find('div.times span').get(0).innerHTML;

			var compare = moment(aStart,"h:mm A").isAfter(moment(bStart,"h:mm A"));
			if (compare){
				return 1;
			} else {
				return -1;
			}
		}
		toCompare.detach().appendTo(eventsList);
	}
}