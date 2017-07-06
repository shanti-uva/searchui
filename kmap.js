
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SOLR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var solrObj=null;																	// Points at Solr object

function Solr()																	// CONSTRUCTOR
{
	this.filter="";																	// No filter
	this.user="";																	// No user
	this.type="Picture";															// Start with pictures
	this.view="Rows";																// Start with rows
	this.data=null;																	// Folds Solr search results
	solrObj=this;																	// Save pointer
}

Solr.prototype.ImportSolrDialog=function()										// SOLR IMPORTER DIALOG
{
	var callback=null;
	var _this=this;																	// Save context
	var collections=["Audio-Video","Picture","Sources","Texts","Visuals"];			// Supported collections
	$("#dialogDiv").remove();														// Remove any old ones
	$("body").append("<div class='unselectable' id='dialogDiv'></div>");			// Add to body													
	str="<p><img src='";															// Image start
	str+="img/shantilogo32.png";													// Logo
	str+="' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>Get Item from Mandala</b></span><p>";
	str+="<p style='text-align:right'>Collection: "+MakeSelect("mdCollect",false,collections,this.type);
	str+="&nbsp;&nbsp;filter by: <input class='ks-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:100px;height:17px;vertical-align:0px'></p>";
	str+="<div id='mdAssets' style='width:100%px;height:300px;overflow-y:auto;background-color:#f8f8f8;padding:8px;border:1px solid #999;border-radius:6px'>";		// Scrollable container
	str+="</div>";
	str+="<br>View as: "+MakeSelect("mdView",false,["Grid","Rows"],this.view);
	str+="&nbsp;&nbspShow only from user: <input class='ks-is' id='mdUser' type='text' value='"+this.user+"' style='width:50px;height:17px;vertical-align:0px'>";
	str+="<div style='float:right;display:inline-block'><div id='dialogOK' class='ks-bs'>OK</div>&nbsp;&nbsp;";
	str+="<div id='dialogCancel' class='ks-bs'>Cancel</div></div>";
	$("#dialogDiv").append(str+"</div>");	
	$("#dialogDiv").dialog({ width:900 } );	
	$(".ui-dialog-titlebar").hide();
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
	$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
	$(".ui-button").css({"border-radius":"30px","outline":"none"});

	$("#dialogOK").on("click", function() {											// ON OK BUT
				if (callback)	callback();											// If callback defined
				$("#dialogDiv").animate({ opacity:0},200, function() {		
					$("#dialogDiv").remove();  
					});
				});

	$("#dialogCancel").on("click", function() {										// ON CANCEL BUT
				$("#dialogBoxDiv").remove();										// Remove 
				$("#dialogDiv").animate({ opacity:0},200, function() {		
					$("#dialogDiv").remove();  
					});
				Sound("delete");										// Delete sound
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
 
 	function LoadCollection(coll)												// LOAD COLLECTION FROM SOLR
	{
		var str;
		var maxDocs=200;
		LoadingIcon(true,64);														// Show loading icon
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
   				 "&fl=*&wt=json&json.wrf=?&rows="+maxDocs+"&limit="+maxDocs;

		$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done(function(data) {
			   		_this.FormatSolrItems(data);
			   		});
	}

 }																					// End closure

Solr.prototype.FormatSolrItems=function(data, sortBy)							// SHOW SOLR ITEMS
{
	var i,r,o;
	var _this=this;																	// Save context
	if (data) trace(data)
	LoadingIcon(false);																// Hide loading icon

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
			o.summart=r.summary;													// Add summary
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
	if (this.view == "Rows")														// If showing rows
		this.DrawAsRows();															// Draw row view
	else																			// Grid view
		this.DrawAsGrid();															// Draw
}

Solr.prototype.DrawAsRows=function()											// SHOW RESULTS AS ROWS
{
	var _this=this;																	// Save context
	var trsty=" style='height:20px;cursor:pointer' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' ";
	trsty+="onMouseOut='this.style.backgroundColor=\"#f8f8f8\"' onclick='solrObj.AddMandalaFile(this.id.substr(6))'";
	var str="<table style='width:100%;text-align:left'>";								// Header row
	str+="<tr style='font-weight:bold'><td id='mdh-date'>Date</td><td id='mdh-id'>&nbsp;ID&nbsp;</td><td style=width:100%' id='mdh-title'>Title</td><td>&nbsp;View?</td></tr>";
	str+="<tr><td colspan='4'><hr></td></tr>";
	
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<tr id='mdres-"+i+"'"+trsty+"><td>"+o.date;							// Add start and date
		str+="</td><td>&nbsp;"+o.id+"&nbsp;"										// Add id
		str+="</td><td>"+ShortenString(o.title,60)+"<td>";							// Add title
		if (o.html) 																// If a vlew 																																			
			str+="&nbsp;<a target='_blank' href='"+o.html+"'>Page</a>";				// Add anchor
		if (o.ajax) {																// If a ajax
			str+="&nbsp;&nbsp;"														// Add divider														 																																			
			str+="<a target='_blank' href='"+o.ajax+"'>Item</a>";					// Add anchor
			}
		str+="</td></tr>";															// Close line	
		}
	str+="</table>";																// Close table
	$("#mdAssets").html(str);	
	
	$('[id^="mdh-"]').off();														// Remove old handlers

	$('[id^="mdh-"]').on("click",function(e) {										// ON CLICK ON HEADER
		var field=$(this).prop("id").substr(4);										// Isolate field
		_this.FormatSolrItems(null,field);											// Sort by field
		});
}

Solr.prototype.DrawAsGrid=function()												// SHOW RESULTS AS GRID
{	
}

Solr.prototype.AddMandalaFile=function(num)										// ADD SOLR ITEM
{
	trace(this.data[num])
}