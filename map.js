const mapjs = document.getElementById('mapjs');
// pegasus for loading json data in parallel with other scripts.
const events = pegasus('https://mfol-api.herokuapp.com/api/events');

const app = new Vue({
  el: '#mapApp',
  data: {
    map: null,
    events: {},
    activeEvent: null;
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
      // don't check for events on affiliate map; use all
      // US + southern Canada bounding box
      const lat = [55, 24.52];
      const lng = [-66.95, -124.77];

      _this.infowindow = new google.maps.InfoWindow({
        content: 'test'
      });
      data.forEach(function(ev) {
        const marker = new google.maps.Marker({
          icon: 'https://s3.amazonaws.com/s3.everytown.org/action_kit/legacy/img/map_pin.png',
          animation: google.maps.Animation.DROP,
          position: { lat: ev.latitude, lng: ev.longitude },
          map: _this.map,
          eventId: ev.id,
        });
        google.maps.event.addListener(marker, 'click', function() {
          console.log('click ', this);
          _this.infowindow.close();
          _this.activeEvent = _this.events[this.eventId];
          _this.infowindow.setContent();
          _this.infowindow.open(_this.map, this);
        });
        _this.events[ev.id] = {
          event: ev,
          marker: marker,
        };
      });
      _this.map.fitBounds({
        west: _.min(lng),
        south: _.min(lat),
        east: _.max(lng),
        north: _.max(lat)
      });
    });
  },

  methods: {
    clickMarker: function() {
    },
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

    showPopup: function showPopup(feature) {
      const _this = this;

      console.log('show popup for ', feature.properties.location);
      if (this.popup) {
        this.popup.remove();
      }
      // draw popup immediately with name
      this.popup
        .setLngLat(feature.geometry.coordinates)
        .setHTML('<div id="popupContent"><b>' + feature.properties.name + '</b></div>')
        .addTo(this.map);
      this.popupLocation = feature.properties.location;
      // update html when it's ready
      this.$nextTick(function popup() {
        // popup.setHTML doesn't update properly
        _this.popup.remove();
        _this.popup
          .setLngLat(feature.geometry.coordinates)
          .setHTML(document.getElementById('affiliateContent').innerHTML)
          .addTo(_this.map);
      });
    },

    hidePopup: function hidePopup() {
      this.popup.remove();
      this.popupLocation = null;
    },
  },
});
