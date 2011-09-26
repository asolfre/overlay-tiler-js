// Copyright 2011 Google

/**
 * @license
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * JS for the upload page.
 *
 * @author Chris Broadfoot (cbro@google.com)
 */

window.onload = function() {
  var div = document.getElementById('upload-map');
  var map = new google.maps.Map(div, {
    center: new google.maps.LatLng(36, -208),
    zoom: 1,
    mapTypeId: 'roadmap'
  });

  var hiddenLat = document.getElementById('lat');
  var hiddenLng = document.getElementById('lng');
  var hiddenZoom = document.getElementById('zoom');

  google.maps.event.addListener(map, 'idle', function() {
    hiddenZoom.value = map.getZoom() + '';
    var center = map.getCenter();
    hiddenLat.value = center.lat() + '';
    hiddenLng.value = center.lng() + '';
  });

  var input = document.createElement('input');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }
  });
}
