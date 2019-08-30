// MANDALA SEARCH UI

class SearchUI  {																					

	constructor(callback)   																	// CONSTRUCTOR
	{
		this.wid=$("body").width();		this.hgt=$("body").height();								// Set sizes
		this.callback=callback;																		// Callback
		this.curMode="simple";																		// Current mode - can be input, simple, or advanced
		this.curQuery={ text:""};																	// Current query
		this.viewMode="Card";																		// Dispay mode - can be Line, Grid, or Card
		this.viewSort="Alpha";																		// Sort mode - can be Alpha, Date, or Other
		this.curType="All";																			// Current item types
		this.curPage=0;																				// Current page being shown
		this.pageSize=100;																			// Results per page	
		this.pageStart=0;
		this.numItems=0;
		this.AddFrame();																			// Add div framework
	
		this.assets={};
		this.assets.All=	{ c:"#5b66cb", g:"&#xe60b", n:1421 };									// All assets
		this.assets.Places=	{ c:"#6faaf1", g:"&#xe62b", n:1200};									// Places
		this.assets.AV=		{ c:"#58aab4", g:"&#xe648", n:6 };										// AV
		this.assets.Images=	{ c:"#b49c59", g:"&#xe62a", n:32 };										// Images
		this.assets.Sources={ c:"#7773ab", g:"&#xe631", n:86 };										// Sources
		this.assets.Texts=	{ c:"#8b5aa1", g:"&#xe636", n:93 };										// Texts
		this.assets.Visuals={ c:"#6e9456", g:"&#xe63b", n:39 };										// Visuals
	
		this.Draw();																				// Draw
	
		window.onresize=()=> {																		// ON RESIZE
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
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Remove format and add framework to body

		$("#sui-clear").on("mouseover",function() { $(this).html("&#xe60d"); });					// Highlight						
		$("#sui-clear").on("mouseout", function() { $(this).html("&#xe610"); });					// Normal						
		$("#sui-clear").on("click",()=> { 															// ON ERASE
			$("#sui-search").val("");	this.curQuery.text=""; 										// Clear input and query												
			this.Draw(); 																			// Redraw
			});					
		$("#sui-search").on("change", ()=> { 														// ON SEARCH CHANGE
			this.curQuery.text=$("#sui-search").val(); 												// Get query
			if (this.curMode == "input") this.curMode="simple";										// Toggle simple mode
			this.Draw(); 																			// Redraw
			});	
		$("#sui-searchgo").on("click", ()=> { 														// ON SEARCH GO
			this.curQuery.text=$("#sui-search").val(); 												// Get query
			if (this.curMode == "input") this.curMode="simple";										// Toggle simple mode
			this.Draw(); 																			// Redraw
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

	Query(query)																				// QUERY AND UPDATE RESULTS
	{
		this.DrawResults();																			// Draw results page if active
	}
	
	DrawResults()																				// DRAW RESULTS SECTION
	{
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
		$("#sui-typeSet").on("click", ()=> {
			$("#sui-typeList").remove();															// Remove type list
			str="<div id='sui-typeList' class='sui-typeList'>";
			for (var k in this.assets) {
				n=this.assets[k].n;																	// Get number of items
				if (n > 1000)	n=Math.floor(n/1000)+"K";											// Shorten
				str+="<div id='sui-tl-"+k+"'><span style='font-size:18px; line-height: 24px; vertical-align:-3px; color:"+this.assets[k].c+"'>"+this.assets[k].g+" </span> "+k+" ("+n+")</div>";
				}
			$("#sui-main").append(str);																// Add to main div
			
			$("[id^=sui-tl-]").on("click", (e)=> {													// ON CLICK ON ASSET TYPE
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
			<div id='sui-viewModeLine' class='sui-resDisplay' title='List view'>&#xe61f</div>
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
			<div id='sui-viewSortOther' class='sui-resDisplay' title='Sort by other'>&#xe655</div>
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
		$("#sui-page1").on("click",()=> { this.curPage=0; this.DrawResults(); });									// ON FIRST CLICK
		$("#sui-pageP").on("click", ()=> { this.curPage=Math.max(this.curPage-1,0);  this.DrawResults(); });		// ON PREVIOUS CLICK
		$("#sui-pageN").on("click", ()=> { this.curPage=Math.min(this.curPage+1,lastPage); this.DrawResults(); });	// ON NEXT CLICK
		$("#sui-pageL").on("click", ()=> { this.curPage=lastPage; this.DrawResults(); });							// ON LAST CLICK
		$("#sui-typePage").on("change", ()=> {																		// ON TYPE PAGE
			var p=$("#sui-typePage").val();															// Get value
			if (!isNaN(p))   this.curPage=Math.max(Math.min(p-1,lastPage),0);						// If a number, cap 0-last	
			this.DrawResults(); 																	// Refresh
			});							
	}

	DrawItems()																					// DRAW RESULT ITEMS
	{
		var str=`
		<br><br><br><div style='text-align:center;color:#666'>Search results will appear here</div>
		`;
		$("#sui-results").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to div
	}

	DrawSearchUI()																				// DRAW SEARCH UI SECTION
	{
		var str=`
		<br><br><br><div style='text-align:center;color:#666'>Search UI will appear here</div>
		`;
		$("#sui-right").html(str.replace(/\t|\n|\r/g,""));										// Remove format and add to div
	}





} // SearchUI class closure
