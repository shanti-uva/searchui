////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITEMS
// Assumes access to sf, curItem globals
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function item()													// CONSTRUCTOR
{
	this.lastClick=0;												// Helps mediate single/double clicking
	this.mediaTypeNames=["Web","Image","Media","Document","Map","Mandala","SHIVA","Qmedia","VisualEyes"];
	this.type="";
	this.filter="";
}	

item.prototype.item=function()									// DRAW
{
}

item.prototype.Set=function(project)							// DIALOG
{
	var _this=this;													// Get context
	this.items=project.items;
}

item.prototype.Preview=function(id)								// PREVIEW ITEM
{
	var h=window.innerHeight-200-75;								// Get height
	var o=dataObj.FindFromID(sf.items,id);							// Get index from real id
	if (o < 0)														// If invalid
		return;														// Quit
	o=sf.items[o];													// Point at item
	var str="<div class='sf-previewTitle'>"+o.title+"</div><br>";	// Add title
	if (o.src && o.src.match(/\.png|.gif|\.jpg|.jpeg/i)) 			// An image
		str+="<div style='width:798px;max-height:"+h+"px;border:1px solid #999;overflow-y:auto'><img style='width:100%' src='"+o.src+"'></div>";
	else
		str+="<iframe frameborder='0' allowfullscreen height='"+h+"' width='100%' style='0,border:1px solid #666;width:100%' src='"+o.src+"'/>";
	ShowLightBox(800,"Preview",str);								// Show lightbox
}

item.prototype.UpdatePage=function()							// UPDATE ITEM PAGE	
{
	var i,pic="", typ="";
	if (curItem != -1) {											// If a valid item
		curItem=Math.min(curItem,sf.items.length-1);				// Cap at length
		var o=sf.items[curItem];									// Point at item
		if (o.type)  typ=o.type.toLowerCase();						// Make type lc
		for (i=0;i<this.mediaTypeNames.length;++i) 					// For each type
			if (typ == this.mediaTypeNames[i].toLowerCase()) {		// A lc match
				$("#imType").prop("selectedIndex",i);				// Set select
				break;
				}
		$("#imTitle").val(o.title ? o.title: "") 					// Set title
		$("#imDesc").val(o.desc   ? o.desc: "");					// Set desc
		$("#imCite").val(o.citation   ? o.citation: "");			// Set citation
		$("#imSrc").val(o.src     ? o.src: "");						// Set src
		$("#imTags").val(o.tags   ? o.tags: "");					// Set tags
		$("#imThumb").val(o.thumb ? o.thumb: "");					// Set thumb
		}
	else{															// Start fresh
		$("#imTitle").val("");	$("#imDesc").val("") 				// Clear it out				
		$("#imCite").val("");	$("#imSrc").val("") 					
		$("#imThumb").val("");	$("#imTags").val("");					
		$("#imType").val("")
		}
	if ($("#imThumb").val())										// If a thumb spec'd
		pic=$("#imThumb").val();									// Use it
	else															// Use generic images
		pic=GetMediaIcon($("#imType").val(),$("#imSrc").val());		// Get proper icon	
	$("#iPic").prop("src",pic);										// Set src
	sf.AddProjectItems(true);										// Add items
	this.AddHandlers(true);											// Re-add handlers
	$("#item-"+curItem).css("color","#990000");						// Set color of current'y highlighted item
}
	
