// MANDALA SEARCH UI

class SearchUI  {																					

	constructor(top, callback)   																// CONSTRUCTOR
	{
		this.top=top;																				// Start of div
		this.wid=1368;		this.hgt=747-top;
		this.callback=callback;																		// Callback
		this.curMode="input";																		// Current mode - can be input, simple, or advanced
		this.curQuery={ text:""};																	// Current query
		this.displayMode="grid";																	// Dispay mode - can be grid, pic, or text
		this.curType="All";																			// Current item types
		this.types=["All","Images","Video","Audio","Visuals","Places","Sources","Subjects","Terms"]; // Types
		this.curPage=0;																				// Current page being shown
		this.pageSize=100;																			// Results per page	
		this.pageStart=0;
		this.numItems=1104;
		this.AddFrame();																			// Add div framework
		this.Draw();																				// Draw
	}

	AddFrame()																					// ADD DIV FRAMEWORK
	{
		var str="<div id='sui-main' class='sui-main'>";												// Main container
		str+="<div id='sui-header' class='sui-header'>";											// Header 
		str+="<div id='sui-headLeft'  class='sui-headLeft'></div>";									// Left header
		str+="<div id='sui-headRight' class='sui-headRight'>";										// Right header - open
		str+="<div class='sui-search1'>&#xe623</div>";												// Magnifier
		str+="<input type='text' id='sui-search' class='sui-search2' placeholder='Enter Search'>"; 	// Search input
		str+="<div id='sui-clear' class='sui-search3'>&#xe610</div>";								// Clear button
		str+="<div id='sui-searchgo' class='sui-search4'>&#xe68a</div>";							// Go button
		str+="<img id='sui-mode' class='sui-search5' src='img/advicon.png'></div></div>";			// Switch mode button - end right header and header			
		str+="<div id='sui-left' class='sui-left'>";												// Left side
		str+="<div id='sui-results' class='sui-results'></div>";									// Results
		str+="<div id='sui-footer' class='sui-footer'></div>";										// Footer
		str+="<div id='sui-right' class='sui-right'></div></div>";									// Right side
		$("body").append(str);																		// Add framework to body

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

	Draw(mode)																						// DRAW SEARCH
	{
		if (mode) this.curMode=mode;																// If mode spec'd, use it
		$("#sui-main").css({ top: this.top, height:this.hgt+"px", width:this.wid+"px" });			// Position main area
		this.DrawSearchInput();																		// Draw searchinput
		this.DrawResults();																			// Draw results page if active
		this.DrawSearchUI();																		// Draw search UI if active
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
		var str="&nbsp;<span id='sui-resclose' class='sui-resclose'>&#xe60f</span>&nbsp;&nbsp;Search results:";
		str+="<span style='font-size:12px'> (1-100) of 11408</span>";
		$("#sui-headLeft").html(str);
		$("#sui-resclose").on("click", ()=> { this.Draw("input"); });							// ON QUIT
		}

	DrawItems()																					// DRAW RESULT ITEMS
	{
	}

	DrawFooter()																				// DRAW RESULTS FOOTER
	{
	}

	DrawSearchUI()																				// DRAW SEARCH UI SECTION
	{
	}


} // SearchUI class closure
