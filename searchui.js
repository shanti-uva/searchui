/* MANDALA SEARCH UI

	Usage: 		var sui=new SearchUI();	-- sui needs to be declared globally!
	Requires: 	jQuery and jQueryUI
	CSS:		searchui.css
	Images:		img/loading.gif, img/advicon.png, img/simicon.png

*/

class SearchUI  {																					

	constructor()   																			// CONSTRUCTOR
	{
		sui=this;																					// Save ref to class as global
		this.wid=$("body").width();		this.hgt=$("body").height();								// Set sizes
		this.solrUrl="https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmassets/select";		// SOLR production url
		this.drupalUI="https://mandala.shanti.virginia.edu/sites/all/themes/shanti_sarvaka/images/default/"; // When images are stored in Drupal
		this.curResults="";																			// Returns results
		this.curMode="simple";																		// Current mode - can be input, simple, or advanced
		this.curQuery={ text:""};																	// Current query
		this.viewMode="Card";																		// Dispay mode - can be List, Grid, or Card
		this.viewSort="Alpha";																		// Sort mode - can be Alpha, Date, or Auther
		this.curType="All";																			// Current item types
		this.curPage=0;																				// Current page being shown
		this.pageSize=100;																			// Results per page	
		this.pageStart=0;
		this.numItems=0;
		this.AddFrame();																			// Add div framework
	
		this.assets={};
		this.assets.All=	 { c:"#5b66cb", g:"&#xe60b", n:1421 };									// All assets
		this.assets.Places=	 { c:"#6faaf1", g:"&#xe62b", n:1200};									// Places
		this.assets["Audio-Video"]=	{ c:"#58aab4", g:"&#xe648", n:6 };								// AV
		this.assets.Images=	 { c:"#b49c59", g:"&#xe62a", n:32 };									// Images
		this.assets.Sources= { c:"#7773ab", g:"&#xe631", n:86 };									// Sources
		this.assets.Texts=	 { c:"#8b5aa1", g:"&#xe636", n:93 };									// Texts
		this.assets.Visuals= { c:"#6e9456", g:"&#xe63b", n:39 };									// Visuals
		this.assets.Subjects={ c:"#cc4c39", g:"&#xe634", n:39 };									// Subjects
		this.assets.Terms=   { c:"#a2733f", g:"&#xe635", n:39 };									// Terms
	
		this.Query();																				// Get intial data
		this.Draw();																				// Draw
	
		window.onresize=()=> {																		// ON WIMDOW RESIZE
			this.wid=$("body").width();		this.hgt=$("body").height();							// Set size
			this.Draw();																			// Redraw																		
			};
		}