item.prototype.MakePage=function()								// PREVIEW ITEM
{
	var str="<div id='projectDiv' class='sf-projectPage'>";			// Items container
	str+="<table style='width:90%;font-weight:bold;text-align:left'>";
	str+="<tr><td height='28'>Item type</td><td>";
	str+=MakeSelect("imType",false,this.mediaTypeNames)+"</td></tr>";
	str+="<tr><td height='28'>Title</td><td>";
	str+="<input type='text' class='sf-is' id='imTitle'></td></tr>";
	str+="<tr><td height='28'>Description</td><td>";
	str+="<textarea class='sf-is' style='font-family:sans-serif' id='imDesc'></textarea></td></tr>";		
	str+="<tr><td height='28'>Citation</td><td>";
	str+="<input type='text' class='sf-is' id='imCite'></td></tr>";
	str+="<tr><td height='28'>Source</td><td>";
	str+="<input type='text' class='sf-is' id='imSrc'></td></tr>";
	str+="<tr><td height='28'>Thumbnail&nbsp;pic&nbsp;&nbsp;</td><td>";
	str+="<input type='text' class='sf-is' id='imThumb'></td></tr>";
	str+="<tr><td height='28'>Tags &nbsp;</td><td>";
	str+="<input type='text' class='sf-is' id='imTags'></td></tr>";
	str+="<tr><td>Icon</td><td><div class='sf-itemPic'><img width='100%' id='iPic'><div></td></tr>";				
	str+="</table>";
	str+="<p style='text-align:center'>Click item  from the right to edit an existing item, or click on the 'Add new item' pulldown below to add a new item to your collection.</p>";
	str+="<div style='text-align:center;'>";
	str+=MakeSelect("imImport",false,["Add new item","Manually","Flickr","Google drive","Mandala"]);
	str+="&nbsp;&nbsp;<img id='imDeleteBut' class='sf-itemBut' src='img/trashbut.gif'  title='Delete an item'></div>";
	str+="</div><div id='itemPickerDiv' class='sf-itemsPicker'></div>";	// Item picker container
	return str;															// Return page
}

