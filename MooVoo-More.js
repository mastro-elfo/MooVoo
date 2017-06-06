/*
Copyright (c) 2017 mastro-elfo

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

/*
 * https://github.com/mastro-elfo/MooVoo
 */

;(function(){
	'use strict';
	
	// Check MooTools
	if(!window.MooVoo) {
		throw 'MooVoo required.';
	}
	
	var MooVoo = window.MooVoo;
	
	MooVoo.More = {
		version: '1.1.0'
	};
	
	if(!JSON) {
		throw 'JSON required.';
	}
	
	/**
	 * Implements MooVoo.Model
	 * 
	 * @since 1.0.0
	 */
	MooVoo.Storage = new Class({
		/**
		 * store(mixed)
		 *
		 * store(key, data)
		 * store(object)
		 * 
		 * @returns this
		 * @since 1.0.0
		 */
		store: function(key, data) {
			if(typeOf(key) == 'object') {
				Object.each(key, function(item, key){
					localStorage[key] = JSON.encode(item);
				});
			}
			else {
				localStorage[key] = JSON.encode(data);
			}
			return this;
		},
		
		/**
		 * retrieve([mixed])
		 *
		 * @returns mixed Object|Array
		 * @since 1.0.0
		 */
		retrieve: function() {
			if(arguments.length == 1) {
				return JSON.decode(localStorage[arguments[0]]);
			}
			else {
				var output = [];
				Array.flatten(arguments).each(function(item){
					output[item] = JSON.decode(localStorage[item]);
				});
				return output;
			}
		},
		
		/**
		 * clear()
		 *
		 * @returns this
		 * @since 1.0.0
		 */
		clear: function(){
			localStorage.clear();
			return this;
		},
		
		/**
		 * delete([mixed])
		 *
		 * @returns this
		 * @since 1.0.0
		 */
		'delete': function(){
			Array.flatten(arguments).each(function(item){
				delete localStorage[item];
			});
			return this;
		}
	});
	
	/**
	 * MooVoo.SimpleView
	 * 
	 * @since 1.0.0
	 */
	MooVoo.SimpleView = new Class({
		Extends: MooVoo.View,
		options: {
			onReady: function(){
				this.render();
			},
			onModelChange: function(){
				this.render();
			}
		}
	});
	
	/**
	 * MooVoo.Input
	 * 
	 * @extends MooVoo.View
	 * @since 1.0.0
	 */
	MooVoo.Input = new Class({
		Extends: MooVoo.View,
		options: {
			onRender: function(){
				this.element.set(this.options.attribute, this.model.get(this.options.property));
			},
			onElementChange: function(){
				this.model.set(this.options.property, this.element.get(this.options.attribute));
			},
			onModelChange: function(){
				var propertyValue = this.model.get(this.options.property);
				if(this.__propertyValue !== propertyValue) {
					this.__propertyValue = propertyValue;
					this.render();
				}
			}
		},
		__propertyValue: null
	});
	
	/**
	 * MooVoo.Output
	 * 
	 * @extends MooVoo.View
	 * @since 1.0.0
	 */
	MooVoo.Output = new Class({
		Extends: MooVoo.View,
		options: {
			onRender: function(){
				this.element.set(this.options.attribute, this.options.template.call(this));
			},
			onModelChange: function(){
				var propertyValue = this.model.get(this.options.property);
				if(this.propertyValue !== propertyValue) {
					this.__propertyValue = propertyValue;
					this.render();
				}
			},
			template: function(){
				return this.model.get(this.options.property);
			}
		},
		__propertyValue: null
	});
	
	/**
	 * MooVoo.Style
	 *
	 * @extends MooVoo.Output
	 * @since 1.0.0
	 */
	MooVoo.Style = new Class({
		Extends: MooVoo.Output,
		options: {
			onRender: function(){
				this.element.setStyle(this.options.attribute, this.options.template.call(this));
			}
		}
	});
	
	/**
	 * MooVoo.StyleClass
	 *
	 * @extends MooVoo.Output
	 * @since 1.0.0
	 */
	MooVoo.StyleClass = new Class({
		Extends: MooVoo.Output,
		options: {
			onRender: function(){
				if(this.options.template.call(this)) {
					this.element.addClass(this.options.attribute);
				}
				else {
					this.element.removeClass(this.options.attribute);
				}
			}
		}
	});
	
	/**
	 * MooVoo.Button
	 * 
	 * Just a container.
	 *
	 * @extends MooVoo.View
	 * @since 1.0.0
	 */
	MooVoo.Button = new Class({
		Extends: MooVoo.View
	});
	
	/**
	 * MooVoo.Display
	 * 
	 * Uses a trigger element to toggle display another element
	 *
	 * @since 1.0.0
	 */
	MooVoo.Display = new Class({
		Extends: MooVoo.Model,
		options: {
			defaults: {
				display: false
			}
		},
		/**
		 * options.triggerElement
		 * options.targetElement
		 * options.triggerEvent
		 * options.render
		 */
		initialize: function(options){
			options = options || {};
			
			this.triggerElement = $(options.triggerElement) || $(this.options.triggerElement) || null;
			delete options.triggerElement;
			
			this.targetElement = $(options.targetElement) || $(this.options.targetElement) || null;
			delete options.targetElement;
			
			var self = this;
			
			this.triggerElement.addEvent(options.triggerEvent, function(){
				self.set('display', !self.get('display'));
			});
			delete options.triggerEvent;
			
			this.render = options.render;
			delete options.render;
			
			this.addEvent('change', function(event){
				self.render(event);
			});
			delete options.render;
			
			this.parent(options);
		}
	});
})();