	AddFrame()																					// ADD DIV FRAMEWORK
	{
		var str=`
		<div id='sui-main' class='sui-main'>
			<div id='sui-top' class='sui-top'>
				<div class='sui-search1'>&#xe623
				<input type='text' id='sui-search' class='sui-search2' placeholder='Enter Search'>
				<div id='sui-clear' class='sui-search3'>&#xe610</div>
				</div>
				<div id='sui-searchgo' class='sui-search4'>&#xe642</div>
				<img id='sui-mode' class='sui-search5' src='img/advicon.png' title='Advanced search'>
			</div>
			<div id='sui-header' class='sui-header'>
				<div id='sui-headLeft' class='sui-headLeft'></div>
				<div id='sui-headRight' class='sui-headRight'></div>
			</div><
			div id='sui-left' class='sui-left'>
				<div id='sui-results' class='sui-results'></div>
				<div id='sui-footer' class='sui-footer'></div>
				<div id='sui-right' class='sui-right'></div>
			</div>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Remove formatting and add framework to body

		$("#sui-clear").on("mouseover",function() { $(this).html("&#xe60d"); });					// Highlight						
		$("#sui-clear").on("mouseout", function() { $(this).html("&#xe610"); });					// Normal						
		$("#sui-clear").on("click",()=> { 															// ON ERASE
			$("#sui-search").val("");	this.curQuery.text=""; 										// Clear input and query												
			this.Query(); 																			// Load and redraw
			});					
		$("#sui-search").on("change", ()=> { 														// ON SEARCH CHANGE
			this.curQuery.text=$("#sui-search").val(); 												// Get query
			if (this.curMode == "input") this.curMode="simple";										// Toggle simple mode
			this.curPage=0;																			// Start at beginning
			this.Query(); 																			// Load and redraw
			});	
		$("#sui-searchgo").on("click", ()=> { 														// ON SEARCH GO
			this.curQuery.text=$("#sui-search").val(); 												// Get query
			if (this.curMode == "input") this.curMode="simple";										// Toggle simple mode
			this.curPage=0;																			// Start at beginning
			this.Query(); 																			// Load and redraw
			});	
		$("#sui-mode").on("click",()=> { 															// ON CHANGE MODE
			if (this.curMode == "advanced") this.curMode="simple";									// Go to simple mode
			else							this.curMode="advanced";								// Go to advanced mode
			this.Draw(); 																			// Redraw
			});	
	}

	Draw(mode)																					// DRAW SEARCH
	{
		$("#sui-main").css({ height:this.hgt+"px", width:this.wid+"px" });							// Position main area
		$("#sui-typeList").remove();																// Remove type list
		if (mode) this.curMode=mode;																// If mode spec'd, use it
		this.DrawResults();																			// Draw results page if active
		this.DrawSearchUI();																		// Draw search UI if active
	}

	Query()																						// QUERY AND UPDATE RESULTS
	{
		this.LoadingIcon(true,64);																	// Show loading icon
		var s=this.curPage*this.pageSize;															// Starting item number
		var search=this.FormQuery();																// Form SOLR search from query object
		var url=this.solrUrl+"/?"+"q="+search+"&fl=*&wt=json&json.wrf=?&sort=id asc&start="+s+"&rows="+this.pageSize;
		$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done((data)=> {
			var i,o;
			this.curResults=data.response.docs;														// Save current results
			for (i=0;i<this.curResults.length;++i) {												// For each result, massage data
				o=this.curResults[i];																// Point at item
				o.asset_type=o.asset_type.charAt(0).toUpperCase()+o.asset_type.slice(1);			// UC 1st char
				if (o.asset_subtype) o.asset_subtype=o.asset_subtype.charAt(0).toUpperCase()+o.asset_subtype.slice(1);	
				if (o.ancestors_txt && o.ancestors_txt.length)	o.ancestors_txt.splice(0,1);		// Remove 1st ancestor from trail
				if (o.asset_type == "Audio-video") 	o.asset_type="Audio-Video";						// Handle AV
				else if (o.asset_type == "Texts") 	o.url_thumb=this.drupalUI+"generic-texts-icon.png";		// Texts icons
				else if (o.asset_type == "Sources") o.url_thumb=this.drupalUI+"generic-sources-icon.png"; 	// Sources
				else if (o.asset_type == "Terms") 	o.url_thumb=this.drupalUI+"generic-terms-icon.png";		// Terms
				else if (o.asset_type == "Places") 	o.url_thumb=this.drupalUI+"generic-places-icon.png"; 	// Places
				else if (o.asset_type == "Subjects") o.url_thumb=this.drupalUI+"generic-subjects-icon.png";	// Subjects
				if (o.display_label) o.title=o.display_label;										// Get title form display
				}
			this.LoadingIcon(false);																// Hide loading icon
			this.DrawResults();																		// Draw results page if active
			});
		this.GetAssetCounts(search);																// Get asset counts	
	}

	FormQuery()																					// FORM SOLR QUERY FROM SEARCH OBJECT
	{
		var search="",asset="*";
		if (this.curType != "All")																	// If not all
			asset="asset_type%3A%22"+this.curType.toLowerCase()+"%22";								// Set asset type						
		if (this.curQuery.text) {																	// If a filter spec'd
			var str="%22*"+this.curQuery.text.toLowerCase()+"*%22";									// Search term
			search+=" AND (title%3A"+str;															// Look at title
			search+=" OR caption%3A"+str;															// Or caption 
			search+=" OR summary%3A"+str+")";														// Or summary
			}
/*		if (_this.filterCollect) {																	// If a collection filter spec'd
			str="*"+_this.filterCollect.toLowerCase()+"*";											// Search term
			search+=" AND collection_title%3A"+str;													// And collection title
			}
		if (_this.placeFilter)																		// If a place filter spec'd 
			search+=" AND kmapid%3A%28%22"+_this.placeFilter.toLowerCase()+"%22%29";				// Place search term 
		if (_this.subjectFilter) 																	// If subject filter spec'd 
			search+=" AND kmapid%3A%28%22"+_this.subjectFilter.toLowerCase()+"%22%29";				// Subject search term
		if (_this.user) 																			// If a user spec'd
			search+=" AND node_user%3A*"+_this.user+"*";											// Look at user
*/
	return asset+search;																			// Return formatted query
}

	GetAssetCounts(search) 																		// GET ASSET COUNTS
	{
		var i,val;
		var url=this.solrUrl+"?"+"q=*"+search+"&wt=json&rows=0&json.facet={assetType:{limit:300,type:%22terms%22,field:%22asset_type%22}}";
		$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done((data)=> {				// Get asset counts
			for (i in this.assets) this.assets[i].n=0;												// Zero them out
			if (!data || !data.facets || !data.facets.assetType || !data.facets.assetType.buckets)	// If no buckets
				return;																				// Quit
			var buckets=data.facets.assetType.buckets;												// Point at buckets
			for (i=0;i<buckets.length;++i) {														// For each bucket
				val=buckets[i].val;																	// Get name
				val=val.charAt(0).toUpperCase()+val.slice(1);										// UC
				if (val == "Audio-video") val="Audio-Video";										// Handle AV
				this.assets[val].n=buckets[i].count;												// Set count
				}
			this.assets.All.n=data.response.numFound;												// All count																	
			});
	}

	DrawResults()																				// DRAW RESULTS SECTION
	{
		$("#sui-results").scrollTop(0);																// Scroll to top
		this.numItems=this.assets[this.curType].n;													// Set number of items
		if (this.curMode == "input") {																// Just the search box
			$("#sui-header").css({ display:"none"});												// Show header
			$("#sui-left").css({ display:"none" });													// Hide results
			$("#sui-right").css({ display:"none" });												// Hide search ui
			$("#sui-headLeft").css({ display:"none" });												// Hide left header
			return;																					// Quit
			}
		else if (this.curMode == "simple") {														// Simple search
			$("#sui-left").css({ width:"100%" });													// Size and show results area
			$("#sui-right").css({ display:"none"});													// Hide search ui
			$("#sui-left").slideDown();																// Slide down
			}
		else if (this.curMode == "advanced") {														// Advanced search
			$("#sui-left").css({ width:this.wid-$("#sui-right").width()-4+"px",display:"inline-block"});	// Size and show results area
			$("#sui-right").css({ display:"inline-block" });										// Show search ui
			}
		$("#sui-headLeft").css({ display:"inline-block" });											// Show left header
		$("#sui-mode").prop({"title": this.curMode == "advanced" ? "Regular search" : "Advanced search" } );	// Set tooltip
		$("#sui-mode").prop({"src": this.curMode == "advanced" ? "img/simicon.png" : "img/advicon.png" } );	// Set mode icon	
		$("#sui-header").css({display:"inline-block"} );											// Show header
		$("#sui-typeList").remove();																// Remove type list
		this.DrawHeader();																			// Draw header
		this.DrawItems();																			// Draw items
		this.DrawFooter();																			// Draw footer
	}

	DrawHeader()																				// DRAW RESULTS HEADER
	{
		var s=this.curPage*this.pageSize+1;															// Starting item number
		var e=Math.min(s+this.pageSize,this.numItems);												// Ending number
		var n=this.assets[this.curType].n;															// Get number of items in current asset
		if (n >= 1000)	n=Math.floor(n/1000)+"K";													// Shorten if need be
		var str=`
			<span id='sui-resClose' class='sui-resClose'>&#xe60f</span>
			Search results: <span style='font-size:12px'> (${s}-${e}) of ${this.numItems}
			`;
		$("#sui-headLeft").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to div
		str=`
			SHOW&nbsp; 
			<div id='sui-type' class='sui-type' title='Choose asset type'>
			<div id='sui-typeIcon' class='sui-typeIcon' style='background-color:${this.assets[this.curType].c}'>
			${this.assets[this.curType].g}</div>${this.curType} (${n}) 
			<div id='sui-typeSet' class='sui-typeSet'>&#xe609</div>
			</div>
			`;
		$("#sui-headRight").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to div
		$("#sui-resClose").on("click", ()=> { this.Draw("input"); });								// ON QUIT
		$("#sui-typeSet").on("click", ()=> {														// ON CHANGE ASSET BUTTON
			$("#sui-typeList").remove();															// Remove type list
			str="<div id='sui-typeList' class='sui-typeList'>";										// Enclosing div for list
			for (var k in this.assets) {															// For each asset type														
				n=this.assets[k].n;																	// Get number of items
				if (n > 1000)	n=Math.floor(n/1000)+"K";											// Shorten
				str+="<div id='sui-tl-"+k+"'><span style='font-size:18px; line-height: 24px; vertical-align:-3px; color:"+this.assets[k].c+"'>"+this.assets[k].g+" </span> "+k+" ("+n+")</div>";
				}
			$("#sui-main").append(str);																// Add to main div
			
			$("[id^=sui-tl-]").on("click", (e)=> {													// ON CLICK ON ASSET 
				this.curType=e.currentTarget.id.substring(7);										// Get asset name		
				$("#sui-typeList").remove();														// Remove type list
				this.Query(); 																		// Get new results
				});							
			});
	}

	DrawFooter()																				// DRAW RESULTS FOOTER
	{
		var lastPage=Math.floor(this.numItems/this.pageSize);										// Calc last page
		var str=`
		<div style='float:left;font-size:18px;'>
			<div id='sui-viewModeList' class='sui-resDisplay' title='List view'>&#xe61f</div>
			<div id='sui-viewModeGrid' class='sui-resDisplay' title='Grid view'>&#xe61b</div>
			<div id='sui-viewModeCard' class='sui-resDisplay' title='Card view'>&#xe673</div>
		</div>	
		<div style='display:inline-block;font-size:11px'>
			<div id='sui-page1' class='sui-resDisplay' title='Go to first page'>&#xe63c</div>
			<div id='sui-pageP' class='sui-resDisplay' title='Go to previous page'>&#xe63f</div>
			<div class='sui-resDisplay'> PAGE <input type='text' id='sui-typePage' 
			style='border:0;border-radius:4px;width:30px;text-align:center;vertical-align:1px;font-size:10px;padding:2px'
			title='Enter page, then press Return'> OF ${lastPage+1}</div>
			<div id='sui-pageN' class='sui-resDisplay' title='Go to next page'>&#xe63e</div>
			<div id='sui-pageL' class='sui-resDisplay' title='Go to last page'>&#xe63d</div>
			</div>	
		<div style='float:right;font-size:16px;'>
			<div id='sui-viewSortAlpha' class='sui-resDisplay' title='Sort alphabetically'>&#xe652</div>
			<div id='sui-viewSortDate'  class='sui-resDisplay' title='Sort by date'>&#xe60c</div>
			<div id='sui-viewSortAuthor' class='sui-resDisplay' title='Sort by author'>&#xe600</div>
			</div>`;
		$("#sui-footer").html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div
		
		$("#sui-typePage").val(this.curPage+1);														// Set page number
		$("[id^=sui-viewMode]").css("color","#ddd");												// Reset modes
		$("#sui-viewMode"+this.viewMode).css("color","#fff");										// Highlight current mode
		$("[id^=sui-viewMode]").on("click",(e)=> { 													// ON MODE CLICK
			this.viewMode=e.currentTarget.id.substring(12);											// Get/set mode name		
			this.DrawResults(); 																	// Redraw
			});		

		$("[id^=sui-viewSort]").css("color","#ddd");												// Reset modes
		$("#sui-viewSort"+this.viewSort).css("color","#fff");										// Highlight current mode
		$("[id^=sui-viewSort]").on("click",(e)=> { 													// ON SORT CLICK
			this.viewSort=e.currentTarget.id.substring(12);											// Get/set mode name		
			this.DrawResults(); 																	// Redraw
			});		
			
		$("[id^=sui-page]").css("color","#fff");													// Reset pagers
		if (this.curPage == 0) 		  	  { $("#sui-page1").css("color","#ddd"); $("#sui-pageP").css("color","#ddd"); }	// No back
		if (this.curPage == lastPage)     { $("#sui-pageN").css("color","#ddd"); $("#sui-pageL").css("color","#ddd"); }	// No forward
		$("#sui-page1").on("click",()=> { this.curPage=0; this.Query(); });									// ON FIRST CLICK
		$("#sui-pageP").on("click", ()=> { this.curPage=Math.max(this.curPage-1,0);  this.Query(); });		// ON PREVIOUS CLICK
		$("#sui-pageN").on("click", ()=> { this.curPage=Math.min(this.curPage+1,lastPage); this.Query(); });// ON NEXT CLICK
		$("#sui-pageL").on("click", ()=> { this.curPage=lastPage; this.Query(); });					// ON LAST CLICK
		$("#sui-typePage").on("change", ()=> {														// ON TYPE PAGE
			var p=$("#sui-typePage").val();															// Get value
			if (!isNaN(p))   this.curPage=Math.max(Math.min(p-1,lastPage),0);						// If a number, cap 0-last	
			this.Query(); 																			// Get new results
		});							
	}

	DrawItems()																					// DRAW RESULT ITEMS
	{
		var i,str="";
		$("#sui-results").css({ "background-color":(this.viewMode == "List") ? "#fff" : "#ddd" }); 	// White b/g for list only
		for (i=0;i<this.curResults.length;++i) {													// For each result
			if (this.viewMode == "Card")		str+=this.DrawCardItem(i);							// Draw if shoing as cards
			else if (this.viewMode == "Grid")	str+=this.DrawGridItem(i);							// Grid
			else								str+=this.DrawListItem(i);							// List
			}	
		if (!this.curResults.length)																// No results
			str="<br><br><br><div style='text-align:center;color:#666'>Sorry, there were no items found<br>Try broadening your search</div>";
		$("#sui-results").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to div

		$(".sui-itemIcon").on("click",(e)=> { 														// ON ICON BUTTON CLICK
			var num=e.currentTarget.id.substring(13);												// Get index of result	
			this.SendMessage(this.curResults[num].url_html);										// Send message
			});
		$("[id^=sui-itemPic-]").on("click",(e)=> { 													// ON ITEM CLICK
			var num=e.currentTarget.id.substring(12);												// Get index of result	
			this.SendMessage(this.curResults[num].url_html);										// Send message
			});
		$(".sui-gridInfo").on("mouseover",(e)=> { 													// ON INFO BUTTON HOVER
			var num=e.currentTarget.id.substring(13);												// Get index of result	
			var o=this.curResults[num];																// Point at item
			var str="";
			if (o.title) str+="<b>"+o.title+"</b><br><br>";											// Add title
			str+=this.assets[o.asset_type].g+"&nbsp;&nbsp;"+o.asset_type.toUpperCase();				// Add type
			if (o.asset_subtype) str+=" / "+o.asset_subtype;										// Add subtype
			str+="<br>";
			if (o.creator) str+="<p>&#xe600&nbsp;&nbsp;"+o.creator.join(", ")+"</p>";				// Add creator
			if (o.summary || o.caption) {															// If a summary or caption
				var s1=o.summary || o.caption;														// Use either summary or caption
				if (s1.length > 80)	s1=s1.substr(0,80)+"...";										// Limit size
				str+="<p><div style='display:inline-block;background-color:#ccc;width:4px;height:18px;margin:2px 10px 0 5px;vertical-align:-4px'></div>&nbsp;<i>"+s1+"</i></p>";										// Add summary
				}
			if (o.summary) str+="<p style='font-family:serif;'>"+o.summary+"</p>";					// Add summary
			var p=$("#"+e.currentTarget.id).offset();												// Get position
			this.Popup(str,20,p.left-220,p.top+24);													// Show popup	
			});
		$(".sui-gridInfo").on("mouseout",(e)=> { $("#sui-popupDiv").remove(); });					// ON INFO BUTTON OUT
		$("[id^=sui-itemTitle-]").on("click",(e)=> { 												// ON TITLE CLICK
			var num=e.currentTarget.id.substring(14);												// Get index of result	
			this.SendMessage(this.curResults[num].url_html);										// Send message
			});
		$(".sui-itemPlus").on("click",(e)=> { 														// ON MORE BUTTON CLICK
			this.ShowItemMore(e.currentTarget.id.substring(13));									// Shoe more info below
			});
	}	
		
	DrawListItem(num)																				// DRAW A LIST ITEM
	{
		var i;
		var o=this.curResults[num];																	// Point at list item
		var str="<div class='sui-item'>";
		str+="<div class='sui-itemPlus' id='sui-itemPlus-"+num+"'>&#xe669</div>";
		str+="<div class='sui-itemIcon' id='sui-itemIcon-"+num+"' style='background-color:"+this.assets[o.asset_type].c+"'>";
		str+=this.assets[o.asset_type].g+"</div>";
		str+="<div class='sui-itemTitle' id='sui-itemTitle-"+num+"'>"+o.title+"</div>";
		if (o.feature_types_ss) {																	// If a feature
			str+="<span style='color:"+this.assets[o.asset_type].c+"'>&nbsp;&bull;&nbsp;</span>";	// Add dot
			str+="<div class='sui-itemFeature'>&nbsp;"+o.feature_types_ss.join(", ")+"</div>";		// Add feature(s)
			}
		str+="<div class='sui-itemId'>"+o.uid;
		if (o.collection_title)																		// If a collection
			str+="<div style='text-align:right;margin-top:2px;'>&#xe633&nbsp;"+o.collection_title+"</div>";		// Add title
		str+="</div>";																				// Close title div
		if (o.ancestors_txt && o.ancestors_txt.length > 1) {										// If has an ancestors trail
			str+="<div class='sui-itemTrail'>";														// Holds trail
			for (i=0;i<o.ancestors_txt.length;++i) {												// For each trail member
				str+="<span class='sui-itemAncestor' onclick='sui.SendMessage(\"";					// Add ancestor
				str+="https://mandala.shanti.virginia.edu/"+o.asset_type.toLowerCase()+"/";			// URL stem
				str+=o.ancestor_ids_is[i+1]+"/overview/nojs#search\")'>";							// URL end
				str+=o.ancestors_txt[i]+"</span>";													// Finish ancestor link
				if (i < o.ancestors_txt.length-1)	str+=" > ";										// Add separator
				}
			str+="</div>";																			// Close trail div
			}
		str+="<div class='sui-itemMore' id='sui-itemMore-"+num+"'></div>";							// More area
		return str+"</div>";																		// Return items markup
	}

	ShowItemMore(num)																			// SHOW MORE INFO
	{
		var j,o,s1,str="";
		if ($("#sui-itemMore-"+num).html()) {														// If open
			$("#sui-itemMore-"+num).slideUp(400,()=>{ $("#sui-itemMore-"+num).html(""); } );		// Close it and clear
			return;																					// Quit	
			}
		
		o=this.curResults[num];																		// Point at item
		if (o.url_thumb)	str+="<img src='"+o.url_thumb+"' class='sui-itemPic' id='sui-itemPic-"+num+"'>";	// Add pic
		str+="<div class='sui-itemInfo'>";															// Info holder
		str+=this.assets[o.asset_type].g+"&nbsp;&nbsp;"+o.asset_type.toUpperCase();					// Add type
		if (o.asset_subtype) str+=" / "+o.asset_subtype;											// Add subtype
		if (o.creator) str+="<br>&#xe600&nbsp;&nbsp;"+o.creator.join(", ");							// Add creator
		if (o.summary || o.caption) {																// If a summary or caption
			s1=o.summary || o.caption;																// Use either summary or caption
			if (s1.length > 137)	s1=s1.substr(0,137)+"...";										// Limit size
			str+="<br><div style='display:inline-block;background-color:#ccc;width:4px;height:18px;margin:2px 10px 0 5px;vertical-align:-4px'></div>&nbsp;<i>"+s1+"</i>";	// Add summary
			}
		str+="</div>";																				// Close info div
		if (o.summary) str+="<br><div style='font-family:serif'>"+o.summary+"</div>";				// Add summary
		if (o.kmapid_strict && o.kmapid_strict.length) {											// Add related places/subjects
			var places=[],subjects=[];
			str+="<div style='margin-bottom:12px'>";												// Related places and subjects container
			for (j=0;j<o.kmapid_strict.length;++j) {												// For each item
				if (o.kmapid_strict[j].match(/subjects/i))		subjects.push(j);					// Add to subjects
				else if (o.kmapid_strict[j].match(/places/i))	places.push(j);						// Add to places
				}
			str+="<div style='float:left;min-width:200px;'><span style='color:"+this.assets.Places.c+"'>";
			str+="<br><b>"+this.assets.Places.g+"</b></span>&nbsp;RELATED PLACES";					// Add header
			if (places.length) {																	// If any places
				for (j=0;j<places.length;++j) {														// For each place
					str+="<br>";
					if (o.kmapid_strict_ss)															// If has names															
						str+="<span class='sui-itemRelated'>"+o.kmapid_strict_ss[places[j]]+"</span>";	// Add place name
					str+="&nbsp;<span style='font-size:10px;margin-right:40px'>("+o.kmapid_strict[places[j]]+")</span>";	// Add place id
					}
				}
			str+="</div>";																			// End places div
			
			str+="<div><span style='display:inline-block;color:"+this.assets.Subjects.c+"'>";
			str+="<br><b>"+this.assets.Subjects.g+"</b></span>&nbsp;RELATED SUBJECTS";				// Add header
			if (subjects.length) {																	// If any subjects
				for (j=0;j<subjects.length;++j) {													// For each subject
					str+="<br>";
					if (o.kmapid_strict_ss)															// If has names															
						str+="<span class='sui-itemRelated'>"+o.kmapid_strict_ss[subjects[j]]+"</span>"; // Add place name
					str+="&nbsp;<span style='font-size:10px'>("+o.kmapid_strict[subjects[j]]+")</span>"; // Add place id
					}
				}
			str+="</div></div>";																	// End subjects and relateds div
			}
		$("#sui-itemMore-"+num).html(str);															// Add to div
		
		$("#sui-itemMore-"+num).slideDown();														// Slide it down
		$("[id^=sui-itemPic]").on("click",(e)=> { 													// ON PIC CLICK
			var num=e.currentTarget.id.substring(12);												// Get index of result	
			this.SendMessage(this.curResults[num].url_html);										// Send message
			});
		}

	DrawGridItem(num)																			// DRAW GRID ITEM
	{
		var str="<div class='sui-grid'>";
		var o=this.curResults[num];																// Point at item
		if (o.url_thumb)	str+="<img src='"+o.url_thumb+"' class='sui-gridPic' id='sui-itemPic-"+num+"'>";	// Add pic
		str+="<div id='sui-gridInfo-"+num+"' class='sui-gridInfo'>&#xe67f</div></div>";
		return str;																				// Return grid markup
	}

	DrawCardItem(num)																			// DRAW CARD ITEM
	{
		var o=this.curResults[num];																// Point at item
		var g="&#xe60c";																		// Collections glyph
		var label=o.collection_title;															// Set label
		var str="<div class='sui-card'>";
		str+="<img src='"+o.url_thumb+"' class='sui-cardPic' id='sui-itemPic-"+num+"'>";		// Add pic
		str+="<div class='sui-cardInfo'><div class='sui-cardTitle' id='sui-itemTitle-"+num+"'><b>"+o.title+"</b><br></div>";	// Add title
		str+="<div style='border-top:.5px solid #e1cb8d;height:1px;width:100%;margin:6px 0 6px 0'></div>";
		if (o.feature_types_ss) str+="&#xe62b&nbsp;&nbsp;"+o.feature_types_ss.join(", ")+"<br>";// Add feature, if a place
		if (o.data_phoneme_ss)  str+="&#xe635&nbsp;&nbsp;"+o.data_phoneme_ss.join(", ")+"<br>";	// Add phoneme if a term
		if (o.node_user)  		str+="&#xe600&nbsp;&nbsp;"+o.node_user+"<br>";					// Or user 
		if (o.duration_s) 		str+="&#xe61c&nbsp;&nbsp;"+o.duration_s+"<br>";					// Add duration
		if (o.timestamp) 		str+="&#xe60c&nbsp;&nbsp;"+o.timestamp.substr(0,10)+"<br>";		// Add timestamp
		if (o.name_tibt)  		str+="=&nbsp;&nbsp;"+o.name_tibt+"<br>";						// Add Tibettan name
		str+="</div>";																			// End info div
		if (!label)	 label=o.asset_type,g=this.assets[o.asset_type].g;							// Generic label if no collection
		str+="<div class='sui-cardFooter'>"+g+"&nbsp;&nbsp;";									// Card footer
		str+="<span style='font-size:11px;vertical-align:2px'>"+label+"<span></div>";			// Add label	
		return str+"</div>";																	// Return items markup
	}

	DrawSearchUI()																				// DRAW SEARCH UI SECTION
	{
		var str=`
		<br><br><br><div style='text-align:center;color:#666'>Search UI will appear here</div>
		`;
		$("#sui-right").html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div
	}

	LoadingIcon(mode, size)																		// SHOW/HIDE LOADING ICON		
	{
		if (!mode) {																				// If hiding
			$("#sui-loadingIcon").remove();															// Remove it
			return;																					// Quit
			}
		var str="<img src='img/loading.gif' width='"+size+"' ";										// Img
		str+="id='sui-loadingIcon' style='position:absolute;top:calc(50% - "+size/2+"px);left:calc(50% - "+size/2+"px);z-index:5000'>";	
		$("#sui-results").append(str);																// Add icon to results
	}

	SendMessage(msg, time)																		// SEND MESSAGE TO HOST
	{
		var str="";
		$("#sui-popupDiv").remove();																// Kill old one, if any
		str+="<div id='sui-popupDiv' class='sui-gridPopup' style='width:auto'>"; 					// Add div
		str+="<b>Navigate to this page:</b><br>";
		str+=msg+"</div>"; 																			// Add div
		$("body").append(str);																		// Add popup to div or body
		$("#sui-popupDiv").fadeIn(500).delay(time ? time*1000 : 3000).fadeOut(500);					// Animate in and out		
	}

	Popup(msg, time, x, y)																		// POPUP 
	{
		var str="";
		$("#sui-popupDiv").remove();																// Kill old one, if any
		str+="<div id='sui-popupDiv' class='sui-gridPopup' style='left:"+x+"px;top:"+y+"px'>"; 		// Add div
		str+=msg+"</div>"; 																			// Add content
		$("body").append(str);																		// Add popup to div or body
		$("#sui-popupDiv").fadeIn(500).delay(time ? time*1000 : 3000).fadeOut(500);					// Animate in and out		
	}


} // SearchUI class closure
