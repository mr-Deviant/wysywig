/***** Made in Ukraine *****/

; // In case previous script wasn't
// Check if jQuery is avialable
if (typeof(jQuery) === 'undefined') {
	console.log('Editor plugin require jQuery!');
}

(function($, window, document, undefined) {
	// Apply wysywig editor to each editable zone
	$.fn.makeEditable = function(options) {
		return $(this).each(function(index, element) {
			new Editor(element, options);
		});
	};

	// Wysywig editor main function
	var Editor = function(element, options) {
		'use strict';

			// Remember editor element & controls
		var $editableArea = $(element), // Current editable content area 
			$editorControls,
			// Default settings
			settings = {
				// TODO: move selectors outside of settings
				editorTemplateSelector: '#editor-template',
				editorDialogSelector  : '.editor-dialog',
				editorDragSelector    : '.editor-drag',
				isDraggable           : true // Enable/disable wysywig draggable
			};

		settings = $.extend(settings, options);

		// Editor inititalization, called automatically!
		var __construct = function() {
			// Show editor when user firstly click on editable area
			// TODO: use .one('click')
	    	$editableArea.click(function(event) {
	    		showEditorOnInnerClick(event);
	    	});

	    	// TODO: Doesn't work now, because $editorControls is out of jQuery click scope
	    	// Hide editor when user click on Cancel button
	    	$('body').on('click', '.editor-cancel', function() {
	    		hideEditor();
	    	});

	    	// Close editor if user click outside of editor
	    	$('body').click(function(event) {
	    		hideEditorOnOuterClick(event);
	    	});
		}();

		var showEditorOnInnerClick = function(event) {
			// If we already display controls panel, skip initialization
			if ($editorControls) {
				return false;
			}

			showEditor();
	    };

	    var hideEditorOnOuterClick = function(event) {
			if (
				// If we doesn't already display controls panel
				!$editorControls
				||
				// Or we click on our editable area
				event.target === $editableArea[0]
				||
				// Or we click on our controls panel
				($editorControls && $(event.target).closest(settings.editorDialogSelector)[0] === $editorControls[0])
			) {
				// Skip this section
				return false;
			}

			hideEditor();
	    };

		var showEditor = function() {
			var controlsHtml,
				$controlsInner;

			// Enable edit of content
			$editableArea.attr('contenteditable', true);

			// Highlight editing content area
			$editableArea.addClass('editable-focus');

			// Get controls panel code
			controlsHtml = $(settings.editorTemplateSelector).html().trim();

			// Add hidden editor controls to DOM
			$editorControls = $(controlsHtml).appendTo('body');

			// Make controls draggable and show drag panel
			if (settings.isDraggable) {
				$('.editor-drag').show();
				makeControlsDraggable();
			}

			// Set correct size for controls
			$controlsInner = $editorControls.find(':first');

			$editorControls.css({
				'height': $controlsInner.outerHeight() + 'px',
				'width': $controlsInner.outerWidth() + 'px'
			});

			// Place editor controls above or below editing content
			placeEditor();

			// Show editor controls
			$controlsInner.css({'marginTop': $controlsInner.outerHeight() + 'px'})
				.animate({'marginTop': 0}, 500);
		};

		var placeEditor = function() {
			var $controlsInner = $editorControls.find(':first');
			var offset = $editableArea.offset();
			$editorControls.css({
				top: offset.top - $controlsInner.outerHeight() + 'px',
				left: offset.left + 'px'
			});
		};

		var hideEditor = function() {
			var $controlsInner = $editorControls.find(':first');

			$.when($controlsInner.animate({'marginTop': $controlsInner.outerHeight() + 'px'}, 500))
			.then(function() {
				$editorControls.remove();
				$editorControls = null;
			});

			// Unhighlight editing content area
			$editableArea.removeClass('editable-focus');

			// Disable edit of content
			$editableArea.attr('contenteditable', false);
		};

		var makeControlsDraggable = function() {
			$('.editor-drag').mousedown(function(event) {
				dragStart(event);
			}).mouseup(function() {
				dragEnd();
			});
		};

		var dragStart = function(event) {
			var posX = event.pageX,
                posY = event.pageY,
                position = $editorControls.position(),
                blockTop = position.top,
                blockLeft = position.left,
                startX = posX - blockLeft,
                startY = posY - blockTop;

            $editorControls.addClass('editor-draggable');

			$('body').bind('mousemove', {$element: $editorControls, startX: startX, startY: startY}, dragProcess);
		};

		var dragProcess = function(event) {
			var posX = event.pageX,
                posY = event.pageY,
                finishX = posX - event.data.startX,
                finishY = posY - event.data.startY;

				event.data.$element.css({
					left: finishX + 'px',
					top: finishY + 'px'
				});
		};

		var dragEnd = function() {
			$editorControls.removeClass('editor-draggable');
			
			$('body').unbind('mousemove', dragProcess);
		};

	};

})(jQuery, window, document);