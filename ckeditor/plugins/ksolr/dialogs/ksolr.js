var skEditor;

CKEDITOR.dialog.add( 'ksolrdialog', function( editor ) {
	return {
		title: 'Add Mandala resource',
		minWidth: 960,
		contents: [{
			id: 'dialogContent',
			elements: [	{
                    type: 'html',
                    html: '<iframe src="http://viseyes.org/ksolr/index.html" style="width:100%;height:640px;margin-top:-90px"></iframe>'
                	}],
			}],
		onLoad: function() {
			if (window.addEventListener) 											// If supported this way
				window.addEventListener("message",kSolrHandler,false);				// Add event handler
			else																	// Use other method
			window.attachEvent("message",kSolrHandler);								// Add handler
			skEditor=editor;
		},
		onOk: function() {}
		};
	});


	function trace(msg)
	{
		console.log(msg)
	}

	function kSolrHandler(e)													// ON KSOLR EVENT
	{
		if (e.data && e.data.match(/kSolrMsg/)) {									// Message from kmap
			var o=$.parseJSON(e.data.substr(9));									// Objectify
			if (o.asset_type == "images") {											// Picture asset
				if (o.imgSrc)		skEditor.insertHtml("<img src='"+o.imgSrc+"' width='300'>");	// Add image to text
				if (o.imgCaption)	skEditor.insertHtml("<br>"+o.imgCaption);		// Add caption to text
				}
			else if (o.asset_type == "sources") {									// Sources asset
				if (o.summary) 		src=o.summary;									// Summary
				else if (o.caption) src=o.caption;									// Caption
				else if (o.title) 	src=o.title;									// Title
				if (src)															// If something
					skEditor.insertHtml("<p>"+src+"</p>");							// Add string to text
				}
			else{																	// Anthing else
				if (o.url_thumb) 													// Use thumb 
					skEditor.insertHtml("<iframe frameborder='0' scrolling='no' src='"+o.url_thumb+"' width='300'><iframe>");	// Add iframe to text
				}
			}
	}
