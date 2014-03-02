#pragma strict
#pragma downcast

import System.Collections.Generic;

//Set in editor
public var playerPrefab : Transform;
public var commanderPrefab : Transform;

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
    if(playerScript.getSelf().GetType() == Runner){
        Network.Instantiate(playerPrefab, Vector3.zero, Quaternion.identity, 0);
    }
    else{
        Network.Instantiate(commanderPrefab, Vector3(0, 0, -2), Quaternion.identity, 0);
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
    if(readyPlayerCount == game.getPlayers().Count){
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
            levelManager.addFirstSegment();
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
    else newPlayer = game.addPlayer(name, teamId,  netPlayer);


    if(Util.IsNetworkedPlayerMe(newPlayer)){
        playerScript.setSelf(newPlayer);
    }
}

@RPC
function killRunner(id : String, info : NetworkMessageInfo){
    var runner : Runner = Util.GetPlayerById(id) as Runner;
    runner.kill();
}

@RPC
function updateReadyStatus(id : String, isReady : boolean, info : NetworkMessageInfo){
    var runner : Runner = Util.GetPlayerById(id) as Runner;
    runner.updateReadyStatus(isReady);
}

@RPC
function updateCharacter(id : String, selectedChar : int, netPlayer : NetworkPlayer, info : NetworkMessageInfo){
    var player : Player = Util.GetPlayerById(id) as Player;

    if(player.getCharacter() > 9 && selectedChar < 9){
        //Runner
        networkView.RPC("changeRole", RPCMode.AllBuffered, id, PlayerRole.Runner.ToString(), netPlayer);
    } else if(player.getCharacter() < 9 && selectedChar > 9) {
        //Commander
        networkView.RPC("changeRole", RPCMode.AllBuffered, id, PlayerRole.Commander.ToString(), netPlayer);
    }

    //Change Roles before we do character updates!
    if(player.getCharacter() != 11) game.getTeam(player.getTeamId()).removeSelectedCharacters(player.getCharacter());

    player.setCharacter(selectedChar);

    if(selectedChar != 11) game.getTeam(player.getTeamId()).updateSelectedCharacters(selectedChar);

}

@RPC
function setTeam(id : String, teamId: int, netPlayer : NetworkPlayer, info : NetworkMessageInfo ) {
    var player : Player = Util.GetPlayerById(id);
    game.setTeam(player, teamId, netPlayer);
}
@RPC
function removeTeam(id : String, teamId: int, netPlayer : NetworkPlayer, info : NetworkMessageInfo ) {
    var player : Player = Util.GetPlayerById(id);
    game.getTeam(player.getTeamId()).removeSelectedCharacters(player.getCharacter());
    game.removeTeam(player, teamId, netPlayer);
    networkView.RPC("updateCharacter", RPCMode.AllBuffered, id, 11);
    networkView.RPC("updateReadyStatus", RPCMode.AllBuffered, id, false);
}

@RPC
function changeRole(id : String, newRole : String, netPlayer: NetworkPlayer, info : NetworkMessageInfo){

    var playerRole : PlayerRole = System.Enum.Parse(PlayerRole, newRole);
    var player: Player;

    if(playerRole == PlayerRole.Runner){
//        player = game.createRunner(player.getName(), player.getTeamId(), netPlayer);
    }
    else if(playerRole == PlayerRole.Commander){
        //player = Util.GetPlayerById(id) as Commander;
    }

    Debug.Log("---" + playerRole);

    var playerList : Dictionary.<String,Player> = game.getPlayers();

    if (playerList.ContainsKey(id)){
        Debug.Log("Contains key");
        playerList[id] = player;
    }
//     else {
//         playerList.Add(id, player);
//     }
 }

// Server only
function OnPlayerDisconnected(netPlayer: NetworkPlayer){
    networkView.RPC("removePlayer", RPCMode.AllBuffered, netPlayer);
}

@RPC
function removePlayer(netPlayer:NetworkPlayer){
    game.removePlayer(netPlayer.ToString());
}
