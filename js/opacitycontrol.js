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
 * Controls the opacity of an AffineOverlay.
 *
 * @constructor
 * @param {overlaytiler.AffineOverlay} affineOverlay  the overlay to control.
 */
overlaytiler.OpacityControl = function(affineOverlay) {
  var el = this.el_ = document.createElement('input');
  el.type = 'range';
  el.min = 0;
  el.max = 100;
  el.value = 100;
  el.style.width = '200px';
  el.onchange = this.onChange_.bind(this);

  this.affineOverlay = affineOverlay;
};

/**
 * Called whenever the slider is moved.
 * @private
 */
overlaytiler.OpacityControl.prototype.onChange_ = function() {
  this.affineOverlay.setOpacity(this.el_.value / 100);
};

/**
 * Returns the Element, suitable for adding to controls on a map.
 * @return {Element}  the Element.
 */
overlaytiler.OpacityControl.prototype.getElement = function() {
  return this.el_;
};
