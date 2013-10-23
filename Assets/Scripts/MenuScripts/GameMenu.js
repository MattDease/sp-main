#pragma strict

private var gameManager : GameObject;
private var menuScript : Menu;
private var playerScript : PlayerScript;
private var netScript : Net;

private var showMenu : boolean = false;
private var isHosting : boolean = false;
private var gameName : String;
private var playerLimit : int = 4;

function Awake(){
    netScript = GetComponent(Net);
}

function Start(){
    menuScript = Menu.script;
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);

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

    if(GUILayout.Button("Start Game")){
        Application.LoadLevel("scene-game");
    }

    if(isHosting && !Network.isServer){
        GUILayout.Label("Game Name:");
        gameName = GUILayout.TextField(gameName, GUILayout.MinWidth(70));
        GUILayout.Label("Player Limit:");
        playerLimit = parseInt(GUILayout.TextField(playerLimit.ToString(), GUILayout.MinWidth(70))) || 0;
        if (GUILayout.Button ("Start Server")){
            netScript.StartHost(playerLimit, gameName);
        }
    }
    else if(Network.isServer){
        GUILayout.Label("Game Hosted!");
    }

    if(!isHosting && Network.isClient){
        GUILayout.Label("Joined Hosted Game!");
    }
}

function enter(isNew : boolean){
    showMenu = true;
    isHosting = isNew;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
