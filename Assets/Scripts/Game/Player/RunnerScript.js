#pragma strict

import System.Collections.Generic;

// Set in editor
public var cameraPrefab : GameObject;

public var depth : float = 0;

private var player : Runner;
private var model : GameObject;
private var animator : Animator;
private var team : Team;
private var gameManager : GameObject;
private var camContainer : GameObject;
private var platform : GameObject = null;
private var egg : GameObject;
private var eggScript : EggScript;

private var targetSpeed : float = Config.RUN_SPEED;
private var currentSpeed : float = Config.RUN_SPEED;
private var runningPlane : Vector3;
private var velocity : Vector3 = Vector3.zero;
private var cameraOffset : Vector2 = Vector2.zero;
private var prevPlatformPos : Vector2 = Vector2.zero;
private var isAttacking : boolean = false;
private var isDoubleJump: boolean = false;
private var lastSpeedChange : float = 0;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    gameManager = GameObject.Find("/GameManager");
}

@RPC
function initRunner(playerId : String, teamId : int){
    player = Util.GetPlayerById(playerId) as Runner;
    model = gameObject.transform.Find("model").gameObject;
    animator = model.GetComponent(Animator);
    team = player.getTeam();

    player.gameObject = gameObject;
    player.script = this;
    player.controller = this;

    if(networkView.isMine){
        camContainer = Instantiate(cameraPrefab, Vector3.zero,  Quaternion.identity);

        var viewport : Vector3 = Camera.main.WorldToViewportPoint(gameObject.transform.position);
        viewport.x += Config.CAMERA_LEAD;
        Camera.main.transform.localPosition += Camera.main.ViewportToWorldPoint(viewport);

        player.gameObject.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;

        runningPlane = player.getPosition();
    }
    else{
        var me : Player = gameManager.GetComponent(PlayerScript).getSelf();

        team.runnerCreationCount++;

        // Change layer so collisions with local player is ignored
        player.gameObject.layer = LayerMask.NameToLayer("Remote Players");

        player.gameObject.transform.position.z += team.runnerCreationCount * Config.RUNNER_LANE_WIDTH;
        if(teamId != me.getTeamId() || me.GetType() == Commander){
            player.gameObject.transform.position.z -= Config.RUNNER_LANE_WIDTH;
        }
        transform.position.z += (teamId == me.getTeamId()) ? 0 : Config.TEAM_DEPTH_OFFSET;
        depth = transform.position.z;
        Util.Toggle(gameObject, false);
        Invoke("show", 0.3);
    }
}

// Do physics changes here
function FixedUpdate(){
    if(networkView.isMine && player.isAlive()){
        player.gameObject.rigidbody.velocity.x = currentSpeed;
    }
}

function Update(){
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    var transState : AnimatorTransitionInfo = animator.GetAnimatorTransitionInfo(0);
    if(animState.IsName("Base Layer.Locomotion")){
        animator.SetBool("IsDoubleJump", false);
        animator.SetBool("HasDoubleJumped", false);
        animator.SetBool("Toss", false);
    }
    else if(animState.IsName("Base Layer.Jump")){
        if(!animator.IsInTransition(0)){
            animator.SetBool("Jump", false);
        }
        if(isDoubleJump){
            animator.SetBool("HasDoubleJumped", true);
        }
    }
    if(animState.IsName("Base Layer.AttackRight")){
        animator.SetBool("Attack", false);
    }
    if(Time.time - lastSpeedChange <= Config.SPEED_TRANSITION_DURATION){
        var percent : float = (Time.time - lastSpeedChange) / Config.SPEED_TRANSITION_DURATION;
        if(targetSpeed == Config.WALK_SPEED){
            animator.SetFloat("Speed", 0.2 + percent * 0.3);
            currentSpeed = Config.RUN_SPEED - (percent * (Config.RUN_SPEED - Config.WALK_SPEED));
        }
        else if(targetSpeed == Config.RUN_SPEED){
            animator.SetFloat("Speed", 0.5 - percent * 0.3);
            currentSpeed = Config.WALK_SPEED + (percent * (Config.RUN_SPEED - Config.WALK_SPEED));
        }
    }
    if(networkView.isMine && player.isAlive()){
        var position : Vector3 = player.getPosition();
        if(Camera.main.WorldToViewportPoint(position).x < 0 || position.y < -1){
            killMe();
            return;
        }
        if(!platform){
            var hit : RaycastHit;
            var pos : Vector3 = gameObject.transform.position;
            pos.y += 0.1;
            if(Physics.Raycast(pos, Vector3.down, hit, 1)) {
                if(hit.collider.gameObject.CompareTag("moveableX") || hit.collider.gameObject.CompareTag("moveableY")){
                    platform = hit.collider.gameObject;
                    prevPlatformPos = platform.transform.position;
                }
            }
        }
        if(platform){
            gameObject.transform.position += Vector2(platform.transform.position.x, platform.transform.position.y) - prevPlatformPos;
            prevPlatformPos = platform.transform.position;
        }
        var grounded : boolean = isGrounded();
        if(grounded != animator.GetBool("IsGrounded")){
            if(grounded){
                networkView.RPC("land", RPCMode.All);
            }
            else{
                networkView.RPC("takeoff", RPCMode.All);
                platform = null;
            }
        }
        checkCrush();
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
        else if(team.getRunners(true).Count > 0){
            var targetPosition : Vector3 = team.getObserverCameraPosition();
            camContainer.transform.position = Vector3.SmoothDamp(camContainer.transform.position, targetPosition, velocity, 0.2);
        }
    }
}

