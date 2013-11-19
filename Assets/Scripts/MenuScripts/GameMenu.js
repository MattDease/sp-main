#pragma strict

private var gameManager : GameObject;
private var menuScript : Menu;
private var playerScript : PlayerScript;
private var gameSetupScript : GameSetup;
private var netScript : Net;

private var showMenu : boolean = false;
private var isHosting : boolean = false;
private var gameName : String;
private var playerLimit : int = 4;

private var playerList : List.<Player>;

function Awake(){
    netScript = GetComponent(Net);
}

function Start(){
    menuScript = Menu.script;
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    gameSetupScript = gameManager.GetComponent(GameSetup);

    gameName = playerScript.getName() + "'s Game";

    //persist game manager object between scenes
    DontDestroyOnLoad( gameManager );
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    //TODO - replace with good UI
    GUILayout.Label("Game Menu" + (isHosting ? " - Host" : ""));
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());

    if(isHosting && !Network.isServer){
        GUILayout.Label("Game Name:");
        gameName = GUILayout.TextField(gameName, GUILayout.MinWidth(70));
        GUILayout.Label("Player Limit:");
        playerLimit = parseInt(GUILayout.TextField(playerLimit.ToString(), GUILayout.MinWidth(70))) || 0;
        if (GUILayout.Button ("Start Server")){
            netScript.startHost(playerLimit, gameName, onInitialize);
        }
    }
    else if(Network.isClient || (isHosting && Network.isServer)){
        playerList = gameSetupScript.playerList;
        GUILayout.Label("Players:");
        for(var player:Player in playerList){
            GUILayout.Label(" - " + player.name + (player.isSelf ? " (me)" : ""));
        }
        if(GUILayout.Button("Start Game")){
            gameSetupScript.enterGame();
        }
    }
}

function onInitialize(success: boolean){
    if(success){
        gameSetupScript.registerPlayerRPC(playerScript.getName());
    }
}

function enter(isNew : boolean){
    showMenu = true;
    isHosting = isNew;

    if(Network.isClient){
        gameSetupScript.registerPlayerRPC(playerScript.getName());
    }
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
