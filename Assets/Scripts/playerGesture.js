#pragma strict

public var model:Transform;
private var body:Rigidbody;
private var eggBody:Rigidbody;

private var egg: GameObject;
private var player: GameObject;

private var isJumping : boolean = false;
private var isCrouching : boolean = false;
private var isRunning : boolean = false;
private var isTossingLeft : boolean = false;
private var isTossingRight : boolean = false;
private var isWalking : boolean = false;
private var isCatchingEgg : boolean = false;
private var hasEgg : boolean = false;

//Variables that determine speed and height.
private var WALK_SPEED : Vector3 = Vector3 (1, 0, 0);
private var RUN_SPEED : Vector3 = Vector3 (4, 0, 0);
private var MAX_HEIGHT : int = 0.5f;
private var JUMP_SPEED : int = 20;

function Start(){
    player = model.gameObject;
    egg = GameObject.Find("egg");
    eggBody = egg.GetComponent(Rigidbody);
    eggBody.freezeRotation = true;
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
	if(isJumping && !hasEgg) {
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

	if(isWalking) {
	  	Walk();
	} else {
	 Run();
	}

    if(hasEgg){
        Parent(player, egg);
    }

}


/* Swipe Info Contains
	Index of Finger = sw.index;
	Angle of Swipe Vector = sw.angle;
	Direction = sw.direction;
	Duration = sw.duration;
	Speed = sw.speed;
	Start Point = sw.startPoint;
	End Point = sw.endPoint;
*/

function OnSwipe(sw:SwipeInfo){
	//Figure out what direction we are swiping
	if(sw.direction.x > 0  && sw.angle > 45 && sw.angle < 135 ) {
		isJumping = true;
	}

	if(sw.direction.x < 0  && sw.angle > 235 && sw.angle < 315 ) {
		isCrouching = true;
	}

	if(sw.direction.y > 0  && ((sw.angle > 0 && sw.angle < 45) || (sw.angle > 315 && sw.angle < 360)) )  {
		isTossingLeft = true;
        Toss(sw.direction, sw.angle);
	}

	if(sw.direction.y < 0  && sw.angle > 135 && sw.angle < 235 ) {
		isTossingRight = true;
        Toss(sw.direction, sw.angle);
	}
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){
	Debug.Log("On Long Tap");
    //Just for temp
    hasEgg = true;
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
	body.MovePosition(body.position + RUN_SPEED * Time.deltaTime);

}

function Toss(direction:Vector3, angle){
    if(hasEgg){
        hasEgg = false;
        Unparent(player, egg);
        eggBody.AddForce(direction);
    }
}

function Parent (parentObj:GameObject, childObj:GameObject){
      Debug.Log("Parent");

      childObj.transform.position = parentObj.transform.position;
      childObj.transform.position += Vector3(2, 3, 0);
      childObj.transform.parent = parentObj.transform;
}

function Unparent(parentObj:GameObject, childObj:GameObject){

    Debug.Log("Unparent");
    var tempPos = childObj.transform.position;
    if(parentObj.transform.childCount > 0) {
        var toRemove = parentObj.transform.Find("egg");
        toRemove.transform.parent = null;
        toRemove.transform.position = tempPos;
    }
      //parentObj.transform.DetachChildren();
}
