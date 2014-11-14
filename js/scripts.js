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
		var $traffic = jQuery('#traffic-level');
		if ($traffic.hasClass('event')){
			return;
		}
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
				css = 'event';
				break;
		}
		$traffic.addClass(css).html(label);

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
	    var outFormat = "h:mm A";
	    var template = jQuery('#event-template').html();
	    var eventsList = jQuery('#events-container ul');
	    var eventNow = false;
	    eventsList.find("li").not('#none').remove();
	    Mustache.parse(template);
		data = data.Data //api's root element is "Data", and we want everything in there
		var events = []
		if (Object.prototype.toString.call(data) !== "[object Array]"){ // one reservation, we'll have to coerce it into a list
			events[0] = data;
		} else {
			events = data;
		}
		var now = moment();
		if (events){
			
			for (var i = 0; i < events.length; i++){
				var ev = events[i];
				if (now.isAfter(moment(ev.TimeEventStart))
				 && now.isBefore(moment(ev.TimeEventEnd))){
					eventNow = true;
				}

				if (now.isAfter(moment(ev.TimeEventEnd))){ //event has already happened
					continue;
				}
				jQuery("#none").hide();
		        ev.TimeEventStart = moment(ev.TimeEventStart).format(outFormat);
		        ev.TimeEventEnd = moment(ev.TimeEventEnd).format(outFormat);
		        ev.EventName = ev.EventName.toProperCase();
		        var renderedTemplate = Mustache.render(template,ev);
		        eventsList.append(renderedTemplate);
			}
			sortEventsList(eventsList);
			if (eventNow){
				jQuery('#traffic-level').removeClass().addClass('event').html('Event');
				jQuery('#open-close').removeClass().addClass('closed').html('Closed');
			} else {
				jQuery('#traffic-level').removeClass('event');
				jQuery('#open-close').removeClass().addClass('open').html('Open');
			}
		} else {
			jQuery("#none").show();
		}

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
			return compare ? 1 : -1;
		}
		toCompare.detach().appendTo(eventsList);
	}
}