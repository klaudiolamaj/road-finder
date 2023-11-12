function checkOperatingHours() {
    // Get the current day and time
    var currentDate = new Date();
    var currentDay = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    var currentTime = currentDate.getHours() * 100 + currentDate.getMinutes(); // Convert time to 24-hour format
    let open = false;

    // Define the operating hours
    var operatingHours = {
        Monday: { start: 630, end: 2200 },
        Tuesday: { start: 630, end: 2200 },
        Wednesday: { start: 630, end: 2200 },
        Thursday: { start: 630, end: 2200 },
        Friday: { start: 630, end: 400 },
        Saturday: { start: 900, end: 400 },
        Sunday: { start: 900, end: 2200 },
    };

    // Check if the current day and time fall within the operating hours
    if (
        operatingHours[getDayName(currentDay)] &&
        currentTime >= operatingHours[getDayName(currentDay)].start &&
        currentTime <= operatingHours[getDayName(currentDay)].end
    ) {
        // Business is open - you can run your code here
        let open = true;
        return open;
    } //else {
    //     // Business is closed - you can run another code here
    //     close = "The business is currently closed.";
    //     return close;
    // }
}

// Helper function to get the day name based on the day number
function getDayName(dayNumber) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
}


function removeContent() {
    // Get the div element by its ID
    var myDiv = document.getElementById("transitOptions");

    // Remove all content inside the div
    myDiv.innerHTML = '';
}
function initMap() {
    // This function is called by the Google Maps API callback
}
document.addEventListener("DOMContentLoaded", function () {

    // Function to get the user's current location
    function getLocation() {
        var startInput = document.getElementById("startInput");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                // Autofill the start input value with the current location
                startInput.value = position.coords.latitude + ", " + position.coords.longitude;
            });
        } else {
            // Geolocation is not supported, handle accordingly
            startInput.value = "Geolocation is not supported on this browser.";
        }
    }

    // Attach the getLocation function to the button click event
    document.getElementById("get-location-btn").addEventListener("click", getLocation);
});

function getTransitOptions() {
    var startInput = document.getElementById('startInput');
    var endInput = document.getElementById('endInput');
    var startPlace = new google.maps.places.Autocomplete(startInput);
    var endPlace = new google.maps.places.Autocomplete(endInput);

    // Listen for the 'place_changed' event to get the selected place
    startPlace.addListener('place_changed', function () {
        var place = startPlace.getPlace();
        startInput.value = place.formatted_address;
    });

    endPlace.addListener('place_changed', function () {
        var place = endPlace.getPlace();
        endInput.value = place.formatted_address;
    });

    // Fetch data from the Google Maps API
    var directionsService = new google.maps.DirectionsService();

    // Get the start and end locations from the Autocomplete inputs
    var start = startInput.value;
    var end = endInput.value;

    // Make requests at different times (every one hour)
    for (var i = 0; i < 24; i++) {
        setTimeout(function (hour) {
            return function () {
                makeTransitRequest(directionsService, start, end, hour);
            };
        }(i), i * 1000); // Delay in milliseconds (1 hour = 3600000 milliseconds)
    }
}

function makeTransitRequest(directionsService, start, end, hour) {
    var departureTime = new Date();
    departureTime.setHours(hour);
    departureTime.setMinutes(0);
    departureTime.setSeconds(0);

    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'TRANSIT',
        transitOptions: {
            departureTime: departureTime,
        },
    }, function (response, status) {
        console.log('Response:', response);
        if (status === 'OK') {
            // Pass the response to the display function
            displayTransitOptions(response);
        } else {
            document.getElementById('transitOptions').innerHTML = '<p>No transit options found.</p>';
        }
    });
}


