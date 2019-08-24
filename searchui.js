// MANDALA SEARCH UI

class SearchUI  {																					

	constructor(top, callback)   																// CONSTRUCTOR
	{
		this.top=top;																				// Start of div
		this.wid=1368;		this.hgt=747-top;
		this.callback=callback;																		// Callback
		this.curMode="simple";																		// Current mode - can be input, simple, or advanced
		this.curQuery={ text:""};																	// Current query
		this.displayMode="card";																	// Dispay mode - can be grid, pic, or text
		this.curType="All";																			// Current item types
		this.types=["All","Images","Video","Audio","Visuals","Places","Sources","Subjects","Terms"]; // Types
		this.curPage=0;																				// Current page being shown
		this.pageSize=100;																			// Results per page	
		this.pageStart=0;
		this.numItems=1104;
		this.AddFrame();																			// Add div framework
		this.Draw();																				// Draw
		$("body").on("resize",this.Draw);															// Redraw on resize of body
	}

	AddFrame()																					// ADD DIV FRAMEWORK
	{
		var str=`
		<div id='sui-top' class='sui-top'></div>
		<div id='sui-main' class='sui-main'>
			<div id='sui-header' class='sui-header'>
			<div id='sui-headLeft' class='sui-headLeft'></div>
			<div id='sui-headRight' class='sui-headRight'>
			<div class='sui-search1'>&#xe623</div>
				<input type='text' id='sui-search' class='sui-search2' placeholder='Enter Search'>
				<div id='sui-clear' class='sui-search3'>&#xe610</div>
				<div id='sui-searchgo' class='sui-search4'>&#xe68a</div>
				<img id='sui-mode' class='sui-search5' src='img/advicon.png'>
				</div>
			</div><
			div id='sui-left' class='sui-left'>
				<div id='sui-results' class='sui-results'></div>
				<div id='sui-footer' class='sui-footer'></div>
				<div id='sui-right' class='sui-right'></div>
			</div>`;
		$("body").append(str.replace(/\t|\n|\r/g,""));												// Remove format and add framework to body

		$("#sui-top").css({ height: this.top });													// Size top area
		$("#sui-main").css({ top: this.top, height:this.hgt+"px", width:this.wid+"px" });			// Position main area
		$("#sui-clear").on("mouseover",function() { $(this).html("&#xe60d"); });					// Highlight						
		$("#sui-clear").on("mouseout", function() { $(this).html("&#xe610"); });					// Normal						
		$("#sui-top").on("click", ()=> { trace(122);this.Draw("input"); });							// ON TOP CLICK
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
		if (mode) this.curMode=mode;																// If mode spec'd, use it
		this.DrawSearchInput();																		// Draw search input
		this.DrawResults();																			// Draw results page if active
		this.DrawSearchUI();																		// Draw search UI if active
	}

	query(query)																				// QUERY AND UPDATE RESULTS
	{
		this.DrawResults();																			// Draw results page if active
	}
	
	DrawResults()																				// DRAW RESULTS SECTION
	{
		if (this.curMode == "input") {																// Just the search box
			$("#sui-header").css({ "background-color":"transparent" });								// Show Drupal header through
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
			$("#sui-left").css({ width:this.wid-$("#sui-right").width()+"px",display:"inline-block"});	// Size and show results area
			$("#sui-right").css({ display:"inline-block" });										// Show search ui
			}
		$("#sui-header").css({"background-color":"#aaa"} );											// Fill header	
		$("#sui-headLeft").css({ display:"inline-block" });											// Show left header
		this.DrawHeader();																			// Draw header
		this.DrawItems();																			// Draw items
		this.DrawFooter();																			// Draw footer
	}

	DrawSearchInput()
	{
	}

	DrawHeader()																				// DRAW RESULTS HEADER
	{
		var s=this.curPage*this.pageSize+1;															// Starting item number
		var e=Math.min(s+this.pageSize,this.numItems);												// Ending number
		var str=`
			&nbsp;<span id='sui-resclose' class='sui-resclose'>&#xe60f
			</span>&nbsp;&nbsp;Search results  
			<span style='font-size:12px'> (${s}-${e}) of ${this.numItems}</span>
			`;
		$("#sui-headLeft").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div
		$("#sui-resclose").on("click", ()=> { this.Draw("input"); });							// ON QUIT
		}

	DrawItems()																					// DRAW RESULT ITEMS
	{
	}

	DrawFooter()																				// DRAW RESULTS FOOTER
	{
		var lastPage=Math.floor(this.numItems/this.pageSize);										// Calc last page
		var str=`
		<div style='float:left;font-size:18px;'>
			<div id='sui-resModeLine' class='sui-resDisplay' title='List view'>&#xe679</div>
			<div id='sui-resModeGrid' class='sui-resDisplay' title='Grid view'>&#xe65f</div>
			<div id='sui-resModeCard' class='sui-resDisplay' title='Card view'>&#xe61b</div>
		</div>	
		<div style='display:inline-block;font-size:11px'>
			<div id='sui-page1' class='sui-resDisplay' title='Go to first page'>&#xe63c</div>
			<div id='sui-pageP' class='sui-resDisplay' title='Go to previous page'>&#xe63f</div>
			<div class='sui-resDisplay'> PAGE <input type='text' id='sui-typePage' 
			style='border:0;border-radius:4px;width:30px;text-align:center;vertical-align:1px;font-size:10px;padding:2px'
			title='Enter page, then press Return'> OF ${lastPage+1}</div>
			<div id='sui-pageN' class='sui-resDisplay' title='Go to next page'>&#xe63e</div>
			<div id='sui-pageL' class='sui-resDisplay' title='Go to last page'>&#xe63d</div>
		</div>`;
		$("#sui-footer").html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div
	
		$("#sui-typePage").val(this.curPage+1);														// Set page number
	
			$("[id^=sui-resMode]").css("color","#fff");													// Reset modes
		$("[id^=sui-page]").css("color","#fff");													// Reset pagers
		if (this.viewMode == "line") 		$("#sui-resModeLine").css("color","#578cf1");			// Hilite line if active
		else if (this.viewMode == "grid") 	$("#sui-resModeGrid").css("color","#578cf1");			// Grid
		else 								$("#sui-resModeCard").css("color","#578cf1");			// Card
		if (this.curPage == 0) 		  { $("#sui-page1").css("color","#ddd"); $("#sui-pageP").css("color","#ddd"); }	// No back
		if (this.curPage == lastPage) { $("#sui-pageN").css("color","#ddd"); $("#sui-pageL").css("color","#ddd"); }	// No forward

		$("#sui-resModeLine").on("click",()=> { this.viewMode="line"; this.DrawResults(); });		// ON LINE CLICK
		$("#sui-resModeGrid").on("click",()=> { this.viewMode="grid"; this.DrawResults(); });		// ON GRID CLICK
		$("#sui-resModeCard").on("click",()=> { this.viewMode="card"; this.DrawResults(); });		// ON CARD CLICK

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

	DrawSearchUI()																				// DRAW SEARCH UI SECTION
	{
	}


} // SearchUI class closure
