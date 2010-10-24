/*
 * ext-foswiki.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Sven Dowideit - using ext-helloworld by Alexis Deveria
 *
 */
 
/* 
	This is a very basic SVG-Edit extension for http://foswiki.org
*/
 
svgEditor.addExtension("Foswiki", function() {
		var urldata = {};
		if (typeof(extWikiDrawPlugin) != 'undefined') {
			urldata = extWikiDrawPlugin;
		}
		$.extend(true, urldata, $.deparam.querystring(true));
		// Load config/data from URL if given

		var wikiDrawRESTHandler = function(do_action, svg, png_datauri) {
			$.post(
				urldata.foswikisave,
				{	
					'action': "SvgEditor", 
					'do': do_action, 
					
					'svgweb': urldata.web, 
					'svgtopic': urldata.topic, 
					'drawing' : urldata.drawing,
					'svgattachment': urldata.attachment, 
					'svgcomment': '%SYSTEMWEB%.WikiDrawPlugin file',
					
					'svg': svg,
					'png': png_datauri,
					
					'annotate' : urldata.bkgd_url,
					'height' : naturalHeight,
					'width' : naturalWidth,
					
					'callingtopic' : urldata.callingtopic,
					'svgedit' : '',
					'returnto' : urldata.returnto
				},
				function (data, textStatus) { 
					var reply = data.split(' ');
					if (reply[0] == 'OK') {
						//requires post svg-edit 5.2.1 
						svgEditor.canvas.undoMgr.resetUndoStack();
						top.location = reply[1];
					} else {
						alert(data);
					}
				});
		}
				
		//replace the built in save with POST to foswiki 
		var opts = {};
		opts.save = function(canvas, svg) {
				//save svg to foswiki_save
				
				if($.isEmptyObject(urldata)) {
					alert('serious error parsing url');
				} else {
					$.alert('Please wait, saving changes to the wiki.', function() {});
						var png_datauri;
						//export the png too
						if(!$('#export_canvas').length) {
							$('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
						}

						//clickExport();
						//ok, so its a hurtful thing to have to do this here..
						if(window.canvg) {
										svgCanvasToString = svgEditor.canvas.getPrivateMethods().svgCanvasToString;
										png_datauri = svgCanvasToString();
										//alert(png_datauri);
						} else {
							$.getScript('canvg/rgbcolor.js', function() {
								$.getScript('canvg/canvg.js', function() {
										svgCanvasToString = svgEditor.canvas.getPrivateMethods().svgCanvasToString;
										png_datauri = svgCanvasToString();
										//alert(png_datauri);

										var c = $('#export_canvas')[0];

										c.width = svgEditor.canvas.contentW;
										c.height = svgEditor.canvas.contentH;
										canvg(c, svg);
										png_datauri = c.toDataURL('image/png');

										// by default, we add the XML prolog back, systems integrating SVG-edit (wikis, CMSs) 
										// can just provide their own custom save handler and might not want the XML prolog
										svg = "<?xml version='1.0'?>\n" + svg;
										wikiDrawRESTHandler('save', svg, png_datauri);
								});
							});
						}
					}
			};
		//load the svg
		if(urldata.svgurl) {
		    // svg edit tosses up a dialog if the url doesn't exist, so we need to pretest :(
			$.get(urldata.svgurl,
			{},
			function(data, textStatus) {
					{
							svgEditor.loadFromURL(urldata.svgurl);
							//requires post svg-edit 5.2.1 
							svgEditor.canvas.undoMgr.resetUndoStack();
						}
				});
		}

		var old = svgEditor.setCustomHandlers(opts);


		return {
			name: "Foswiki",
			// For more notes on how to make an icon file, see the source of
			// the foswiki-icon.xml
			svgicons: "extensions/foswiki-icon.xml",
			
			// Multiple buttons can be added in this array
			buttons: [{
				// Must match the icon ID in foswiki-icon.xml
				id: "foswiki_cancel", 
				
				// This indicates that the button will be added to the top "editor_panel"
				// button panel on the left side
				type: "context", 
				panel: "editor_panel",
				
				// Tooltip text
				title: "Cancel edit", 
				
				// Events
				events: {
					'click': function() {
						wikiDrawRESTHandler('cancel', '', '');
					}
				}
			}]
		};
});

