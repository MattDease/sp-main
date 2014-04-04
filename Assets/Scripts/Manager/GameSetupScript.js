#pragma strict
#pragma downcast

import System.Collections.Generic;

//Set in editor
public var characterPrefabs : List.<Transform>;
public var eggPrefab : Transform;

public var game : Game;

public var playerList : Dictionary.<String,Player> = new Dictionary.<String,Player>();

// Game Manager
private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;
// Game Scripts
private var levelManager : LevelManager;
private var gameMenu : GameMenu;

private var readyPlayerCount : int = 0;
private var restartReadyCount : int = 0;
private var startTime : double;
private var lastLevelPrefix : int = 0;
private var isLeaving : boolean = false;

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
    networkView.RPC("loadLevel", RPCMode.All, "scene-game", lastLevelPrefix + 1);
}

function onLevelReady(){
    networkView.RPC("createCharacter", RPCMode.All);
}

@RPC
function createCharacter(info : NetworkMessageInfo){
    var player : Player = playerScript.getSelf();
    var go : Transform;
    var me : Player = playerScript.getSelf();
    if(me.GetType() == Runner){
        go = Network.Instantiate(characterPrefabs[me.getCharacter()], Vector3.zero, Quaternion.identity, 0);
        go.networkView.RPC("initRunner", RPCMode.All, me.getId(), me.getTeamId());
    }
    else{
        go = Network.Instantiate(characterPrefabs[me.getCharacter()], Vector3(0, 0, Config.COMMANDER_DEPTH_OFFSET), Quaternion.identity, 0);
        go.networkView.RPC("initCommander", RPCMode.All, me.getId(), me.getTeamId());
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
    startTime = Time.time + delay;
    Invoke("startGame", delay);
}

function getCountDown() : int {
    if(startTime){
        var delay : double = startTime - Time.time;
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
            levelManager.addFirstPlanes();
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

    // Log team data produced by menu interface
    if(Config.MENU_DEBUG){
        Debug.Log("I am a " + (Network.isServer ? "Server" : "Client"));
        Debug.Log("I am player " + playerScript.getSelf().getId() + ", on team " + playerScript.getSelf().getTeamId());
        for(var player : Player in game.getPlayers().Values){
            Debug.Log(player.ToString());
        }
    }

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

@RPC
function resetGame(){
    readyPlayerCount = 0;
    game.reset();
    if(Network.isServer){
        readyToRestart(playerScript.getSelf().getId());
    }
    else{
        networkView.RPC("readyToRestart", RPCMode.Server, playerScript.getSelf().getId());
    }
}

function restartGame(){
    networkView.RPC("resetGame", RPCMode.All);
}

// Server only
function returnToMenu(){
    MasterServer.RegisterHost(Config.GAME_ID, game.getName(), ConnectionTesterStatus.Undetermined.ToString());
    networkView.RPC("goToMenu", RPCMode.All);
}

@RPC
function goToMenu(){
    readyPlayerCount = 0;
    game.reset();
    stateScript.setCurrentMenu(Network.isServer ? menus.host : menus.game);
    Network.RemoveRPCsInGroup(0);
    Application.LoadLevel("scene-menu");
}

// Server only
@RPC
function readyToRestart(id : String){
    restartReadyCount++;
    if(restartReadyCount >= game.getPlayers().Count){
        restartReadyCount = 0;
        enterGame();
    }
}

function leaveGame(){
    isLeaving = true;
    readyPlayerCount = 0;
    if(Network.isServer){
        Network.RemoveRPCsInGroup(0);
    }
    Network.Disconnect();
    playerScript.incrementTimesPlayed();
    playerScript.setSelf(null);
    stateScript.setGameState(GameState.Uninitialized);
    stateScript.setCurrentMenu(menus.lobby);
    game.destroy();
    game = null;
    isLeaving = false;
    Application.LoadLevel("scene-menu");
}

function OnDisconnectedFromServer(info : NetworkDisconnection){
    if(!isLeaving && Application.loadedLevelName == "scene-game"){
        leaveGame();
    }
}

// Server only
function OnPlayerConnected(netPlayer : NetworkPlayer){
    for(var player : Player in game.getPlayers().Values){
        var role : PlayerRole;
        switch(player.GetType()){
            case Runner :
            role = PlayerRole.Runner;
            break;
            case Commander :
            role = PlayerRole.Commander;
            break;
            case Player :
            role = PlayerRole.Player;
            break;
        }
        networkView.RPC("addFullPlayer", netPlayer, player.getName(), player.getTeamId(), role.ToString(),
                        player.getNetworkPlayer(), player.getCharacter(), player.getReadyStatus());
    }
}

// Server only
function OnPlayerDisconnected(netPlayer : NetworkPlayer){
    networkView.RPC("removePlayer", RPCMode.All, netPlayer);
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
    networkView.RPC("addPlayer", RPCMode.All, name, newPlayerInfo[0], newPlayerInfo[1].ToString(), netPlayer);
}

@RPC
function setVersusMode(mode : String){
    var gameMode : GameMode = System.Enum.Parse(GameMode, mode);
    game.setIsVersus(gameMode);
    gameMenu = GameObject.Find("/MenuScripts").GetComponent(GameMenu);
    gameMenu.selectCharacter = false;
}

@RPC
function addPlayer(name : String, teamId : int, role : String, netPlayer : NetworkPlayer) : Player {
    var playerRole : PlayerRole = System.Enum.Parse(PlayerRole, role);
    var newPlayer : Player;

    if(playerRole == PlayerRole.Runner){
        newPlayer = game.addRunner(name, teamId, netPlayer);
    }
    else if(playerRole == PlayerRole.Commander){
        newPlayer = game.addCommander(name, teamId, netPlayer);
    }
    else newPlayer = game.addPlayer(name, teamId, netPlayer);


    if(Util.IsNetworkedPlayerMe(newPlayer)){
        playerScript.setSelf(newPlayer);
    }

    return newPlayer;
}

@RPC
function addFullPlayer(name : String, teamId : int, role : String, netPlayer : NetworkPlayer, character : int, ready : boolean){
    var player : Player = addPlayer(name, teamId, role, netPlayer);
    player.setCharacter(character);
    player.updateReadyStatus(ready);
}

@RPC
function updateReadyStatus(id : String, isReady : boolean){
    var player : Player = Util.GetPlayerById(id);
    player.updateReadyStatus(isReady);
}

@RPC
function updateCharacter(id : String, selectedChar : int, netPlayer : NetworkPlayer){
    var player : Player = Util.GetPlayerById(id) as Player;

    if(player.getTeamId() == 100) {
        player.setCharacter(selectedChar);
    }
    else {
        if(selectedChar != 12) {
            game.getTeam(player.getTeamId()).updateSelectedCharacters(selectedChar);
            game.getTeam(player.getTeamId()).removeSelectedCharacters(player.getCharacter());
        }

        if(player.getCharacter() > 8 && selectedChar < 9 || player.getCharacter() == 12 && selectedChar < 9){
            if(player.getCharacter() > 8 && player.getCharacter() < 12 && selectedChar < 9){
                player.getTeam().clearCommander();
            }
            player.setCharacter(selectedChar);
            changeRole(id, player.getName(), PlayerRole.Runner.ToString(), player.getTeamId(), player.getCharacter(), netPlayer);
        } else if(player.getCharacter() < 9 && selectedChar > 8 || player.getCharacter() == 12 && selectedChar >= 9) {

            if(player.getCharacter() != 12) {
                player.getTeam().removeRunner(player.getId());
            }
            player.setCharacter(selectedChar);
            changeRole(id, player.getName(), PlayerRole.Commander.ToString(), player.getTeamId(), player.getCharacter(), netPlayer);
        } else {
            player.setCharacter(selectedChar);
        }
    }
}

@RPC
function setTeam(id : String, teamId: int, netPlayer : NetworkPlayer, info : NetworkMessageInfo ) {
    var player : Player = Util.GetPlayerById(id);
    game.setTeam(player, teamId, netPlayer);
}
@RPC
function removeTeam(id : String, teamId: int, netPlayer : NetworkPlayer) {
    var player : Player = Util.GetPlayerById(id);
    game.getTeam(teamId).removeSelectedCharacters(player.getCharacter());
    game.removeTeam(player, teamId, netPlayer);
    updateCharacter(id, 12, netPlayer);
    updateReadyStatus(id, false);
    changeRole(id, player.getName(), PlayerRole.Player.ToString(), player.getTeamId(), player.getCharacter(), netPlayer);
}

@RPC
function changeRole(id : String, name : String, newRole : String, teamId:int, character:int, netPlayer: NetworkPlayer){
    var oldPlayer : Player = Util.GetPlayerById(id) as Player;

    var playerRole : PlayerRole = System.Enum.Parse(PlayerRole, newRole);
    var player : Player;

    if(playerRole == PlayerRole.Runner){
        player = game.changeToRunner(id, name, teamId, character, netPlayer);
    } else if(playerRole == PlayerRole.Commander){
        player = game.changeToCommander(id, name, teamId, character, netPlayer);
    } else if(playerRole == PlayerRole.Player){
        player = game.changeToPlayer(id, name, teamId, netPlayer);
    }

    if (Util.IsNetworkedPlayerMe(oldPlayer)) {
        playerScript.setSelf(player);
    }
 }

@RPC
function voteForRestart(id : String, vote : boolean){
    var player : Player = Util.GetPlayerById(id);
    player.setRestartVote(vote);
}

@RPC
function removePlayer(netPlayer:NetworkPlayer){
    game.removePlayer(netPlayer.ToString());
}
