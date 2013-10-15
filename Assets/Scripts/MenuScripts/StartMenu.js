#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

private var playerName : String;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.gameManager.GetComponent(PlayerScript);
    playerName = playerScript.getName();
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    //TODO - replace with good UI
    if(false && playerName){
        //display message
        GUILayout.Label("Welcome back, " + playerName);
        if(GUILayout.Button("Start")){
            leaveFor(menus.main);
        }
    }
    else{
        //prompt for name
        GUILayout.Label("Enter your name:");
        playerName = GUILayout.TextField(playerName, 20);
        if(playerName && GUILayout.Button("Start")){
            playerScript.setName(playerName);
            leaveFor(menus.main);
        }
    }

}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.open(newMenu);
}
