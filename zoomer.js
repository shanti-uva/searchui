///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ZOOMER
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Zoomer(url, startZoom, overviewSize) 						//	DRAW ZOOMER
{
	this.div="#previewDiv";													// Current div selector
 	var _this=this;															// Context for callbacks
	var str="<div id='zoomerOuterDiv' style='border:1px solid #666;overflow:hidden;margin-right:3px;margin-bottom:3px;'>";	// Make outer div
 	str+="<div id='zoomerDiv' </div></div>";								// Make Zoomer div
	$(this.div).height("auto");												// Height is auto
	$(this.div).append(str);												// Add div
  	this.zoomerScale=startZoom;												// Init scale
	this.zoomerOverviewSize=overviewSize;									// Set size
	str="<img id='zoomerImg' src='"+url+"' ";								// Add image
	str+="height='100%' width='100%'>";										// Size
	$("#zoomerDiv").append(str);											// Add image to zoomer
	
	$("#zoomerImg").on("load", function(e) {								// WHEN IMAGE IS LOADED
		_this.zoomerWidth=$(this).width();									// Get true width
		_this.zoomerHeight=$(this).height();								// Get true height
		_this.zoomerAsp=_this.zoomerHeight/_this.zoomerWidth;				// Get aspect ratio
		_this.zoomerX=_this.zoomerY=.5; 									// Default center
		$("#zoomerOuterDiv").height($("#zoomerOuterDiv").width()*_this.zoomerAsp);
		_this.DrawZoomerOverview(url);										// Reflect pos in overview
		_this.PositionZoomer();												// Position it
		});

	$("#zoomerDiv").draggable({ drag:function(event,ui) {					// DRAGGABLE
		var w=$("#zoomerDiv").width();										// Get image width
		var h=$("#zoomerDiv").height();										// Get image height
		var s=this.zoomerScale;												// Current scale
		_this.DrawZoomerOverview(url);										// Reflect pos in overview
		}});	 
	}

Zoomer.prototype.PositionZoomer=function() 								// POSITION ZOOMER
{
	var s=this.zoomerScale;													// Point at scale
	var w=this.zoomerWidth*s;												// Get image width scaled
	var h=this.zoomerHeight*s;												// Get image height
	$("#zoomerDiv").width(w);												// Size it
	$("#zoomerDiv").height(h);												// Size it
	var l=w*this.zoomerX-(w/s/2);											// Get left
	var t=h*this.zoomerY-(h/s/2);											// Get top
	$("#zoomerDiv").css({"left":-l+"px","top":-t+"px"});					// Position zoomer	
	var l=$(this.div).position().left;										// Left boundary
	var r=l-0+(w/s-w+14);													// Right boundary
	var t=$(this.div).position().top;										// Top boundary
	var b=t-0+(h/s-h+36);													// Bottom boundary
	$("#zoomerDiv").draggable("option",{ containment: [r,b,l,t] } );		// Reset containment
}

Zoomer.prototype.DrawZoomerOverview=function(url) 						// DRAW ZOOMER OVERVIEW
{
	var str;
	var s=this.zoomerScale;													// Scale
	if (!this.zoomerOverviewSize)
		return;
 	var _this=this;															// Context for callbacks
	var w=$("#zoomerOuterDiv").width()/this.zoomerOverviewSize;				// Width of frame
	var h=$("#zoomerOuterDiv").height()/this.zoomerOverviewSize;			// Height of frame
	var h=w*h/w;															// Height based on aspect
	var p=$("#zoomerOuterDiv").position();									// Offset in frame
	
	if ($("#zoomerOverDiv").length == 0)  {									// If not initted yet 
		var css = { position:"absolute",									// Frame factors
					left:w*this.zoomerOverviewSize-w+p.left+"px",
					width:w+"px",
					height:h+"px",
					top:h*this.zoomerOverviewSize-h+p.top+"px",
					"border-left":"1px solid #ccc",
					"border-top":"1px solid #eee"
					};
		
		str="<div id='zoomerOverDiv'></div>";								// Frame box div
		$("#zoomerOuterDiv").append(str);									// Add to div
		$("#zoomerOverDiv").css(css);										// Set overview frame
		str="<img src='"+url+"' ";											// Name
		str+="height='"+h+"' ";												// Height
		str+="width='"+w+"' >";												// Width
		$("#zoomerOverDiv").append(str);									// Add image to zoomer
		if (typeof(DrawZoomerOverviewGrid) == "function")					// If not embedded
			DrawZoomerOverviewGrid();										// Draw grid in overview if enabled
			var css = { position:"absolute",								// Box factors
						border:"1px solid #eee",
						"z-index":3,
						"background-color":"rgba(220,220,220,0.4)"
						};
		str="<div id='zoomerOverBox'></div>";								// Control box div
		$("#zoomerOverDiv").append(str);									// Add control box to overview frame
		$("#zoomerOverBox").css(css);										// Set overview frame
		$("#zoomerOverBox").draggable({ containment:"parent", 				// Make it draggable 
							drag:function(event,ui) {						// Handle drag						
								var w=$("#zoomerOverDiv").width();			// Overview width
								var pw=$("#zoomerDiv").width();				// Zoomer width
								var h=$("#zoomerOverDiv").height();			// Overview hgt
								var ph=$("#zoomerDiv").height();			// Zoomer hgt
								var s=_this.zoomerScale;					// Current scale
								var x=Math.max(0,ui.position.left/w*pw);	// Calc left
								var y=Math.max(0,ui.position.top/h*ph);		// Calc top
								_this.zoomerX=(x+(pw/s/2))/pw; 				// Get center X%
								_this.zoomerY=(y+(ph/s/2))/ph;  			// Get center Y%
								$("#zoomerDiv").css({"left":-x+"px","top":-y+"px"});	// Position zoomer	
								}
							 });		
		$("#zoomerOverBox").resizable({ containment:"parent",				// Resizable
								aspectRatio:true,
								minHeight:12,
								resize:function(event,ui) {					// On resize
									var w=$("#zoomerOverDiv").width();		// Overview width
									var pw=$("#zoomerDiv").width();			// zoomer width
									var h=$("#zoomerOverDiv").height();		// Overview hgt
									var ph=$("#zoomerDiv").height();		// zoomer hgt
									_this.zoomerScale=Math.max(w/ui.size.width,1); 	// Get new scale, cap at 100%					
									var s=_this.zoomerScale;				// Current scale
									var x=Math.max(0,ui.position.left/w*pw);// Calc left
									var y=Math.max(0,ui.position.top/h*ph);	// Calc top
									_this.zoomerX=(x+(pw/s/2))/pw; 			// Get center X%
									_this.zoomerY=(y+(ph/s/2))/ph;  		// Get center Y%
									_this.PositionZoomer();					// Redraw
									}
								}); 
			}
		var x=$("#zoomerDiv").css("left").replace(/px/,"");					// Get x pos
		x=-$("#zoomerOuterDiv").width()/2;									// Center it
		x=-x/w/this.zoomerOverviewSize*w/this.zoomerScale;					// Scale to fit
		var y=$("#zoomerDiv").css("top").replace(/px/,"");					// Get y pos
		y=-$("#zoomerOuterDiv").height()/2;									// Center it
		y=-y/h/this.zoomerOverviewSize*h/this.zoomerScale;					// Scale to fit
		$("#zoomerOverBox").width(w/this.zoomerScale).height(h/this.zoomerScale);	// Set size
		$("#zoomerOverBox").css({"left":x+"px","top":y+"px"});				// Position control box		
}
