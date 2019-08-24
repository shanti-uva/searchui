// MANDALA SEARCH UI

class SearchUI  {																					

	constructor(top, callback)   																// CONSTRUCTOR
	{
		this.top=top;																				// Start of div
		this.wid=1368;		this.hgt=747-top;
		this.callback=callback;																		// Callback
		this.curMode="simple";																		// Current mode - can be input, simple, or advanced
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
		$("#sui-top").on("click", ()=> { trace(122);this.Draw("input"); });									// ON TOP CLICK
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
		this.DrawSearchInput();																		// Draw search input
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
		var str=`
			&nbsp;<span id='sui-resclose' class='sui-resclose'>&#xe60f
			</span>&nbsp;&nbsp;Search results
			<span style='font-size:12px'> (1-100) of ${this.numItems}</span>
			`;
		$("#sui-headLeft").html(str.replace(/\t|\n|\r/g,""));									// Remove format and add to div
		$("#sui-resclose").on("click", ()=> { this.Draw("input"); });							// ON QUIT
		}

	DrawItems()																					// DRAW RESULT ITEMS
	{
	}

	DrawFooter()																				// DRAW RESULTS FOOTER
	{
		var str=`
		<div style='float:left;font-size:18px;'>
			<div id='sui-dispLine' class='sui-resDisplay' title='List view'>&#xe679</div>
			<div id='sui-disPic'   class='sui-resDisplay' title='Image view'>&#xe65f</div>
			<div id='sui-disGrid'  class='sui-resDisplay' title='Card view'>&#xe61b</div>
		</div>	
		<div style='display:inline-block;font-size:11px'>
			<div id='sui-firstItem' class='sui-resDisplay' title='Go to first page'>&#xe63c</div>
			<div id='sui-prevItem' class='sui-resDisplay' title='Go to previous page'>&#xe63f</div>
			<div class='sui-resDisplay'> PAGE 
			<input type='text' id='sui-itemPage' 
			style='border:0;border-radius:4px;width:30px;text-align:center;vertical-align:1px;font-size:10px;padding:2px'
			title='Enter page, then press Return'> OF 239</div>
			<div id='sui-nextItem' class='sui-resDisplay' title='Go to next page'>&#xe63e</div>
			<div id='sui-lastItem' class='sui-resDisplay' title='Go to last page'>&#xe63c</div>
		</div>




			`;
		$("#sui-footer").html(str.replace(/\t|\n|\r/g,""));											// Remove format and add to div
		$("#sui-itemPage").val(this.curPage+1);														// Set page number
	}

	DrawSearchUI()																				// DRAW SEARCH UI SECTION
	{
	}


} // SearchUI class closure
