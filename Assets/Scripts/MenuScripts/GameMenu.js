#pragma strict

private var gameManager : GameObject;
private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;
private var isHosting : boolean = false;

function Start(){
    menuScript = Menu.script;
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);

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
