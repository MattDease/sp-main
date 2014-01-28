#pragma strict

import System.Collections.Generic;

// Set in editor
public var cameraPrefab : GameObject;

private var player : Commander;
private var team : Team;
private var camContainer : GameObject;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = Util.GetPlayerById(networkView.viewID.owner.guid) as Commander;
    team = player.getTeam();

    player.gameObject = gameObject;
    player.script = this;

    // Disable script updates until game starts
    this.enabled = false;

    if(networkView.isMine){
        player.gameObject.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;
    }
}

// Do physics changes here
function FixedUpdate(){
    if(networkView.isMine){

    }
}

function Update(){
    if(networkView.isMine){

    }
}

function LateUpdate(){
    if(networkView.isMine){

    }
}

function OnCollisionEnter(theCollision : Collision){

}

function OnCollisionExit(theCollision : Collision){

}

/*
 *  INPUT
 */
function checkKeyboardInput(){
    if(networkView.isMine){

    }
}

function OnEnable(){
    if(networkView.isMine){
        Gesture.onTouchE += OnTouch;
        Gesture.onMouse1E += OnTouch;
    }
}

function OnDisable(){
    if(networkView.isMine){
        Gesture.onTouchE -= OnTouch;
        Gesture.onMouse1E -= OnTouch;
    }
}

function OnTouch(pos:Vector2){
    // set target
}
