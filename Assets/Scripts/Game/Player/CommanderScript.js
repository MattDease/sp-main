#pragma strict

import System.Collections.Generic;

// Set in editor
public var cameraPrefab : GameObject;

private var player : Commander;
private var model : GameObject;
private var animator : Animator;
private var team : Team;
private var camContainer : GameObject;

private var touched : boolean = false;
private var plane : Plane = new Plane(Vector3(0, 1, Config.COMMANDER_DEPTH_OFFSET),
                                      Vector3(1, 1, Config.COMMANDER_DEPTH_OFFSET),
                                      Vector3(1, 0, Config.COMMANDER_DEPTH_OFFSET));
private var targetPosition : Vector3;
private var velocity : Vector3 = Vector3.zero;
private var offsetX : float = 0;
private var platform : GameObject;
private var platformOffset : Vector2 = Vector2.zero;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = Util.GetPlayerById(networkView.viewID.owner.ToString()) as Commander;
    team = player.getTeam();
    model = gameObject.transform.Find("model").gameObject;
    animator = model.GetComponent(Animator);

    player.gameObject = gameObject;
    player.script = this;

    if(networkView.isMine){
        camContainer = Instantiate(cameraPrefab, Vector3.zero,  Quaternion.identity);

        var playerPosition : Vector3 = gameObject.transform.position;
        var viewport : Vector3 = Camera.main.WorldToViewportPoint(playerPosition);
        viewport.x = 0.5;
        viewport.y = 0.8;
        player.gameObject.transform.position = Camera.main.ViewportToWorldPoint(viewport);

        player.gameObject.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;
    }
}

@RPC
function initCommander(teamId : int){
    transform.position.z += (teamId == player.getTeamId()) ? 0 : Config.TEAM_DEPTH_OFFSET;
}

// Do physics changes here
function FixedUpdate(){
    if(networkView.isMine){

    }
}

function Update(){
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    if(animState.IsName("Base Layer.Attack") && !animator.IsInTransition(0)){
        animator.SetBool("attack", false);
    }
    if(networkView.isMine){
        if(touched){
            gameObject.transform.position = Vector3.SmoothDamp(player.getPosition(), targetPosition, velocity, 0.07);

            var hit : RaycastHit;
            if (Physics.Raycast(gameObject.transform.position, Vector3.forward, hit, 4)){
                if(hit.collider.gameObject.CompareTag("enemy")){
                    hit.collider.gameObject.GetComponent(EnemyScript).notifyKill();
                    attack();
                    networkView.RPC("attack", RPCMode.Others);
                }
                if(!platform){
                    if(Vector3.Distance(gameObject.transform.position, targetPosition) < 0.3){
                        if(hit.collider.gameObject.CompareTag("moveableX") || hit.collider.gameObject.CompareTag("moveableY")){
                            platform = hit.collider.gameObject;
                            platformOffset = platform.transform.position - gameObject.transform.position;
                        }
                    }
                }
            }
            if(platform){
                var position : Vector3 = platform.transform.position;
                if(platform.CompareTag("moveableX")){
                    position.x = player.getPosition().x + platformOffset.x;
                }
                else if(platform.CompareTag("moveableY")){
                    position.y = player.getPosition().y + platformOffset.y;
                }
                platform.GetComponent(PlatformScript).notifyPosition(position);
            }
        }
        checkKeyboardInput();
    }
}

function LateUpdate(){
    if(networkView.isMine && team.isAlive()){
        var currentTeamPosition : Vector3 = team.getObserverCameraPosition();
        if(!touched){
            gameObject.transform.position.x = currentTeamPosition.x + offsetX;
        }
        camContainer.transform.position.x = currentTeamPosition.x;
        camContainer.transform.position.y = currentTeamPosition.y/2;
    }
}

function OnCollisionEnter(theCollision : Collision){

}

function OnCollisionExit(theCollision : Collision){

}

function setOffset(){
    offsetX = gameObject.transform.position.x - team.getObserverCameraPosition().x;
}

@RPC
function attack(){
    animator.SetBool("attack", true);
}

/*
 *  INPUT
 */
function checkKeyboardInput(){
    if(networkView.isMine){
        if(Config.DEBUG){
            if(Input.GetKeyDown(KeyCode.A)){
                attack();
                networkView.RPC("attack", RPCMode.Others);
            }
        }
    }
}

function OnEnable(){
    if(networkView.isMine){
        setOffset();

        touched = false;

        Gesture.onTouchE += OnTouch;
        Gesture.onMouse1E += OnTouch;
        Gesture.onTouchDownE += OnTouchStart;
        Gesture.onMouse1DownE += OnTouchStart;
        Gesture.onTouchUpE += OnTouchEnd;
        Gesture.onMouse1UpE += OnTouchEnd;
    }
}

function OnDisable(){
    if(networkView.isMine){
        touched = false;

        Gesture.onTouchE -= OnTouch;
        Gesture.onMouse1E -= OnTouch;
        Gesture.onTouchDownE -= OnTouchStart;
        Gesture.onMouse1DownE -= OnTouchStart;
        Gesture.onTouchUpE -= OnTouchEnd;
        Gesture.onMouse1UpE -= OnTouchEnd;
    }
}

function OnTouch(pos:Vector2){
    var ray : Ray = Camera.main.ScreenPointToRay(pos);
    var rayDistance : float;
    if(plane.Raycast(ray, rayDistance)) {
        targetPosition = ray.GetPoint(rayDistance);
    }
}

function OnTouchStart(pos:Vector2){
    var ray : Ray = Camera.main.ScreenPointToRay(pos);
    var rayDistance : float;
    if(plane.Raycast(ray, rayDistance)) {
        targetPosition = ray.GetPoint(rayDistance);
    }
    touched = true;
}

function OnTouchEnd(pos:Vector2){
    setOffset();
    platform = null;
    platformOffset = Vector2.zero;
    touched = false;
}
