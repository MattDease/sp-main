#pragma strict

var menuSkin : GUISkin;

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

private var playerName : String;
private var newName : String = "";
private var backgroundTexutre : Texture2D;
private var startBtnTexture : Texture2D;

var mainmenu : MainMenu;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
    playerName = playerScript.getName();
    backgroundTexutre = Resources.Load("Textures/gui/background", Texture2D);
    startBtnTexture = Resources.Load("Textures/gui/startBtn", Texture2D);

    menuSkin = Resources.Load("MenuSkin", GUISkin);

}

function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.skin = menuSkin;

    var labelStyle : GUIStyle = GUI.skin.GetStyle("Logo");
    labelStyle.fontSize = menuScript.getScale() * 270;

    GUI.DrawTexture(new Rect(0,0, Screen.width, Screen.height), backgroundTexutre);

    GUI.Label (new Rect (0, Screen.height/2 - Screen.height/8 , Screen.width, 0), "Scrambled", "Logo");


    if(playerName){
        GUI.Label(Rect(0,0, Screen.width, Screen.height + 60), "Welcome back, " + playerName);

        if(GUI.Button(Rect(0,0, Screen.width,Screen.height), "", "FullImage")){
            leaveFor(menus.main);
        }
    }
    else{
        //prompt for name
        GUI.Label(Rect(0,0, Screen.width - 175, Screen.height + 60),"Enter your name:");
        newName = GUI.TextField(Rect(Screen.width/2,Screen.height/2 + 20,150, 25), newName, 20);
        if(newName && GUI.Button(Rect(0,0, Screen.width,Screen.height), "", "FullImage")){
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
