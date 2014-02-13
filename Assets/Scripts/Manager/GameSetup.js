#pragma strict

import System.Collections.Generic;

// TODO rethink this class. for now, add whatever you need to it.
public class Player{
    public var name : String;
    public var isSelf : boolean;
    public var netPlayer : NetworkPlayer;
    public var id : String;
    public var gameObject : GameObject;
    public var controller : MonoBehaviour;
    // TODO support commander players & better way to store role...probably extend class
    public var isRunner : boolean = true;
    public var selectedCharacter : int = 0;

    public function Player(name:String, networkPlayer:NetworkPlayer, isSelf:boolean){
        this.name = name;
        this.isSelf = isSelf;
        this.netPlayer = networkPlayer;
        this.id = networkPlayer.guid;
    }
}

//Set in editor
public var playerPrefab : Transform;

public var localPlayer : Player;
public var playerList : Dictionary.<String,Player> = new Dictionary.<String,Player>();

// Game Manager
private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
// Game Scripts
private var levelManager : LevelManager;

private var lastLevelPrefix = 0;

function Start(){
    playerScript = GetComponent(PlayerScript);
    stateScript = GetComponent(StateScript);
}

function enterGame(){
    Network.RemoveRPCsInGroup(0);
    networkView.RPC("loadLevel", RPCMode.AllBuffered, "scene-game", lastLevelPrefix + 1);
    stateScript.setGameState(GameState.Loading);
}

function startGameProxy(){
    networkView.RPC("startGame", RPCMode.All);
}

@RPC
function startGame(info : NetworkMessageInfo){
    stateScript.setGameState(GameState.Playing);
    Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
}

function OnNetworkLoadedLevel(){
    levelManager = GameObject.Find("GameScripts").GetComponent(LevelManager);
    if(Network.isServer){
        levelManager.addSegment();
    }
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
    playerScript.setSelf(null);
    stateScript.setCurrentMenu(menus.main);
    Application.LoadLevel("scene-menu");
}
function registerPlayerRPC(name : String, player : NetworkPlayer){
    networkView.RPC("registerRemotePlayer", RPCMode.OthersBuffered, name, player);
    registerPlayer(name, Network.player, true);
}

@RPC
function registerRemotePlayer(name : String, player : NetworkPlayer, info : NetworkMessageInfo){
    registerPlayer(name, player, false);
}

function registerPlayer(name : String, netPlayer : NetworkPlayer, isSelf : boolean){
    var newPlayer = new Player(name, netPlayer, isSelf);
    playerList.Add(netPlayer.guid, newPlayer);
    if(isSelf){
        playerScript.setSelf(newPlayer);
    }
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
    for(var key : String in playerList.Keys){
        var player = playerList[key];
        if(player.netPlayer == netPlayer){
            Network.RemoveRPCs(player.netPlayer);
            Network.DestroyPlayerObjects(player.netPlayer);
            Debug.Log("Player '" + player.name + "' disconnected.");
            playerList.Remove(key);
            break;
        }
    }
}
