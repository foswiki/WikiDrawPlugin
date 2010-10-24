/*
 * jQuery pngIE - A fast, reliable, and unobtrusive transparent png fix for Internet Explorer 6.
 *
 * Copyright (c) 2010 David Belais
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Version: 0.1
 */
(function($) {
	
	$.fn.pngie=function(options){
		
		var settings = $.extend({
			blankgif:'http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif',
			sizingMethod:'crop'//Alternate values of 'image' or 'scale' are not recommended.
		}, options);
		
		var element=this;
		
		if($.browser.msie && parseInt($.browser.version,10)<7){
			
			//fix for img tags
			var fix=function(){
				if($(this).width()>0){
					var f=/^progid\:DXImageTransform\.Microsoft\.AlphaImageLoader\(.*?src\=[\"\']?(.*\.png)[\"\']?.*?\)/.exec(this.runtimeStyle.filter);			
					if(!f || f.length<2 || f[1]!=$(this).attr('src')){
						$(this).attr('width',$(this).width()).attr('height',$(this).height());
						this.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader' + '(src="' + $(this).attr('src') + '", sizingMethod="'+settings.sizingMethod+'");';
						$(this).attr('src',settings.blankgif);
					}
				}
			};
			
			//fix existing png's
			$("[src$=.png]",this).add($(this).filter("[src$=.png]")).each(fix);
			$(window).load(function(){$("[src$=.png]",element).add($(element).filter("[src$=.png]")).each(fix);});
			
			//re-apply fix when a src attribute is changed
			$('[src$=.png]').live('mousemove',function(){
				$(this).each(fix);
				$("[src$=.png]").each(fix);
			});
			
			//fix dynamically added png's
			$("[src$=.png]").load(fix);
			
			
			//fix for backgrounds ( repeating background are ignored )
			$('*',this).each(function(i){
				var bg=$(this).css('background-image');
				if(typeof(bg)=='string' && bg!='none' & !/^progid\:DXImageTransform\.Microsoft\.AlphaImageLoader/.test(this.runtimeStyle.filter)){
					bg=/url\([\"\']?(.*\.png)[\"\']?\)/.exec(bg);
					if(bg && bg.length>1 && $(this).css('background-repeat').indexOf('no-')>-1){
						$(this).css('background-image', 'none').attr('contentEditable',true).attr('width',$(this).width()).attr('height',$(this).height());
						this.runtimeStyle.filter='progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+bg[1]+'",sizingMethod="'+settings.sizingMethod+'")';
					}
				}
			});
		}
		
		return $;
	};
	
})(jQuery);