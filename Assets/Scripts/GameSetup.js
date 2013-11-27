#pragma strict

import System.Collections.Generic;

class Player{
    var name : String;
    var isSelf : boolean;
    var netPlayer : NetworkPlayer;
    //add other player attributes like heath, team, etc here
}

public var playerPrefab : Transform;

public var playerList : List.<Player> = new List.<Player>();

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;

private var lastLevelPrefix = 0;

function Start(){
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);
}

function enterGame(){
    Network.RemoveRPCsInGroup(0);
    networkView.RPC("loadLevel", RPCMode.AllBuffered, "scene-game", lastLevelPrefix + 1);
}

function OnNetworkLoadedLevel(){
    //Start the game!
    //do stuff like:
    //var playerInstance : Transform = Network.Instantiate(playerPrefab, pos, rot, 0);
}

//Based on http://docs.unity3d.com/Documentation/Components/net-NetworkLevelLoad.html
@RPC
function loadLevel(level : String, levelPrefix : int){
    lastLevelPrefix = levelPrefix;

    Network.SetSendingEnabled(0, false);
    Network.isMessageQueueRunning = false;
    Network.SetLevelPrefix(levelPrefix);
    Application.LoadLevel(level);
    yield;
    yield;

    Network.isMessageQueueRunning = true;
    Network.SetSendingEnabled(0, true);

    for (var go : GameObject in FindObjectsOfType(GameObject)){
        go.SendMessage("OnNetworkLoadedLevel", SendMessageOptions.DontRequireReceiver);
    }
}

function OnDisconnectedFromServer(){
    playerScript.incrementTimesPlayed();
    stateScript.setCurrentMenu(menus.main);
    Application.LoadLevel("scene-menu");
}
function registerPlayerRPC(name : String){
    networkView.RPC("registerRemotePlayer", RPCMode.OthersBuffered, name);
    registerPlayer(name, Network.player, true);
}

@RPC
function registerRemotePlayer(name : String, info : NetworkMessageInfo){
    registerPlayer(name, info.sender, false);
}

function registerPlayer(name : String, netPlayer : NetworkPlayer, isSelf : boolean){
    var newPlayer = new Player();
    newPlayer.name = name;
    newPlayer.isSelf = isSelf;
    newPlayer.netPlayer = netPlayer;
    playerList.Add(newPlayer);
}

function OnPlayerDisconnected(netPlayer: NetworkPlayer){
    networkView.RPC("notifyOtherPlayerDisconnected", RPCMode.OthersBuffered, netPlayer);
    otherPlayerDisconnected(netPlayer);
}

@RPC
function notifyOtherPlayerDisconnected(netPlayer : NetworkPlayer){
    otherPlayerDisconnected(netPlayer);
}

function otherPlayerDisconnected(netPlayer:NetworkPlayer){
    for(var player : Player in playerList){
        if(player.netPlayer == netPlayer){
            Debug.Log("Player '" + player.name + "' disconnected.");
            playerList.Remove(player);
            break;
        }
    }
    // Network.RemoveRPCs(player);
    // Network.DestroyPlayerObjects(player);
}
