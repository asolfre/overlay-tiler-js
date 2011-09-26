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
 * JS for the editor page.
 *
 * @author Chris Broadfoot (cbro@google.com)
 */

var PARAMS = parseParams();
var SRCFILE = unescape(PARAMS.overlay);
var OUTFILE = 'out.png';

window.onload = function() {
  var zoom = parseInt(PARAMS.z, 10);
  var div = document.getElementById('map');
  var map = new google.maps.Map(div, {
    center: new google.maps.LatLng(PARAMS.lat, PARAMS.lng),
    zoom: zoom,
    mapTypeId: 'roadmap'
  });

  var img = new Image();
  img.src = SRCFILE;
  img.onload = setupOverlay.bind(this, img, map);
};

/**
 * Adds an editable overlay to the map.
 * @param {Image} img
 * @param {google.maps.Map} map
 */
function setupOverlay(img, map) {
  // sometimes the image hasn't actually loaded
  if (!img.height) {
    setTimeout(setupOverlay.bind(this, img, map), 50);
    return;
  }

  var overlay = new overlaytiler.AffineOverlay(img);
  overlay.setMap(map);

  var opacity = new overlaytiler.OpacityControl(overlay);
  map.controls[google.maps.ControlPosition.TOP_LEFT]
      .push(opacity.getElement());


  var gdalCommand = document.createElement('pre');
  gdalCommand.id = 'gdal-command';
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM]
      .push(gdalCommand);

  /**
   * Displays generated GDAL commands.
   */
  google.maps.event.addListener(overlay, 'change', function () {
    var dots = overlay.getDotLatLngs();

    // Generate GDAL command
    var cmd = ['gdal_translate'];
    cmd.push('\\\n');
    cmd.push('-gcp 0 0', dots[0].lng(), dots[0].lat());
    cmd.push('\\\n');
    cmd.push('-gcp', img.width, '0', dots[1].lng(), dots[1].lat());
    cmd.push('\\\n');
    cmd.push('-gcp', img.width, img.height, dots[2].lng(), dots[2].lat());
    cmd.push('\\\n');
    cmd.push(basename(SRCFILE), OUTFILE);

    cmd.push('\n\ngdal2tiles.py');
    cmd.push('-s EPSG:4326');
    cmd.push('-z 16-19');
    cmd.push(OUTFILE, 'out');

    gdalCommand.innerText = cmd.join(' ');
  });
}

function parseParams() {
  var result = {};
  var params = window.location.search.substring(1).split('&');
  for (var i = 0, param; param = params[i]; i++) {
    var parts = param.split('=');
    result[parts[0]] = parts[1];
  }
  return result;
}

function basename(file) {
  var parts = file.split('/');
  return parts[parts.length - 1];
}
