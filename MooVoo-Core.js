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
	/**
	 * MooVoo, a Model-View library for MooTools (mootools.net).
	 * 
	 * @author mastro-elfo
	 */
	
	// Check MooTools
	if(!MooTools || !Class || !Events || !Options) {
		throw 'MooTools, Class, Events and Options are required.';
	}
	
	// Check MooVoo namespace
	if(window.MooVoo) {
		throw 'MooVoo namespace already in use.';
	}
	
	/**
	 * addEvent(self, obj, event, replace)
	 *
	 * Adds onModel.. and onElement... events
	 *
	 * @param {Object} self View or Collection that adds the event
	 * @param {Object} obj The event triggerer
	 * @param {String} event The event name
	 * @param {String} replace The part of event that must be replaced
	 * @since 1.0.0
	 */
	function addEvent(self, obj, event, replace) {
		obj.addEvent(event.replace(replace, '').toLowerCase(), function(data){
			self.fireEvent(event, data);
		});
	}
	
	var MooVoo = window.MooVoo = {};
	
	/**
	 * Core version
	 * @since 1.0.0
	 */
	MooVoo.Core = {
		version: '1.1.0'
	};
		
	/**
	 * class Model
	 * @fires ready, change, destroy
	 * @since 1.0.0
	 */
	MooVoo.Model = new Class({
		Implements: [Events, Options],
		options: {
			// Set defaults to use this.get(). Defaults are set in constructor,
			// but 'change' event is not fired
			defaults: {}
		},
		
		/**
		 * @fires ready
		 * @since 1.0.0
		 */
		initialize: function(options){
			options = options || {};
			this.setOptions(this.options.defaults);
			this.setOptions(options);
			this.fireEvent('ready', this);
			return this;
		},
		
		/**
		 * set([mixed])
		 * 
		 * set({
		 * 		<key>: <value>,
		 * 		...
		 * })
		 *
		 * set(<key>, <value>)
		 *
		 * @fires change
		 * @since 1.0.0
		 */
		set: function(name, value){
			var fire = false;
			if(typeOf(name) == 'object') {
				if(Object.some(name, function(v, k){
					return v !== this.options[k];
				})) {
					this.setOptions(name);
					fire = true;
				}
			}
			else if(this.options[name] !== value) {
				var o = {};
				o[name] = value;
				this.setOptions(o);
				fire = true;
			}
			if(fire) {
				this.fireEvent('change', this);
			}
			return this;
		},
		
		/**
		 * get([mixed])
		 * 
		 * get() returns an object with keys defined in options.defaults (and the corresponding values)
		 * get(<number>) or get(<string>) returns the corresponding value
		 * get(...) returns an object with values corresponding to passed keys
		 *
		 * @returns {mixed}
		 * @since 1.0.0
		 */
		get: function(){
			if (arguments.length === 0) {
				return this.get(Object.keys(this.options.defaults));
			}
			else if((arguments.length == 1) && (typeOf(arguments[0]) == 'number' || typeOf(arguments[0]) == 'string') ) {
				return this.options[arguments[0]];
			}
			else {
				var self = this;
				var output = {};
				Array.flatten(arguments).each(function(key){
					output[key] = self.options[key];
				});
				return output;
			}
		},
		
		/**
		 * @fires destroy
		 * @since 1.0.0
		 */
		destroy: function(){
			this.fireEvent('destroy', this);
		},
		
		/**
		 * restore the defaults values
		 * @returns this
		 * @since 1.0.0
		 */
		'default': function(){
			this.set(this.get('defaults'));
			return this;
		}
	});
	
	/**
	 * MooVoo.Property
	 *
	 * This object is a draft.
	 *
	 * @extends MooVoo.Model
	 * @since 1.1.0
	 */
	MooVoo.Property = new Class({
		Extends: MooVoo.Model,
		options: {
			onReady: function(){
				this.set(this.property, this.model.get(this.property));
			},
			onModelChange: function(){
				var value = this.model.get(this.property);
				if(value !== this.get(this.property)) {
					this.set(this.property, value);
				}
			},
			onModelDestroy: function(){
				this.destroy();
			}
		},
		initialize: function(options){
			options = options || {};
			
			// model is a special option
			this.model = options.model;
			delete options.model;
			
			// property is a special option
			this.property = options.property;
			delete options.property;
			
			var self = this;
			Object.each(Object.filter(Object.merge.apply(null, [{}, this.options].append(arguments)),
									  function(option){return typeOf(option) == 'function' && (/^onModel[A-Z]/).test(event);}),
						function(callback, event){
							if (self.model){
								addEvent(self, self.model, event, 'onModel');
							}
			});
			
			this.parent(options);
		},
		__value: null
	});
	
	/**
	 * class MooVoo.View
	 * @fires ready, render
	 * @since 1.0.0
	 */
	MooVoo.View = new Class({
		Implements: [Events, Options],
		
		/**
		 * options.model
		 * options.element
		 */
		initialize: function(options){
			options = options || {};
			
			// model is a special option
			this.model = options.model;
			delete options.model;
			
			// element is a special option
			this.element = $(options.element);
			delete options.element;
			
			var self = this;
			Object.each(Object.filter(Object.merge.apply(null, [{}, this.options].append(arguments)),
									  function(option){return typeOf(option) == 'function';}),
						function(callback, event){
							if (self.model && (/^onModel[A-Z]/).test(event)){
								addEvent(self, self.model, event, 'onModel');
							}
							else if (self.element && (/^onElement[A-Z]/).test(event)) {
								addEvent(self, self.element, event, 'onElement');
							}
			});
			
			this.setOptions(options);
			
			this.fireEvent('ready');
		},
		
		/**
		 * render()
		 * @fires render
		 * @returns this
		 * @since 1.0.0
		 */
		render: function(){
			this.fireEvent('render');
			return this;
		}
	});
	
	/**
	 * class Collection
	 * @extends Array
	 * @since 1.0.0
	 * @fires ready, add
	 * @since 1.0.0
	 */
	MooVoo.Collection = new Class({
		Extends: Array,
		Implements: [Events, Options],
		initialize: function(options){
			options = options || {};
			
			// Save 'onModel...' events to add them with 'addModel' method
			this.__modelEvents = Object.filter(Object.merge.apply(null, [{}, this.options].append(arguments)),
												function(option, name){
													return typeOf(option) == 'function' && /^onModel[A-Z]/.test(name);
												});
			this.setOptions(options);
			this.fireEvent('ready');
		},
		
		/**
		 * addModel([mixed])
		 * @fires add
		 * @returns this
		 * @since 1.0.0
		 */
		addModel: function(){
			var self = this;
			Array.flatten(Array.convert(arguments)).each(function(model){
				var idx = self.push(model) -1;
				
				// add onModel... events
				Object.each(self.__modelEvents, function(callback, option){
					addEvent(self, self[idx], option, 'onModel');
				});
				self.fireEvent('add', self[idx]);
			});
			
			return this;
		},
		
		/**
		 * get([mixed])
		 *
		 * Calls get method on each model in collection
		 * 
		 * @returns {Array}
		 * @see MooVoo.Model.get
		 * @since 1.0.0
		 */
		get: function(){
			var args = arguments;
			return this.map(function(model){
				if(args && args.length){
					return model.get(args);
				}
				else {
					return model.get();
				}
			});
		}
	});
})();