function isGrounded() : boolean {
    var hit : RaycastHit;
    var pos : Vector3 = gameObject.transform.position;
    pos.y += 0.1;
    if(Physics.Raycast(pos, Vector3.down, hit, 0.2)) {
        if(hit.collider.gameObject.layer == LayerMask.NameToLayer("Ground Segments")){
            return true;
        }
    }
    return false;
}

function checkCrush() {
    var hits : RaycastHit[] = Physics.RaycastAll (transform.position, Vector3.up, transform.collider.bounds.size.y * 0.8);
    for (var i = 0; i < hits.Length; i++){
        var hit : RaycastHit = hits[i];
        var go : GameObject = hit.collider.gameObject;
        if(go.CompareTag("moveableY") && go.transform.GetComponent(PlatformScript).gravity){
            killMe();
        }
    }
}

function show(){
    Util.Toggle(gameObject, true);
}

function killMe(){
    gameManager.networkView.RPC("killRunner", RPCMode.All, player.getId());
}

@RPC
function jump(){
    var grounded : boolean = isGrounded();
    if(grounded || (!grounded && !isDoubleJump)) {
        var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
        if(animState.IsName("Base Layer.Locomotion")){
            animator.SetBool("Jump", true);
            player.gameObject.rigidbody.velocity.y = Config.JUMP_SPEED;
        }
        else if(animState.IsName("Base Layer.Jump")){
            animator.SetBool("IsDoubleJump", true);
            isDoubleJump = true;
            player.gameObject.rigidbody.velocity.y = Config.JUMP_SPEED;
        }
    }
}

@RPC
function takeoff(){
    animator.SetBool("IsGrounded", false);
}

@RPC
function land(){
    animator.SetBool("IsGrounded", true);
    isDoubleJump = false;
}

@RPC
function attack(){
    animator.SetTrigger("Attack");
}

@RPC
function grab(){
    animator.SetTrigger("Catch");
}

function toss(forward : boolean){
    if(eggScript.isHoldingEgg(player.getId())){
        var target = team.getClosestRunner(player, forward);
        if(target){
            networkView.RPC("syncToss", RPCMode.All);
            egg.networkView.RPC("startThrow", RPCMode.All, target.getId());
        }
    }
}

@RPC
function syncToss(){
    animator.SetBool("Catch", false);
    animator.SetBool("Toss", true);
}

@RPC
function startWalk(){
    targetSpeed = Config.WALK_SPEED;
    lastSpeedChange = Time.time;
}

@RPC
function stopWalk(){
    targetSpeed = Config.RUN_SPEED;
    lastSpeedChange = Time.time;
}

function OnTriggerEnter(other : Collider){
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    var transState : AnimatorTransitionInfo = animator.GetAnimatorTransitionInfo(0);
    if(other.gameObject.CompareTag("enemy")){
        var enemyScript : EnemyScript = other.gameObject.GetComponent(EnemyScript);
        if(animState.IsName("Base Layer.AttackRight") || transState.IsUserName("startAttack") || transState.IsUserName("stopAttack")){
            enemyScript.notifyKill();
        }
        else if(networkView.isMine && enemyScript.isAlive()){
            killMe();
            enemyScript.notifyAttack();
        }
    }
    else if(other.gameObject.CompareTag("coin")){
        other.gameObject.GetComponent(CoinScript).notifyKill();
    }
}

function OnCollisionEnter(theCollision : Collision){

}

function OnCollisionExit(theCollision : Collision){

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
            networkView.RPC("jump", RPCMode.All);
        }
        if(Input.GetKeyDown(KeyCode.A)){
            networkView.RPC("startWalk", RPCMode.All);
        }
        if(Input.GetKeyUp(KeyCode.A)){
            networkView.RPC("stopWalk", RPCMode.All);
        }
        if(Input.GetKeyUp(KeyCode.D)){
            networkView.RPC("attack", RPCMode.All);
        }
        if(Config.USE_EGG){
            if(Input.GetKeyUp(KeyCode.R)){
                toss(false);
            }
            if(Input.GetKeyUp(KeyCode.T)){
                toss(true);
            }
        }
        if(Config.DEBUG){
            if(Input.GetKeyUp(KeyCode.C)){
                networkView.RPC("grab", RPCMode.All);
            }
            if(Input.GetKeyUp(KeyCode.K)){
                killMe();
            }
        }
    }
}

function OnEnable(){
    animator.SetBool("Idle", false);
    if(networkView.isMine){
        if(Config.USE_EGG){
            egg = team.getEgg();
            eggScript = egg.GetComponent(EggScript);
        }

        Gesture.onSwipeE += OnSwipe;
        Gesture.onLongTapE += OnLongTap;
        Gesture.onTouchDownE += OnTouch;
        Gesture.onTouchUpE += OnRelease;
        Gesture.onMouse1DownE += OnTouch;
        Gesture.onMouse1UpE += OnRelease;
        Gesture.onMultiTapE += OnTap;
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
        Gesture.onMultiTapE -= OnTap;

    }
}

function OnSwipe(sw:SwipeInfo){
    // TODO - rewrite
    //Figure out what direction we are swiping
    if(sw.direction.x >= 0) {
        networkView.RPC("jump", RPCMode.All);
    }

    if(Config.USE_EGG){
        if(sw.direction.y >= 0  )  {
            toss(true);
        }
    }
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){

}

function OnTap(tap:Tap){
    networkView.RPC("attack", RPCMode.All);

}

function OnTouch(pos:Vector2){
    networkView.RPC("startWalk", RPCMode.All);

}
function OnRelease(pos:Vector2){
    networkView.RPC("stopWalk", RPCMode.All);
}
