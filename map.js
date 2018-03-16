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
      center: new google.maps.LatLng(41.850033, -87.6500523),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
    this.geocoder = geocoder = new google.maps.Geocoder();
    // load json, then draw markers
    events.then(function(data) {
      // US + southern Canada bounding box
      const lat = [55, 24.52];
      const lng = [-66.95, -124.77];

      _this.infowindow = new google.maps.InfoWindow();
      data.forEach(function(ev) {
        ev.rsvp = 'https://event.marchforourlives.com/event/march-our-lives-events/' +
          ev.id +'/signup';
        ev.start_dt = moment(ev.time_at_iso, moment.ISO_8601).format('dddd, MMMM D, h:mm A')
        const marker = new google.maps.Marker({
          icon: 'https://s3.amazonaws.com/s3.everytown.org/action_kit/legacy/img/map_pin.png',
          animation: google.maps.Animation.DROP,
          position: { lat: ev.latitude, lng: ev.longitude },
          map: _this.map,
          eventId: ev.id,
        });
        google.maps.event.addListener(marker, 'click', function() {
          console.log('click ', this);
          _this.activeEvent = _this.events[this.eventId];
          _this.infowindow.close();
          _this.$nextTick(function () {
            _this.infowindow.setContent(document.getElementById('activeEvent').innerHTML);
            _this.infowindow.open(_this.map, _this.activeEvent.marker);
          })
        });
        ev.marker = marker;
        _this.events[ev.id] = ev;
      });
      _this.map.fitBounds({
        west: _.min(lng),
        south: _.min(lat),
        east: _.max(lng),
        north: _.max(lat)
      });
    });
  },

  updated: function() {
    const _this = this;
    // after activeEvent section renders
  },

  methods: {
    geocode: function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        console.log('error geocoding', status);
        return;
      }
    },
    inIframe: function() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    },
  },
});
