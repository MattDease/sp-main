#pragma strict
#pragma downcast

import System.Collections.Generic;

//Set in editor
public var playerPrefab : Transform;
public var commanderPrefab : Transform;
public var eggPrefab : Transform;

public var game : Game;

public var localPlayer : Player;
public var playerList : Dictionary.<String,Player> = new Dictionary.<String,Player>();

// Game Manager
private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
// Game Scripts
private var levelManager : LevelManager;

private var readyPlayerCount : int = 0;
private var startTime : double;
private var lastLevelPrefix : int = 0;

function Start(){
    playerScript = GetComponent(PlayerScript);
    stateScript = GetComponent(StateScript);
}

function Update(){
    if(stateScript.getGameState() != GameState.Uninitialized){
        game.updateState();
    }
}

function enterGame(){
    Network.RemoveRPCsInGroup(0);
    networkView.RPC("loadLevel", RPCMode.AllBuffered, "scene-game", lastLevelPrefix + 1);
}

function onLevelReady(){
    networkView.RPC("createCharacter", RPCMode.All);
}

@RPC
function createCharacter(info : NetworkMessageInfo){
    var go : Transform;
    if(playerScript.getSelf().GetType() == Runner){
        go = Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
        go.networkView.RPC("initRunner", RPCMode.All, playerScript.getSelf().getTeamId());
    }
    else{
        go = Network.Instantiate(commanderPrefab, Vector3(0, 0, Config.COMMANDER_DEPTH_OFFSET), Quaternion.identity, 0);
        go.networkView.RPC("initCommander", RPCMode.All, playerScript.getSelf().getTeamId());
    }
    if(Network.isServer){
        // Server can't send server RPC
        playerReady();
    }
    else{
        networkView.RPC("playerReady", RPCMode.Server);
    }
}

// Server Only
@RPC
function playerReady(){
    readyPlayerCount++;
    var players : Dictionary.<String, Player> = game.getPlayers();
    if(readyPlayerCount == players.Count){
        if(Config.USE_EGG){
            // TODO support multiple teams
            for(var team : Team in game.getTeams()){
                var holder = team.getRandomRunner();
                var egg : Transform = Network.Instantiate(eggPrefab, holder.getPosition(), Quaternion.identity, 0);
                egg.networkView.RPC("setHolder", RPCMode.All, holder.getId());
            }
        }
        networkView.RPC("startCountDown", RPCMode.All);
    }
}

@RPC
function startCountDown(info : NetworkMessageInfo){
    var delay : double = Config.START_DELAY - (Network.time - info.timestamp);
    startTime = Time.realtimeSinceStartup + delay;
    Invoke("startGame", delay);
}

function getCountDown() : int {
    if(startTime){
        var delay : double = startTime - Time.realtimeSinceStartup;
        if(delay < 0){
            return 0;
        }
        else{
            return Mathf.Ceil(delay);
        }
    }
    else{
        return -1;
    }
}

function startGame(){
    game.start();
}

function OnNetworkLoadedLevel(){
    if(game.isValid()){
        levelManager = GameObject.Find("GameScripts").GetComponent(LevelManager);

        if(Network.isServer){
            for(var team : Team in game.getTeams()){
                levelManager.addFirstSegment(team.getId());
            }
        }
    }
    else{
        stateScript.setGameState(GameState.Error);
        Debug.Log("Game setup is invalid. Cannot Start.");
    }
}

//Based on http://docs.unity3d.com/Documentation/Components/net-NetworkLevelLoad.html
@RPC
function loadLevel(level : String, levelPrefix : int){
    lastLevelPrefix = levelPrefix;

    stateScript.setGameState(GameState.Loading);

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
    game.destroy();
    game = null;
    stateScript.setCurrentMenu(menus.main);
    Application.LoadLevel("scene-menu");
}

function registerPlayerProxy(name : String){
    if(Network.isServer){
        // Server can't sent server RPC
        registerPlayer(name, Network.player);
    }
    else{
        networkView.RPC("registerPlayer", RPCMode.Server, name, Network.player);
    }
}

// Server only
@RPC
function registerPlayer(name : String, netPlayer : NetworkPlayer){
    var newPlayerInfo : Array = game.getNewPlayerTeamAndRole();
    networkView.RPC("addPlayer", RPCMode.AllBuffered, name, newPlayerInfo[0], newPlayerInfo[1].ToString(), netPlayer);
}

@RPC
function addPlayer(name : String, teamId : int, role : String, netPlayer : NetworkPlayer, info : NetworkMessageInfo){
    var playerRole : PlayerRole = System.Enum.Parse(PlayerRole, role);
    var newPlayer : Player;
    if(playerRole == PlayerRole.Runner){
        newPlayer = game.addRunner(name, teamId, netPlayer);
    }
    else if(playerRole == PlayerRole.Commander){
        newPlayer = game.addCommander(name, teamId, netPlayer);
    }

    if(Util.IsNetworkedPlayerMe(newPlayer)){
        playerScript.setSelf(newPlayer);
    }
}

@RPC
function killRunner(id : String, info : NetworkMessageInfo){
    var runner : Runner = Util.GetPlayerById(id) as Runner;
    runner.kill();
}

// Server only
function OnPlayerDisconnected(netPlayer: NetworkPlayer){
    networkView.RPC("removePlayer", RPCMode.AllBuffered, netPlayer);
}

@RPC
function removePlayer(netPlayer:NetworkPlayer){
    game.removePlayer(netPlayer.ToString());
}
