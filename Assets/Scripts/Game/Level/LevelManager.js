#pragma strict

import System.Collections.Generic;

// General TODOs
// - remove old segments
// - consider position of all active players when creating/destroying segments
// - reimplement difficulty functionality

// Set in editor
public var segmentPrefab : GameObject;

private var gameManager : GameObject;
private var difficultyScript : DifficultyScript;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetupScript;

private var segments : List.<GameObject> = new List.<GameObject>();

private var waitingForSegment : boolean = false;

private var segmentOffset : float = 4;
private var newSegmentThreshold : float = 8;
private var currentLevelEnd : float;

function Start () {
    gameManager = GameObject.Find("/GameManager");
    difficultyScript = gameManager.GetComponent(DifficultyScript);
    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);
}

function Update () {
    if(Network.isClient || waitingForSegment || stateScript.getGameState() != GameState.Playing){
        return;
    }

    if(currentLevelEnd - playerScript.getDistance() < newSegmentThreshold){
        addSegment();
    }
}

function addSegment(){
    waitingForSegment = true;
    var pos = currentLevelEnd ? new Vector3(currentLevelEnd, 0, 0) : new Vector3(-segmentOffset, 0, 0);
    Network.Instantiate(segmentPrefab, pos, Quaternion.identity, 0);
}

function onAddSegment(segment : GameObject){
    var segmentWidth : float = segment.Find("debug_platform").GetComponent(MeshFilter).mesh.bounds.size.x;

    if(segments.Count == 0){
        currentLevelEnd = segmentWidth - segmentOffset;
        gameSetupScript.onLevelReady();
    }
    else{
        currentLevelEnd += segmentWidth;
    }

    waitingForSegment = false;
    segments.Add(segment);
}
