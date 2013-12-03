#pragma strict

public var model:Transform;
private var body:Rigidbody;
private var eggBody:Rigidbody;

private var egg: GameObject;
private var player: GameObject;

//Booleans to determine what action is currently happened. Used to trigger in the update function
public var isJumping : boolean = false;
public var isCrouching : boolean = false;
public var isRunning : boolean = false;
public var isTossingLeft : boolean = false;
public var isTossingRight : boolean = false;
public var isWalking : boolean = false;
public var isCatchingEgg : boolean = false;
public var hasEgg : boolean = false;

//Variables that determine speed and height.
private var WALK_SPEED : Vector3 = Vector3 (25, 0, 0);
private var RUN_SPEED : Vector3 = Vector3 (50, 0, 0);
private var MAX_HEIGHT : float = 50;
private var JUMP_SPEED : float = 30;

//temp
private var debugPlayer : GameObject;

function Start(){
    debugPlayer = GameObject.Find(PlayerPrefs.GetString("playerName") + "_player");

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
    if(isJumping && ! hasEgg) {

            if(model.transform.position.y > MAX_HEIGHT) {
                    body.AddForce(0,0,0);
                    body.velocity = Vector3(0,0,0);
                    isJumping = false;
            } else body.AddForce(0, JUMP_SPEED, 0);
    }

    if(isCrouching && !hasEgg){
            /*TODO: Add actions for crouching.
     Will play correct animation and change the size of the box collider to be shorter
      */
        if(model.transform.position.y > MAX_HEIGHT) {
                body.AddForce(0,0,0);
                body.velocity = Vector3(0,0,0);
                isCrouching = false;
            } else body.AddForce(0, JUMP_SPEED, 0);
    }

    if(isWalking) Walk();
    else Run();

    if(hasEgg){
       Parent(player, egg);
    }
    debugPlayer.transform.position = model.transform.position;
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
        body.MovePosition(body.position - WALK_SPEED * Time.deltaTime);
}

function Run() {
        body.MovePosition(body.position - RUN_SPEED * Time.deltaTime);

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

    Physics.IgnoreCollision(parentObj.collider, childObj.collider);

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
