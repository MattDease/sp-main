#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;
private var netScript : Net;

private var showMenu : boolean = false;
private var isQuickplay : boolean = false;

function Awake(){
    netScript = GetComponent(Net);
}

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    // TODO Implement networking to poll masterserver so a list of active
    // games can be displayed

    // TODO - replace with good UI
    GUILayout.Label("Lobby Menu" + (isQuickplay ? " - Quickplay" : ""));
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());
    if(GUILayout.Button("Game Menu")){
        leaveFor(menus.game);
    }
}

function enter(quickplay : boolean){
    showMenu = true;
    isQuickplay = quickplay;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
