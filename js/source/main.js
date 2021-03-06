/*
* @package HTML5 Form Shim
* @author sheiko
* @license MIT
* @copyright (c) Dmitry Sheiko http://www.dsheiko.com
* jscs standard:Jquery
* Code style: http://docs.jquery.com/JQuery_Core_Style_Guidelines
*/

/** @constructor */
/* jshint -W098 */
var hfFormShim = (function( global, factory ) {
	"use strict";
	// Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	// Rhino, and plain browser loading.
	if ( typeof define === "function" && define.amd ) {
		define(function( require, exports, module ) {
			return factory( exports );
		});
	} else if ( typeof exports !== "undefined" ) {
		return factory( exports );
	} else {
		return factory({});
	}
}( this, function( exports ) {
	"use strict";
		exports.version = "2.2.2-dev";

		// Additional lambda-function to get original undefined
		return (function( global, undefined ) {
				/**
			* Get reference to jQuery
			* @type {object}
			**/
		var $ = (function( global ) {
				if ( global.jQuery === undefined ) {
					throw new ReferenceError( "jQuery is required" );
				}
				return global.jQuery;
			}( global )),
			/** @type {object} */
			document = global.document,
			/** @type (object) */
			composite = null,
			/**
				*  How long on-input event handler waits before catching the input
				*  @constant
				*  @default
				*/
			ONINPUT_DELAY = 500,
			/** @namespace */
			meta = {
				/**
					* Detect language code
					* @public
					*/
				language: (function(){
					return ( global.navigator.userLanguage || global.navigator.language )
						.substr( 0, 2 );
				}())
			},
			/** @namespace */
			util = $import( "./util" ),
			/**
			* @namespace
			* @property {object} supportedInputTypes - List of supported types of input element
			* @property {object} supportedInputProps - List of supported properties of input element
			*/
			modernizr = $import( "./modernizr" ),
			/**
			* @class
			*/
			Page = $import( "./Page" ),
			/**
			* @class
			*/
			Form = $import( "./Form" ),

			/**
			* Value Object representing constraint validation API validity default state
			* @class
			*/
			ValidityDefaultStateVo = $import( "./ValidityDefaultStateVo" ),

			/**
			* Abstract input (input of a given type or textarea)
			* @class
			*/
			AbstractInput = $import( "./Input/Abstract" ),
			/**
			* Input type custom validators
			* @namespace
			*/
			Input = {
				/** @class */
				Text: $import( "./Input/Text" ),
				/** @class */
				Tel: $import( "./Input/Tel" ),
				/** @class */
				Email: $import( "./Input/Email" ),
				/** @class */
				Number: $import( "./Input/Number" ),
				/** @class */
				Url: $import( "./Input/Url" )
			};

		Page.incrementor = 0;

		/**
		* Set custom validator
		*
		* @param {string} type e.g. Zip
		* @param {string} msg validation message
		* @param {function} validatorCb( node: jQuery, logger: ValidationLogger ): boolean
		* @param {function} initCb( node: jQuery, logger: ValidationLogger ): boolean
		*/
		$.setCustomInputTypeValidator = function( type, msg, validatorCb, initCb ) {
			/**
			* @class
			* @name Input.AbstractType
			*/
			Input[ util.ucfirst( type ) ] = function() {
				return {
					__extends__: AbstractInput,
					/**
					* @name __constructor__
					* @memberof Input.AbstractType
					*/
					__constructor__: function() {
						initCb && initCb.apply( this.boundingBox, [ this ] );
					},
					/**
					* Validate input value
					*
					* @public
					* @memberof Input.AbstractType
					* @return {object} ValidationLogger
					*/
					validateValue: function() {
						validatorCb.apply( this.boundingBox, [ this ] ) ||
							this.throwValidationException( "customError", msg );
					}
				};
			};
		};

	/**
		* Render tooltip when validation error happens on form submition
		* Can be overriden
		* @param {string} error
		*/
		$.setCustomValidityCallback = function( error ) {
					/** $type {{top: number, left: number }} */
			var pos = this.position(),
					/** @type {jQuery} */
					parentNode = this.parent(),
					/** @type {jQuery} */
					tooltip,
					/** @type {string} */
					tooltipId = "has-tip-" + Math.ceil( pos.left ) + "-" + Math.ceil( pos.top );


			// Skip if the target already provided with tooltip (even in waiting)
			if ( parentNode.hasClass( tooltipId ) ) {
				return;
			}
			parentNode.addClass( tooltipId );
			tooltip = $( "<div class=\"tooltip tooltip-e\">" +
				"<div class=\"tooltip-arrow tooltip-arrow-e\"></div>" +
				"<div class=\"tooltip-inner\">" + error + "</div>" +
				"</div>"
				).
				appendTo( parentNode );

			tooltip.css({
				"top": pos.top - ( tooltip.height() / 2 ) + 20,
				"left": pos.left - tooltip.width() - 12
			});
			global.setTimeout( function(){
				tooltip.remove();
				parentNode.removeClass( tooltipId );
			}, 2500 );
	};
	/**
		* Shim for setCustomValidity DOM element method
		* Sets a custom error, so that the element would fail to validate.
		* The given message is the message to be shown to the user when
		* reporting the problem to the user.
		* If the argument is the empty string, clears the custom error.
		* @see http://www.w3.org/html/wg/drafts/html/master/forms.html#the-constraint-validation-api
		* @param {string} message
		*/
	$.fn.setCustomValidity = function( message ) {
		$( this ).each(function( inx, el ) {
			$( el ).data( "customvalidity", message );
		});
	};


		util.onDomReady(function(){
			composite = util.createInstance( Page );
		});

		return {
			/**
			* Repeat initialization on a given form or all the forms in DOM
			* if no argument given
			* @memberof hfFormShim
			* @static
			* @param {object} options OPTIONAL
			*/
			init: function( options ) {
				if ( options && options.boundingBox && options.boundingBox.length ) {
					composite = util.createInstance( Form, [ options ] );
				} else {
					composite = util.createInstance( Page );
				}
			},
			/**
			* Obtain AbstractInput (hfFormShim input wrapper) for the given node
			* @memberof hfFormShim
			* @static
			* @param {object} node
			* @return {object} AbstractInput
			*/
			getInput: function( node ) {
				return composite.getInput( node );
			},
			/**
			* Provide access to objects from unit-tests            *
			* @memberof hfFormShim
			* @static
			*/
			getTestable: function() {
				return {
					util: util,
					Input: Input
				};
			}
		};
	}( window ));
}));