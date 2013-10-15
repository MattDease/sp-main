#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;
private var isQuickplay : boolean = false;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.gameManager.GetComponent(PlayerScript);
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    //TODO - replace with good UI
    GUILayout.Label("Lobby Menu" + (isQuickplay ? " - Quickplay" : ""));
}

function enter(quickplay : boolean){
    showMenu = true;
    isQuickplay = quickplay;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.open(newMenu);
}
