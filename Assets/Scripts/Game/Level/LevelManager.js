#pragma strict

import System.Collections.Generic;

// General TODOs
// - reimplement difficulty functionality

// Set in editor
public var startSegmentPrefab : GameObject;
public var segmentPrefabs : List.<GameObject>;
public var backgroundPrefabs : List.<GameObject>;
public var enemyPrefabs : List.<GameObject>;
public var signPrefabs : List.<GameObject>;
public var coinPrefab : GameObject;

private var gameManager : GameObject;
private var difficultyManager : DifficultyManager;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
private var gameSetupScript : GameSetupScript;

private var game : Game;

// structure is team > segment > objects
private var levels : List.< List.< List.<GameObject> > > = new List.< List.< List.<GameObject> > >();
// structure is plane type > planes
private var backgrounds : List.< List.<GameObject> > = new List.< List.<GameObject> >();

private var waitingForSegment : boolean = false;
private var levelsReady : int = 0;

private var segmentOffset : float = 18;
private var newSegmentThreshold : float = 50;

private var lastSegmentEnd : List.<float> = new List.<float>();
private var firstSegmentEnd : List.<float> = new List.<float>();

private var currentLevel : int = 0;
private var previousLevel : int = 0;


public var BACKGROUND_OFFSET : List.<Vector3> = new List.<Vector3>();
BACKGROUND_OFFSET.Add(Vector3(30, -1, 5));
BACKGROUND_OFFSET.Add(Vector3(60, -5, 15));
BACKGROUND_OFFSET.Add(Vector3(60, -1, 17));
BACKGROUND_OFFSET.Add(Vector3(90, -5, 25));

function Start () {
    gameManager = GameObject.Find("/GameManager");
    difficultyManager = GetComponent(DifficultyManager);
    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);

    game = gameSetupScript.game;

    // Initialize Level List
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
            addSegment(team.getId(), false);
        }
        if(team.getStraggler().getDistance() - firstSegmentEnd[team.getId()] > newSegmentThreshold){
            removeSegment(team.getId());
        }
    }

    for(var i : int = 0; i < backgrounds.Count; i++){
        if(getLastEnd(i) - game.getLeadingTeam().getDistance() < getThreshold(i)){
            addPlane(i);
        }
        if(game.getTrailingTeam().getDistance() - getFirstEnd(i) > getThreshold(i)){
            removePlane(i);
        }
    }
}

function addFirstSegment(teamId : int){
    lastSegmentEnd[teamId] = -segmentOffset;
    addSegment(teamId, true);
    addSegment(teamId, false);
}

function addSegment(teamId : int, isFirst : boolean){
    waitingForSegment = true;
    var segment : GameObject;

    if(isFirst){
        segment = startSegmentPrefab;
    }
    else {
        difficultyManager.setSegmentCount(difficultyManager.getSegmentCount() + 1);
        var segmentIndex : int = difficultyManager.getSegment();

        previousLevel = currentLevel;
        currentLevel = segmentIndex;

        segment = segmentPrefabs[segmentIndex - 1];
    }

    var go : GameObject = Network.Instantiate(segment, new Vector3(lastSegmentEnd[teamId], 0, 0), Quaternion.identity, 0);
    go.networkView.RPC('initSegment', RPCMode.All, teamId);
}

function removeSegment(teamId : int){
    var objects : List.<GameObject> = levels[teamId][0];
    var levelSegment : GameObject = objects[0];
    firstSegmentEnd[teamId] += levelSegment.transform.Find("model/main").GetComponent(MeshFilter).mesh.bounds.size.x;
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
    var typeCount : int[] = [0, 0, 0, 0];
    for(var i : int = 0; i < enemies.Count; i++){
        var enemy : Enemy = enemies[i];
        go = Network.Instantiate(enemyPrefabs[enemy.prefabIndex], enemy.start.position, Quaternion.identity, 0);
        go.networkView.RPC("initEnemy", RPCMode.All, teamId, teamId == playerScript.getSelf().getTeamId());
        go.GetComponent(EnemyScript).init(enemy.start.position, enemy.end.position, typeCount[enemy.prefabIndex]);
        typeCount[enemy.prefabIndex]++;
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

function getFirstEnd(index : int) : float {
    if(backgrounds[index].Count > 0){
        var bg : GameObject = backgrounds[index][0];
        return bg.transform.position.x + bg.transform.Find("model").GetComponent(MeshFilter).mesh.bounds.size.x;
    }
    else{
        return (0 - BACKGROUND_OFFSET[index].x);
    }
}

function getLastEnd(index : int) : float {
    if(backgrounds[index].Count > 0){
        var bg : GameObject = backgrounds[index][backgrounds[index].Count - 1];
        return bg.transform.position.x + bg.transform.Find("model").GetComponent(MeshFilter).mesh.bounds.size.x;
    }
    else{
        return (0 - BACKGROUND_OFFSET[index].x);
    }
}

function getThreshold(index : int) : float{
    return BACKGROUND_OFFSET[index].x;
}

function addFirstPlanes(){
    for(var i : int = 0; i < BACKGROUND_OFFSET.Count; i++){
        backgrounds.Add(new List.<GameObject>());
    }
    for(i = 0; i < BACKGROUND_OFFSET.Count; i++){
        addPlane(i);
    }
}

function addPlane(index : int){
    var pos : Vector3 = BACKGROUND_OFFSET[index];
    pos.x = getLastEnd(index);
    if(game.getMode() == GameMode.Versus){
        pos.z += Config.TEAM_DEPTH_OFFSET;
    }
    Network.Instantiate(backgroundPrefabs[index], pos, Quaternion.identity, 0);
}

function removePlane(index : int){
    Network.Destroy(backgrounds[index][0]);
    backgrounds[index].RemoveAt(0);
}

function onAddPlane(index : int, plane : GameObject){
    backgrounds[index].Add(plane);
}

function getCurrentLevel() {
    return currentLevel;
}
function getPreviousLevel() {
    return previousLevel;
}
