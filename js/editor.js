;'use strict';

/***** Made in Ukraine *****/

// Check if jQuery is avialable
if (typeof(jQuery) === 'undefined') {
	console.log('Editor plugin require jQuery!');
}

(function($, window, document) {
	// Wysywig editor main function
	var Editor = function(element, options) {
		
		var that = this,
			// Remember editor element & controls
			$editableArea = $(element), // Current editable content area 
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
	    	$editableArea.click(showEditorOnInnerClick);

	    	// Close editor if user click outside of editor
	    	$('body').click(hideEditorOnOuterClick);

	    	// Save original content of editable area
	    	storeOriginalContent();
		};

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
				// Or we click on our editable area or some element inside
				(event.target === $editableArea[0] || $(event.target).closest($editableArea)[0] === $editableArea[0])
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
				'width' : $controlsInner.outerWidth() + 'px'
			});

			// Place editor controls above or below editing content
			placeEditor();

			// Show editor controls
			$controlsInner.css({'marginTop': $controlsInner.outerHeight() + 'px'})
				.animate({'marginTop': 0}, 500);

			// Save new content when user click on Save button
	    	$('.editor-save', $editorControls).on('click', function() {
	    		that.saveContent($editableArea[0], getNewContent());
	    	});

			// Restore original content when user click on Restore button
	    	$('.editor-restore', $editorControls).on('click', function() {
	    		restoreOriginalContent();
	    	});

			// Hide editor when user click on Hide button
	    	$('.editor-hide', $editorControls).on('click', function() {
	    		hideEditor();
	    	});
		};

		var showFrom = 'top';

		var placeEditor = function() {
			var $document = $('document'), // Window
				documentWidth = $document.width(),
				documentHeight = $document.height(),
				editableAreaWidth = $editableArea.width(),// Editable area
				editableAreaHeight = $editableArea.height(),
				$controlsInner = $editorControls.find(':first'), // Controls
				controlsInnerWidth = $controlsInner.outerWidth(),
				controlsInnerHeight = $controlsInner.outerHeight(),
				offset = $editableArea.offset();

			// Show editor on top of content if it possible
			if (offset.top >= controlsInnerHeight) {
				showFrom = 'top';
			} else if (documentHeight - offset.top - editableAreaHeight >= controlsInnerHeight) {
				showFrom = 'bottom';
			} else if (documentWidth - offset.left - editableAreaWidth >= controlsInnerWidth) {
				showFrom = 'right';
			} else if (offset.left >= controlsInnerWidth) {
				showFrom = 'left';
			}

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

		var storeOriginalContent = function() {
			$editableArea.data('originalContent', $editableArea.html());
		};

		var getNewContent = function() {
			return $editableArea.html();
		};

		var restoreOriginalContent = function() {
			$editableArea.html($editableArea.data('originalContent'));
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

		// Call constructor
		__construct();
	};

	// Abstract function for saving new content
	Editor.prototype.saveContent = function(element, content) {
		console.log('saveContent function is abstract and should be redefined!!!');
		console.log('Element class:' + element.className + ', new content:'+ content);
	};

	// Apply wysywig editor to each editable zone
	$.fn.makeEditable = function(options) {
		return $(this).each(function(index, element) {
			new Editor(element, options);
		});
	};

})(jQuery, window, document);