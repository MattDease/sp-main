#pragma strict

import System.Collections.Generic;

// General TODOs
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

private var game : Game;

// structure is team > segment > objects
private var levels : List.< List.< List.<GameObject> > > = new List.< List.< List.<GameObject> > >();

private var waitingForSegment : boolean = false;
private var levelsReady : int = 0;

private var segmentOffset : float = 0.5;
private var newSegmentThreshold : float = 50;

private var lastSegmentEnd : List.<float> = new List.<float>();
private var firstSegmentEnd : List.<float> = new List.<float>();

function Start () {
    gameManager = GameObject.Find("/GameManager");
    difficultyScript = gameManager.GetComponent(DifficultyScript);
    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);

    game = gameSetupScript.game;

    // Initialize Lists
    for(var i : int = 0; i < game.getTeams().Count; i++){
        lastSegmentEnd.Add(0);
        firstSegmentEnd.Add(0);
        levels.Add(new List.< List.<GameObject> >());
    }

    InvokeRepeating("updateLevel", 0.3, 0.3);
}

function Update () {

}

function updateLevel(){
    if(Network.isClient || waitingForSegment || stateScript.getGameState() != GameState.Playing){
        return;
    }

    for(var team : Team in game.getTeams()){
        if(!team.isAlive()){
            continue;
        }
        if(lastSegmentEnd[team.getId()] - team.getLeader().getDistance() < newSegmentThreshold){
            addSegment(team.getId());
        }
        if(team.getStraggler().getDistance() - firstSegmentEnd[team.getId()] > newSegmentThreshold){
            removeSegment(team.getId());
        }
    }
}

function addFirstSegment(teamId : int){
    lastSegmentEnd[teamId] = -segmentOffset;
    addSegment(teamId);
}

function addSegment(teamId : int){
    waitingForSegment = true;
    var segment : GameObject = segmentPrefabs[Random.Range(0, segmentPrefabs.Count)];
    // TODO - Use difficulty to determine next segment.
    var go : GameObject = Network.Instantiate(segment, new Vector3(lastSegmentEnd[teamId], 0, 0), Quaternion.identity, 0);
    go.networkView.RPC('initSegment', RPCMode.All, teamId);
}

function removeSegment(teamId : int){
    var objects : List.<GameObject> = levels[teamId][0];
    var levelSegment : GameObject = objects[0];
    firstSegmentEnd[teamId] += levelSegment.Find("model/main").GetComponent(MeshFilter).mesh.bounds.size.x;
    while(objects.Count){
        Network.Destroy(objects[0]);
        objects.RemoveAt(0);
    }
    levels[teamId].RemoveAt(0);
}

function onAddSegment(teamId : int, segment : GameObject, enemies : List.<Enemy>, coins : List.<Transform>){
    var segmentWidth : float = segment.transform.Find("model/main").GetComponent(MeshFilter).mesh.bounds.size.x;
    var objects : List.<GameObject> = new List.<GameObject>();
    objects.Add(segment);

    var go : GameObject;
    var position : Vector3;
    for(var i : int = 0; i < enemies.Count; i++){
        var enemy : Enemy = enemies[i];
        go = Network.Instantiate(enemyPrefabs[enemy.prefabIndex], enemy.end.position, Quaternion.identity, 0);
        go.networkView.RPC("initEnemy", RPCMode.All, teamId, teamId == playerScript.getSelf().getTeamId());
        go.GetComponent(EnemyScript).init(enemy.start.position, enemy.end.position);
        objects.Add(go);
    }

    for(var j : int = 0; j < coins.Count; j++){
        go = Network.Instantiate(coinPrefab, coins[j].position, Quaternion.identity, 0);
        go.networkView.RPC("initCoin", RPCMode.All, teamId, teamId == playerScript.getSelf().getTeamId());
        objects.Add(go);
    }

    if(levels[teamId].Count == 0){
        firstSegmentEnd[teamId] = segmentWidth - segmentOffset;
        lastSegmentEnd[teamId] = segmentWidth - segmentOffset;
        levelsReady++;
        if(levelsReady == levels.Count){
            gameSetupScript.onLevelReady();
        }
    }
    else{
        lastSegmentEnd[teamId] += segmentWidth;
    }

    waitingForSegment = false;
    levels[teamId].Add(objects);
}
