#pragma strict

public var projectileObject:Transform;
private var body:Rigidbody;
private var labelTimer:float=-1;

function Start(){
	body=projectileObject.gameObject.GetComponent(Rigidbody);
}

function OnEnable(){
	Gesture.onSwipeE += OnSwipe;
	Gesture.onLongTapE += OnLongTap;
	Gesture.onTouchE += OnTouch;
}

function OnDisable(){
	Gesture.onSwipeE -= OnSwipe;
	Gesture.onLongTapE -= OnLongTap;
	Gesture.onTouchE -= OnTouch;
}

function OnSwipe(sw:SwipeInfo){
	//show the swipe info
	var labelText:String="Swipe Detected, ";
	if(sw.isMouse) labelText+="mouse "+sw.index.ToString()+ " ";
	else labelText+="finger "+sw.index.ToString()+" ";

	labelText+="Angle: " + sw.angle.ToString() + " ";
	labelText+="Direction X: " + sw.direction.x.ToString() + " ";
	labelText+="Direction Y: " + sw.direction.y.ToString() + " ";
	labelText+="Duration: " + sw.duration.ToString() + " ";
	labelText+="Speed: " + sw.speed.ToString() + " ";
	labelText+="Start Pos X: " + sw.startPoint.x.ToString() + " ";
	labelText+="Start Pos Y: " + sw.startPoint.y.ToString() + " ";
	labelText+="End Pos X: " + sw.endPoint.x.ToString() + " ";
	labelText+="End Pos Y: " + sw.endPoint.y.ToString();
	//Debug.Log(labelText);

	//Figure out what direction we are swiping
	if(sw.direction.x > 0  && sw.angle > 45 && sw.angle < 135 ) {
		Debug.Log("Swipe Up");
	}

	if(sw.direction.x < 0  && sw.angle > 235 && sw.angle < 315 ) {
		Debug.Log("Swipe Down");
	}

	if(sw.direction.y > 0  && ((sw.angle > 0 && sw.angle < 45) || (sw.angle > 315 && sw.angle < 360)) )  {
		Debug.Log("Swipe Right");
	}


	if(sw.direction.y < 0  && sw.angle > 135 && sw.angle < 235 ) {
		Debug.Log("Swipe Left");
	}
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){
	Debug.Log("On Long Tap");
}

function OnTouch(pos:Vector2){
	//Debug.Log("OnTouch - gives x and y coords");
}
