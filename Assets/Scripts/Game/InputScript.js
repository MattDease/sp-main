#pragma strict

// TODO - lots...including add commander control support

private var player : Player;

function Start () {
    player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
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
    // TODO - rewrite
    //Figure out what direction we are swiping
    if(sw.direction.x > 0  && sw.angle > 45 && sw.angle < 135 ) {
        jump();
    }

    if(sw.direction.x < 0  && sw.angle > 235 && sw.angle < 315 ) {
        crouch();
    }

    // TODO find target player based on swipe direction and pass them to a toss function
    // if(sw.direction.y > 0  && ((sw.angle > 0 && sw.angle < 45) || (sw.angle > 315 && sw.angle < 360)) )  {
    //     Toss(sw.direction, sw.speed);
    // }

    // if(sw.direction.y < 0  && sw.angle > 135 && sw.angle < 235 ) {
    //     Toss(sw.direction, sw.speed);
    // }
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){

}

function OnTouch(pos:Vector2){
    toggleWalk(true);
}
function OnRelease(pos:Vector2){
    toggleWalk(false);
}

function Update () {
    if(Input.GetKeyDown(KeyCode.W)){
        jump();
    }
    if(Input.GetKeyDown(KeyCode.S)){
        crouch();
    }
    if(Input.GetKeyDown(KeyCode.A)){
        toggleWalk(true);
    }
    if(Input.GetKeyUp(KeyCode.A)){
        toggleWalk(false);
    }
    if(Input.GetKeyUp(KeyCode.D)){
        // toss();
    }
}


/*** Actions ***/

function jump(){
    (player.controller as RunnerScript).jump();
}

function crouch(){
    (player.controller as RunnerScript).crouch();
}

function toggleWalk(state:boolean){
    if(state){
        (player.controller as RunnerScript).startWalk();
    }
    else{
        (player.controller as RunnerScript).stopWalk();
    }
}
