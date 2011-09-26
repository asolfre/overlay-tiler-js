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
 * @author Chris Broadfoot (cbro@google.com)
 */

/**
 * A map overlay that allows affine transformations on its image.
 *
 * @constructor
 * @extends google.maps.OverlayView
 * @param {!HTMLImageElement} img  The image to display.
 */
overlaytiler.AffineOverlay = function(img) {
  var canvas = this.canvas_ = document.createElement('canvas');
  // TODO(cbro): calculate the width/height on the fly in case it's larger than
  // 2000px. This should be good enough for now.
  canvas.width = 2000;
  canvas.height = 2000;
  canvas.style.position = 'absolute';
  this.ctx = canvas.getContext('2d');

  this.img_ = img;
};

overlaytiler.AffineOverlay.prototype = new google.maps.OverlayView;

/**
 * The overlay should be offset this number of pixels from the left of the map
 * div when first added.
 * @private
 * @type number
 */
overlaytiler.AffineOverlay.prototype.DEFAULT_X_OFFSET_ = 100;

/**
 * The overlay should be offset this number of pixels from the top of the map
 * div when first added.
 * @private
 * @type number
 */
overlaytiler.AffineOverlay.prototype.DEFAULT_Y_OFFSET_ = 50;

/**
 * The image that has been overlaid and transformed according to the control
 * points (dots).
 * @private
 * @type overlaytiler.TransformedImage
 */
overlaytiler.AffineOverlay.prototype.ti_;

/**
 * The points that control the transformation of this overlay.
 * @private
 * @type Array.<overlaytiler.Dot>
 */
overlaytiler.AffineOverlay.prototype.dots_;

/**
 * Adds the image in the top left of the current map viewport.
 * The overlay can be transformed via three control points, and translated via
 * a larger control point that sits in the middle of the image overlay.
 */
overlaytiler.AffineOverlay.prototype.onAdd = function() {
  var proj = this.getProjection();
  var bounds = this.getMap().getBounds();
  var sw = proj.fromLatLngToContainerPixel(bounds.getSouthWest());
  var ne = proj.fromLatLngToContainerPixel(bounds.getNorthEast());

  // TODO(cbro): Give the overlay an initial top-left LatLng instead of
  // determining it based off the current map viewport.
  var x = sw.x + this.DEFAULT_X_OFFSET_;
  var y = ne.y + this.DEFAULT_Y_OFFSET_;

  var pane = this.getPanes().overlayImage;
  this.getPanes().overlayLayer.appendChild(this.canvas_);

  var img = this.img_;
  var dots = this.dots_ = [
      new overlaytiler.Dot(pane, x, y),
      new overlaytiler.Dot(pane, x + img.width, y),
      new overlaytiler.Dot(pane, x + img.width, y + img.height)];

  for (var i = 0, dot; dot = dots[i]; ++i) {
    google.maps.event.addListener(dot, 'dragstart',
        this.setMapDraggable_.bind(this, false));

    google.maps.event.addListener(dot, 'dragend',
        this.setMapDraggable_.bind(this, true));

    google.maps.event.addListener(dot, 'change', this.renderCanvas_.bind(this));
  }

  this.ti_ = new overlaytiler.TransformedImage(
      img, dots[0], dots[1], dots[2]);
  this.ti_.draw(this.ctx);

  // The Mover allows the overlay to be translated.
  var mover = new overlaytiler.Mover(pane, dots);
  google.maps.event.addListener(mover, 'dragstart',
      this.setMapDraggable_.bind(this, false));

  google.maps.event.addListener(mover, 'dragend',
      this.setMapDraggable_.bind(this, true));

  this.renderCanvas_();
};

/**
 * Notify that the canvas should be rendered.
 * Essentially limits rendering to a max of 66fps.
 * @private
 */
overlaytiler.AffineOverlay.prototype.renderCanvas_ = function() {
  if (this.renderTimeout) return;
  this.renderTimeout = window.setTimeout(
      this.forceRenderCanvas_.bind(this), 15);
};

/**
 * Actually renders to the canvas.
 * @private
 */
overlaytiler.AffineOverlay.prototype.forceRenderCanvas_ = function() {
  // make sure the whole image is in view.
  var topLeft = this.getTopLeftPoint_();
  this.canvas_.style.top = topLeft.y + 'px';
  this.canvas_.style.left = topLeft.x + 'px';

  var ctx = this.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // identity
  ctx.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ti_.setTranslate(-topLeft.x, -topLeft.y);
  this.ti_.draw(ctx);

  delete this.renderTimeout;
  google.maps.event.trigger(this, 'change');
};

/**
 * Sets the map's draggable option.
 * @private
 * @param {boolean} draggable  Whether the map should be draggable.
 */
overlaytiler.AffineOverlay.prototype.setMapDraggable_ = function(draggable) {
  this.getMap().set('draggable', draggable);
};

/**
 * Sets the opacity of the overlay.
 * @param {number} opacity  The opacity, from 0.0 to 1.0.
 */
overlaytiler.AffineOverlay.prototype.setOpacity = function(opacity) {
  this.canvas_.style.opacity = opacity;
};

/**
 * @inheritDoc
 */
overlaytiler.AffineOverlay.prototype.draw = function() {
  this.renderCanvas_();
};

/**
 * TODO(cbro): remove the overlay from the map.
 * @inheritDoc
 */
overlaytiler.AffineOverlay.prototype.onRemove = function() {
};

/**
 * Calculates where the fourth anchor should be.
 * @private
 * @return {google.maps.Point} the coordinates of the fourth point.
 */
overlaytiler.AffineOverlay.prototype.getVirtualDot_ = function() {
  var dots = this.dots_;
  return new google.maps.Point(
      dots[0].x + dots[2].x - dots[1].x,
      dots[0].y + dots[2].y - dots[1].y);
};

/**
 * Gets the top left rendered Point of the canvas.
 * @private
 * @return {google.maps.Point} the top left point.
 */
overlaytiler.AffineOverlay.prototype.getTopLeftPoint_ = function() {
  var dots = this.dots_;
  var virtualDot = this.getVirtualDot_();

  return new google.maps.Point(
      Math.min(dots[0].x, dots[1].x, dots[2].x, virtualDot.x),
      Math.min(dots[0].y, dots[1].y, dots[2].y, virtualDot.y));
};

/**
 * Gets all LatLngs for each control dot.
 * @return {Array.<google.maps.LatLng>} LatLngs of control dots.
 */
overlaytiler.AffineOverlay.prototype.getDotLatLngs = function() {
  var proj = this.getProjection();
  var result = [];
  var dots = this.dots_;
  for (var i = 0, dot; dot = dots[i]; ++i) {
    result.push(proj.fromDivPixelToLatLng(new google.maps.Point(dot.x, dot.y)));
  }
  return result;
};
