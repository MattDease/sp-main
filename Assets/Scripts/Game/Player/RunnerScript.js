#pragma strict

import System.Collections.Generic;

// Set in editor
public var cameraPrefab : GameObject;

private var player : Runner;
private var model : GameObject;
private var team : Team;
private var camContainer : GameObject;
private var platform : GameObject;

private var currentSpeed : float = Config.RUN_SPEED;
private var runningPlane : Vector3;
private var cameraOffset : Vector2 = Vector2.zero;
private var prevPlatformPos : Vector2 = Vector2.zero;
private var isCrouched : boolean = false;
private var isAttacking : boolean = false;
private var isGrounded : boolean = true;
private var canDoubleJump: boolean = false;
private var crouchTime : float = 0;
private var attackTime : float = 0;

// TODO either move to config file or use mesh info
private var runnerWidth : float = 0.6;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = Util.GetPlayerById(networkView.viewID.owner.guid) as Runner;
    model = gameObject.transform.Find("debug_runner").gameObject;
    team = player.getTeam();

    player.gameObject = gameObject;
    player.script = this;
    player.controller = this;

    player.gameObject.transform.position.z = runnerWidth/2;

    if(networkView.isMine){
        camContainer = Instantiate(cameraPrefab, Vector3.zero,  Quaternion.identity);

        var viewport : Vector3 = Camera.main.WorldToViewportPoint(gameObject.transform.position);
        viewport.x += Config.CAMERA_LEAD;
        Camera.main.transform.localPosition += Camera.main.ViewportToWorldPoint(viewport);

        player.gameObject.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;

        runningPlane = player.getPosition();
    }
    else{
        // Change layer so collisions with local player is ignored
        player.gameObject.layer = LayerMask.NameToLayer("Remote Players");

        // TODO Fix. Assumes own player is always the first to be instantiated
        player.gameObject.transform.position.z += team.getRunners(false).Count * runnerWidth;
    }
}

// Do physics changes here
function FixedUpdate(){
    if(networkView.isMine){
        if(platform){
            gameObject.transform.position += Vector2(platform.transform.position.x, platform.transform.position.y) - prevPlatformPos;
            prevPlatformPos = platform.transform.position;
        }
        player.gameObject.rigidbody.velocity.x = currentSpeed;
    }
}

function Update(){
    if(networkView.isMine && player.isAlive()){
        var position : Vector3 = player.getPosition();
        if(Camera.main.WorldToViewportPoint(position).x < 0 || position.y < -1){
            GameObject.Find("/GameManager").networkView.RPC("killRunner", RPCMode.OthersBuffered, player.getId());
            player.kill();
            return;
        }
        if(isCrouched && Time.timeSinceLevelLoad - crouchTime > Config.CROUCH_DURATION){
            unCrouch();
        }
        if(isAttacking && Time.timeSinceLevelLoad - attackTime > Config.ATTACK_DURATION){
            stopAttack();
        }
        if(!platform){
            var hit : RaycastHit;
            if(Physics.Raycast(gameObject.transform.position, Vector3.down, hit, 1)) {
                if(hit.collider.gameObject.CompareTag("moveableX") || hit.collider.gameObject.CompareTag("moveableY")){
                    platform = hit.collider.gameObject;
                    prevPlatformPos = platform.transform.position;
                }
            }
        }
        checkKeyboardInput();
    }
}

function LateUpdate(){
    if(networkView.isMine){
        if(player.isAlive()){
            cameraOffset += getCameraOffset();
            if(cameraOffset.x < 0){
                cameraOffset.x = 0;
            }
            camContainer.transform.position = player.getPosition() + cameraOffset;
        }
        else{
            camContainer.transform.position = team.getObserverCameraPosition();
        }
    }
}

function jump(){
    if(isCrouched){
        unCrouch();
    }
    else{
        if(isGrounded || !isGrounded && canDoubleJump) {
            player.gameObject.rigidbody.velocity.y = Config.JUMP_SPEED;
            if(canDoubleJump) canDoubleJump = false;
        }
    }
}

function crouch(){
    crouchTime = Time.timeSinceLevelLoad;

    if(isCrouched) return;
    isCrouched = true;

    // TEMP. replace with animation
    player.gameObject.transform.localScale.y = 0.5;
}

