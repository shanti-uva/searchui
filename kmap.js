////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SOLR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var solrObj=null;																	// Points at Solr object

function Solr()																	// CONSTRUCTOR
{
	solrObj=this;																	// Save pointer to obj
	this.rawData=null;																// Holds raw Solr search results
	this.data=null;																	// Folds formatted search results
	this.collection=[];																// Holds collection of items
	this.filter="";																	// No filter
	this.user="";																	// No user
	this.type="Picture";															// Start with pictures
	this.view="List";																// Start with List
	this.previewMode="";															// Mode of preview ('Zoom', 'Preview', '')
	this.previewX=0;	this.previewY=0;											// Position of preview pane
	this.curItem=-1;																// Currently selected item
}

Solr.prototype.ImportSolrDialog=function(maxDocs, callback)						// SOLR IMPORTER DIALOG
{
	var _this=this;																	// Save context
	this.maxDocs=maxDocs;															// Maximum docs to load
	var collections=["Audio-Video","Picture","Sources","Texts","Visuals"];			// Supported collections
	$("#dialogDiv").remove();														// Remove any old ones
	$("body").append("<div class='unselectable' id='dialogDiv'></div>");			// Add to body													
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'>&nbsp;&nbsp;"; // Logo
	str+="<span class='ks-dialogLabel'>Get Item from Mandala</span><p>";			// Dialog label
	str+="<p style='text-align:right'>Collection: "+MakeSelect("mdCollect",false,collections,this.type);
	str+="&nbsp;&nbsp;filter by: <input class='ks-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:100px;height:17px;vertical-align:0px'></p>";
	str+="<div id='mdAssets' class='ks-dialogResults'></div>";						// Scrollable container
	str+="<br>View as: "+MakeSelect("mdView",false,["Grid","List"],this.view);
	str+="&nbsp;&nbspShow only from user: <input class='ks-is' id='mdUser' type='text' value='"+this.user+"' style='width:50px;height:17px;vertical-align:0px'>";
	str+="<div style='float:right;display:inline-block'><div id='dialogOK' style='display:none' class='ks-greenbs'>Save item</div>&nbsp;&nbsp;";
	str+="<div id='dialogCancel' class='ks-bs'>Cancel</div></div>";
	$("#dialogDiv").append(str+"</div>");	
	$("#dialogDiv").dialog({ width:900 } );	
	$(".ui-dialog-titlebar").hide();
	$("#dialogOK").on("click", function() {											// ON OK BUT
				$("#dialogDiv").animate({ opacity:0},200, function() {				// Fade out
					$("#previewDiv").remove();										// Remove preview
					if (callback)	callback(_this.rawData.response.docs[_this.curItem]); // If callback defined, run it and return raw Solr data
					_this.previewMode="";											// No mode
					});
				});

	$("#dialogCancel").on("click", function() {										// ON CANCEL BUT
				$("#dialogBoxDiv").remove();										// Remove 
				$("#dialogDiv").animate({ opacity:0},200, function() {				// Fade out		
					$("#dialogDiv").remove();  										// Remove dialog
					$("#previewDiv").remove();										// Remove preview
					_this.previewMode="";											// No mode
					});
				Sound("delete");													// Delete sound
			});

	LoadCollection($("#mdCollect").val());											// Load 1st collection
 	
 	$("#mdCollect").on("change", function() {										// ON CHANGE COLLECTION
			_this.type=$(this).val();												// Save for later											
		 	LoadCollection(_this.type);												// Load it
			});
	
	$("#mdFilter").on("change", function() {										// ON CHANGE FILTER
			_this.filter=$(this).val();												// Save for later											
		 	LoadCollection(_this.type);												// Load it
			});

	$("#mdUser").on("change", function() {											// ON CHANGE USER
			_this.user=$(this).val();												// Save for later											
		 	LoadCollection(_this.type);												// Load it
			});
  
  	$("#mdView").on("change", function() {											// ON CHANGE VIEW
			_this.view=$(this).val();												// Save for later											
		 	LoadCollection(_this.type);												// Load it
			});
 
 	function LoadCollection(coll) {												// LOAD COLLECTION FROM SOLR
		var str;
		_this.LoadingIcon(true,64);													// Show loading icon
		var search="asset_type%3A%22"+coll.toLowerCase()+"%22";						// Add asset type						
		if (_this.filter) {															// If a filter spec'd
			str="%22*"+_this.filter.toLowerCase()+"*%22";							// Search term
			search+=" AND (title%3A"+str;											// Look at title
			search+=" OR collection_title%3A"+str;									// Or collection title
			search+=" OR summary%3A"+str+")";										// Or summary
			}
		if (_this.user) 															// If a user spec'd
			search+=" AND node_user%3A*"+_this.user+"*";							// Look at user
		var url="https://ss251856-us-east-1-aws.measuredsearch.com/solr/kmassets_dev/select?"+"q="+search + 
   				 "&fl=*&wt=json&json.wrf=?&rows="+_this.maxDocs+"&limit="+_this.maxDocs;

		$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done(function(data) {
			   		_this.FormatSolrItems(data);
			   		});
		}

}																					// End closure