item.prototype.AddHandlers=function(fromUpdate)						// ADD  HANDLERS
{
	var _this=this;														// Save context
	if (!fromUpdate)	this.UpdatePage();								// Update page, unless recursive

	$('[id^="im"]').off();												// Remove old handlers that start with 'im'
	$('[id^="item-"]').off();

	$("#imType").on("change",function() { 								// CHANGE TYPE
		if (curItem != -1) {											// If an existing item	
			sf.Do();													// something changed
			sf.items[curItem].type=$(this).val();						// Set value
			sf.AddProjectItems(true);									// Redraw items
			_this.AddHandlers(true);									// Re-add handlers
			}								
		_this.UpdatePage();												// Update page
		});
	$("#imTitle").on("blur",function() { 								// EDIT TITLE
		if (curItem != -1) {											// If an existing item	
			sf.Do();													// something changed
			sf.items[curItem].title=$(this).val();						// Set value
			sf.AddProjectItems(true);									// Redraw items
			_this.AddHandlers(true);									// Re-add handlers
			}								
		_this.UpdatePage();												// Update page
		});
	$("#imDesc").on("blur",function() { 								// EDIT DESC
		if (curItem != -1) {											// If an existing item	
			sf.Do();													// something changed
			sf.items[curItem].desc=$(this).val();						// Set value
			sf.AddProjectItems(true);									// Redraw items
			_this.AddHandlers(true);									// Re-add handlers
			}								
		_this.UpdatePage();												// Update page
		});	
	$("#imCite").on("blur",function() { 								// EDIT CITE
		if (curItem != -1) {											// If an existing item	
			sf.Do();													// something changed
			sf.items[curItem].citation=$(this).val();					// Set value
			sf.AddProjectItems(true);									// Redraw items
			_this.AddHandlers(true);									// Re-add handlers
			}								
		_this.UpdatePage();												// Update page
		});
	$("#imThumb").on("blur",function() { 								// EDIT THUMB
		if (curItem != -1) {											// If an existing item	
			sf.Do();													// something changed
			sf.items[curItem].thumb=$(this).val();						// Set value
			sf.AddProjectItems(true);									// Redraw items
			_this.AddHandlers(true);									// Re-add handlers
			}								
		_this.UpdatePage();												// Update page
		});
	$("#imSrc").on("blur",function() { 									// EDIT SOURCE
		if (curItem != -1) {											// If an existing item	
			sf.Do();													// something changed
			sf.items[curItem].src=ExtractFromEmbed($(this).val());		// Extract url from embed code and set value
			if (sf.items[curItem].src) {								// Something in source
				if (sf.items[curItem].src.match(/youtube|video|kaltura|mp4|mp3/i))		// If media
					sf.items[curItem].type="Media";										// Set type
				else if (sf.items[curItem].src.match(/google.com.map/i))				// If google map
					sf.items[curItem].type="Map";										// Set type
				else if (sf.items[curItem].src.match(/\.png|.gif|\.jpg|.jpeg/i)) 		// An image
					sf.items[curItem].type="Image";										// Set type
				else if (sf.items[curItem].src.match(/go\.htm/i)) 						// SHIVA
					sf.items[curItem].type="SHIVA";										// Set type
				else if (sf.items[curItem].src.match(/viseyes\.org\/visualeyes/i)) 		// VisualEyes
					sf.items[curItem].type="VisualEyes";								// Set type
				else if (sf.items[curItem].src.match(/qmediaplayer\.com/i)) 			// Qmedia
					sf.items[curItem].type="Qmedia";									// Set type
				$("#imSrc").val(sf.items[curItem].src);					// Set src, in case it changed
				$("#imType").val(sf.items[curItem].type);				// Set pulldown
				}	
			sf.AddProjectItems(true);									// Redraw items
			_this.AddHandlers(true);									// Re-add handlers
			}								
		});
	$("#imTags").on("blur",function() { 								// EDIT TAGS
		if (curItem != -1) {											// If an existing item	
			sf.Do();													// something changed
			sf.items[curItem].tags=$(this).val();						// Set value
			sf.AddProjectItems(true);									// Redraw items
			_this.AddHandlers(true);									// Re-add handlers
			}								
		_this.UpdatePage();												// Update page
		});
			
	$("#imDeleteBut").on("click",function() { 							// ADD NEW ITEM
		if (curItem != -1)
			ConfirmBox("This will delete the item titled:<br><br><b><i>"+sf.items[curItem].title+"</b></i>", function() {
				sf.Do()													// Something changed
				sf.items.splice(curItem,1);								// Remove it
				curItem--;												// Go to previous projcet
				Sound("delete");										// Delete
				_this.UpdatePage();										// Update page
				})
		});
	
	$("#imImport").on("change",function() { 							// IMPORT
		if ($(this).val() == "Flickr")									// If Flickr
			_this.ImportFlickr();										// Run importer
		else if ($(this).val() == "Google drive")						// If Google
		  	_this.ImportGoogle(true);									// Run importer
		else if ($(this).val() == "Mandala")							// If Mandala
		  	_this.ImportMandala();										// Run importer
  		else if ($(this).val() == "Manually") {							// By hand	
  			sf.Do()														// Something changed
			Sound("add");												// Add sound
			var o={};													// Holds new item
			o.type="Web";												// Set type to web
			o.title="New item"; 										// Set title
			o.id=MakeUniqueId();										// Create new id
			o.desc=o.src="";											// Clear src and desc
			o.tags=$("#imTags").val();									// Set tags
			o.thumb=$("#imThumb").val();								// Set thumb
			sf.items.push(o);											// Add to items
			curItem=sf.items.length-1;									// Point to this one
			_this.UpdatePage();											// Update page
			}
   		$(this).prop("selectedIndex",0);								// Set select to top
		_this.UpdatePage();												// Update page
		});

	$("#projFilter").on("change",function() { 							// FILTER BY TYPE
		itemFilter=$("#projFilter").val();								// Set it	
		_this.UpdatePage();												// Update page
		});

	$("#projType").on("change",function() { 							// FILTER BY STRING
		itemType=$("#projType").val();									// Set it	
		_this.UpdatePage();												// Update page
		});

	$('[id^="item-"]').on("click",function(e) {							// ON SINGLE/DOUBLE CLICK ON ITEM
		curItem=$(this).prop("id").substr(5);							// Set current item
		_this.UpdatePage();												// Update page
		Sound("click");													// Click
		if (e.timeStamp-_this.lastClick < 400)							// A double click		
			itemObj.Preview(sf.items[curItem].id);						// Get real id and preview 
		_this.lastClick=e.timeStamp;									// Then is now
		});
		
	$('[id^="item-"]').on("doubletap",function() {						// ON DOUBLE TAP MOBILE
		var id=$(this).prop("id").substr(5);							// Get current item
		itemObj.Preview(sf.items[id]);									// Get real id and preview 
		});

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FLICKR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

item.prototype.ImportFlickr=function()								// FLICKR IMPORTER
{
	
	var _this=this;														// Save context

	GetFlickrImage( function(s) {
		var o={};														// Holds new item
		o.type="Image"													// Set type
		o.src=s.split("|")[0];											// Set src
		o.title=s.split("|")[1];										// Set title
		o.id=MakeUniqueId();											// Create new id
		sf.items.push(o);												// Add ite,
		curItem=sf.items.length-1;										// Point to this one
		_this.UpdatePage();												// Update page
		});

	function GetFlickrImage(callback)										// GET FLICKR IMAGE
	{
		var apiKey="edc6ee9196af0ad174e8dd2141434de3";
		var trsty=" style='cursor:pointer;background-color:#f8f8f8' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' onMouseOut='this.style.backgroundColor=\"#f8f8f8\"'";
		var cols,photos,str;
		var curCollection=0,curSet;
		
		$("#alertBoxDiv").remove();												// Remove any old ones
		$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
		str="<p><img src='";													// Image start
		str+="img/shantilogo32.png";											// Logo
		str+="' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
		str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>Get Image from Flickr</b></span><p>";
		str+="<p style='text-align:right'>Flickr screen name: <input class='sf-is' id='idName' type='text' value='"+GetCookie('flickr')+"' style='width:100px;;margin-bottom:8px' > &nbsp;<button id='getBut' class='sf-bs'>Get</button></p>";
		str+="<div style='display:inline-block;width:360px;height:120px;overflow-y:auto;background-color:#f8f8f8;padding:8px;border:1px solid #999;border-radius:8px'>";		// Scrollable container
		str+="<table id='collectTable' style='font-size:11px;width:100%;padding:0px;border-collapse:collapse;'>";	// Add table
		str+="<tr><td><b>Collection</b></td><td width='20'></td></tr>";			// Add header
		str+="<tr><td colspan='2'><hr></td></tr>";								// Add rule
		str+="</table></div>&nbsp;&nbsp;&nbsp;"									// End table
	
		str+="<div style='vertical-align:top;display:inline-block;width:360px;height:120px;overflow-y:auto;background-color:#f8f8f8;padding:8px;border:1px solid #999;border-radius:8px'>";		// Scrollable container
		str+="<dl id='setTable' style='font-size:11px;margin-top:2px;margin-bottom:2px'>";		// Add table
		str+="<dt><b>Set</b></dt>";												// Add header
		str+="<dt><hr></dt>";													// Add rule
		str+="</dl></div><br><br>";												// End table
	
		str+="<div id='picGal' style='width:100%px;height:300px;overflow-y:auto;background-color:#f8f8f8;padding:8px;border:1px solid #999;border-radius:8px'>";		// Scrollable container
		str+="</div>";

		$("#alertBoxDiv").append(str+"</div>");	
		$("#alertBoxDiv").dialog({ width:800, buttons: {
					            	"Cancel":  	function() { LoadingIcon(false); $(this).remove(); }
									}});	
		$(".ui-dialog-titlebar").hide();
		$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
		$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
 		$(".ui-button").css({"border-radius":"30px","outline":"none"});
  		
 		$("#getBut").on("click",function() {									// ON GET CONTENT BUTTON
	   		cols=[];															// Reset array of collections
			Sound("click");														// Click
			var id=$("#idName").val();											// ID name
 			var url="https://api.flickr.com/services/rest/?method=flickr.people.findByUsername&format=rest&api_key="+apiKey+"&username="+id;
	 		SetCookie("flickr",id,7);											// Save cookie
 			LoadingIcon(true,64);												// Show loading icon
 			$.ajax({ type:"GET", url:url, dataType:"xml",						// Call REST to get user id
  				success: function(xml){											// Om XML
	   				LoadingIcon(false);											// Hide loading icon
	   				if ($(xml).find("err").length) {							// If an error tag
	   					$("#picGal").html("<p style='text-align:center;color:990000'><b>"+$(xml).find("err").attr("msg")+"</b></p>");
	   					return;													// Quit
	   					}
  	   				id=$(xml).find("user").attr("id");							// Get id
		 			GetContent(id);												// Get content from Flickr via user id
					}});														// Ajax get id end
 			});																	// Click end

	
	function GetContent(userId) 												// GET CONTENT
	{
		var i=0,o,oo;
		var url="https://api.flickr.com/services/rest/?method=flickr.collections.getTree&format=rest&api_key="+apiKey+"&user_id="+userId;
		LoadingIcon(true,64);														// Show loading icon
		$.ajax({ type:"GET", url:url, dataType:"xml",								// Call REST to get user tree	
			success: function(xml) {												// On XML
				$("#collectTable tr:gt(1)").remove();								// Remove all rows
				$("#setTable tr").remove();											// Remove all rows
				$("#picGal").html("<p style='text-align:center'><b>Choose collection to view</b></p>");
		   		LoadingIcon(false);													// Hide loading icon
				$(xml).find("collection").each( function() {						// For each collection
					o={};															// New obj
					o.sets=[];														// Array of sets
					o.id=$(this).attr("id");										// Get id
					o.title=$(this).attr("title");									// Get title
					$(this).find("set").each( function() {							// For each set
						oo={};														// New obj
						oo.id=$(this).attr("id");									// Get set id
						oo.title=$(this).attr("title");								// Get set title
						o.sets.push(oo);											// Add set
						});
					cols.push(o);													// Add collection to array
				});
			
			url="https://api.flickr.com/services/rest/?method=flickr.photosets.getList&format=rest&api_key="+apiKey+"&user_id="+userId;
			LoadingIcon(true,64);													// Show loading icon
			$.ajax({ type:"GET", url:url, dataType:"xml",							// Call REST to get user tree	
				success: function(xml) {											// On XML
			   		LoadingIcon(false);												// Hide loading icon
					o={};															// New obj
					o.sets=[];														// Array of sets
					o.title="All";													// Get title
					$(xml).find("photoset").each( function() {						// For each set
						oo={};														// New obj
						oo.id=$(this).attr("id");									// Get set id
						oo.title=$(this).text().split("\n")[1];						// Get set title
						o.sets.push(oo);											// Add set
						});
					if (o.sets.length)												// If some sets
						cols.push(o);												// Add to array
					
					for (i=0;i<cols.length;++i)	{									// For each collection
			 			str="<tr id='fda"+i+"' "+trsty+">";							// Row
						str+="<td>"+cols[i].title+"</td>"; 							// Add name
						$("#collectTable").append(str);								// Add row														
					
						$("#fda"+i).on("click", function() {						// On collection click
							Sound("click");											// Click
							$("#picGal").html("<p style='text-align:center'><b>Choose set to view</b></p>");
							$("#ida"+curCollection).css({"color":"#000000","font-weight":"normal"});	// Uncolor last
							curCollection=this.id.substr(3);						// Set cur collection
							$("#ida"+curCollection).css({"color":"#990000","font-weight":"bold"});		// Color current
							ChooseCollection(curCollection);						// Show current collection
							});														// End collection click
						}
				}});																// Ajax get sets end
 			
 	
			}});																	// Ajax get tree end	
	}

	function ChooseCollection(id) 											// CHOOSE A COLLECTION
 	{
		var o=cols[curCollection];												// Point at collection
		$("#setTable tr").remove();												// Remove all rows
		for (var j=0;j<o.sets.length;++j) {										// For each set			
 			str="<tr id='ids"+j+"' "+trsty+">";									// Row
			str+="<td>"+o.sets[j].title+"</td>"; 								// Add name
			$("#setTable").append(str);											// Add row
			
			$("#ids"+j).on("click", function() { 								// On set click
				Sound("click");													// Click
				$("#ids"+curSet).css({"color":"#000000","font-weight":"normal"});	// Uncolor last
				curSet=this.id.substr(3);										// Cur set
				$("#ids"+curSet).css({"color":"#990000","font-weight":"bold"});	// Color current
				ChooseSet(this.id.substr(3));									// Show current set
				});																// End set click
			}	
	}
 
	function ChooseSet(id) 													// CHOOSE A SET
 	{
		var i,j=0,str="",oo,t;
		id=cols[curCollection].sets[id].id;										// Get set id
		var url="https://api.flickr.com/services/rest/?method=flickr.photosets.getphotos&format=rest&api_key="+apiKey+"&photoset_id="+id;
		LoadingIcon(true,64);													// Show loading icon
		$.ajax({ type:"GET", url:url, dataType:"xml",							// Call REST to get list of photos
			success: function(xml) {											// On XML
				photos=[];														// New photo array
				$(xml).find("photo").each( function() {							// For each set
			   		LoadingIcon(false);												// Hide loading icon
					oo={};														// New obj
					oo.id=$(this).attr("id");									// Get id
					oo.secret=$(this).attr("secret");							// Get secret
					oo.farm=$(this).attr("farm");								// Get farm
					oo.server=$(this).attr("server");							// Get server
					oo.title=$(this).attr("title");								// Get title
					photos.push(oo);											// Add photo to array
					t=oo.title;													// Copy title				   								
					str+="<div id='idp"+(j++)+"' style='width:83px;border:1px solid #ccc;padding:4px;display:inline-block;text-align:center;font-size:9px;margin:6px;";
					str+="cursor:pointer;background-color:#f8f8f8' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' onMouseOut='this.style.backgroundColor=\"#f8f8f8\"'>";
					str+="<img title='"+oo.title+"' src='https://farm"+oo.farm+".staticflickr.com/"+oo.server+"/"+oo.id+"_"+oo.secret+"_s.jpg'><br>";
					str+="<div style='padding-top:4px;overflow:hidden'>"+oo.title.substr(0,Math.min(oo.title.length,15))+"</div></div>";
					});
				$("#picGal").html(str);											// Add to gallery
				for (i=0;i<photos.length;++i) {									// For each pic
					$("#idp"+i).on("click", function(){							// ON PHOTO CLICK
						Sound("click");											// Click
						var id=this.id.substr(3);								// Get id
						ChoosePhoto(id,photos[id].title);						// Preview and choose photo
						});														// End photo click
					}
				}});															// Ajax get photos end
	}

	function ChoosePhoto(id, title) 										// PREVIEW AND CHOOSE PHOTO SIZES
 	{
		var o,sizes=[],i;
		var url="https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=rest&api_key="+apiKey+"&photo_id="+photos[id].id;
		LoadingIcon(true,64);													// Show loading icon
		$.ajax({ type:"GET", url:url, dataType:"xml",							// Call REST to get sizes
			success: function(xml) {											// On XML
				LoadingIcon(false);												// Hide loading icon
				$(xml).find("size").each( function() {							// For each size
					o={};														// New obj
					o.source=$(this).attr("source");							// Get source
					o.label=$(this).attr("label");								// Get label
					o.title=$(this).attr("title");								// Get title
					if (o.label == "Medium") 									// If medium pic
						str="<img style='border:1px solid #666' src='"+o.source+"' height='294'>";	// Image
					sizes.push(o);												// Add size to array
					});
							
				var t=$("#picGal").position().top+10;							// Gallery top
				str+="<div style='position:absolute;top:"+t+"px;left:550px;width:232px;text-align:right;'>";
				str+="<span style='font-size:11px'><i>Choose size: </i> </span>";		
				for (i=0;i<sizes.length;++i) 									// For each size
					str+="<button style='margin-bottom:5px' class='bs' id='fdx"+i+"'>"+sizes[i].label+"</button><br>"
				$("#picGal").html(str+"</div>");								// Fill gallery
				for (i=0;i<sizes.length;++i)									// For each size
					$("#fdx"+i).on("click", function() {						// On button click
						Sound("click");											// Click
						callback(sizes[this.id.substr(3)].source+"|"+title);	// Send url/title to cb
						$("#alertBoxDiv").remove();								// Close dialog
						});
			}});																// Ajax get sizes end
	  	}
	}																			// End closure function
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GOOGLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

item.prototype.ImportGoogle=function(allFiles, callback)						// FLICKR IMPORTER
{
	var _this=this;																	// Save context
 	
	LoadGoogleDrive( true, function(s) {
		var o={ type:"Web" };														// Holds new item
	    if (s.embedUrl)																// If Google native
	    	o.src=s.embedUrl;														// Use embed
	    else																		// Non-google
	    	o.src="//drive.google.com/uc?export=download&id="+s.id;					// Construct 'direct' link
    	if (s.name)																	// If title
	    	o.title=s.name;															// Use it
	   	if (s.desc)																	// If desc
	    	o.desc=s.desc;															// Use it
		if (s.type == "photo") {													// If photo    
			o.type="Image"															// Set type
  			o.src+="#.jpg";															// Force as image
  			}
 		o.id=MakeUniqueId();														// Create new id
 		sf.items.push(o);															// Add item
		curItem=sf.items.length-1;													// Point to this one
		_this.UpdatePage();															// Update page
		});
	
 	function LoadGoogleDrive(allFiles, callback)								// LOAD PICKER FOR GOOGLE DRIVE
	{
	  	var pickerApiLoaded=false;
		var oauthToken;
		gapi.load('auth', { 'callback': function() {
				window.gapi.auth.authorize( {
	              	'client_id': "81792849751-1c76v0vunqu0ev9fgqsfgg9t2sehcvn2.apps.googleusercontent.com",
	             	'scope': ['https://www.googleapis.com/auth/drive'],
	              	'immediate': false }, function(authResult) {
							if (authResult && !authResult.error) {
	          					oauthToken=authResult.access_token;
	          					createPicker();
	          					}
	          				});
				}
			});
		
		gapi.load('picker', {'callback': function() {
				pickerApiLoaded=true;
		        createPicker();
	    	   	}
			});
	
		function createPicker() {
	        if (pickerApiLoaded && oauthToken) {
	           	var upview=new google.picker.DocsUploadView();
	           	var view=new google.picker.DocsView().
	           		setOwnedByMe(allFiles).
					setIncludeFolders(true);
	          	var picker=new google.picker.PickerBuilder().
	          		addView(view).
	          		addView(upview).
					setOAuthToken(oauthToken).
					setDeveloperKey("AIzaSyAVjuoRt0060MnK_5_C-xenBkgUaxVBEug").
					setCallback(pickerCallback).
					build();
				picker.setVisible(true);
	       		}
	    	}
	
		function pickerCallback(data) {
	        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
         		var doc=data[google.picker.Response.DOCUMENTS][0];
	      		// name, desc, url, type, id, [ embedUrl ]	
   				// 		type = [ photo, files, doc, document ]
	      		callback(doc)
	       		}
			}
	   
	}	// End closure
 }
 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MANDALA
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

item.prototype.ImportMandala=function()											// MANDALA IMPORTER
{
	var _this=this;																	// Save context
	var collections=["Audio-Video","Images","Sources","Texts","Visual"];			// Supported collections
	$("#alertBoxDiv").remove();														// Remove any old ones
	$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
	str="<p><img src='";															// Image start
	str+="img/shantilogo32.png";													// Logo
	str+="' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>Get Item from Mandala</b></span><p>";
	str+="<p style='text-align:right'>Collection: "+MakeSelect("mdCollect",false,collections,this.type);
	str+="&nbsp;&nbsp;filter by: <input class='sf-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:100px;margin-bottom:8px'></p>";
	str+="<div id='mdAssets' style='width:100%px;height:300px;overflow-y:auto;background-color:#f8f8f8;padding:8px;border:1px solid #999;border-radius:6px'>";		// Scrollable container
	str+="</div>";

	$("#alertBoxDiv").append(str+"</div>");	
	$("#alertBoxDiv").dialog({ width:800, buttons: {
				            	"Cancel":  	function() { LoadingIcon(false); $(this).remove(); }
								}});	
	$(".ui-dialog-titlebar").hide();
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
	$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
	$(".ui-button").css({"border-radius":"30px","outline":"none"});

	LoadCollection($("#mdCollect").val());											// Load 1st collection
 	
 	
	$("#mdCollect").on("change", function() {										// ON CHANGE COLLECTION
			itemObj.type=$(this).val();												// Save for later											
		 	LoadCollection($(this).val());											// Load it
			});
	$("#mdFilter").on("change", function() {										// ON CHANGE FILTER
			itemObj.filter=$(this).val();											// Save for later											
		 	LoadCollection($(this).val());											// Load it
			});
	
 
 
 	function LoadCollection(coll)												// LOAD COLLECTION FROM SOLR
	{
		LoadingIcon(true,64);														// Show loading icon
		var search="service%3A"+coll.toLowerCase()+"*";								// Add servoce						
		if ($("#mdFilter").val())													// If a filter spec'd
			search+=", caption%3A*"+$("#mdFilter").val().toLowerCase()+"*";			// Add filter to query
		
		$.ajax({
			'url': ' https://ss251856-us-east-1-aws.measuredsearch.com/solr/#/?q='+search,
		  	'data': {'wt':'json', 'json.wrf':'itemObj.FormatMandalaItems', rows:50 },
		  	'dataType': 'jsonp',
			'jsonp': 'json.wrf'
		});
	}
	
 }	// End closure

item.prototype.FormatMandalaItems=function(data, sortBy)						// SHOW MANDALA ITEMS
{
	var i,r,o;
if (data) trace(data)
	LoadingIcon(false);																// Hide loading icon

	if (data) {																		// If not just sorting
		this.data=[];																	// New results store 
		for (i=0;i<data.response.docs.length;++i) {									// For each doc returned
			r=data.response.docs[i];												// Point at it
			o={ title:"No title", desc:""};											// Create obj												
			o.date=r.timestamp.substr(5,2)+"/"+r.timestamp.substr(8,2)+"/"+r.timestamp.substr(0,4);	// Munge date
			if (r.caption)															// If a caption defined
				o.title=r.caption;													// Use it
			o.id=r.id;																// Save id
			o.thumb=r.url_thumb;													// Save thumb
			o.ajax=r.url_ajax;														// Save ajax
			o.json=r.url_json;														// Save json
			o.html=r.url_html;														// Save html
			o.embed=r.url_embed;													// Add embed 
			o.kmap=r.kmapid;														// Save kmap array
			this.data.push(o);														// Add result to array
			}
		}
	else if (this.data) {															// Just sorting and some data
		var order=1;																// Assume ascending
		if (this.data[0][sortBy] < this.data[this.data.length-1][sortBy])			// Ascending already
			order=-1;																// Make it descending
		this.data.sort(function(a,b) { 												// Reshuffle chairs on Titanic
				if (a[sortBy] < b[sortBy])    	return -1*order;
				else if (a[sortBy] > b[sortBy])	return 1*order;
				else 			   				return 0;
				});					
		}
	var trsty=" style='height:20px;cursor:pointer' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' ";
	trsty+="onMouseOut='this.style.backgroundColor=\"#f8f8f8\"' onclick='itemObj.AddMandalaFile(this.id.substr(6))'";

	var str="<table style='width:100%;text-align:left'>";								// Header row
	str+="<tr style='font-weight:bold'><td id='mdh-date'>Date</td><td id='mdh-id'>&nbsp;ID&nbsp;</td><td id='mdh-title'>Title</td><td>&nbsp;View?</td></tr>";
	str+="<tr><td colspan='4'><hr></td></tr>";
	
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<tr id='mdres-"+i+"'"+trsty+"><td>"+o.date;							// Add start and date
		str+="</td><td>&nbsp;"+o.id+"&nbsp;"										// Add id
		str+="</td><td>"+ShortenString(o.title,60)+"<td>";							// Add title
		if (o.html) 																// If a vlew 																																			
			str+="&nbsp;<a target='_blank' href='"+o.html+"'>View</a><br>";			// Add anchor
		str+="</td></tr>";															// Close line	
		}
	str+="</table>";																// Close table
	$("#mdAssets").html(str);	
	
	$('[id^="mdh-"]').off();														// Remove old handlers

	$('[id^="mdh-"]').on("click",function(e) {										// ON CLICK ON HEADER
		var field=$(this).prop("id").substr(4);										// Isolate field
		itemObj.FormatMandalaItems(null,field);										// Sort by field
		});
}

item.prototype.AddMandalaFile=function(num)										// ADD MANDALA ITEM
{
	var r=this.data[num];															// Point at result
	var o={ type:"Mandala" };														// Holds new item
    if (r.ajax)																		// If an embed code
    	o.src=r.ajax;																// Use ajax
    else if (r.html)																// If html
    	o.src=r.html;																// Use it
  	o.title=r.title;																// Set title
   	if (r.desc)																		// If desc
    	o.desc=r.desc;																// Use it
	o.id=MakeUniqueId();															// Create new id
	sf.items.push(o);																// Add item
	if (r.thumb && r.thumb.match(/\.png|.gif|\.jpg|.jpeg|thumb/i))					// If valid a thumbnail 
		o.thumb=r.thumb;															// Use it
	curItem=sf.items.length-1;														// Point to this one
	this.UpdatePage();																// Update page
	$("#alertBoxDiv").remove();														// Remove dialog
	LoadingIcon(false);																// Hide loading icon
	this.data=null;																	// Release data
}

//////	JSON CALLBACKS
	
	function loadMandala1234(solrData)
	{
		trace(solrData)
		itemObj.FormatMandalaItems(solrData);
	}