function unCrouch(){
    if(!isCrouched) return;
    isCrouched = false;

    // TEMP. replace with animation
    player.gameObject.transform.localScale.y = 1;
}

function attack(){
    attackTime = Time.timeSinceLevelLoad;

    if(isAttacking) return;
    model.renderer.material.color = Color.green;
    isAttacking = true;
}

function stopAttack(){
    if(!isAttacking) return;
    model.renderer.material.color = Color.gray;
    isAttacking = false;
}

function startWalk(){
    currentSpeed = Config.WALK_SPEED;
}

function stopWalk(){
    currentSpeed = Config.RUN_SPEED;
}

function OnTriggerEnter(other : Collider){
    if(other.gameObject.CompareTag("enemy")){
        if(isAttacking){
            other.gameObject.GetComponent(EnemyScript).notifyKill();
        }
        else{
            GameObject.Find("/GameManager").networkView.RPC("killRunner", RPCMode.OthersBuffered, player.getId());
            player.kill();
        }
    }
    else if(other.gameObject.CompareTag("coin")){
        other.gameObject.GetComponent(CoinScript).notifyKill();
    }
}

function OnCollisionEnter(theCollision : Collision){
    if(theCollision.gameObject.layer == LayerMask.NameToLayer("Ground Segments")){
        isGrounded = true;
        canDoubleJump = false;
    }
}

//consider when character is jumping .. it will exit collision.
function OnCollisionExit(theCollision : Collision){
    if(theCollision.gameObject.layer == LayerMask.NameToLayer("Ground Segments")) {
        isGrounded = false;
        canDoubleJump = true;
        if(platform && theCollision.gameObject.CompareTag("moveableX")){
            platform = null;
        }
    }
}

private function getCameraOffset() : Vector2 {
    var leader : Vector3 = Vector3.zero;
    for(var player : Runner in this.team.getRunners(true).Values){
        if(!Util.IsNetworkedPlayerMe(player)){
            var position : Vector3 = player.getPosition();
            position.y = runningPlane.y;
            position.z = runningPlane.z;
            var viewport : Vector3 = Camera.main.WorldToViewportPoint(position);
            if(viewport.x > leader.x && (viewport.x > Config.MAX_RUNNER_X || cameraOffset.x != 0)){
                leader = viewport;
            }
        }
    }
    if(leader != Vector3.zero){
        var maxX : float = Camera.main.ViewportToWorldPoint(Vector3(Config.MAX_RUNNER_X, leader.y, leader.z)).x;
        var leadX : float = Camera.main.ViewportToWorldPoint(leader).x;
        return Vector2(leadX - maxX, 0);
    }
    else{
        return Vector2.zero;
    }
}

/*
 *  INPUT
 */
function checkKeyboardInput(){
    if(networkView.isMine){
        if(Input.GetKeyDown(KeyCode.W)){
            jump();
        }
        if(Input.GetKeyDown(KeyCode.S)){
            crouch();
        }
        if(Input.GetKeyDown(KeyCode.A)){
            startWalk();
        }
        if(Input.GetKeyUp(KeyCode.A)){
            stopWalk();
        }
        if(Input.GetKeyUp(KeyCode.D)){
            // toss();
        }
        if(Config.DEBUG){
            if(Input.GetKeyUp(KeyCode.K)){
                GameObject.Find("/GameManager").networkView.RPC("killRunner", RPCMode.OthersBuffered, player.getId());
                player.kill();
            }
        }
    }
}

function OnEnable(){
    if(networkView.isMine){
        Gesture.onSwipeE += OnSwipe;
        Gesture.onLongTapE += OnLongTap;
        Gesture.onTouchDownE += OnTouch;
        Gesture.onTouchUpE += OnRelease;
        Gesture.onMouse1DownE += OnTouch;
        Gesture.onMouse1UpE += OnRelease;
    }
}

function OnDisable(){
    if(networkView.isMine){
        Gesture.onSwipeE -= OnSwipe;
        Gesture.onLongTapE -= OnLongTap;
        Gesture.onTouchDownE -= OnTouch;
        Gesture.onTouchUpE -= OnRelease;
        Gesture.onMouse1DownE -= OnTouch;
        Gesture.onMouse1UpE -= OnRelease;
    }
}

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
    // FIXME triggering attack here is wrong
    attack();

    startWalk();
}
function OnRelease(pos:Vector2){
    stopWalk();
}
