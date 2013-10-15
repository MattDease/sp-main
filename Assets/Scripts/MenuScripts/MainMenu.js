#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.gameManager.GetComponent(PlayerScript);
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    //TODO - replace with good UI
    GUILayout.Label("Main Menu");
    GUILayout.Label("Player: " + playerScript.getName());
    if(GUILayout.Button("New Game")){
        leaveFor(menus.host);
    }
    if(GUILayout.Button("Quickplay")){
        leaveFor(menus.quickplay);
    }
    if(GUILayout.Button("Join Game")){
        leaveFor(menus.lobby);
    }

}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.open(newMenu);
}
