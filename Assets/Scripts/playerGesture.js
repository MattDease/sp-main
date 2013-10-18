#pragma strict

public var model:Transform;
private var body:Rigidbody;
private var labelTimer:float=-1;

private var isJumping : boolean = false;
private var isCrouching : boolean = false;
private var isRunning : boolean = false;
private var isTossingLeft : boolean = false;
private var isTossingRight : boolean = false;
private var isWalking : boolean = false;

private var WALK_SPEED : Vector3 = Vector3 (1, 0, 0);
private var RUN_SPPED : Vector3 = Vector3 (4, 0, 0);


private var MAX_HEIGHT : int = 0.5f;
private var JUMP_SPEED : int = 20;

function Start(){
	body=model.gameObject.GetComponent(Rigidbody);
    body.freezeRotation = true;
}

function OnEnable(){
	Gesture.onSwipeE += OnSwipe;
	Gesture.onLongTapE += OnLongTap;
	Gesture.onTouchE += OnTouch;
	Gesture.onTouchUpE += OnRelease;
	Gesture.onMouse1E += OnTouch;
	Gesture.onMouse1UpE += OnRelease;

}

function OnDisable(){
	Gesture.onSwipeE -= OnSwipe;
	Gesture.onLongTapE -= OnLongTap;
	Gesture.onTouchE -= OnTouch;
	Gesture.onTouchUpE -= OnRelease;
	Gesture.onMouse1E -= OnTouch;
	Gesture.onMouse1UpE -= OnRelease;
}

function Update() {

	/*To make a jump, we add a force in the y direction.
	When he reaches a max jump height - remove added force and set jumping to false.*/
	if(isJumping) {
		body.AddForce(0, JUMP_SPEED, 0);

		if(model.transform.position.y > MAX_HEIGHT) {
			body.AddForce(0,0,0);
			body.velocity = Vector3(0,0,0);
			isJumping = false;
		}
	}

	if(isCrouching){
		//Add actions here
	}

	if(isTossingLeft){
		//Add actions here
	}

	if(isTossingRight) {
		//Add actions here
	}


	if(isWalking) {
	  	Walk();
	} else {
	 Run();
	}

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
		isJumping = true;
	}

	if(sw.direction.x < 0  && sw.angle > 235 && sw.angle < 315 ) {
		isCrouching = true;
	}

	if(sw.direction.y > 0  && ((sw.angle > 0 && sw.angle < 45) || (sw.angle > 315 && sw.angle < 360)) )  {
		isTossingLeft = true;
	}

	if(sw.direction.y < 0  && sw.angle > 135 && sw.angle < 235 ) {
		isTossingRight = true;
	}
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){
	Debug.Log("On Long Tap");
}

function OnTouch(pos:Vector2){
	isWalking = true;
}
function OnRelease(pos:Vector2){
	isWalking = false;
}

function Walk() {
	body.MovePosition(body.position + WALK_SPEED * Time.deltaTime);
}

function Run() {
		body.MovePosition(body.position + RUN_SPPED * Time.deltaTime);

}
