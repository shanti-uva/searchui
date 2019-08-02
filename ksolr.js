////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SOLR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var ksSolrObj=null;																	// Points at Solr object

function ksSolr()																// CONSTRUCTOR
{
	ksSolrObj=this;																	// Save pointer to obj
	this.rawData=null;																// Holds raw Solr search results
	this.data=null;																	// Folds formatted search results
	this.collection=[];																// Holds collection of items
	this.filter="";																	// No filter
	this.filterCollect="";															// No collection filter
	this.filterPlace="";															// No place filter
	this.filterSubject="";															// No subject filter
	this.user="";																	// No user
	this.type="Images";																// Start with Images
	this.view="Grid";																// Start with grid
	this.previewMode="";															// Mode of preview ('Zoom', 'Preview', '')
	this.curItem=-1;																// Currently selected item
	this.solrUrl="https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmassets/select";		// SOLR production yrl
	this.pageSize=100;																// Size of page
	this.docsFound=0;																// Total number of docs found
	this.startDoc=0;																// Docs start
}

ksSolr.prototype.ImportSolrDialog=function(maxDocs, callback, mode)				// SOLR IMPORTER DIALOG
{
	var i;
	var _this=this;																	// Save context
	this.maxDocs=_this.pageSize;													// Maximum docs to load
	var collections=["Audio-Video","Images","Sources","Texts","Visuals"];			// Supported collections
	$("#dialogDiv").remove();														// Remove any old ones
	$("body").append("<div class='unselectable ks-dialog' id='dialogDiv'</div>");	// Add to body													
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'>&nbsp;&nbsp;"; // Logo
	str+="<span class='ks-dialogLabel'>Get Item from Mandala</span>";				// Dialog label
	str+='<p class="result-summary">Showing <span class="rangediv"><b><span class="start">0</span> - <span class="end">0</span></b> of </span>';
	str+="<span id='numItemsFound'>No</span> items</p>";        				// Number of items;
	str+="<p style='text-align:right'>Type&nbsp;&nbsp;"+this.MakeSelect("mdType",false,collections,this.type);
	str+="&nbsp;&nbsp;filter by&nbsp;&nbsp;<input class='ks-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:100px;height:17px;vertical-align:0px'>";
	str+="&nbsp;&nbsp; Places&nbsp;&nbsp;<input class='ks-is' id='mdFilterPlace' type='text' value='"+this.filterPlace+"' style='width:60px;height:17px;vertical-align:0px'>";  
	str+="&nbsp;&nbsp; Subjects&nbsp;&nbsp;<input class='ks-is' id='mdFilterSubject' type='text' value='"+this.filterSubject+"' style='width:60px;height:17px;vertical-align:0px'></p>"; 
	str+="<div id='mdAssets' class='ks-dialogResults'></div>";						// Scrollable container
	str+='<br><div class="dialogctrl"><div id="prev" class="ks-bs">Previous</div><div id="next" class="ks-bs">Next</div></div>';
	str+="View as&nbsp;&nbsp;"+this.MakeSelect("mdView",false,["Grid","List"],this.view);
	str+="&nbsp;&nbsp;Show only from user&nbsp;&nbsp;<input class='ks-is' id='mdUser' type='text' value='"+this.user+"' style='width:50px;height:17px;vertical-align:0px'>";
	str+="&nbsp;&nbsp;in collection&nbsp;&nbsp;<input class='ks-is' id='mdFilterCollect' type='text' value='"+this.filterCollect+"' style='width:100px;height:17px;vertical-align:0px'>";
	str+="<div style='float:right;display:inline-block'><div id='dialogOK' style='display:none' class='ks-greenbs'>Add item</div>&nbsp;&nbsp;";
	str+="<div id='dialogCancel' class='ks-bs'>Cancel</div></div>";
	$("#dialogDiv").append(str+"</div>");	
	$("#dialogOK").on("click", function() {											// ON OK BUT
					$("#previewDiv").remove();										// Remove preview
					$("[id^=kmTreeDiv]").remove();									// Remove tree 
					var str=JSON.stringify(_this.rawData.response.docs[_this.curItem]);
					window.parent.postMessage("kSolrMsg="+str,"*");					// Send message to parent wind		
					if (callback)	callback(_this.rawData.response.docs[_this.curItem]); // If callback defined, run it and return raw Solr data
					_this.previewMode="";											// No mode
					for (i=0;i<_this.data.length;++i)								// For each result
						$("#mdres-"+i).css({ "color":"#000", "font-weight":"normal" });	// Make default
					$("#dialogOK").css("display","none");							// Hide add button
					});

	$("#dialogCancel").on("click", function() {										// ON CANCEL BUT
					$("#previewDiv").remove();										// Remove preview
					$("[id^=kmTreeDiv]").remove();									// Remove tree 
					if (_this.previewMode == 'Zoom') {								// If in zoomer
						_this.Preview(_this.curItem);								// Back to preview
						return;														// Quit
						}
					_this.previewMode="";											// No mode
					for (i=0;i<_this.data.length;++i)								// For each result
						$("#mdres-"+i).css({ "color":"#000", "font-weight":"normal" });	// Make default
					$("#dialogOK").css("display","none");							// Hide add button
				});


	$(".dialogctrl #prev").on("click", function() { 
        if (_this.startDoc >= _this.pageSize) {
            _this.startDoc-=_this.pageSize;
            $('.result-summary .start').text(_this.startDoc+1);
            $('.result-summary .end').text(_this.startDoc+_this.pageSize);
            LoadCollection(); 
    	    }
    	});
 
	$(".dialogctrl #next").on("click", function() { 
		if (_this.startDoc+_this.pageSize > _this.docsFound) return;
		_this.startDoc+=_this.pageSize;
        $('.result-summary .start').text(_this.startDoc+1);
        $('.result-summary .end').text(_this.startDoc+_this.pageSize);
		LoadCollection(); 
    	});

	LoadCollection();																// Load 1st collection
 	
 	$("#mdType").on("change", function() {											// ON CHANGE COLLECTION
		_this.startDoc=0;         													// Start fresh  
		_this.type=$(this).val();													// Save for later											
		LoadCollection();															// Load it
		});
	$("#mdFilter").on("change", function() {										// ON CHANGE FILTER
		_this.startDoc=0;         													// Start fresh  
		_this.filter=$(this).val();													// Save for later											
		 LoadCollection();															// Load it
		});
	$("#mdFilterCollect").on("change", function() {									// ON CHANGE FILTER COLLECT
		_this.startDoc=0;         													// Start fresh  
		_this.filterCollect=$(this).val();											// Save for later											
		 LoadCollection();															// Load it
		});
	$("#mdUser").on("change", function() {											// ON CHANGE USER
		_this.startDoc=0;         													// Start fresh  
		_this.user=$(this).val();													// Save for later											
		 LoadCollection();															// Load it
		});
   	$("#mdView").on("change", function() {											// ON CHANGE VIEW
		_this.startDoc=0;         													// Start fresh  
		_this.view=$(this).val();													// Save for later											
	 	LoadCollection();															// Load it
		});
	$("#mdFilterPlace").on("change", function() {									// ON CHANGE PLACE FILTER
		_this.startDoc=0;         													// Start fresh  
		_this.placeFilter=$(this).val();											// Save for later											
		 LoadCollection();															// Load it
		});
	$("#mdFilterPlace").on("click", function() {									// ON CLICK PLACE FILTER
		_this.startDoc=0;         													// Start fresh  
		var x=$("#mdFilterPlace").offset().left;
		var y=$("#mdFilterPlace").offset().top+26;
		_this.MakeTree(x, y, "P", LoadCollection);									// Show place tree				
		});
	$("#mdFilterSubject").on("change", function() {									// ON CHANGE PLACE FILTER
		_this.startDoc=0;         													// Start fresh  
		_this.subjectFilter=$(this).val();											// Save for later											
		LoadCollection();															// Load it
		});
	$("#mdFilterSubject").on("click", function() {									// ON CLICK PLACE FILTER
		_this.startDoc=0;         													// Start fresh  
		var x=$("#mdFilterSubject").offset().left;
		var y=$("#mdFilterSubject").offset().top+26;
		_this.MakeTree(x, y, "S", LoadCollection);								// Show subject tree 
		});
			
	function LoadCollection() {													// LOAD COLLECTION FROM SOLR
		var str;
		_this.LoadingIcon(true,64);													// Show loading icon
		var type=_this.type;														// Get type to show
		var search="asset_type%3A%22"+type.toLowerCase()+"%22";						// Add asset type						
		if (_this.filter) {															// If a filter spec'd
			str="%22*"+_this.filter.toLowerCase()+"*%22";							// Search term
			search+=" AND (title%3A"+str;											// Look at title
			search+=" OR caption%3A"+str;											// Or caption 
			search+=" OR summary%3A"+str+")";										// Or summary
			}
		if (_this.filterCollect) {													// If a collection filter spec'd
			str="%22*"+_this.filterCollect.toLowerCase()+"*%22";					// Search term
			search+=" AND collection_title%3A"+str;									// And collection title
			}
		if (_this.placeFilter)														// If a place filter spec'd 
			search+=" AND kmapid%3A%28%22"+_this.placeFilter.toLowerCase()+"%22%29";// Place search term 
		if (_this.subjectFilter) 													// If subject filter spec'd 
			search+=" AND kmapid%3A%28%22"+_this.subjectFilter.toLowerCase()+"%22%29";	// Subject search term
		if (_this.user) 															// If a user spec'd
			search+=" AND node_user%3A*"+_this.user+"*";							// Look at user
		var url=_this.solrUrl+"/?"+"q="+search+"&fl=*&wt=json&json.wrf=?&start="+_this.startDoc+"&rows="+_this.pageSize;

		$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done(function(data) {
			   		_this.FormatSolrItems(data);
			   		});
		}
}																					// End closure

