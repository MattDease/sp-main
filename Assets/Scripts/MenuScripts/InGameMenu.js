#pragma strict

private var gameManager : GameObject;
private var playerScript : PlayerScript;
private var stateScript : StateScript;

private var menuScript : Menu;

private var showMenu : boolean = false;

var GuiInGame : GuiClasses[];
var menuSkin : GUISkin;

function Start(){
    gameManager = GameObject.Find("/GameManager");

    menuScript = Menu.script;
    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);

    menuSkin = Resources.LoadAssetAtPath("Assets/MenuSkin.guiskin", GUISkin);

    GuiInGame = new GuiClasses[3];
    GuiInGame[0] = new GuiClasses();
    GuiInGame[1] = new GuiClasses();
    GuiInGame[2] = new GuiClasses();
}

function OnGUI () {
    //Todo -- Player progression bar 
    var bgHeight : int;
    var buttonOffset : int;
    GUI.skin = menuSkin;

    GuiInGame[0].textureHeight = Screen.height*0.45;

    if(Screen.height< 500){
        bgHeight = Screen.height*0.45;
    }
    else bgHeight = Screen.height*0.25;

    if(Screen.height>500){
        buttonOffset = Screen.height*0.1;
    } else
        buttonOffset = Screen.height*0.03;

    for(var x =0; x<3; x++){
        GuiInGame[x].pointLocation = GuiInGame[x].Point.Center;
        GuiInGame[x].updateLocation();

        if(x !=0){
            GuiInGame[x].textureWidth = 150;
            GuiInGame[x].textureHeight = 30;
        }
    }

    GUI.Box(Rect (0,GuiInGame[0].offset.y,Screen.width, bgHeight), "You dropped the egg....");

    // half of texture width and offset by 2.5% of screen
    if(GUI.Button(Rect(GuiInGame[1].offset.x - (75 + Screen.width * 0.025) ,GuiInGame[1].offset.y - buttonOffset ,150,30), "Main Menu")){
        Application.LoadLevel("scene-menu");
    }

    if(GUI.Button(Rect(GuiInGame[2].offset.x + (75 + Screen.width * 0.025) ,GuiInGame[2].offset.y - buttonOffset ,150,30), "Join New")){
    }

}

