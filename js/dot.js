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
 * A draggable Dot, rendered to the page.
 *
 * @constructor
 * @param {Node} parent  the element to add this dot to.
 * @param {number} x  initial x-axis position.
 * @param {number} y  initial y-axis position.
 */
overlaytiler.Dot = function(parent, x, y) {
  this.x = x;
  this.y = y;

  var canvas = this.canvas_ = document.createElement('div');
  canvas.className = 'dot';
  parent.appendChild(canvas);

  this.onMouseMove_ = this.onMouseMove_.bind(this);
  this.onMouseDown_ = this.onMouseDown_.bind(this);
  this.onMouseUp_ = this.onMouseUp_.bind(this);

  canvas.addEventListener('mousedown', this.onMouseDown_, true);
  window.addEventListener('mouseup', this.onMouseUp_, true);

  this.style = canvas.style;
  this.render();
};

/**
 * @return {Element} the canvas.
 */
overlaytiler.Dot.prototype.getCanvas = function() {
  return this.canvas_;
};

/**
 * Renders this dot to the page, at its location.
 */
overlaytiler.Dot.prototype.render = function() {
  this.style.left = this.x + 'px';
  this.style.top = this.y + 'px';
  google.maps.event.trigger(this, 'change');
};

/**
 * Moves the dot to the current mouse position.
 * @private
 * @param {MouseEvent} e  the event containing coordinates of current mouse
 * position.
 */
overlaytiler.Dot.prototype.onMouseMove_ = function(e) {
  this.x += e.clientX - this.cx;
  this.y += e.clientY - this.cy;

  this.render();

  this.cx = e.clientX;
  this.cy = e.clientY;
};

/**
 * Enables editing of the dot's location.
 * @private
 * @param {MouseEvent} e  the event containing coordinates of current mouse
 * position.
 */
overlaytiler.Dot.prototype.onMouseDown_ = function(e) {
  this.cx = e.clientX;
  this.cy = e.clientY;
  this.mouseMoveListener_ = google.maps.event.addDomListener(window,
      'mousemove', this.onMouseMove_.bind(this));
  google.maps.event.trigger(this, 'dragstart');
};

/**
 * Disables editing of the dot's location.
 * @private
 */
overlaytiler.Dot.prototype.onMouseUp_ = function() {
  if (this.mouseMoveListener_) {
    google.maps.event.removeListener(this.mouseMoveListener_);
  }
  google.maps.event.trigger(this, 'dragend');
};
