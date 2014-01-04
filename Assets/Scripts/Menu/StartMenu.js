#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

private var playerName : String;
private var newName : String = "";

var mainmenu : MainMenu;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
    playerName = playerScript.getName();
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    //TODO - replace with good UI
    if(playerName){
        //display message
        GUILayout.Label("Start Menu");
        GUILayout.Label("Welcome back, " + playerName);
        if(GUILayout.Button("Start")){
            leaveFor(menus.main);
        }
    }
    else{
        //prompt for name
        GUILayout.Label("Enter your name:");
        newName = GUILayout.TextField(newName, 20);
        if(newName && GUILayout.Button("Start")){
            playerName = newName;
            playerScript.setName(newName);
            leaveFor(menus.main);
        }
    }

}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