function displayTransitOptions(response) {

    // Remove the hidden class so the data style take place
    var element = document.getElementById("transitOptions");
    element.classList.remove("hidden");

    // Display the data
    var transitOptionsDiv = document.getElementById('transitOptions');
    var optionDiv = document.createElement('div');
    optionDiv.classList.add('option');
    optionDiv.innerHTML = '<h3>Option</h3>';

    var routes = response.routes;
    var totalDuration = 0;

    routes.forEach(function (route, index) {
        var legs = route.legs;
        legs.forEach(function (leg, legIndex) {
            var legDiv = document.createElement('div');
            legDiv.innerHTML = '<p><strong>Leg :</strong></p>';
            legDiv.innerHTML += '<p>Start Address: ' + leg.start_address + '</p>';
            legDiv.innerHTML += '<p>End Address: ' + leg.end_address + '</p>';

            var steps = leg.steps;
            steps.forEach(function (step, stepIndex) {
                var stepDiv = document.createElement('div');
                stepDiv.classList.add('step-details');
                stepDiv.innerHTML += '<p><strong>Step ' + (stepIndex + 1) + ':</strong></p>';
                stepDiv.innerHTML += '<p>Travel Mode: ' + step.travel_mode + '</p>';
                stepDiv.innerHTML += '<p>Duration: ' + step.duration.text + '</p>';
                stepDiv.innerHTML += '<p>Instructions: ' + step.instructions + '</p>';

                if (step.transit) {
                    // Pass the response to the display function
                    stepDiv.innerHTML += '<p>Start Time: ' + step.transit.departure_time.text + '</p>';
                    stepDiv.innerHTML += '<p>Arrival Time: ' + step.transit.arrival_time.text + '</p>';
                    if (step.transit.line) {
                        stepDiv.innerHTML += '<p>Line: ' + step.transit.line.short_name + '</p>';
                        stepDiv.innerHTML += '<p>Vehicle: ' + step.transit.line.vehicle.type + '</p>';
                    }
                }

                legDiv.appendChild(stepDiv);

                // Check if the step is "Walking" and duration is more than 5 minutes
                if (step.travel_mode === "WALKING" && step.duration.value > 300) {
                    var taxiParagraph = document.createElement('div');
                    taxiParagraph.className = 'taxi';
                    taxiParagraph.innerHTML = 'You have to walk more than 5 minutes. Consider taking a taxi\n<ol>';

                    // Append Gosauer Taxi
                    appendTaxiService(taxiParagraph, 'Gosauer Taxi', '+436602186809', 'http://www.gosauer-taxi.at/');

                    if (leg.start_address === "Hallstatt") {
                        appendTaxiService(taxiParagraph, 'Prime Taxi', '+436764830333', 'https://www.primetaxi.at/');
                    }

                    if (leg.start_address === "Ebensee") {
                        appendTaxiService(taxiParagraph, 'Prime Taxi', '+436764802999', 'https://www.primetaxi.at/');
                    }

                    if (leg.start_address === "Bad Ischl") {
                        appendTaxiService(taxiParagraph, 'Prime Taxi', '+436764820777', 'https://www.primetaxi.at/');
                    }

                    if (open) {
                        appendTaxiService(taxiParagraph, 'Taxi 4242', '+43 61354242', 'https://taxi4242.at/');
                    }

                    taxiParagraph.innerHTML += '</ol>';
                    legDiv.appendChild(taxiParagraph);

                    // Function to append a taxi service to the ordered list
                    function appendTaxiService(parentElement, serviceName, phoneNumber, domain) {
                        var listItem = document.createElement('li');
                        listItem.innerHTML = '<a href="' + domain + '">' + serviceName + ':</a> ' + phoneNumber;
                        parentElement.querySelector('ol').appendChild(listItem);
                    }

                }
            });

            totalDuration += leg.duration.value;
            optionDiv.appendChild(legDiv);
        });
    });

    optionDiv.innerHTML += '<p class="total-duration"><strong>Total Duration: </strong>' + formatDuration(totalDuration) + '</p>';
    transitOptionsDiv.appendChild(optionDiv);
}


function formatDuration(durationInSeconds) {
    var hours = Math.floor(durationInSeconds / 3600);
    var minutes = Math.floor((durationInSeconds % 3600) / 60);
    return hours + 'h ' + minutes + 'min';
}

function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
}