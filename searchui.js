// MANDALA SEARCH UI

class SearchUI  {																					

	constructor(top, callback)   																// CONSTRUCTOR
	{
		this.top=top;																				// Start of div
		this.wid=1368;		this.hgt=747-top;
		this.callback=callback;																		// Callback
		this.curMode="advanced";																		// Current mode - can be input, simple, or advanced
		this.curQuery={};																			// Current query
		this.displayMode="grid";																	// Dispay mode - can be grid, pic, or text
		this.curType="All";																			// Current item types
		this.types=["All","Images","Video","Audio","Visuals","Places","Sources","Subjects","Terms"]; // Types
		this.curPage=0;																				// Current page being shown
		this.pageSize=100;																			// Results per page	
		this.AddFrame();																			// Add div framework
		this.Draw();																				// Draw
	}

	AddFrame()																					// ADD DIV FRAMEWORK
	{
		var str="<div id='sui-main' class='sui-main'>";												// Main container
		str+="<div id='sui-header' class='sui-header'>";											// Header
		str+="<div id='sui-headLeft'  class='sui-headLeft'></div>";									// Left header
		str+="<div id='sui-headRight' class='sui-headRight'></div></div>";							// Right
		str+="<div id='sui-left' class='sui-left'>";												// Left side
		str+="<div id='sui-results' class='sui-results'></div>";									// Results
		str+="<div id='sui-footer' class='sui-footer'></div>";										// Footer
		str+="<div id='sui-right' class='sui-right'></div></div>";									// Right side
		$("body").append(str);																		// Add framework to body
	}

	Draw()																						// DRAW SEARCH
	{
		$("#sui-main").css({ top: this.top, height:this.hgt+"px", width:this.wid+"px" });			// Position main area
		this.DrawResults();																			// Draw results page if active
		this.DrawSearchUI();																		// Draw search UI if active
	}

	DrawResults()																				// DRAW RESULTS SECTION
	{
		if (this.curMode == "input") {																// Just the search box
			$("#sui-header").css({ "background-color":"transparent" });	
			$("#sui-left").css({ display:"none" });													// Hide results
			$("#sui-right").css({ display:"none" });												// Hide search ui
			$("#sui-headLeft").css({ display:"none" });												// Hide left header
			trace(123)
			return;																					// Quit
			}
		else if (this.curMode == "simple") {														// Simple search
			$("#sui-left").css({ width:"100%", display:"block" });									// Size and show results area
			$("#sui-right").css({ display:"none"});													// Hide search ui
			}
		else if (this.curMode == "advanced")	{													// Advanced search
			$("#sui-left").css({ width:this.wid-$("#sui-right").width()+"px", display:"block" });	// Size  and show results area
			$("#sui-right").css({ display:"inline-block" });										// Show search ui
			}
		$("#sui-header").css({"background-color":"#ccc"} );											// Fill header	
		$("#sui-headLeft").css({ display:"inline-block" });											// Show left header
		this.DrawHeader();																			// Draw header
		this.DrawItems();																			// Draw items
		this.DrawFooter();																			// Draw footer
	}

	DrawHeader()																				// DRAW RESULTS HEADER
	{
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
