CKEDITOR.dialog.add( 'ksolrdialog', function( editor ) {
	return {
		title: 'Add Mandala resource',
		minWidth: 960,
		contents: [{
			id: 'dialogContent',
			elements: [	{
                    type: 'html',
                    html: '<iframe src="http://viseyes.org/kmap?cke" style="width:100%;height:620px;margin-top:-90px"></iframe>'
                	}],
			}],
		onLoad: function() {
		},
		onOk: function() {
			editor.insertHtml("<img src='http://wp.patheos.com.s3.amazonaws.com/blogs/faithwalkers/files/2013/03/bigstock-Test-word-on-white-keyboard-27134336.jpg' width='300'>");
			}
		};
	});


	function trace(msg)
	{
		console.log(msg)
	}