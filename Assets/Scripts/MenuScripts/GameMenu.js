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

}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.open(newMenu);
}
