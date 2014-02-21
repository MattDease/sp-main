#pragma strict

import System.Collections.Generic;

// General TODOs
// - remove old segments
// - consider position of all active players when creating/destroying segments
// - reimplement difficulty functionality

// Set in editor
public var segmentPrefabs : List.<GameObject>;
public var enemyPrefabs : List.<GameObject>;
public var signPrefabs : List.<GameObject>;
public var coinPrefab : GameObject;

private var gameManager : GameObject;
private var difficultyScript : DifficultyScript;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetupScript;

private var segments : List.<GameObject> = new List.<GameObject>();

private var waitingForSegment : boolean = false;

private var segmentOffset : float = 4;
private var newSegmentThreshold : float = 8;
private var lastSegmentEnd : float;
private var firstSegmentEnd : float;

function Start () {
    gameManager = GameObject.Find("/GameManager");
    difficultyScript = gameManager.GetComponent(DifficultyScript);
    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);

    InvokeRepeating("updateLevel", 0.3, 0.3);
}

function Update () {

}

function updateLevel(){
    if(Network.isClient || waitingForSegment || stateScript.getGameState() != GameState.Playing){
        return;
    }

    if(lastSegmentEnd - gameSetupScript.game.getTeam(0).getLeader().getDistance() < newSegmentThreshold){
        addSegment();
    }
    if(gameSetupScript.game.getTeam(0).getStraggler().getDistance() - firstSegmentEnd > newSegmentThreshold){
        removeSegment();
    }
}

function addFirstSegment(){
    lastSegmentEnd = -segmentOffset;
    addSegment();
}

function addSegment(){
    waitingForSegment = true;
    var pos = new Vector3(lastSegmentEnd, 0, 0);
    // TODO - Use difficulty to determine next segment.
    Network.Instantiate(segmentPrefabs[Random.Range(0, segmentPrefabs.Count)], pos, Quaternion.identity, 0);
}

function removeSegment(){
    var segment : GameObject = segments[0];
    firstSegmentEnd += segment.Find("model/main").GetComponent(MeshFilter).mesh.bounds.size.x;
    Network.Destroy(segment);
    segments.RemoveAt(0);

}

function onAddSegment(segment : GameObject, enemies : List.<Enemy>, coins : List.<Transform>){
    var segmentWidth : float = segment.Find("model/main").GetComponent(MeshFilter).mesh.bounds.size.x;

    for(var i : int = 0; i < enemies.Count; i++){
        var enemy : Enemy = enemies[i];
        var go : GameObject = Network.Instantiate(enemyPrefabs[enemy.prefabIndex], enemy.end.position, Quaternion.identity, 0);
        go.GetComponent(EnemyScript).startMove(enemy.start.position, enemy.end.position);
    }

    for(var j : int = 0; j < coins.Count; j++){
        Network.Instantiate(coinPrefab, coins[j].position, Quaternion.identity, 0);
    }

    if(segments.Count == 0){
        firstSegmentEnd = segmentWidth - segmentOffset;
        lastSegmentEnd = segmentWidth - segmentOffset;
        gameSetupScript.onLevelReady();
    }
    else{
        lastSegmentEnd += segmentWidth;
    }

    waitingForSegment = false;
    segments.Add(segment);
}
