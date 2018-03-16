const mapjs = document.getElementById('mapjs');
// pegasus for loading json data in parallel with other scripts.
const events = pegasus('https://mfol-api.herokuapp.com/api/events');

const app = new Vue({
  el: '#mapApp',
  data: {
    map: null,
    events: {},
    activeEvent: null,
  },

  mounted: function mounted() {
    document.getElementById('mapApp').style.display = 'block';
    const _this = this;

    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
    });
    // load json, then draw markers
    events.then(function(data) {
      _this.infowindow = new google.maps.InfoWindow();
      data.forEach(function(ev) {
        // set rsvp and formatted date
        ev.rsvp = 'https://event.marchforourlives.com/event/march-our-lives-events/' +
          ev.id +'/signup';
        ev.start_dt = moment(ev.time_at_iso, moment.ISO_8601).format('dddd, MMMM D, h:mm A')
        // create marker
        const marker = new google.maps.Marker({
          icon: 'https://s3.amazonaws.com/s3.everytown.org/action_kit/legacy/img/map_pin.png',
          position: { lat: ev.latitude, lng: ev.longitude },
          map: _this.map,
          eventId: ev.id,
        });
        google.maps.event.addListener(marker, 'click', function() {
          _this.activeEvent = _this.events[this.eventId];
          _this.infowindow.close();
          // when rendered, get content from activeEvent div and show in infowindow
          _this.$nextTick(function() {
            _this.infowindow.setContent(document.getElementById('activeEvent').innerHTML);
            _this.infowindow.open(_this.map, _this.activeEvent.marker);
          })
        });
        // save marker and event by id
        ev.marker = marker;
        _this.events[ev.id] = ev;
      });

      // US + southern Canada bounding box
      const lat = [55, 24.52];
      const lng = [-66.95, -124.77];
      _this.map.fitBounds({
        west: _.min(lng),
        south: _.min(lat),
        east: _.max(lng),
        north: _.max(lat)
      });

      // search box
      _this.searchBox = new google.maps.places.SearchBox(document.getElementById('pac-input'));
      _this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        document.getElementById('pac-input'));
      google.maps.event.addListener(_this.searchBox, 'places_changed', function() {
        _this.searchBox.set('map', null);
        const places = _this.searchBox.getPlaces();
        if (!places) {
          return;
        }
        _this.map.setCenter({lat: places[0].geometry.location.lat(),
          lng: places[0].geometry.location.lng()});
        _this.searchBox.set('map', _this.map);
        _this.map.setZoom(10);
      });
    });
  },
});
