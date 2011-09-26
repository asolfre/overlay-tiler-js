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
 * Creates a mover (big dot) that moves a bunch of other dots.
 *
 * @constructor
 * @param {Node} parent  the element to attach this dot to.
 * @param {Array.<overlaytiler.Dot>} dots  the dots that should be moved with
 *    this dot.
 * @extends overlaytiler.Dot
 */
overlaytiler.Mover = function(parent, dots) {
  // hide the dot until its position is calculated.
  var dot = new overlaytiler.Dot(parent, -1e5, -1e5);
  dot.controlDots_ = dots;
  dot.getCanvas().className += ' mover';
  dot.onMouseMove_ = this.onMouseMove_.bind(dot);

  google.maps.event.addListener(dots[0], 'change', this.onDotChange_.bind(dot));
  google.maps.event.addListener(dots[2], 'change', this.onDotChange_.bind(dot));
  this.onDotChange_.call(dot);

  return dot;
};

/**
 * Repositions the mover to be between the first and third control points.
 * @this overlaytiler.Dot
 * @private
 */
overlaytiler.Mover.prototype.onDotChange_ = function() {
  var dots = this.controlDots_;
  this.x = (dots[0].x + dots[2].x) / 2;
  this.y = (dots[0].y + dots[2].y) / 2;
  this.render();
};

/**
 * Translates a dot.
 * @this overlaytiler.Dot
 * @private
 * @param {overlaytiler.Dot} dot  the dot to move.
 * @param {number} deltax  the amount to move on the x-axis.
 * @param {number} deltay  the amount to move on the y-axis.
 */
overlaytiler.Mover.prototype.translateDot_ = function(dot, deltax, deltay) {
  dot.x += deltax;
  dot.y += deltay;
  dot.render();
};

/**
 * @this overlaytiler.Dot
 * @private
 * @param {MouseEvent} e  the event containing coordinates of current mouse
 * position.
 */
overlaytiler.Mover.prototype.onMouseMove_ = function(e) {
  var deltax = e.clientX - this.cx;
  var deltay = e.clientY - this.cy;

  this.x += deltax;
  this.y += deltay;

  for (var i = 0, dot; dot = this.controlDots_[i]; ++i) {
    overlaytiler.Mover.prototype.translateDot_(dot, deltax, deltay);
  }
  this.render();

  this.cx = e.clientX;
  this.cy = e.clientY;
};
