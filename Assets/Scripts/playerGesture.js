#pragma strict

public var model:Transform;
private var body:Rigidbody;
private var eggBody:Rigidbody;

private var egg: GameObject;
private var player: GameObject;

//Booleans to determine what action is currently happened. Used to trigger in the update function
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
private var MAX_HEIGHT : float = 0.5;
private var JUMP_SPEED : float = 20;

function Start(){

    egg = GameObject.Find("egg");
    eggBody = egg.GetComponent(Rigidbody);
    eggBody.freezeRotation = true;

    player = model.gameObject;
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

	if(isCrouching && !hasEgg){
		/*TODO: Add actions for crouching.
         Will play correct animation and change the size of the box collider to be shorter
	  */
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
        Toss(sw.direction, sw.speed);
	}

	if(sw.direction.y < 0  && sw.angle > 135 && sw.angle < 235 ) {
		isTossingRight = true;
        Toss(sw.direction, sw.speed);
	}
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){
    //Just for temp  - this will be set somewhere else!
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

function Toss(direction:Vector3, speed){
    if(hasEgg){
        hasEgg = false;
        Unparent(player, egg);

        /*TODO: AI to choice who the closest team mate is a throw the egg to them.
        We should use the swipe speed to actually influence the speed of the toss.
        */
        eggBody.AddForce(direction);
    }
}

function Parent (parentObj:GameObject, childObj:GameObject){
      childObj.transform.position = parentObj.transform.position;
      childObj.transform.position += Vector3(2, 3, 0);
      childObj.transform.parent = parentObj.transform;
}

function Unparent(parentObj:GameObject, childObj:GameObject){

    //Save the position of the child so we can make the child stop following the parents position.
    var tempPos = childObj.transform.position;

    if(parentObj.transform.childCount > 0) {
        childObj.transform.parent = null;
        childObj.transform.position = tempPos;
    }
}