Solr.prototype.LoadingIcon=function(mode, size, container)						// SHOW/HIDE LOADING ICON		
{
	container=container ? "#"+containern: "body";									// If no container spec'd, use body
	if (!mode) {																	// If hiding
		$("#sf-loadingIcon").remove();												// Remove it
		return;																		// Quit
		}
	var str="<img src='img/loading.gif' width='"+size+"' ";							// Img
	str+="id='sf-loadingIcon' style='position:absolute;top:calc(50% - "+size/2+"px);left:calc(50% - "+size/2+"px);z-index:5000'>";	
	$(container).append(str);														// Add icon to container
}

Solr.prototype.FormatSolrItems=function(data, sortBy)							// SHOW SOLR ITEMS
{
	var i,r,o;
	var _this=this;																	// Save context
	this.LoadingIcon(false);														// Hide loading icon
	this.rawData=data;																// Save raw data
	if (data) {																		// If not just sorting
		this.data=[];																// New results store 
		for (i=0;i<data.response.docs.length;++i) {									// For each doc returned
			r=data.response.docs[i];												// Point at it
			o={ title:"No title", desc:""};											// Create obj												
			o.date=r.timestamp.substr(5,2)+"/"+r.timestamp.substr(8,2)+"/"+r.timestamp.substr(0,4);	// Munge date
			if (r.title)															// If a title
				o.title=r.title[0];													// Extract it
			else if (r.caption)														// If a caption defined but no title
				o.title=r.caption;													// Use it
			o.id=r.id;																// Save id
			o.thumb=r.url_thumb;													// Save thumb
			if (o.thumb)	o.thumb=o.thumb.replace(/dev\-/,"");					// Remove 'dev-' prefix, if there
			o.ajax=r.url_ajax;														// Save ajax
			if (o.ajax)		o.ajax=o.ajax.replace(/dev\-/,"");						// Remove dev
			o.json=r.url_json;														// Save json
			if (o.json)		o.json=o.json.replace(/dev\-/,"");						// Remove dev
			o.html=r.url_html;														// Save html
			if (o.html)		o.html=o.html.replace(/dev\-/,"");						// Remove dev
			o.embed=r.url_embed;													// Add embed 
			if (o.embed) 	o.embed=o.embed.replace(/dev\-/,"");					// Remove dev
			if ((r.asset_type == "picture") || (r.asset_type == "image")) {			// An image
				if (r.url_huge)			o.ajax=r.url_huge.replace(/dev\-/,"");		// If huge, set url and remove 'dev-' prefix
				else if (r.url_large)	o.ajax=r.url_large.replace(/dev\-/,"");		// Else use large
				else if (r.url_normal)	o.ajax=r.url_normal.replace(/dev\-/,"");	// Else use normal
				else 					o.ajax=o.thumb;								// Else use thumb
				}
			o.kmap=r.kmapid;														// Save kmap array
			o.user=r.node_user;														// Add user
			o.summary=r.summary;													// Add summary
			o.type=r.asset_type;													// Add type
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
	if (this.view == "List")														// If showing List
		this.DrawAsList();															// Draw row view
	else																			// Grid view
		this.DrawAsGrid();															// Draw
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SHOW RESULTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Solr.prototype.DrawAsList=function()											// SHOW RESULTS AS LIST
{
	var i;
	var _this=this;																	// Save context
	var trsty=" class='ks-listItem'  onclick='solrObj.Preview(this.id.substr(6))'";	// Row style
	var str="<table style='width:100%;text-align:left'>";							// Header row
	str+="<tr style='font-weight:bold;cursor:ns-resize'><td id='mdh-date'>Date</td><td id='mdh-id'>&nbsp;ID&nbsp;</td><td style=width:100%' id='mdh-title'>Title</td><td  id='mdh-user'>&nbsp;User</td></tr>";
	str+="<tr><td colspan='4'><hr></td></tr>";
	
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<tr id='mdres-"+i+"'"+trsty+"><td>"+o.date;							// Add start and date
		str+="</td><td>&nbsp;"+o.id+"&nbsp;"										// Add id
		str+="</td><td>"+ShortenString(o.title,80)+"<td>";							// Add title
		if (o.user)																	// If a user spec'd
			str+=ShortenString(o.user,60);											// Add user		
		str+="</td></tr>";															// Close line	
		}
	str+="</table>";																// Close table
	
	$("#mdAssets").html(str);														// Add results
	
	$('[id^="mdh-"]').off();														// Remove old handlers

	$('[id^="mdh-"]').on("click",function(e) {										// ON CLICK ON HEADER
		var field=$(this).prop("id").substr(4);										// Isolate field
		_this.FormatSolrItems(null,field);											// Sort by field
		});
}

Solr.prototype.DrawAsGrid=function()											// SHOW RESULTS AS GRID
{	
	var i,str="";
	var _this=this;																	// Save context
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<div class='ks-gridItem' id='mdres-"+i+"'>";							// Div start
		if (o.thumb)																// If a thumbnail defined
			str+="<img src='"+o.thumb+"' width='100%' height='100'><br>";			// Add it
		str+="<span style='color:#27ae60'>"+(i+1)+". </span>";						// Add pic num
		str+=ShortenString(o.title,60);												// Add title
		str+="&nbsp;("+o.id+")&nbsp;"												// Add id
		str+="</div>";																// Close div	
		}
	$("#mdAssets").html(str);														// Add results to panel
	$('[id^="mdres-"]').off();														// Remove old handlers
	$('[id^="mdres-"]').on("click",function(e) {									// ON CLICK ON ITEM
		var id=$(this).prop("id").substr(6);										// Isolate id
		_this.Preview(id);															// Preview
		});
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PREVIEW
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Solr.prototype.Preview=function(num)												// PREVIEW RESULT
{
	var _this=this;																		// Save context
	var o=this.data[num];																// Point at item
	this.curItem=num;																	// Current item
	this.previewMode="Preview";															// Preview mode
	$("#previewDiv").remove();															// Remove any old ones
	$("#zoomerDiv").remove();															// Remove any old ones
	$("#dialogOK").css("display","inline-block");										// Show add button

	for (i=0;i<this.data.length;++i)													// For each result
		$("#mdres-"+i).css("color","#000");												// Make default color
	$("#mdres-"+num).css("color","#27ae60");											// Highlight

	var h=345;																			// Get dialog height												
	var w=$("#mdAssets").width()/2;														// Get dialog width												
	var maxHgt=window.innerHeight-100;													// Max height
	var maxWid=window.innerWidth-200;													// Max width
	var x=this.previewX, y=this.previewY;												// Get saved position
	if ((x == 0) && (y == 0)) {															// Position first time
		x=$("#mdAssets").offset().left+$("#mdAssets").width()-w/2;						// Left
		y=$("#mdAssets").offset().top+4;												// Top
		}	
	var str="<div class='unselectable ks-prevDiv' id='previewDiv' style='";				// Div head
	str+="height:"+h+"px;width:"+w+"px;";												// Size
	str+="left:"+x+"px;top:"+y+"px'>";													// Position
	str+="<p class='ks-prevId'><img src='img/shantilogo32.png' style='vertical-align:-6px;width:24px'>&nbsp;&nbsp;"; // Logo
	str+="Mandala item "+o.id;															// Show id
	str+="<img src='img/closedot.gif' id='lbxBoxExit' class='ks-dialogDoneBut'><br></p>"; // Done button
	if (o.title)																		// If a title
		str+="<p class='ks-dialogTitle'>"+o.title+"</p>";								// Show title 
	if (o.ajax && o.ajax.match(/\.png|.gif|\.jpg|.jpeg/i)) 								// An image
		str+="<div id='previewImg' style='width:"+w+"px;overflow-y:auto'><img id='myImg' style='width:100%' src='"+o.ajax+"'></div>";
	else
		str+="<iframe frameborder='0' allowfullscreen height='"+h+"' width='100%' style='0,border:1px solid #666;width:100%' src='"+o.ajax+"'/>";
	str+="<div style='padding:8px;padding-top:0px;'>";
	if (o.type == "picture") str+="<br><div  class='ks-greenbs' id='zoomImg'>Zoomable image</div><br>"
	if (o.summary)
		str+="<p class='ks-presummary>"+o.summary+"</p>";
	if (o.user)	str+="<br><b>User: </b>"+o.user;										// Add user
	if (o.date)	str+="<br><b>Date: </b>"+o.date;										// Add date
	if (o.html)	str+="<p><a target='_blank' href='"+o.html+"'><b>View webpage</b></a></p>"	// Add link to page
	$("body").append(str+"</div></div>");												// Add content

	$("#previewDiv").draggable( { stop:function(ev,ui) {								// Make preciew pane draggable
			if (_this.previewMode == "Preview") {										// If moving preview window
				_this.previewX=ui.offset.left;											// Save preview pane X on drag
				_this.previewY=ui.offset.top;											// Save Y
				}
		}});
															
	$("#lbxBoxExit").on("click",function() {											// CLICK ON DONE BUT
			Sound("click");																// Click
			$("#previewDiv").remove();													// Remove it
			_this.previewMode="";														// No mode
			$("#dialogOK").css("display","none");										// Hide add button
			});
	
	$("#zoomImg").on("click",function() {												// ZOOM IMAGE
		var rh=$("#myImg").prop("naturalHeight");										// Real height
		var rw=$("#myImg").prop("naturalWidth");										// Real width
		var asp=rh/rw;																	// Aspect
		var w=Math.max(Math.min(rw,maxWid),maxWid);										// Adjust width
		_this.previewMode="Zoom";														// Zoom mode

		if (w*asp > maxHgt) {															// If too tall
			if (w*.75*asp < maxHgt)			w*=.75;										// Adjust
			else if (w*.5*asp < maxHgt)		w*=.5;										// In
			else if (w*.33*asp < maxHgt)	w*=.33;										// Steps						
			else 							w*=.25;
			}
		$("#previewDiv").width(w);														// Set width

		var str="<p class='ks-prevId'><img src='img/shantilogo32.png' style='vertical-align:-6px;width:24px'>&nbsp;&nbsp;"; // Logo
		str+="Pan and Zoom on Mandala item "+o.id;										// Show id
		str+="<img src='img/closedot.gif' id='lbxBoxExit' class='ks-dialogDoneBut'><br></p>"; // Done button
		$("#previewDiv").html(str);

		$("#lbxBoxExit").on("click",function() {										// CLICK ON DONE BUT
				Sound("click");															// Click
				$("#dialogOK").css("display","none");									// Hide add button
				$("#previewDiv").remove();												// Remove it
				_this.previewMode="";													// No mode
				});
		
		var x=(window.innerWidth-$("#previewDiv").width())/2;							// Center x
		$("#previewDiv").css({left:x+"px",top:"25px"});									// Center y
		new Zoomer(o.ajax,2,4);                                                     	// Alloc zoomer
		});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COLLECTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Solr.prototype.AddToCollection=function(item)										// ADD ITEM TO COLLECTION
{
}

Solr.prototype.RemoveFromCollection=function(num)									// REMOVE ITEM TO COLLECTION
{
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function MakeSelect(id, multi, items, sel, extra, values)				// CREATE HTML SELECT
	{
		var	str="<select class='ks-is' id='"+id+"'";							// Header
		str+="style='width:auto'";
		if (multi)																// Multi select
			str+="multiple='multiple' size='"+multi+"'";						// Add flag
		if (extra)																// If extra param
			str+=extra;															// Add them
		str+=">";																// End header
		for (i=0;i<items.length;++i) {											// For each option
			str+="<option";														// Add tag
			if (sel == items[i])												// If selected
				str+=" selected='selected'"										// Add tag
			if (values && values[i])											// If has a value
				str+=" value='"+values[i]+"'";									// Add it
			str+=">"+items[i]+"</option>";										// End option
			}	
		return str+"</select>";													// End select				
	}

	function trace(msg, p1, p2, p3, p4)										// CONSOLE 
	{
		if (p4 != undefined)
			console.log(msg,p1,p2,p3,p4);
		else if (p3 != undefined)
			console.log(msg,p1,p2,p3);
		else if (p2 != undefined)
			console.log(msg,p1,p2);
		else if (p1 != undefined)
			console.log(msg,p1);
		else
			console.log(msg);
	}

	function ShortenString(str, len)									// SHORTEN A STRING TO LENGTH
	{
		if (str && str.length > len)										// Too long
			str=str.substr(0,(len-3)/2)+"..."+str.slice((len-3)/-2);		// Shorten	
		return str;															// Return string
	}

	function Sound(sound, mute)												// PLAY SOUND
	{
		var snd=new Audio();													// Init audio object
		if (!snd.canPlayType("audio/mpeg") || (snd.canPlayType("audio/mpeg") == "maybe")) 
			snd=new Audio("img/"+sound+".ogg");									// Use ogg
		else	
			snd=new Audio("img/"+sound+".mp3");									// Use mp3
		if (!mute)	{															// If not initing or muting	
			snd.volume=50/100;													// Set volume
			snd.play();															// Play it
			}
		}