ksSolr.prototype.FormatSolrItems=function(data, sortBy)							// SHOW SOLR ITEMS
{
	var i,r,o;
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
			o.ajax=r.url_ajax;														// Save ajax
			o.json=r.url_json;														// Save json
			o.html=r.url_html;														// Save html
			o.embed=r.url_embed;													// Add embed 
			if (r.asset_type == "images") {											// An image
				if (r.url_huge)			o.ajax=r.url_huge;							// If huge, set url 
				else if (r.url_large)	o.ajax=r.url_large;							// Else use large
				else if (r.url_normal)	o.ajax=r.url_normal;						// Else use normal
				else 					o.ajax=o.thumb;								// Else use thumb
				}
			o.kmap=r.kmapid;														// Save kmap array
			o.user=r.node_user;														// Add user
			o.summary=r.summary;													// Add summary
			o.type=r.asset_type;													// Add type
			this.data.push(o);														// Add result to array
			}
		if (data.response.numFound == 0) 
				$('.result-summary .rangediv').hide();
			else{
				$('.result-summary .rangediv').show();
				$('.result-summary .start').text(this.startDoc+1);
				$('.result-summary .end').text(this.startDoc+data.response.docs.length);
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
	this.docsFound=data.response.numFound;											// Get number total of results
	$("#numItemsFound").text(this.docsFound);										// Show total
	if (this.view == "List")														// If showing List
		this.DrawAsList();															// Draw row view
	else																			// Grid view
		this.DrawAsGrid();															// Draw
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SHOW RESULTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ksSolr.prototype.DrawAsList=function()											// SHOW RESULTS AS LIST
{
	var i;
	var _this=this;																	// Save context
	var trsty=" class='ks-listItem'  onclick='ksSolrObj.Preview(this.id.substr(6))'";	// Row style
	var str="<table style='width:100%;text-align:left'>";							// Header row
	str+="<tr style='font-weight:bold;cursor:url(img/sortcur.gif),ns-resize'><td style=width:100%' id='mdh-title'>Title</td><td id='mdh-date'>Date</td><td id='mdh-id'>&nbsp;ID&nbsp;</td><td  id='mdh-user'>&nbsp;User</td></tr>";
	str+="<tr><td colspan='4'><hr></td></tr>";
	
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<tr id='mdres-"+i+"'"+trsty+"><td>"+this.ShortenString(o.title,80)+"</td>";	// Add title
		str+="<td>"+o.date;															// Add date
		str+="</td><td>&nbsp;"+o.id+"<td>"											// Add id
		if (o.user)																	// If a user spec'd
			str+=this.ShortenString(o.user,12);										// Add user		
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

ksSolr.prototype.DrawAsGrid=function()											// SHOW RESULTS AS GRID
{	
	var i,str="";
	var _this=this;																	// Save context
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<div class='ks-gridItem' id='mdres-"+i+"'>";							// Div start
		str+="<div class='ks-gridPic'>";											// Pic div start
		if (o.thumb)																// If a thumbnail defined
			str+="<img src='"+o.thumb+"' width='100%'>";							// Add it
		str+="</div><span style='color:#27ae60'>"+(i+1+_this.startDoc)+". </span>";	// Add pic num
		str+=this.ShortenString(o.title,70);										// Add title
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
// PREVIEW
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


ksSolr.prototype.Preview=function(num)												// PREVIEW RESULT
{
	var _this=this;																		// Save context
	var o=this.data[num];																// Point at item
	this.curItem=num;																	// Current item
	this.previewMode="Preview";															// Preview mode
	$("#previewDiv").remove();															// Remove any old ones
	$("#zoomerDiv").remove();															// Remove any old ones
	$("#dialogOK").css("display","inline-block");										// Show add button

	for (i=0;i<this.data.length;++i)													// For each result
		$("#mdres-"+i).css({ "color":"#000", "font-weight":"normal" });					// Make default
	$("#mdres-"+num).css({ "color":"#009900", "font-weight":"bold" });					// Highlight

	var h=368, w=244;																	// Get size												
	var maxHgt=window.innerHeight-100;													// Max height
	var maxWid=window.innerWidth-200;													// Max width
	var y=$("#mdAssets").offset().top;													// Top
	var x=$("#mdAssets").offset().left+900-w;											// Left
	
	var str="<div class='unselectable ks-prevDiv' id='previewDiv' style='";				// Div head
	str+="height:"+h+"px;width:"+w+"px;";												// Size
	str+="left:"+x+"px;top:"+y+"px'>";													// Position
	str+="<div class='ks-prevId'>Mandala item "+o.id+"</div>";							// Show id
	if (o.title)																		// If a title
		str+="<p class='ks-dialogTitle'>"+o.title+"</p>";								// Show title 
	if (o.ajax && o.ajax.match(/\.png|.gif|\.jpg|.jpeg/i)) 								// An image
		str+="<div id='previewImg' style='width:"+(w-8)+"px;overflow-y:auto;padding:12px;padding-top:0'><img id='myImg' style='width:100%' src='"+o.ajax+"'></div>";
	else
		str+="<iframe frameborder='0'style='width:100%;padding:12px;padding-top:0;height:210px' src='"+o.ajax+"'/>";
	str+="<div>";
	if (o.type == "images") str+="<div  class='ks-greenbs' id='zoomImg'>Zoomable image</div><br>"
	if (o.summary)	str+="<p>"+o.summary+"</p>";										// Add summary
	if (o.date)		str+="<br>"+o.date;													// Add date
	if (o.user)		str+=" by "+o.user;													// Add user
	if (o.html)		str+="<p><a target='_blank' href='"+o.html+"'><b>View webpage</b></a></p>"	// Add link to page
	$("body").append(str+"</div></div>");												// Add content

	$("#zoomImg").on("click",function() {												// ZOOM IMAGE
		_this.previewMode="Zoom";														// Zoom mode
		var rh=$("#myImg").prop("naturalHeight");										// Real height
		var rw=$("#myImg").prop("naturalWidth");										// Real width
		var asp=rh/rw;																	// Aspect
		var h=$("#dialogDiv").height()-24;												// Max height
		$("#previewDiv").height(h);														// Set height
		$("#previewDiv").width(h/asp);													// Set width
		$("#previewDiv").html("");
		var x=(window.innerWidth-$("#previewDiv").width())/2;							// Center x
		var y=$("#dialogDiv").offset().top+1;												// Top
		$("#previewDiv").css({left:x+"px",top:y+"px"});									// Position
		new Zoomer(o.ajax,2,4);                                                     	// Alloc zoomer
		});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TREE 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ksSolr.prototype.MakeTree=function(x, y, which, callback)  								// MAKE TREE
{
	var _this=this;
	var div="#kmTreeDiv"+which;															// Tree div
	if ($(div).css("display") == "block") {												// If showing
		$(div).css("display","none");													// Hide it
		return;																			// Quit
		}
	else																				// Not showing	
		$(div).css("display","block");													// Show it

	if (!$(div).length) {																// If doesn't exist
		var str="<div id='kmTreeDiv"+which+"' class='ks-tree'";				
		str+="style='left:"+x+"px;top:"+y+"px'><ul>";
		if (which == "P") {
			str+="<li class='parent'><a id='places-13738' data-path='13735/13738'>Africa</a>";
			str+="<li class='parent'><a id='places-13742' data-path='13735/13742'>Antarctica</a>";
			str+="<li class='parent'><a id='places-13740' data-path='13735/13740'>Asia</a>";
			str+="<li class='parent'><a id='places-13739' data-path='13735/13739'>Europe</a>";
			str+="<li class='parent'><a id='places-13736' data-path='13735/13736'>North America</a>";
			str+="<li class='parent'><a id='places-13741' data-path='13735/13741'>Oceania</a>";
			str+="<li class='parent'><a id='places-13737' data-path='13735/13737'>South America</a>";
			}
		else{
			str+="<li class='parent'><a id='subjects-8868' data-path='8868'>Cultural Landscapes</a>";
			str+="<li class='parent'><a id='subjects-6793' data-path='6793'>General</a>";
			str+="<li class='parent'><a id='subjects-20'   data-path='20'  >Geographic Features</a>";
			str+="<li class='parent'><a id='subjects-6404' data-path='6404'>Higher Education Digital Tools</a>";
			str+="<li class='parent'><a id='subjects-6664' data-path='6664'>Mesoamerican Studies</a>";
			str+="<li class='parent'><a id='subjects-7174' data-path='7174'>Politics</a>";
			str+="<li class='parent'><a id='subjects-6844' data-path='6844'>Teaching Resources</a>";
			str+="<li class='parent'><a id='subjects-6403' data-path='6403'>Tibet and Himalayas</a>";
			}
		$("body").append(str+"</ul></div>");											// Add to tree div

		$('.ks-tree li').each( function() {                                				// For each element
			if ($(this).children('ul').length > 0)                       				// If has children 
				$(this).addClass('parent');                              				// Make parent class
			});

		$('.ks-tree li > a').on("click", function(e) {									// ON CLICK OF NODE TEXT
			handleClick($(this),e);  													// Handle
			});      
		}
		
	x=$("#kmTreeDiv"+which).offset().left;												// Current left side
	$("#kmTreeDiv"+which).css("left",Math.min(x,$("body").width()-200)+"px");			// Cap at end of body

	function handleClick(row, e)													// HANDLE CLICK
	{
		if (e.offsetX < 12) {                                         				  	// In icon
			if (row.parent().children().length == 1) 									// If no children
				LazyLoad(row);															// Lazy load from SOLR
			else{																		// Open or close
				row.parent().toggleClass('active');                         			// Toggle active class on or off
				row.parent().children('ul').slideToggle('fast');            			// Slide into place
				}
			}
		else{																			// In text
			$('.ks-tree li a').each( function() {                          				// For each line
				$(this).css({"color":"#000","font-weight":"normal"});      				// Normal
				}); 
			row.css({"color":"#009900","font-weight":"bold"});          				// Bold and green   
			var v=e.target.id.split("-");												// Id as array
			if (v[0] == "places") {														// Places
				$("#mdFilterPlace").val($("#"+e.target.id).text())						// Set text
				ksSolrObj.placeFilter=e.target.id;										// Set search term
				callback(e.target.id);													// Load it via callback
				}
			else{																		// Subjects
				$("#mdFilterSubject").val($("#"+e.target.id).text())					// Set text
				ksSolrObj.subjectFilter=e.target.id;									// Set search term
				callback(e.target.id);													// Load it via callback
				}
			}		
	}

	function LazyLoad(row) 															// ADD NEW NODES TO TREE
	{
		if (row.parent().children().length == 1) {										// If no children, lazy load 
			var base="https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmterms_prod";	// Base url
			var path=""+row.data().path;												// Get path	as string										
				var lvla=path.split("/").length+1;										// Get level
			var type=row.prop("id").split('-')[0];										// Get type
			var url=buildQuery(base,type,path,lvla,lvla);								// Build query
			$.ajax( { url: url, dataType: 'jsonp' } ).done(function(res) {				// Run query
				var o,i,re;
				var str="<ul style='display:none'>";									// Wrapper
				var f=res.facet_counts.facet_fields.ancestor_id_path.join();			// List of facets
				res.response.docs.sort(function(a,b) { return (a.header > b.header) ? 1 : -1 }); // Sort
				for (i=0;i<res.response.docs.length;++i) {								// For each child
					o=res.response.docs[i];												// Point at child
					re=new RegExp("\/"+o.id.split("-")[1]);								// Id
					str+="<li";															// Start row
					if (f && f.match(re))	str+=" class='parent'"						// If has children, add parent class
					str+="><a id='"+o.id;												// Add id
					str+="' data-path='"+o.ancestor_id_path+"'>";						// Add path
					str+=o.header+"</a></li>";											// Add label
					}
				if (res.response.docs.length) {
					row.after(str+"</ul>");												// Add to tree
					row.parent().toggleClass('active');                         		// Toggle active class on or off
					row.parent().children('ul').slideToggle('fast');            		// Slide into place
					$('.ks-tree li > a').off();											// Clear handlers
					$('.ks-tree li > a').on("click",function(e) { handleClick($(this),e); }); 	// Restore handler
					}
				});
			}
		}
}

// THIS FUNCTION IS STRAIGHT FROM YUJI 3/15/18 --  sites/all/libraries/shanti_kmaps_tree/js/jquery.kmapstree.js

var SOLR_ROW_LIMIT=2000;

function buildQuery(termIndexRoot, type, path, lvla, lvlb) 
{
    path = path.replace(/^\//, "").replace(/\s\//, " ");  // remove root slashes
    if (path === "") {
        path = "*";
    }

	var fieldList = [
        "header",
        "id",
        "ancestor*",
        "caption_eng",
        "level_i"
    ].join(",");

    var result =
        termIndexRoot + "/select?" +
        "df=ancestor_id_path" +
        "&q=" + path +
        "&wt=json" +
        "&indent=true" +
        "&limit=" + SOLR_ROW_LIMIT +
        "&facet=true" +
        "&fl=" + fieldList +
        "&indent=true" +

        "&fq=tree:" + type +
        "&fq=level_i:[" + lvla + "+TO+" + (lvlb + 1) + "]" +
        "&fq={!tag=hoot}level_i:[" + lvla + "+TO+" + lvlb + "]" +

        "&facet.mincount=2" +
        "&facet.limit=-1" +
        "&sort=level_i+ASC" +
        "&facet.sort=ancestor_id_path" +
        "&facet.field={!ex=hoot}ancestor_id_path" +

        "&wt=json" +
        "&json.wrf=?" +

        "&rows=" + SOLR_ROW_LIMIT;

		return result;
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ksSolr.prototype.MakeSelect=function(id, multi, items, sel, extra, values)		// CREATE HTML SELECT
{
		var	str="<select class='ks-is' id='"+id+"'";								// Header
		str+="style='width:auto'";
		if (multi)																	// Multi select
			str+="multiple='multiple' size='"+multi+"'";							// Add flag
		if (extra)																	// If extra param
			str+=extra;																// Add them
		str+=">";																	// End header
		for (i=0;i<items.length;++i) {												// For each option
			str+="<option";															// Add tag
			if (sel == items[i])													// If selected
				str+=" selected='selected'"											// Add tag
			if (values && values[i])												// If has a value
				str+=" value='"+values[i]+"'";										// Add it
			str+=">"+items[i]+"</option>";											// End option
			}	
		return str+"</select>";														// Return element				
}


ksSolr.prototype.LoadingIcon=function(mode, size, container)					// SHOW/HIDE LOADING ICON		
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

ksSolr.prototype.Sound=function(sound, mute)									// PLAY SOUND
{
	var snd=new Audio();															// Init audio object
	if (!snd.canPlayType("audio/mpeg") || (snd.canPlayType("audio/mpeg") == "maybe")) 
		snd=new Audio("img/"+sound+".ogg");											// Use ogg
	else	
		snd=new Audio("img/"+sound+".mp3");											// Use mp3
	if (!mute)	{																	// If not initing or muting	
		snd.volume=50/100;															// Set volume
		snd.play();																	// Play it
		}
	}

ksSolr.prototype.ShortenString=function(str, len)								// SHORTEN A STRING TO LENGTH
{
	if (str && str.length > len)													// Too long
		str=str.substr(0,(len-3)/2)+"..."+str.slice((len-3)/-2);					// Shorten	
	return str;																		// Return string}
}
